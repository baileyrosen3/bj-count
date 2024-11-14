import { Card } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  getActionDescription,
  getDeviationAction,
  calculateTrueCount,
  calculateRemainingDecks,
  HARD_TOTALS,
  SOFT_TOTALS,
  PAIRS,
  getBasicStrategy,
} from "@/lib/blackjack";
import { CountingSystem } from "@/lib/types";

interface StrategyAdviceProps {
  dealerUpCard: Card;
  playerCards: Card[];
  deckState: Record<Card, number>;
  runningCount: number;
  countingSystem: CountingSystem;
}

export function StrategyAdvice({
  dealerUpCard,
  playerCards,
  deckState,
  runningCount,
  countingSystem,
}: StrategyAdviceProps) {
  const getHandType = (cards: Card[]) => {
    if (cards.length !== 2) return "hard";
    if (cards[0] === cards[1]) return "pair";
    if (cards.includes("A")) return "soft";
    return "hard";
  };

  const getHandTotal = (cards: Card[]): string => {
    const handType = getHandType(cards);

    if (handType === "pair") {
      return `${cards[0]},${cards[0]}`;
    }

    if (handType === "soft") {
      const nonAceCard = cards.find((card) => card !== "A") || "";
      return `A,${nonAceCard}`;
    }

    // Calculate hard total
    let total = 0;
    let aces = 0;

    cards.forEach((card) => {
      if (card === "A") {
        aces += 1;
      } else if (["K", "Q", "J", "10"].includes(card)) {
        total += 10;
      } else {
        total += parseInt(card);
      }
    });

    // Add aces
    while (aces > 0) {
      if (total + 11 <= 21) {
        total += 11;
      } else {
        total += 1;
      }
      aces--;
    }

    return total.toString();
  };

  const getBasicStrategyAction = () => {
    const trueCount = calculateTrueCount(
      runningCount,
      calculateRemainingDecks(deckState)
    );

    const action = getBasicStrategy(
      playerCards,
      dealerUpCard,
      trueCount,
      countingSystem
    );

    return action || "S";
  };

  const action = getBasicStrategyAction();
  const description = getActionDescription(action);

  return (
    <div className="flex flex-col gap-2 bg-black/50 p-3 rounded-lg border border-cyan-500/30 shadow-neon backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-cyan-300">
            OPTIMAL STRATEGY
          </span>
          <Badge
            variant="secondary"
            className="text-xs bg-purple-500/20 text-purple-200 border-purple-500/30 font-mono"
          >
            {countingSystem}
          </Badge>
        </div>
        <Badge
          variant="outline"
          className="text-xs border-cyan-500/30 text-cyan-300 font-mono"
        >
          {getHandType(playerCards).toUpperCase()}
        </Badge>
      </div>
      <div className="text-lg font-mono font-semibold text-cyan-100 glow-text">
        {description}
      </div>
      <div className="flex justify-between items-center text-xs font-mono text-cyan-400/60">
        <span>vs DEALER {dealerUpCard}</span>
        <span>
          TRUE COUNT:{" "}
          {calculateTrueCount(runningCount, calculateRemainingDecks(deckState))}
        </span>
      </div>
    </div>
  );
}
