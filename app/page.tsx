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
import CardDetector from "../components/CardDetector";
import { DetectedCard } from "@/types/cards";

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
  const [bankroll, setBankroll] = useState<number>(0);
  const [unitSize, setUnitSize] = useState<number>(0);

  const handleGameStart = (
    decks: number,
    initialBankroll: number,
    initialUnitSize: number
  ) => {
    setNumberOfDecks(decks);
    setBankroll(initialBankroll);
    setUnitSize(initialUnitSize);
    setDeckState(initialDeckState(decks));
    setIsGameStarted(true);
  };

  const handleReset = () => {
    setIsGameStarted(false);
    setDeckState(null);
    setRunningCount(0);
    setSelectedDealerCard(null);
    setBankroll(0);
    setUnitSize(0);
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

  const handleDetectedCards = (cards: DetectedCard[]) => {
    cards.forEach(({ card, position }) => {
      // Determine if the card is a dealer card based on position
      const isDealerCard = position.y < window.innerHeight / 2;

      if (isDealerCard) {
        handleDealerCardSelect(card);
      } else {
        handleCardClick(card);
      }
    });
  };

  if (!isGameStarted || !deckState) {
    return (
      <main className="min-h-screen bg-background/95 flex flex-col items-center justify-center dark">
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
    <main className="flex min-h-screen flex-col items-center justify-between p-24 dark bg-background/95">
      <CardDetector onCardsDetected={handleDetectedCards} />
      <div className="flex flex-col w-full max-w-md space-y-4">
        <div className="flex items-center justify-between bg-card/30 p-4 rounded-xl backdrop-blur-sm border border-border/30">
          <div>
            <span className="text-lg font-medium text-foreground">
              True Count: {trueCount}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className="h-8 w-8 border-border/30 bg-background/50 hover:bg-background/70"
          >
            <RefreshCw className="h-4 w-4" />
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
              <div>Bankroll: ${bankroll}</div>
              <div>Unit Size: ${unitSize}</div>
              <div>Recommended Bet: ${bettingUnits * unitSize}</div>
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
