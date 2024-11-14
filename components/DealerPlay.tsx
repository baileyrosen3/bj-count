import { useState } from "react";
import { Card } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DealerPlayProps {
  upCard: Card;
  deckState: Record<Card, number>;
  onCardSelect: (card: Card) => void;
  onComplete: (finalCards: Card[]) => void;
}

export function DealerPlay({
  upCard,
  deckState,
  onCardSelect,
  onComplete,
}: DealerPlayProps) {
  const [dealerCards, setDealerCards] = useState<Card[]>([upCard]);
  const [showingDownCard, setShowingDownCard] = useState(true);

  const getCardColor = (card: Card) => {
    if (["2", "3", "4", "5", "6"].includes(card)) {
      return "bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-200/50 dark:bg-blue-400/25 dark:hover:bg-blue-400/35 dark:text-blue-200";
    }
    if (["10", "J", "Q", "K", "A"].includes(card)) {
      return "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-200/50 dark:bg-red-400/25 dark:hover:bg-red-400/35 dark:text-red-200";
    }
    return "bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-200 border-zinc-200/50 dark:bg-zinc-400/25 dark:hover:bg-zinc-400/35 dark:text-zinc-200";
  };

  const handleCardSelect = (card: Card) => {
    setDealerCards((prev) => [...prev, card]);
    onCardSelect(card);
    setShowingDownCard(false);
  };

  const calculateTotal = (cards: Card[]): number => {
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

    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }

    return total;
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary/20 dark:bg-primary/30 -mx-4 -mt-4 px-4 py-3 border-b border-border">
        <div className="text-lg font-semibold">Dealer&apos;s Turn</div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Dealer&apos;s Cards</span>
          <Badge variant="outline">Total: {calculateTotal(dealerCards)}</Badge>
        </div>

        <div className="flex gap-2 h-16 items-center bg-background/80 rounded-lg px-3 border border-border">
          {dealerCards.map((card, i) => (
            <Badge
              key={i}
              variant="outline"
              className={cn(
                "h-10 w-8 flex items-center justify-center text-lg font-medium",
                getCardColor(card)
              )}
            >
              {card}
            </Badge>
          ))}
        </div>

        {showingDownCard ? (
          <div className="space-y-2">
            <div className="text-sm font-medium">Select Down Card</div>
            <div className="grid grid-cols-5 gap-1.5">
              {Object.entries(deckState).map(([card, count]) => (
                <Button
                  key={card}
                  variant="outline"
                  onClick={() => handleCardSelect(card as Card)}
                  disabled={count === 0 || card === "?"}
                  className={cn(
                    "h-12 text-lg font-medium relative transition-colors",
                    getCardColor(card as Card),
                    count === 0 && "opacity-50"
                  )}
                >
                  {card}
                  <Badge
                    variant="outline"
                    className={cn(
                      "absolute -top-2 -right-2 h-5 w-5 text-xs",
                      getCardColor(card as Card)
                    )}
                  >
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onComplete(dealerCards);
                }}
                className="text-white"
              >
                Stand
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowingDownCard(true)}
                className="text-white"
                disabled={calculateTotal(dealerCards) >= 17}
              >
                Hit
              </Button>
            </div>
            {calculateTotal(dealerCards) >= 17 && (
              <Button
                className="w-full bg-primary text-white"
                onClick={() => onComplete(dealerCards)}
              >
                Complete Dealer&apos;s Turn
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
