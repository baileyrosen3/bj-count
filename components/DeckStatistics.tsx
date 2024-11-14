"use client";

import { calculateRemainingDecks, calculateTrueCount } from "../lib/blackjack";
import {
  Card as UICard,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Card } from "../lib/types";
import { cn } from "../lib/utils";

interface DeckStatisticsProps {
  deckState: Record<Card, number>;
  runningCount: number;
  numberOfDecks: number;
}

export default function DeckStatistics({
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
    <UICard className="w-full bg-black/40 border-cyan-500/30 shadow-neon">
      <CardHeader>
        <CardTitle className="text-xl font-mono text-cyan-300 tracking-wide">
          DECK STATISTICS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 font-mono">
          <div className="flex justify-between text-sm text-cyan-100">
            <span>RUNNING COUNT</span>
            <span className="font-bold text-cyan-300">{runningCount}</span>
          </div>
          <div className="flex justify-between text-sm text-cyan-100">
            <span>TRUE COUNT</span>
            <span className="font-bold text-cyan-300">{trueCount}</span>
          </div>
          <div className="flex justify-between text-sm text-cyan-100">
            <span>REMAINING DECKS</span>
            <span className="font-bold text-cyan-300">{remainingDecks}</span>
          </div>
          <div className="flex justify-between text-sm text-cyan-100">
            <span>TOTAL CARDS</span>
            <span className="font-bold text-cyan-300">{totalCards}</span>
          </div>
        </div>

        <div className="space-y-3">
          {Object.entries(deckState).map(([card, count]) => (
            <div key={card} className="space-y-1">
              <div className="flex justify-between text-sm font-mono text-cyan-100">
                <span>{card}</span>
                <span>{count}</span>
              </div>
              <div className="relative w-full h-1 bg-cyan-950 rounded-full overflow-hidden border border-cyan-500/20">
                <Progress
                  value={getProgressValue(count)}
                  className={cn(
                    "h-full transition-all",
                    "bg-gradient-to-r from-cyan-500 to-purple-500"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </UICard>
  );
}
