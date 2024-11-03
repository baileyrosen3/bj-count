export type Card =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";
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

export type Action = "H" | "S" | "D" | "Ds" | "Y" | "N" | "Y/N";

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

export const getCardValue = (card: Card): number => {
  if (["2", "3", "4", "5", "6"].includes(card)) return 1;
  if (["7", "8", "9"].includes(card)) return 0;
  return -1; // 10, J, Q, K, A
};

export const getCardCategory = (card: Card): "low" | "neutral" | "high" => {
  if (["2", "3", "4", "5", "6"].includes(card)) return "low";
  if (["7", "8", "9"].includes(card)) return "neutral";
  return "high";
};

export const calculateTrueCount = (
  runningCount: number,
  remainingDecks: number
): number => {
  if (remainingDecks === 0) return 0;
  return Math.round((runningCount / remainingDecks) * 10) / 10;
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

export const getDeviationAction = (
  playerHand: string,
  dealerCard: string,
  trueCount: number
): Action | null => {
  const handValue = playerHand; // Now playerHand is of type Card[]
  const dealerValue = dealerCard; // Assume this function gets the value of the dealer's card

  switch (handValue) {
    case "Insurance":
      if (dealerCard === "A" && trueCount >= 3) return "Y"; // Take Insurance
      break;
    case "16":
      if (dealerValue === "9" && trueCount >= 5) return "S"; // Stand
      if (dealerValue === "10" && trueCount >= 0) return "S"; // Stand
      break;
    case "15":
      if (dealerValue === "10" && trueCount >= 4) return "S"; // Stand
      break;
    case "13":
      if (dealerValue === "2" && trueCount >= -1) return "S"; // Stand
      if (dealerValue === "3" && trueCount >= -2) return "S"; // Stand
      break;
    case "12":
      if (dealerValue === "2" && trueCount >= 4) return "S"; // Stand
      if (dealerValue === "3" && trueCount >= 2) return "S"; // Stand
      if (dealerValue === "4" && trueCount >= 0) return "S"; // Stand
      if (dealerValue === "5" && trueCount >= -1) return "H"; // Hit
      if (dealerValue === "6" && trueCount >= -1) return "H"; // Hit
      break;
    case "11":
      if (dealerValue === "A" && trueCount >= 1) return "D"; // Double Down
      break;
    case "10":
      if (dealerValue === "10" && trueCount >= 4) return "D"; // Double Down
      if (dealerValue === "A" && trueCount >= 4) return "D"; // Double Down
      break;
    case "9":
      if (dealerValue === "2" && trueCount >= 1) return "D"; // Double Down
      if (dealerValue === "7" && trueCount >= 4) return "D"; // Double Down
      break;
    case "Pair of 10s":
      if (dealerValue === "5" && trueCount >= 5) return "Y"; // Change 'P' to 'Y' for Split
      if (dealerValue === "6" && trueCount >= 5) return "Y"; // Change 'P' to 'Y' for Split
      break;
    case "14":
      if (dealerValue === "10" && trueCount >= 3) return "S"; // Surrender
      break;
    case "15":
      if (dealerValue === "10" && trueCount >= 0) return "S"; // Surrender
      if (dealerValue === "9" && trueCount >= 2) return "S"; // Surrender
      if (dealerValue === "A" && trueCount >= 2) return "S"; // Surrender (assuming 'A' is represented as 1)
      break;
    default:
      return null; // No deviation
  }

  return null; // Default case if no rules matched
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
