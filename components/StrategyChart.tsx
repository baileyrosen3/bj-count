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

  const renderDealingState = () => {
    return (
      <div className="space-y-4">
        <div className="bg-primary/10 -mx-4 -mt-4 px-4 py-3 border-b border-border/50">
          <div className="text-lg font-semibold">
            {dealPhase === "betting" && "Place Bet"}
            {dealPhase === "initial-dealing" && "Initial Deal"}
            {dealPhase === "dealer-card" && "Dealer&apos;s Card"}
          </div>
        </div>

        <div className="bg-card/50 px-4 py-3 rounded-lg border border-border/50">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">
              True Count
            </div>
          </div>
        </div>

        {dealPhase === "betting" && (
          <div className="space-y-3">
            <div className="text-lg font-medium">Place Your Bet</div>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 25, 50, 100, 200].map((amount) => (
                <Button
                  key={amount}
                  onClick={() => {
                    setCurrentBet(amount);
                    setDealPhase("initial-dealing");
                  }}
                  variant={currentBet === amount ? "default" : "outline"}
                  className="h-12"
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>
        )}

        {dealPhase === "initial-dealing" && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="text-lg font-medium">Initial Deal</div>
              <Badge variant="outline">{dealtCards.length} cards dealt</Badge>
            </div>

            {dealtCards.length > 0 && (
              <div className="bg-card/50 p-3 rounded-lg border border-border/50">
                <div className="text-sm font-medium mb-2">Dealt Cards</div>
                <div className="flex flex-wrap gap-2">
                  {dealtCards.map((card, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="h-8 w-8 flex items-center justify-center text-lg"
                    >
                      {card}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-5 gap-1">
              {dealerCards.map((card) => (
                <Button
                  key={card}
                  variant="outline"
                  className={cn(
                    "h-12 text-lg font-medium",
                    deckState[card] === 0 && "opacity-50"
                  )}
                  onClick={() => handleAddCard(card)}
                  disabled={deckState[card] === 0}
                >
                  {card}
                </Button>
              ))}
            </div>

            <Button
              className="w-full h-12 mt-2"
              onClick={handleFinishInitialDeal}
              variant="default"
            >
              Complete Initial Deal
            </Button>
          </div>
        )}

        {dealPhase === "dealer-card" && (
          <div className="space-y-3">
            <div className="text-lg font-medium">Dealer&apos;s Up Card</div>
            <div className="grid grid-cols-5 gap-1">
              {dealerCards.map((card) => (
                <Button
                  key={card}
                  variant="outline"
                  className={cn(
                    "h-12 text-lg font-medium",
                    deckState[card] === 0 && "opacity-50"
                  )}
                  onClick={() => handleAddCard(card)}
                  disabled={deckState[card] === 0}
                >
                  {card}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGameState = () => {
    switch (gameState) {
      case "dealing":
        return renderDealingState();

      case "in-progress":
        return (
          <div className="space-y-4">
            <div className="bg-primary/10 -mx-4 -mt-4 px-4 py-3 border-b border-border/50">
              <div className="text-lg font-semibold">
                Playing Hand {activeHandIndex + 1}/{playerHands.length}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-lg font-medium">
                Hand {activeHandIndex + 1}/{playerHands.length}
              </div>
              <Badge variant="outline">
                ${playerHands[activeHandIndex]?.bet}
              </Badge>
            </div>

            <div className="flex gap-2 overflow-x-auto py-2">
              {playerHands[activeHandIndex]?.cards.map((card, i) => (
                <Button
                  key={i}
                  variant="outline"
                  className="h-16 w-12 text-lg font-medium flex-shrink-0"
                >
                  {card}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleSplit()}
                disabled={
                  !playerHands[activeHandIndex] ||
                  playerHands[activeHandIndex].cards.length !== 2 ||
                  playerHands[activeHandIndex].cards[0] !==
                    playerHands[activeHandIndex].cards[1]
                }
              >
                Split
              </Button>
              <Button
                onClick={() => handleDouble()}
                disabled={
                  !playerHands[activeHandIndex] ||
                  playerHands[activeHandIndex].cards.length !== 2
                }
              >
                Double
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="text-lg font-medium">Hand Result</div>
              <div className="grid grid-cols-2 gap-2">
                {["win", "lose", "push", "blackjack"].map((result) => (
                  <Button
                    key={result}
                    onClick={() => handleHandResult(result as HandResult)}
                    variant="outline"
                  >
                    {result.charAt(0).toUpperCase() + result.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );

      case "ended":
        return (
          <div className="space-y-4">
            <div className="bg-primary/10 -mx-4 -mt-4 px-4 py-3 border-b border-border/50">
              <div className="text-lg font-semibold">Hand Complete</div>
            </div>

            <div className="text-lg font-medium">Game Summary</div>
            {playerHands.map((hand, index) => (
              <div key={index} className="bg-card/50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <div>Hand {index + 1}</div>
                  <Badge
                    variant={
                      hand.result === "win" || hand.result === "blackjack"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {hand.result}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  {hand.cards.map((card, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="h-10 w-8 text-sm font-medium"
                      disabled
                    >
                      {card}
                    </Button>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  Bet: ${hand.bet} {hand.isDoubled && "(Doubled)"}{" "}
                  {hand.isSplit && "(Split)"}
                </div>
              </div>
            ))}
            <Button
              onClick={() => {
                setGameState("dealing");
                setPlayerHands([]);
                setActiveHandIndex(0);
                setCurrentBet(0);
              }}
              className="w-full"
            >
              New Hand
            </Button>
          </div>
        );
    }
  };

  return (
    <UICard className="w-full border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">{renderGameState()}</CardContent>
    </UICard>
  );
}
