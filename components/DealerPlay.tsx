"use client";

import { useState } from "react";
import { Card } from "../lib/types";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { cn } from "../lib/utils";

interface DealerPlayProps {
  upCard: Card;
  deckState: Record<Card, number>;
  onCardSelect: (card: Card) => void;
  onComplete: (finalCards: Card[]) => void;
}

export default function DealerPlay({
  upCard,
  deckState,
  onCardSelect,
  onComplete,
}: DealerPlayProps) {
  const [cards, setCards] = useState<Card[]>([upCard]);

  const calculateTotal = (cards: Card[]): number | [number, number] => {
    let total = 0;
    let aces = 0;

    cards.forEach((card) => {
      if (card === "A") {
        aces += 1;
        total += 11;
      } else if (["K", "Q", "J", "10"].includes(card)) {
        total += 10;
      } else {
        total += parseInt(card);
      }
    });

    // For hands with aces
    if (aces > 0) {
      const softTotal = total;
      const hardTotal = total - 10 * aces;

      // For dealer, show both totals if under 17 exists
      if (hardTotal < 17 || (softTotal <= 21 && softTotal < 17)) {
        // Only show valid totals (under 21)
        if (softTotal > 21) return hardTotal;
        if (hardTotal < 17 && softTotal < 17) return [hardTotal, softTotal];
        // If one total is >= 17 and valid, show both
        if (hardTotal >= 17 && softTotal <= 21) return [hardTotal, softTotal];
        if (softTotal >= 17 && hardTotal < softTotal)
          return [hardTotal, softTotal];
      }
    }

    // Adjust for busting
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }

    return total;
  };

  const renderTotal = (total: number | [number, number]) => {
    if (Array.isArray(total)) {
      return `${total[0]}/${total[1]}`;
    }
    return total;
  };

  const total = calculateTotal(cards);
  const mustHit = Array.isArray(total)
    ? total[0] < 17 || total[1] < 17
    : total < 17;

  const handleCardSelect = (card: Card) => {
    onCardSelect(card);
    setCards((prev) => [...prev, card]);
  };

  const getCardColor = (card: Card) => {
    if (["2", "3", "4", "5", "6"].includes(card)) {
      return "bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-200/50";
    }
    if (["10", "J", "Q", "K", "A"].includes(card)) {
      return "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-200/50";
    }
    return "bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-200 border-zinc-200/50";
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg border border-cyan-500 bg-black/60 shadow-neon backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-mono text-cyan-300 bg-cyan-500/5 px-2 rounded-md border border-cyan-500/20">
            {renderTotal(total)}
          </div>
          {mustHit && (
            <Badge
              variant="outline"
              className="text-yellow-300 border-yellow-500/30"
            >
              MUST HIT ON 16
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {cards.map((card, i) => (
            <Badge
              key={i}
              variant="outline"
              className={cn(
                "h-10 w-8 flex items-center justify-center text-lg font-mono",
                getCardColor(card)
              )}
            >
              {card}
            </Badge>
          ))}
        </div>
      </div>

      {mustHit ? (
        <div className="grid grid-cols-5 gap-1.5 p-4 bg-black/40 rounded-lg border border-cyan-500/30">
          {Object.entries(deckState).map(([card, count]) => (
            <Button
              key={card}
              variant="outline"
              onClick={() => handleCardSelect(card as Card)}
              disabled={count === 0}
              className={cn(
                "h-12 text-lg font-mono relative",
                "bg-black/40 border-cyan-500/30",
                "hover:bg-cyan-500/20 hover:border-cyan-500/50",
                count === 0 && "opacity-50"
              )}
            >
              {card}
              <Badge
                variant="outline"
                className="absolute -top-2 -right-2 h-5 w-5 text-xs border-cyan-500/30"
              >
                {count}
              </Badge>
            </Button>
          ))}
        </div>
      ) : (
        <Button
          onClick={() => onComplete(cards)}
          className={cn(
            "w-full h-12 text-lg font-mono",
            "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500",
            "hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600",
            "text-white shadow-neon-lg transition-all duration-300"
          )}
        >
          ROUND OVER
        </Button>
      )}
    </div>
  );
}
