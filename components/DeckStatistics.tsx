"use client";

import { calculateRemainingDecks, calculateTrueCount } from "@/lib/blackjack";
import {
  Card as UICard,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/lib/types";

interface DeckStatisticsProps {
  deckState: Record<Card, number>;
  runningCount: number;
  numberOfDecks: number;
}

export function DeckStatistics({
  deckState,
  runningCount,
  numberOfDecks,
}: DeckStatisticsProps) {
  const remainingDecks = calculateRemainingDecks(deckState);
  const trueCount = calculateTrueCount(runningCount, remainingDecks);
  const totalCards = Object.values(deckState).reduce((a, b) => a + b, 0);

  const getProgressValue = (count: number) =>
    (count / (numberOfDecks * 4)) * 100;

  return (
    <UICard className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Deck Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Running Count</span>
            <span className="font-bold">{runningCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>True Count</span>
            <span className="font-bold">{trueCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Remaining Decks</span>
            <span className="font-bold">{remainingDecks}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Total Cards</span>
            <span className="font-bold">{totalCards}</span>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(deckState).map(([card, count]) => (
            <div key={card} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{card}</span>
                <span>{count}</span>
              </div>
              <Progress value={getProgressValue(count)} className="h-1" />
            </div>
          ))}
        </div>
      </CardContent>
    </UICard>
  );
}
