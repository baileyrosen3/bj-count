"use client";

import { useState } from "react";
import {
  Card,
  Action,
  HARD_TOTALS,
  SOFT_TOTALS,
  PAIRS,
  getActionDescription,
  getCardValue,
  getDeviationAction,
  calculateTrueCount,
  calculateRemainingDecks,
  getBettingUnits,
} from "@/lib/blackjack";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface StrategyChartProps {
  dealerCard: Card | null;
  onDealerCardSelect: (card: Card) => void;
  onCountUpdate: (value: number) => void;
  deckState: Record<Card, number>;
  runningCount: number;
}

export function StrategyChart({
  dealerCard,
  onDealerCardSelect,
  onCountUpdate,
  deckState,
  runningCount,
}: StrategyChartProps) {
  const [handType, setHandType] = useState<"hard" | "soft" | "pair">("hard");
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
    "J",
    "Q",
    "K",
    "A",
  ];

  const handleDealerCardSelect = (card: Card) => {
    if (deckState[card] > 0) {
      onDealerCardSelect(card);
      onCountUpdate(getCardValue(card));
    }
  };

  const getAction = (total: string, dealerCard: Card): Action | null => {
    const dCard =
      dealerCard === "J"
        ? "10"
        : dealerCard === "Q"
        ? "10"
        : dealerCard === "K"
        ? "10"
        : dealerCard;
    const trueCount = calculateTrueCount(
      runningCount,
      calculateRemainingDecks(deckState)
    );

    const playerHand = convertTotalToHand(total);

    // Check for deviation action
    const deviationAction = getDeviationAction(
      playerHand.join(","),
      dCard,
      trueCount
    );
    if (deviationAction) {
      return deviationAction;
    }

    if (handType === "hard" && total in HARD_TOTALS) {
      return HARD_TOTALS[total as keyof typeof HARD_TOTALS][dCard];
    }
    if (handType === "soft" && total in SOFT_TOTALS) {
      return SOFT_TOTALS[total as keyof typeof SOFT_TOTALS][dCard];
    }
    if (handType === "pair" && total in PAIRS) {
      return PAIRS[total as keyof typeof PAIRS][dCard];
    }
    return null;
  };

  const getTotals = () => {
    switch (handType) {
      case "hard":
        return ["17", "16", "15", "14", "13", "12", "11", "10", "9", "8"];
      case "soft":
        return ["A,9", "A,8", "A,7", "A,6", "A,5", "A,4", "A,3", "A,2"];
      case "pair":
        return [
          "A,A",
          "K,K",
          "Q,Q",
          "J,J",
          "10,10",
          "9,9",
          "8,8",
          "7,7",
          "6,6",
          "5,5",
          "4,4",
          "3,3",
          "2,2",
        ];
      default:
        return [];
    }
  };

  const convertTotalToHand = (total: string): Card[] => {
    // Implement your logic to convert the total string to a Card array
    // For example, if total is "A,2", return ["A", "2"]
    return total.split(",") as Card[];
  };
  return (
    <UICard className="w-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Dealer&apos;s Card
          </div>
          <div className="grid grid-cols-5 gap-1">
            {dealerCards.map((card) => (
              <Button
                key={card}
                variant="outline"
                className={cn(
                  "h-12 text-lg font-medium border-border/50",
                  dealerCard === card && "border-primary bg-primary/15",
                  ["2", "3", "4", "5", "6"].includes(card) &&
                    "bg-blue-400/15 hover:bg-blue-400/25",
                  ["10", "A", "J", "Q", "K"].includes(card) &&
                    "bg-red-400/15 hover:bg-red-400/25",
                  deckState[card] === 0 && "opacity-50"
                )}
                onClick={() => handleDealerCardSelect(card)}
                disabled={deckState[card] === 0}
              >
                {card}
              </Button>
            ))}
          </div>
        </div>

        <ToggleGroup
          type="single"
          value={handType}
          onValueChange={(value: "hard" | "soft" | "pair") =>
            value && setHandType(value)
          }
          className="justify-stretch bg-background/50 p-1 rounded-lg"
        >
          <ToggleGroupItem value="hard" className="flex-1">
            Hard
          </ToggleGroupItem>
          <ToggleGroupItem value="soft" className="flex-1">
            Soft
          </ToggleGroupItem>
          <ToggleGroupItem value="pair" className="flex-1">
            Pairs
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="grid grid-cols-2 gap-2">
          {getTotals().map((total) => (
            <Button
              key={total}
              variant="outline"
              className="h-10 justify-between border-border/50 bg-background/50"
            >
              <span>{total}</span>
              {dealerCard && (
                <span className="text-sm font-medium text-muted-foreground">
                  {getActionDescription(getAction(total, dealerCard) || "S")}
                </span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </UICard>
  );
}
