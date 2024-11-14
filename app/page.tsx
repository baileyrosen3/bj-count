"use client";

import { useState } from "react";
import {
  CARDS,
  getCardValue,
  calculateTrueCount,
  initialDeckState,
  getBettingUnits,
  calculateRemainingDecks,
  setCurrentCountingSystem,
} from "../lib/blackjack";
import { Card as CardType } from "../lib/types";
import { Button } from "../components/ui/button";
import DeckStatistics from "../components/DeckStatistics";
import { RefreshCw } from "lucide-react";
import SetupScreen from "../components/SetupScreen";
import BankrollStats from "../components/BankrollStats";
import { CountingSystem } from "../lib/types";
import BlackjackTable, { BlackjackHand } from "../components/BlackjackTable";
import PlayingTable from "../components/PlayingTable";
import { cn } from "../lib/utils";

interface GameStats {
  handsPlayed: number;
  handsWon: number;
  totalWinnings: number;
  totalLosses: number;
  biggestWin: number;
  biggestLoss: number;
  peakBankroll: number;
}

interface PlayingHand {
  id: number;
  cards: CardType[];
  isYourHand: boolean;
  bet: number;
  isDoubled: boolean;
  isSplit: boolean;
  isComplete: boolean;
}

type GamePhase = "setup" | "playing" | "complete";

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
  const [gamePhase, setGamePhase] = useState<GamePhase>("setup");
  const [playerHands, setPlayerHands] = useState<PlayingHand[]>([]);
  const [dealerHand, setDealerHand] = useState<{ cards: CardType[] } | null>(
    null
  );

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
    setGamePhase("setup");
    setPlayerHands([]);
    setDealerHand(null);
    setBankroll(0);
    setMinBet(0);
    setGameStats({
      handsPlayed: 0,
      handsWon: 0,
      totalWinnings: 0,
      totalLosses: 0,
      biggestWin: 0,
      biggestLoss: 0,
      peakBankroll: 0,
    });
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

  const handleRunningCountChange = (newCount: number) => {
    setRunningCount(newCount);
  };

  const handleAllHandsComplete = () => {
    setGamePhase("setup");
  };

  const handleDeckReset = () => {
    setDeckState(initialDeckState(numberOfDecks));
    setRunningCount(0);
    setGamePhase("setup");
    setPlayerHands([]);
    setDealerHand(null);
  };

  if (!isGameStarted || !deckState) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-purple-950 flex flex-col items-center justify-center dark relative">
        <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none scanlines opacity-10" />
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
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-purple-950 py-6 px-4 flex flex-col items-center dark relative">
      <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none scanlines opacity-10" />

      {isGameStarted && deckState && (
        <div className="fixed top-4 right-4 flex gap-2 z-20">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeckReset}
            className="h-9 border-cyan-500/30 bg-black/50 hover:bg-cyan-500/20 font-mono text-cyan-300"
            title="Reset Deck"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            RESET DECK
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-9 border-pink-500/30 bg-black/50 hover:bg-pink-500/20 font-mono text-pink-300"
            title="Reset System"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            RESET SYSTEM
          </Button>
        </div>
      )}

      <div className="flex flex-col w-full max-w-md space-y-6 relative z-10">
        {/* Game Phase Content */}
        {gamePhase === "setup" && (
          <div className="bg-black/40 border border-cyan-500/30 rounded-xl shadow-neon backdrop-blur-sm">
            <BlackjackTable
              deckState={deckState}
              onCardSelect={(card: string | number) => {
                setDeckState((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    [card as CardType]: prev[card as CardType] - 1,
                  };
                });
              }}
              onCardRemove={(card: string | number) => {
                setDeckState((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    [card as CardType]: prev[card as CardType] + 1,
                  };
                });
              }}
              runningCount={runningCount}
              countingSystem={countingSystem}
              onRunningCountChange={handleRunningCountChange}
              minBet={minBet}
              bankroll={bankroll}
              onComplete={(
                playerHands: BlackjackHand[],
                dealerHand: BlackjackHand
              ) => {
                const playingHands = playerHands.map((hand) => ({
                  id: hand.id,
                  cards: hand.cards,
                  isYourHand: hand.isYourHand,
                  bet: hand.bet,
                  isDoubled: false,
                  isSplit: false,
                  isComplete: false,
                }));

                setPlayerHands(playingHands);
                setDealerHand(dealerHand);
                setGamePhase("playing");
              }}
            />
          </div>
        )}

        {gamePhase === "playing" && dealerHand && (
          <div className="bg-black/40 border border-cyan-500/30 rounded-xl shadow-neon backdrop-blur-sm">
            <PlayingTable
              key={`playing-table-${gamePhase}`}
              initialHands={playerHands}
              dealerUpCard={dealerHand.cards[0]}
              deckState={deckState}
              runningCount={runningCount}
              countingSystem={countingSystem}
              onRunningCountChange={handleRunningCountChange}
              onCardSelect={(card: string | number) => {
                setDeckState((prev) => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    [card as CardType]: prev[card as CardType] - 1,
                  };
                });
              }}
              onHandComplete={(hand: PlayingHand) => {
                const isWin = hand.isComplete;
                handleHandResult(hand.bet, isWin);
              }}
              onAllHandsComplete={handleAllHandsComplete}
            />
          </div>
        )}

        {gamePhase === "complete" && (
          <Button
            onClick={handleReset}
            className={cn(
              "w-full h-12 text-lg font-mono",
              "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500",
              "hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600",
              "text-white shadow-neon-lg transition-all duration-300"
            )}
          >
            NEW GAME
          </Button>
        )}

        <div className="space-y-6">
          <BankrollStats bankroll={bankroll} stats={gameStats} />
          <DeckStatistics
            deckState={deckState}
            runningCount={runningCount}
            numberOfDecks={numberOfDecks}
          />
        </div>
      </div>
    </main>
  );
}
