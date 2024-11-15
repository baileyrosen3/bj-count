import {
  Action,
  COUNTING_SYSTEM_VALUES,
  COUNTING_SYSTEMS,
  CountingSystem,
  Card,
} from "./types";

// Add a variable to hold the current counting system
let currentCountingSystem: CountingSystem = "Hi-Lo";

// Function to set the current counting system
export const setCurrentCountingSystem = (system: CountingSystem) => {
  currentCountingSystem = system;
};

export const getCardValue = (card: Card): number => {
  console.log("Current Counting System:", currentCountingSystem);
  const systemInfo = COUNTING_SYSTEMS.find(
    (sys) => sys.name === currentCountingSystem
  );

  if (!systemInfo) {
    console.warn("Counting system not found, defaulting to Hi-Lo");
    const value = COUNTING_SYSTEM_VALUES["Hi-Lo"][card];
    console.log(`Hi-Lo fallback - Card: ${card}, Value: ${value}`);
    return value || 0;
  }

  // Log the card values for the current system
  console.log("System Card Values:", systemInfo.cardValues);

  const cardValue = systemInfo.cardValues[card];
  console.log(
    "Card:",
    card,
    "Value:",
    cardValue,
    "System:",
    currentCountingSystem,
    "Card Values Map:",
    systemInfo.cardValues
  );

  return cardValue || 0;
};

export type HandTotal =
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17"
  | "A,2"
  | "A,3"
  | "A,4"
  | "A,5"
  | "A,6"
  | "A,7"
  | "A,8"
  | "A,9"
  | "2,2"
  | "3,3"
  | "4,4"
  | "5,5"
  | "6,6"
  | "7,7"
  | "8,8"
  | "9,9"
  | "10,10"
  | "A,A";

export const CARDS: Card[] = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
];

export const getCardCategory = (card: Card): "low" | "neutral" | "high" => {
  if (["2", "3", "4", "5", "6"].includes(card)) return "low";
  if (["7", "8", "9"].includes(card)) return "neutral";
  return "high";
};

export const calculateTrueCount = (
  runningCount: number,
  remainingDecks: number
): number => {
  console.log("Running Count:", runningCount);
  console.log("Remaining Decks:", remainingDecks);

  if (remainingDecks === 0) return 0;

  const systemInfo = COUNTING_SYSTEMS.find(
    (sys) => sys.name === currentCountingSystem
  );

  if (!systemInfo || !isBalancedSystem(currentCountingSystem)) {
    // For unbalanced systems like KO, true count may not be used
    return runningCount;
  }

  const trueCount = Math.round((runningCount / remainingDecks) * 10) / 10;
  console.log("Calculated True Count:", trueCount);

  return trueCount;
};

export const calculateRemainingDecks = (
  deckState: Record<Card, number>
): number => {
  const totalCards = Object.values(deckState).reduce((a, b) => a + b, 0);
  return Math.round((totalCards / 52) * 10) / 10;
};

export const initialDeckState = (
  numberOfDecks: number
): Record<Card, number> => {
  const deckState: Record<Card, number> = {} as Record<Card, number>;
  CARDS.forEach((card) => {
    if (["10", "J", "Q", "K"].includes(card)) {
      deckState[card] = numberOfDecks * 4;
    } else {
      deckState[card] = numberOfDecks * 4;
    }
  });
  return deckState;
};

// Strategy chart data
type HardHandTotal =
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16"
  | "17";

export const HARD_TOTALS: Record<HardHandTotal, Record<Card, Action>> = {
  "8": {
    "2": "H",
    "3": "H",
    "4": "H",
    "5": "H",
    "6": "H",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "9": {
    "2": "H",
    "3": "D",
    "4": "D",
    "5": "D",
    "6": "D",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "10": {
    "2": "D",
    "3": "D",
    "4": "D",
    "5": "D",
    "6": "D",
    "7": "D",
    "8": "D",
    "9": "D",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "11": {
    "2": "D",
    "3": "D",
    "4": "D",
    "5": "D",
    "6": "D",
    "7": "D",
    "8": "D",
    "9": "D",
    "10": "D",
    A: "D",
    J: "D",
    Q: "D",
    K: "D",
    "?": "D",
  },
  "12": {
    "2": "H",
    "3": "H",
    "4": "S",
    "5": "S",
    "6": "S",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "13": {
    "2": "S",
    "3": "S",
    "4": "S",
    "5": "S",
    "6": "S",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "14": {
    "2": "S",
    "3": "S",
    "4": "S",
    "5": "S",
    "6": "S",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "15": {
    "2": "S",
    "3": "S",
    "4": "S",
    "5": "S",
    "6": "S",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "16": {
    "2": "S",
    "3": "S",
    "4": "S",
    "5": "S",
    "6": "S",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "17": {
    "2": "S",
    "3": "S",
    "4": "S",
    "5": "S",
    "6": "S",
    "7": "S",
    "8": "S",
    "9": "S",
    "10": "S",
    A: "S",
    J: "S",
    Q: "S",
    K: "S",
    "?": "S",
  },
} as const;

type SoftHandTotal =
  | "A,2"
  | "A,3"
  | "A,4"
  | "A,5"
  | "A,6"
  | "A,7"
  | "A,8"
  | "A,9";

export const SOFT_TOTALS: Record<SoftHandTotal, Record<Card, Action>> = {
  "A,2": {
    "2": "H",
    "3": "H",
    "4": "H",
    "5": "D",
    "6": "D",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "A,3": {
    "2": "H",
    "3": "H",
    "4": "H",
    "5": "D",
    "6": "D",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "A,4": {
    "2": "H",
    "3": "H",
    "4": "D",
    "5": "D",
    "6": "D",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "A,5": {
    "2": "H",
    "3": "H",
    "4": "D",
    "5": "D",
    "6": "D",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "A,6": {
    "2": "H",
    "3": "D",
    "4": "D",
    "5": "D",
    "6": "D",
    "7": "H",
    "8": "H",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "A,7": {
    "2": "Ds",
    "3": "Ds",
    "4": "Ds",
    "5": "Ds",
    "6": "Ds",
    "7": "S",
    "8": "S",
    "9": "H",
    "10": "H",
    A: "H",
    J: "H",
    Q: "H",
    K: "H",
    "?": "H",
  },
  "A,8": {
    "2": "S",
    "3": "S",
    "4": "S",
    "5": "S",
    "6": "S",
    "7": "S",
    "8": "S",
    "9": "S",
    "10": "S",
    A: "S",
    J: "S",
    Q: "S",
    K: "S",
    "?": "S",
  },
  "A,9": {
    "2": "S",
    "3": "S",
    "4": "S",
    "5": "S",
    "6": "S",
    "7": "S",
    "8": "S",
    "9": "S",
    "10": "S",
    A: "S",
    J: "S",
    Q: "S",
    K: "S",
    "?": "S",
  },
} as const;

type PairHandTotal =
  | "2,2"
  | "3,3"
  | "4,4"
  | "5,5"
  | "6,6"
  | "7,7"
  | "8,8"
  | "9,9"
  | "10,10"
  | "A,A";

export const PAIRS: Record<PairHandTotal, Record<Card, Action>> = {
  "2,2": {
    "2": "Y/N",
    "3": "Y/N",
    "4": "Y",
    "5": "Y",
    "6": "Y",
    "7": "Y",
    "8": "N",
    "9": "N",
    "10": "N",
    A: "N",
    J: "N",
    Q: "N",
    K: "N",
    "?": "N",
  },
  "3,3": {
    "2": "Y/N",
    "3": "Y/N",
    "4": "Y",
    "5": "Y",
    "6": "Y",
    "7": "Y",
    "8": "N",
    "9": "N",
    "10": "N",
    A: "N",
    J: "N",
    Q: "N",
    K: "N",
    "?": "N",
  },
  "4,4": {
    "2": "N",
    "3": "N",
    "4": "N",
    "5": "Y/N",
    "6": "Y/N",
    "7": "N",
    "8": "N",
    "9": "N",
    "10": "N",
    A: "N",
    J: "N",
    Q: "N",
    K: "N",
    "?": "N",
  },
  "5,5": {
    "2": "N",
    "3": "N",
    "4": "N",
    "5": "N",
    "6": "N",
    "7": "N",
    "8": "N",
    "9": "N",
    "10": "N",
    A: "N",
    J: "N",
    Q: "N",
    K: "N",
    "?": "N",
  },
  "6,6": {
    "2": "Y/N",
    "3": "Y",
    "4": "Y",
    "5": "Y",
    "6": "Y",
    "7": "N",
    "8": "N",
    "9": "N",
    "10": "N",
    A: "N",
    J: "N",
    Q: "N",
    K: "N",
    "?": "N",
  },
  "7,7": {
    "2": "Y",
    "3": "Y",
    "4": "Y",
    "5": "Y",
    "6": "Y",
    "7": "Y",
    "8": "N",
    "9": "N",
    "10": "N",
    A: "N",
    J: "N",
    Q: "N",
    K: "N",
    "?": "N",
  },
  "8,8": {
    "2": "Y",
    "3": "Y",
    "4": "Y",
    "5": "Y",
    "6": "Y",
    "7": "Y",
    "8": "Y",
    "9": "Y",
    "10": "Y",
    A: "Y",
    J: "Y",
    Q: "Y",
    K: "Y",
    "?": "Y",
  },
  "9,9": {
    "2": "Y",
    "3": "Y",
    "4": "Y",
    "5": "Y",
    "6": "Y",
    "7": "N",
    "8": "Y",
    "9": "Y",
    "10": "N",
    A: "N",
    J: "N",
    Q: "N",
    K: "N",
    "?": "N",
  },
  "10,10": {
    "2": "N",
    "3": "N",
    "4": "N",
    "5": "N",
    "6": "N",
    "7": "N",
    "8": "N",
    "9": "N",
    "10": "N",
    A: "N",
    J: "N",
    Q: "N",
    K: "N",
    "?": "N",
  },
  "A,A": {
    "2": "Y",
    "3": "Y",
    "4": "Y",
    "5": "Y",
    "6": "Y",
    "7": "Y",
    "8": "Y",
    "9": "Y",
    "10": "Y",
    A: "Y",
    J: "Y",
    Q: "Y",
    K: "Y",
    "?": "Y",
  },
} as const;

export const getActionDescription = (action: Action): string => {
  return (
    {
      H: "Hit",
      S: "Stand",
      D: "Double (Hit)",
      Ds: "Double (Stand)",
      Y: "Split",
      N: "No split",
      "Y/N": "Split only if 'DAS' is available",
    }[action] || ""
  );
};

// Add this type definition at the top of the file
type DeviationKey =
  | "16vs9"
  | "16vs10"
  | "15vs10"
  | "13vs2"
  | "12vs4"
  | "12vs5"
  | "12vs6"
  | "11vsA"
  | "10vs10"
  | "9vs2"
  | "Insurance";

type DeviationTable = {
  [key in DeviationKey]?: number;
};

type SystemDeviations = {
  [key in CountingSystem]: DeviationTable;
};

export const getDeviationAction = (
  total: string,
  dealerCard: string,
  trueCount: number,
  countingSystem: CountingSystem = "Hi-Lo"
): Action | null => {
  // Different systems have different deviation points
  const deviations: SystemDeviations = {
    "Hi-Lo": {
      "16vs9": 5,
      "16vs10": 0,
      "15vs10": 4,
      "13vs2": -1,
      "12vs4": 0,
      "12vs5": -1,
      "12vs6": -1,
      "11vsA": 1,
      "10vs10": 4,
      "9vs2": 1,
      Insurance: 3,
    },
    "Hi-Opt I": {
      "16vs9": 6,
      "16vs10": 1,
      "15vs10": 5,
      "13vs2": 0,
      "12vs4": 1,
      "11vsA": 2,
      Insurance: 4,
    },
    "Hi-Opt II": {
      "16vs9": 4,
      "16vs10": -1,
      "15vs10": 3,
      "13vs2": -2,
      "12vs4": -1,
      "11vsA": 0,
      Insurance: 2,
    },
    "Zen Count": {
      "16vs9": 4,
      "16vs10": -1,
      "15vs10": 3,
      "13vs2": -2,
      Insurance: 2,
    },
    "Omega II": {
      "16vs9": 3,
      "16vs10": -2,
      "15vs10": 2,
      Insurance: 1,
    },
    KO: {
      "16vs9": 7,
      "16vs10": 2,
      "15vs10": 6,
      Insurance: 4,
    },
  };

  const systemDeviations = deviations[countingSystem] || deviations["Hi-Lo"];

  // Check for deviations based on the selected counting system
  switch (total) {
    case "Insurance":
      if (
        dealerCard === "A" &&
        systemDeviations.Insurance !== undefined &&
        trueCount >= systemDeviations.Insurance
      )
        return "Y";
      break;
    case "16":
      if (
        dealerCard === "9" &&
        systemDeviations["16vs9"] !== undefined &&
        trueCount >= systemDeviations["16vs9"]
      )
        return "S";
      if (
        dealerCard === "10" &&
        systemDeviations["16vs10"] !== undefined &&
        trueCount >= systemDeviations["16vs10"]
      )
        return "S";
      break;
    case "15":
      if (
        dealerCard === "10" &&
        systemDeviations["15vs10"] !== undefined &&
        trueCount >= systemDeviations["15vs10"]
      )
        return "S";
      break;
    case "13":
      if (
        dealerCard === "2" &&
        systemDeviations["13vs2"] !== undefined &&
        trueCount >= systemDeviations["13vs2"]
      )
        return "S";
      break;
    case "12":
      if (
        dealerCard === "4" &&
        systemDeviations["12vs4"] !== undefined &&
        trueCount >= systemDeviations["12vs4"]
      )
        return "S";
      break;
    case "11":
      if (
        dealerCard === "A" &&
        systemDeviations["11vsA"] !== undefined &&
        trueCount >= systemDeviations["11vsA"]
      )
        return "D";
      break;
    case "10":
      if (
        dealerCard === "10" &&
        systemDeviations["10vs10"] !== undefined &&
        trueCount >= systemDeviations["10vs10"]
      )
        return "D";
      break;
    case "9":
      if (
        dealerCard === "2" &&
        systemDeviations["9vs2"] !== undefined &&
        trueCount >= systemDeviations["9vs2"]
      )
        return "D";
      break;
  }

  return null;
};

const parseHandValue = (hand: Card[]): number | string => {
  let totalValue = 0;
  let aceCount = 0;

  hand.forEach((card) => {
    const cardValue = getCardValue(card); // Assume this function returns the value of the card
    totalValue += cardValue;

    if (card === "A") {
      aceCount++;
    }
  });

  // Adjust for Aces
  while (totalValue > 21 && aceCount > 0) {
    totalValue -= 10; // Count Ace as 1 instead of 11
    aceCount--;
  }

  // Return special cases
  if (totalValue === 21 && hand.length === 2) {
    return "Blackjack"; // Special case for Blackjack
  } else if (totalValue === 20 && hand.length === 2 && hand[0] === hand[1]) {
    return "Pair of 10s"; // Special case for a pair of 10s
  } else if (totalValue === 16 && hand.length === 2 && hand[0] === hand[1]) {
    return "Pair of 8s"; // Special case for a pair of 8s
  }

  return totalValue; // Return the total value of the hand
};

export const getBettingUnits = (trueCount: number): number => {
  console.log(trueCount);
  if (trueCount <= 2) return 1;
  if (trueCount < 3) return 2;
  if (trueCount < 4) return 4;
  if (trueCount < 5) return 8;
  return 8; // For +5 and up
};

export const isBalancedSystem = (system: CountingSystem): boolean => {
  const balancedSystems = [
    "Hi-Lo",
    "Hi-Opt I",
    "Hi-Opt II",
    "Omega II",
    "Zen Count",
  ];
  return balancedSystems.includes(system);
};

export const getBasicStrategy = (
  playerCards: Card[],
  dealerCard: Card,
  trueCount: number,
  countingSystem: CountingSystem = "Hi-Lo"
): Action => {
  console.log("Player Cards:", playerCards);
  console.log("Dealer Card:", dealerCard);
  console.log("True Count:", trueCount);
  console.log("Counting System:", countingSystem);

  // First, check if it's a pair
  if (playerCards.length === 2 && playerCards[0] === playerCards[1]) {
    const pairKey = `${playerCards[0]},${playerCards[1]}` as PairHandTotal;
    console.log("Pair Key:", pairKey);
    if (pairKey in PAIRS) {
      console.log("Pair Action:", PAIRS[pairKey][dealerCard]);
      return PAIRS[pairKey][dealerCard];
    }
  }

  // Calculate total value and check for soft hands (hands with an Ace)
  let total = 0;
  let hasAce = false;
  let softTotal = 0;

  for (const card of playerCards) {
    if (card === "A") {
      hasAce = true;
      total += 11;
      softTotal += 1;
    } else if (["K", "Q", "J"].includes(card)) {
      total += 10;
      softTotal += 10;
    } else {
      const value = parseInt(card);
      total += value;
      softTotal += value;
    }
  }

  console.log("Total Value:", total);
  console.log("Has Ace:", hasAce);

  // Adjust for Aces
  while (total > 21 && hasAce) {
    total -= 10;
    hasAce = false;
  }

  console.log("Adjusted Total Value:", total);

  // Check for deviations first
  const deviationAction = getDeviationAction(
    total.toString(),
    dealerCard,
    trueCount,
    countingSystem
  );
  console.log("Deviation Action:", deviationAction);

  if (deviationAction) {
    return deviationAction;
  }

  // Handle soft hands
  if (hasAce && playerCards.length === 2) {
    const softKey = `A,${
      playerCards[0] === "A" ? playerCards[1] : playerCards[0]
    }` as SoftHandTotal;
    console.log("Soft Key:", softKey);
    if (softKey in SOFT_TOTALS) {
      console.log("Soft Action:", SOFT_TOTALS[softKey][dealerCard]);
      return SOFT_TOTALS[softKey][dealerCard];
    }
  }

  // Handle hard totals
  if (total <= 8) {
    console.log("Hard Action for 8:", HARD_TOTALS["8"][dealerCard]);
    return HARD_TOTALS["8"][dealerCard];
  } else if (total >= 17) {
    console.log("Hard Action for 17:", HARD_TOTALS["17"][dealerCard]);
    return HARD_TOTALS["17"][dealerCard];
  } else {
    const hardKey = total.toString() as HardHandTotal;
    console.log("Hard Key:", hardKey);
    if (hardKey in HARD_TOTALS) {
      console.log("Hard Action:", HARD_TOTALS[hardKey][dealerCard]);
      return HARD_TOTALS[hardKey][dealerCard];
    }
  }

  // Default action if nothing else matches
  console.log("Default Action: H");
  return "H";
};
