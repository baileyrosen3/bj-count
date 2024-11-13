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
  setCurrentCountingSystem,
} from "@/lib/blackjack";
import { Button } from "@/components/ui/button";
import { DeckStatistics } from "@/components/DeckStatistics";
import { StrategyChart } from "@/components/StrategyChart";
import { RefreshCw, Plus, Minus } from "lucide-react";
import { ValueButton } from "@/components/ValueButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SetupScreen } from "@/components/SetupScreen";
import { BankrollStats } from "@/components/BankrollStats";
import { BettingControls } from "@/components/BettingControls";
import { CountingSystem } from "@/lib/types";

interface GameStats {
  handsPlayed: number;
  handsWon: number;
  totalWinnings: number;
  totalLosses: number;
  biggestWin: number;
  biggestLoss: number;
  peakBankroll: number;
}

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
  const [minBet, setMinBet] = useState<number>(0);
  const [countingSystem, setCountingSystem] = useState<CountingSystem>("Hi-Lo");
  const [gameStats, setGameStats] = useState<GameStats>({
    handsPlayed: 0,
    handsWon: 0,
    totalWinnings: 0,
    totalLosses: 0,
    biggestWin: 0,
    biggestLoss: 0,
    peakBankroll: 0,
  });

  const handleGameStart = (
    decks: number,
    initialBankroll: number,
    minimumBet: number,
    system: CountingSystem
  ) => {
    setNumberOfDecks(decks);
    setDeckState(initialDeckState(decks));
    setBankroll(initialBankroll);
    setMinBet(minimumBet);
    setCountingSystem(system);
    setCurrentCountingSystem(system);
    setGameStats({
      handsPlayed: 0,
      handsWon: 0,
      totalWinnings: 0,
      totalLosses: 0,
      biggestWin: 0,
      biggestLoss: 0,
      peakBankroll: initialBankroll,
    });
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

  const handleHandResult = (bet: number, isWin: boolean) => {
    const newBankroll = isWin ? bankroll + bet : bankroll - bet;
    setBankroll(newBankroll);

    setGameStats((prev) => ({
      ...prev,
      handsPlayed: prev.handsPlayed + 1,
      handsWon: isWin ? prev.handsWon + 1 : prev.handsWon,
      totalWinnings: isWin ? prev.totalWinnings + bet : prev.totalWinnings,
      totalLosses: !isWin ? prev.totalLosses + bet : prev.totalLosses,
      biggestWin: isWin ? Math.max(prev.biggestWin, bet) : prev.biggestWin,
      biggestLoss: !isWin ? Math.max(prev.biggestLoss, bet) : prev.biggestLoss,
      peakBankroll: Math.max(prev.peakBankroll, newBankroll),
    }));
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
    <main className="min-h-screen bg-background py-6 px-4 flex flex-col items-center dark">
      <div className="flex flex-col w-full max-w-md space-y-6">
        <div className="flex items-center justify-between bg-card/50 px-5 py-4 rounded-xl backdrop-blur-sm border border-border/50">
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">
              True Count:
            </span>
            <span className="text-xl font-semibold text-foreground">
              {trueCount}
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleReset}
            className="h-9 w-9 border-border/50 bg-zinc-800/50 hover:bg-zinc-700/50"
          >
            <RefreshCw className="h-4 w-4 text-white" />
          </Button>
        </div>

        <div className="grid grid-cols-5 gap-1.5">
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
          <TabsList className="grid w-full grid-cols-2 p-1">
            <TabsTrigger value="strategy" className="text-base">
              Strategy
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-base">
              Statistics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="strategy" className="mt-6">
            <div className="space-y-6">
              <div className="text-base font-medium text-foreground px-1">
                Recommended Betting Units: {bettingUnits}
              </div>
              <BettingControls
                bankroll={bankroll}
                minBet={minBet}
                onHandResult={handleHandResult}
              />
              <StrategyChart
                dealerCard={selectedDealerCard}
                onDealerCardSelect={handleDealerCardSelect}
                onCountUpdate={handleCountUpdate}
                deckState={deckState}
                runningCount={runningCount}
                countingSystem={countingSystem}
              />
            </div>
          </TabsContent>
          <TabsContent value="stats" className="mt-6">
            <div className="space-y-6">
              <BankrollStats bankroll={bankroll} stats={gameStats} />
              <DeckStatistics
                deckState={deckState}
                runningCount={runningCount}
                numberOfDecks={numberOfDecks}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
