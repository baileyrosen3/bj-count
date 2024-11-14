"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DealerCardsProps {
  selectedCard: Card | null;
  onSelectCard: (card: Card) => void;
}

export function DealerCards({ selectedCard, onSelectCard }: DealerCardsProps) {
  const dealerCards: Card[] = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "A",
  ];

  return (
    <div className="bg-card p-2 rounded-lg shadow-sm space-y-2">
      <div className="text-sm font-medium text-muted-foreground">
        Dealer&apos;s Card
      </div>
      <div className="grid grid-cols-5 gap-1">
        {dealerCards.map((card) => (
          <Button
            key={card}
            variant="outline"
            className={cn(
              "h-12 text-lg font-bold",
              selectedCard === card && "border-primary bg-primary/10",
              ["2", "3", "4", "5", "6"].includes(card) &&
                "bg-blue-50 hover:bg-blue-100",
              ["10", "A"].includes(card) && "bg-red-50 hover:bg-red-100"
            )}
            onClick={() => onSelectCard(card)}
          >
            {card}
          </Button>
        ))}
      </div>
    </div>
  );
}
