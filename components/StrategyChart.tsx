"use client";

import { useState } from "react";
import { Card } from "@/lib/types";
import {
  HARD_TOTALS,
  SOFT_TOTALS,
  PAIRS,
  getActionDescription,
  getCardValue,
  getDeviationAction,
  calculateTrueCount,
  calculateRemainingDecks,
} from "@/lib/blackjack";
import { Card as UICard, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { CountingSystem } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type GameState = "dealing" | "in-progress" | "ended";
type HandResult = "win" | "lose" | "push" | "blackjack" | null;
type DealPhase = "betting" | "initial-dealing" | "dealer-card";

interface PlayerHand {
  cards: Card[];
  bet: number;
  isDoubled: boolean;
  isSplit: boolean;
  result: HandResult;
}

interface StrategyChartProps {
  dealerCard: Card | null;
  onDealerCardSelect: (card: Card) => void;
  onCountUpdate: (value: number) => void;
  deckState: Record<Card, number>;
  runningCount: number;
  countingSystem: CountingSystem;
  onHandResult: (bet: number, isWin: boolean) => void;
}

export function StrategyChart({
  dealerCard,
  onDealerCardSelect,
  onCountUpdate,
  deckState,
  runningCount,
  countingSystem,
  onHandResult,
}: StrategyChartProps) {
  const [gameState, setGameState] = useState<GameState>("dealing");
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [playerHands, setPlayerHands] = useState<PlayerHand[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);
  const [handType, setHandType] = useState<"hard" | "soft" | "pair">("hard");
  const [isInitialDealComplete, setIsInitialDealComplete] = useState(false);
  const [dealPhase, setDealPhase] = useState<DealPhase>("betting");
  const [dealtCards, setDealtCards] = useState<Card[]>([]);

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
      setGameState("in-progress");
    }
  };

  const handleAddCard = (card: Card) => {
    if (gameState === "dealing") {
      // Add card to the dealt cards list
      setDealtCards((prev) => [...prev, card]);
      onCountUpdate(getCardValue(card));

      if (dealPhase === "dealer-card") {
        handleDealerCardSelect(card);
        setGameState("in-progress");
      }
    } else if (gameState === "in-progress" && playerHands[activeHandIndex]) {
      // Add card to active hand
      const updatedHands = [...playerHands];
      updatedHands[activeHandIndex].cards.push(card);
      setPlayerHands(updatedHands);
      onCountUpdate(getCardValue(card));
    }
  };

  const handleFinishInitialDeal = () => {
    setDealPhase("dealer-card");
  };

  const handleStartGame = () => {
    setIsInitialDealComplete(true);
    setGameState("in-progress");
  };

  const handleSplit = () => {
    const currentHand = playerHands[activeHandIndex];
    if (
      currentHand &&
      currentHand.cards.length === 2 &&
      currentHand.cards[0] === currentHand.cards[1]
    ) {
      const newHands = [...playerHands];
      // Create two new hands from the split
      newHands.splice(
        activeHandIndex,
        1,
        {
          cards: [currentHand.cards[0]],
          bet: currentHand.bet,
          isDoubled: false,
          isSplit: true,
          result: null,
        },
        {
          cards: [currentHand.cards[1]],
          bet: currentHand.bet,
          isDoubled: false,
          isSplit: true,
          result: null,
        }
      );
      setPlayerHands(newHands);
    }
  };

  const handleDouble = () => {
    const currentHand = playerHands[activeHandIndex];
    if (currentHand && currentHand.cards.length === 2) {
      const newHands = [...playerHands];
      newHands[activeHandIndex].isDoubled = true;
      newHands[activeHandIndex].bet *= 2;
      setPlayerHands(newHands);
    }
  };

  const handleHandResult = (result: HandResult) => {
    const currentHand = playerHands[activeHandIndex];
    if (currentHand) {
      const newHands = [...playerHands];
      newHands[activeHandIndex].result = result;
      setPlayerHands(newHands);

      // Calculate win/loss
      const isWin = result === "win" || result === "blackjack";
      onHandResult(currentHand.bet, isWin);

      // Move to next hand or end game
      if (activeHandIndex < playerHands.length - 1) {
        setActiveHandIndex(activeHandIndex + 1);
      } else {
        setGameState("ended");
      }
    }
  };

  return (
    <UICard className="w-full bg-black/40 border-cyan-500/30 shadow-neon backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-4">
          <div className="bg-black/60 -mx-4 -mt-4 px-4 py-3 border-b border-cyan-500/30">
            <div className="text-lg font-mono font-semibold text-cyan-300">
              STRATEGY MATRIX
            </div>
          </div>

          <div className="space-y-3">
            <ToggleGroup
              type="single"
              value={handType}
              onValueChange={(value) => value && setHandType(value as any)}
              className="justify-start bg-black/30 p-1 rounded-lg border border-cyan-500/20"
            >
              {["hard", "soft", "pair"].map((type) => (
                <ToggleGroupItem
                  key={type}
                  value={type}
                  className={cn(
                    "font-mono text-sm px-4 data-[state=on]:bg-cyan-500/20",
                    "data-[state=on]:text-cyan-300 hover:text-cyan-200"
                  )}
                >
                  {type.toUpperCase()}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div className="grid grid-cols-5 gap-1">
              {dealerCards.map((card) => (
                <Button
                  key={card}
                  variant="outline"
                  className={cn(
                    "h-12 text-lg font-mono",
                    "bg-black/40 border-cyan-500/30",
                    "hover:bg-cyan-500/20 hover:border-cyan-500/50",
                    "text-cyan-300",
                    deckState[card] === 0 && "opacity-50"
                  )}
                  onClick={() => handleAddCard(card)}
                  disabled={deckState[card] === 0}
                >
                  {card}
                  <Badge
                    variant="outline"
                    className="absolute -top-2 -right-2 h-5 w-5 text-xs border-cyan-500/30"
                  >
                    {deckState[card]}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Rest of the content with similar styling */}
        </div>
      </CardContent>
    </UICard>
  );
}
