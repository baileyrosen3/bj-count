"use client";

import { useState, useEffect } from "react";
import { Card } from "../lib/types";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { cn } from "../lib/utils";
import {
  calculateRemainingDecks,
  calculateTrueCount,
  getCardValue,
} from "../lib/blackjack";

export interface BlackjackHand {
  id: number;
  cards: Card[];
  isPlayer: boolean;
  isYourHand: boolean;
  isComplete?: boolean;
  bet: number;
}

interface BlackjackTableProps {
  deckState: Record<Card, number>;
  onCardSelect: (card: Card) => void;
  onCardRemove: (card: Card) => void;
  runningCount: number;
  countingSystem: string;
  onComplete: (playerHands: BlackjackHand[], dealerHand: BlackjackHand) => void;
  onRunningCountChange: (count: number) => void;
  minBet: number;
  bankroll: number;
}

export default function BlackjackTable({
  deckState,
  onCardSelect,
  onCardRemove,
  runningCount,
  countingSystem,
  onComplete,
  onRunningCountChange,
  minBet,
  bankroll,
}: BlackjackTableProps) {
  const [numberOfHands, setNumberOfHands] = useState<number>(1);
  const [selectedHandIndexes, setSelectedHandIndexes] = useState<number[]>([]);
  const [hands, setHands] = useState<BlackjackHand[]>([
    {
      id: 0,
      cards: [],
      isPlayer: true,
      isYourHand: false,
      bet: minBet,
    },
  ]);
  const [dealerHand, setDealerHand] = useState<BlackjackHand>({
    id: -1,
    cards: [],
    isPlayer: false,
    isYourHand: false,
    bet: minBet,
  });
  const [activeHandIndex, setActiveHandIndex] = useState<number | null>(null);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [currentBet, setCurrentBet] = useState<number>(minBet);

  const handleNumberOfHandsChange = (value: string) => {
    const num = parseInt(value);
    setNumberOfHands(num);
    setHands(
      Array.from({ length: num }, (_, i) => ({
        id: i,
        cards: [],
        isPlayer: true,
        isYourHand: false,
        bet: minBet,
      }))
    );
  };

  const handlePlayerHandSelect = (handIndex: string) => {
    const index = parseInt(handIndex);
    setSelectedHandIndexes((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return [...prev, index];
    });

    setHands((prev) =>
      prev.map((hand) =>
        hand.id === index ? { ...hand, isYourHand: !hand.isYourHand } : hand
      )
    );
  };

  const handleCardSelect = async (card: Card) => {
    if (activeHandIndex === null) return;

    if (activeHandIndex === -1) {
      // Dealer hand
      if (dealerHand.cards.length === 0) {
        // Add the visible card and hidden card in one update
        setDealerHand((prev) => ({
          ...prev,
          cards: [...prev.cards, card, "?" as Card],
        }));
        onCardSelect(card);
        // Update running count only for the visible card
        const cardValue = getCardValue(card);
        console.log(
          `Adding dealer card ${card} with value ${cardValue} to count`
        );
        onRunningCountChange(runningCount + cardValue);
      }
    } else {
      // Player hand
      const hand = hands[activeHandIndex];
      if (hand && hand.cards.length < 2) {
        await new Promise<void>((resolve) => {
          setHands((prev) =>
            prev.map((h) =>
              h.id === activeHandIndex ? { ...h, cards: [...h.cards, card] } : h
            )
          );
          resolve();
        });
        onCardSelect(card);
        // Update running count for player card
        const cardValue = getCardValue(card);
        console.log(
          `Adding player card ${card} with value ${cardValue} to count`
        );
        onRunningCountChange(runningCount + cardValue);
      }
    }
    // Hide card selection after adding a card
    setIsSelectingCard(false);
  };

  // Add a useEffect to check setup completion after state updates
  useEffect(() => {
    // For debugging
  }, [hands, dealerHand]);

  const isSetupComplete = () => {
    // Check if at least one hand is selected as "your hand"
    const hasSelectedHand = hands.some((hand) => hand.isYourHand);

    // Check if dealer has exactly 2 cards (one up card and one down card)
    const dealerComplete = dealerHand.cards.length === 2;

    // Check if all hands have exactly 2 cards
    const allHandsComplete = hands.every((hand) => {
      // For debugging
      return hand.cards.length === 2;
    });

    // All conditions must be met
    return hasSelectedHand && dealerComplete && allHandsComplete;
  };

  const getCardColor = (card: Card) => {
    if (["2", "3", "4", "5", "6"].includes(card)) {
      return "bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-200/50";
    }
    if (["10", "J", "Q", "K", "A"].includes(card)) {
      return "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-200/50";
    }
    return "bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-200 border-zinc-200/50";
  };

  // Add function to handle card deletion
  const handleCardDelete = (handId: number, cardIndex: number) => {
    if (handId === -1) {
      // Dealer hand
      const deletedCard = dealerHand.cards[cardIndex];
      if (deletedCard !== "?") {
        // Return card to deck
        onCardRemove(deletedCard);
        // Remove from running count
        const cardValue = getCardValue(deletedCard);
        console.log(
          `Removing dealer card ${deletedCard} with value ${cardValue} from count`
        );
        onRunningCountChange(runningCount - cardValue);
      }
      // Reset dealer's hand completely if it's the first card
      if (cardIndex === 0) {
        setDealerHand((prev) => ({
          ...prev,
          cards: [],
        }));
      } else {
        setDealerHand((prev) => ({
          ...prev,
          cards: prev.cards.filter((_, i) => i !== cardIndex),
        }));
      }
    } else {
      // Player hand
      const hand = hands.find((h) => h.id === handId);
      if (hand) {
        const deletedCard = hand.cards[cardIndex];
        // Return card to deck
        onCardRemove(deletedCard);
        // Remove from running count
        const cardValue = getCardValue(deletedCard);
        console.log(
          `Removing player card ${deletedCard} with value ${cardValue} from count`
        );
        onRunningCountChange(runningCount - cardValue);
        setHands((prev) =>
          prev.map((h) =>
            h.id === handId
              ? { ...h, cards: h.cards.filter((_, i) => i !== cardIndex) }
              : h
          )
        );
      }
    }
  };

  // Update renderCard function to include delete button
  const renderCard = (
    card: Card,
    isHidden: boolean = false,
    handId: number,
    cardIndex: number
  ) => (
    <div className="relative group">
      <Badge
        variant="outline"
        className={cn(
          "h-10 w-8 flex items-center justify-center text-lg font-medium border transition-colors",
          isHidden
            ? "bg-primary/25 border-primary-foreground/30 dark:bg-primary/30 text-primary-foreground"
            : getCardColor(card)
        )}
      >
        {isHidden ? "?" : card}
      </Badge>
      {!isHidden && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-4 w-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            handleCardDelete(handId, cardIndex);
          }}
        >
          <span className="text-[10px]">×</span>
        </Button>
      )}
    </div>
  );

  // Add back the complete setup button and functionality
  const handleCompleteSetup = () => {
    if (isSetupComplete()) {
      // Convert BlackjackHands to include bet amount
      const handsWithBets = hands.map((hand) => ({
        ...hand,
        bet: currentBet,
      }));
      onComplete(handsWithBets, dealerHand);
    }
  };

  // Update the getRecommendedBet function...

  const getRecommendedBet = (trueCount: number, minBet: number): number => {
    // Subtract 1 from true count to get number of units
    const bettingUnits = Math.max(0, trueCount - 1);
    // Only multiply by minBet if there are units to bet
    return bettingUnits === 0 ? minBet : minBet * bettingUnits;
  };

  return (
    <div className="space-y-6 text-cyan-100 p-4">
      <div className="bg-black/40 border-b p-4 border-cyan-500/30 shadow-neon">
        <div className="text-lg font-mono font-semibold text-cyan-300">
          INITIALIZE GAME
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-mono text-cyan-400 uppercase tracking-wide">
            Initial Bet
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[25, 50, 100].map((amount) => (
              <Button
                key={amount}
                onClick={() => setCurrentBet(amount)}
                className={cn(
                  "h-12 font-mono",
                  currentBet === amount
                    ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                    : "bg-black/50 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10",
                  amount > bankroll && "opacity-50 cursor-not-allowed"
                )}
                disabled={amount > bankroll}
              >
                ${amount}
              </Button>
            ))}
          </div>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300 font-mono">
              $
            </span>
            <input
              type="number"
              value={currentBet}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= minBet && value <= bankroll) {
                  setCurrentBet(value);
                }
              }}
              className="w-full pl-8 h-12 bg-black/50 border border-cyan-500/30 rounded-md text-cyan-300 font-mono"
              min={minBet}
              max={bankroll}
            />
          </div>
        </div>

        <div className="flex justify-between text-sm font-mono">
          <span className="text-cyan-400">RUNNING COUNT: {runningCount}</span>
          <span className="text-cyan-400">
            TRUE COUNT:{" "}
            {calculateTrueCount(
              runningCount,
              calculateRemainingDecks(deckState)
            )}
          </span>
        </div>
        <div className="flex justify-between text-sm font-mono">
          <span className="text-cyan-400">RECOMMENDED BET:</span>
          <div className="flex items-center gap-2">
            <span className="text-green-400">
              $
              {getRecommendedBet(
                calculateTrueCount(
                  runningCount,
                  calculateRemainingDecks(deckState)
                ),
                minBet
              )}
            </span>
            <span className="text-cyan-400/60">
              (
              {Math.max(
                0,
                calculateTrueCount(
                  runningCount,
                  calculateRemainingDecks(deckState)
                ) - 1
              )}{" "}
              UNITS)
            </span>
          </div>
        </div>

        {/* Add back number of hands selection */}
        <div className="space-y-2">
          <label className="text-sm font-mono text-cyan-400 uppercase tracking-wide">
            Number of Hands
          </label>
          <Select
            value={numberOfHands.toString()}
            onValueChange={handleNumberOfHandsChange}
            defaultValue="1"
          >
            <SelectTrigger className="w-full bg-black/50 border-cyan-500/30 text-cyan-300 font-mono">
              <SelectValue placeholder="Select number of hands" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 border-cyan-500/30 font-mono">
              {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                <SelectItem
                  key={num}
                  value={num.toString()}
                  className="text-cyan-300"
                >
                  {num} {num === 1 ? "hand" : "hands"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Add back hand selection */}
        {numberOfHands > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-mono text-cyan-400 uppercase tracking-wide">
              Select Your Hands
            </label>
            <div className="grid grid-cols-4 gap-2">
              {hands.map((hand) => (
                <Button
                  key={hand.id}
                  variant={hand.isYourHand ? "default" : "outline"}
                  onClick={() => handlePlayerHandSelect(hand.id.toString())}
                  className={cn(
                    "h-12 relative font-mono",
                    hand.isYourHand
                      ? "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500"
                      : "bg-black/50 hover:bg-black/70 text-cyan-300 border-cyan-500/30"
                  )}
                >
                  <span className="text-sm tracking-wide">
                    HAND {hand.id + 1}
                  </span>
                  {hand.isYourHand && (
                    <Badge className="absolute -top-2 -right-2 bg-cyan-500/20 text-xs border-cyan-500">
                      YOU
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Dealer's hand section */}
        <div className="space-y-2">
          <label className="text-sm font-mono text-cyan-400 uppercase tracking-wide">
            Dealer Protocol
          </label>
          <div
            className={cn(
              "flex gap-2 h-16 items-center rounded-lg px-3 border transition-colors cursor-pointer",
              "bg-black/50 backdrop-blur-sm",
              activeHandIndex === -1
                ? "border-cyan-500 shadow-neon"
                : "border-cyan-500/30 hover:border-cyan-500/50"
            )}
            onClick={() =>
              setActiveHandIndex(activeHandIndex === -1 ? null : -1)
            }
          >
            {dealerHand.cards.map((card, i) => (
              <div key={`dealer-card-${i}`} className="relative group">
                {renderCard(card, i === 1, -1, i)}
              </div>
            ))}
            {dealerHand.cards.length < 2 && (
              <Button
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHandIndex(-1);
                }}
                className={cn(
                  "hover:bg-cyan-500/20 text-cyan-300 font-mono",
                  activeHandIndex === -1 && "border-cyan-500"
                )}
              >
                + ADD CARD
              </Button>
            )}
          </div>
        </div>

        {/* Player hands section */}
        <div className="space-y-2">
          <label className="text-sm font-mono text-cyan-400 uppercase tracking-wide">
            Player Hands
          </label>
          <div className="space-y-3">
            {hands.map((hand, index) => (
              <div
                key={hand.id}
                className={cn(
                  "space-y-2 p-3 rounded-lg border backdrop-blur-sm cursor-pointer",
                  "bg-black/50 hover:bg-black/60 transition-colors",
                  activeHandIndex === hand.id
                    ? "border-cyan-500 shadow-neon"
                    : "border-cyan-500/30 hover:border-cyan-500/50"
                )}
                onClick={() => setActiveHandIndex(hand.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-cyan-300">
                      HAND {index + 1}
                    </span>
                    {hand.isYourHand && (
                      <Badge
                        variant="outline"
                        className="text-xs border-cyan-500/30 font-mono bg-cyan-500/10"
                      >
                        YOU
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {hand.cards.map((card, i) => (
                    <div
                      key={`hand-${hand.id}-card-${i}`}
                      className="relative group"
                    >
                      {renderCard(card, false, hand.id, i)}
                    </div>
                  ))}
                  {hand.cards.length < 2 && (
                    <Button
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHandIndex(hand.id);
                      }}
                      className={cn(
                        "hover:bg-cyan-500/20 text-cyan-300 font-mono border border-transparent",
                        activeHandIndex === hand.id && "border-cyan-500/50"
                      )}
                    >
                      + ADD CARD
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card selection grid - Only show when dealer or player hand is selected */}
        {activeHandIndex !== null && (
          <div className="space-y-2">
            <label className="text-sm font-mono text-cyan-400 uppercase tracking-wide">
              {activeHandIndex === -1
                ? "SELECT DEALER CARD"
                : "SELECT PLAYER CARD"}
            </label>
            <div className="grid grid-cols-5 gap-1.5 p-4 bg-black/40 rounded-lg border border-cyan-500/30 shadow-neon">
              {Object.entries(deckState).map(([card, count]) => (
                <Button
                  key={card}
                  variant="outline"
                  onClick={() => handleCardSelect(card as Card)}
                  disabled={count === 0}
                  className={cn(
                    "h-12 text-lg font-mono relative transition-colors",
                    "bg-black/40 border-cyan-500/30",
                    "hover:bg-cyan-500/20 hover:border-cyan-500/50",
                    count === 0 && "opacity-50"
                  )}
                >
                  {card}
                  <Badge
                    variant="outline"
                    className="absolute -top-2 -right-2 h-5 w-5 text-xs border-cyan-500/30"
                  >
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Move the complete setup button and requirements outside the card selection condition */}
        <Button
          className={cn(
            "w-full h-12 text-lg font-mono mt-4",
            "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500",
            "hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600",
            "text-white shadow-neon-lg transition-all duration-300",
            !isSetupComplete() && "opacity-50 cursor-not-allowed"
          )}
          onClick={handleCompleteSetup}
          disabled={!isSetupComplete()}
        >
          COMPLETE INITIAL DEAL
        </Button>

        {/* Requirements section */}
        <div className="space-y-2 bg-black/30 p-3 rounded-lg border border-cyan-500/20">
          <div className="text-sm font-mono text-cyan-400">REQUIREMENTS:</div>
          <div className="space-y-1 text-xs font-mono">
            <div
              className={cn(
                "flex items-center gap-2",
                currentBet >= minBet && currentBet <= bankroll
                  ? "text-green-400"
                  : "text-cyan-300/60"
              )}
            >
              • Set valid bet amount
            </div>
            <div
              className={cn(
                "flex items-center gap-2",
                hands.some((h) => h.isYourHand)
                  ? "text-green-400"
                  : "text-cyan-300/60"
              )}
            >
              • Select at least one hand as yours
            </div>
            <div
              className={cn(
                "flex items-center gap-2",
                dealerHand.cards.length === 2
                  ? "text-green-400"
                  : "text-cyan-300/60"
              )}
            >
              • Deal dealer&apos;s cards
            </div>
            <div
              className={cn(
                "flex items-center gap-2",
                hands.every((h) => h.cards.length === 2)
                  ? "text-green-400"
                  : "text-cyan-300/60"
              )}
            >
              • Deal all player hands
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
