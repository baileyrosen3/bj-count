"use client";

import { useState } from "react";
import {
  Card as CardType,
  CARDS,
  getCardValue,
  calculateTrueCount,
  initialDeckState,
  getBettingUnits,
  calculateRemainingDecks,
} from "@/lib/blackjack";
import { Button } from "@/components/ui/button";
import { DeckStatistics } from "@/components/DeckStatistics";
import { StrategyChart } from "@/components/StrategyChart";
import { RefreshCw, Plus, Minus } from "lucide-react";
import { ValueButton } from "@/components/ValueButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SetupScreen } from "@/components/SetupScreen";

export default function Home() {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [deckState, setDeckState] = useState<Record<CardType, number> | null>(
    null
  );
  const [runningCount, setRunningCount] = useState(0);
  const [numberOfDecks, setNumberOfDecks] = useState(6);
  const [selectedDealerCard, setSelectedDealerCard] = useState<CardType | null>(
    null
  );

  const handleGameStart = (decks: number) => {
    setNumberOfDecks(decks);
    setDeckState(initialDeckState(decks));
    setIsGameStarted(true);
  };

  const handleReset = () => {
    setIsGameStarted(false);
    setDeckState(null);
    setRunningCount(0);
    setSelectedDealerCard(null);
  };

  const handleCardClick = (card: CardType) => {
    if (deckState && deckState[card] > 0) {
      setDeckState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [card]: prev[card] - 1,
        };
      });
      setRunningCount((prev) => prev + getCardValue(card));
    }
  };

  const handleDealerCardSelect = (card: CardType) => {
    setSelectedDealerCard(card);
    setDeckState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [card]: prev[card] - 1,
      };
    });
  };

  const handleCountUpdate = (value: number) => {
    setRunningCount((prev) => prev + value);
  };

  if (!isGameStarted || !deckState) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center dark">
        <SetupScreen onStart={handleGameStart} />
      </main>
    );
  }

  const trueCount = calculateTrueCount(
    runningCount,
    calculateRemainingDecks(deckState)
  );

  const bettingUnits = getBettingUnits(trueCount);

  return (
    <main className="min-h-screen bg-background p-4 flex flex-col items-center dark">
      <div className="flex flex-col w-full max-w-md space-y-4">
        <div className="flex items-center justify-between bg-card/50 p-4 rounded-xl backdrop-blur-sm border border-border/50">
          <div>
            <span className="text-lg font-medium text-foreground">
              True Count: {trueCount}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className="h-8 w-8 border-border/50 bg-zinc-800/50 hover:bg-zinc-700/50"
          >
            <RefreshCw className="h-4 w-4 text-white" />
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-1">
          {CARDS.map((card) => (
            <ValueButton
              key={card}
              card={card}
              count={deckState[card]}
              onClick={() => handleCardClick(card)}
              disabled={deckState[card] === 0}
            />
          ))}
        </div>

        <Tabs defaultValue="strategy" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>
          <TabsContent value="strategy">
            <div className="text-sm font-medium text-muted-foreground mt-4 mb-4 ml-2">
              Recommended Betting Units: {bettingUnits}
            </div>
            <StrategyChart
              dealerCard={selectedDealerCard}
              onDealerCardSelect={handleDealerCardSelect}
              onCountUpdate={handleCountUpdate}
              deckState={deckState}
              runningCount={runningCount}
            />
          </TabsContent>
          <TabsContent value="stats">
            <DeckStatistics
              deckState={deckState}
              runningCount={runningCount}
              numberOfDecks={numberOfDecks}
            />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
