"use client";

import { useState, useEffect } from "react";
import { Card } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getCardValue } from "@/lib/blackjack";

interface BlackjackHand {
  id: number;
  cards: Card[];
  isPlayer: boolean;
  isYourHand: boolean;
}

interface BlackjackTableProps {
  deckState: Record<Card, number>;
  onCardSelect: (card: Card) => void;
  runningCount: number;
  countingSystem: string;
  onComplete: (playerHands: BlackjackHand[], dealerHand: BlackjackHand) => void;
  onRunningCountChange: (count: number) => void;
}

export function BlackjackTable({
  deckState,
  onCardSelect,
  runningCount,
  countingSystem,
  onComplete,
  onRunningCountChange,
}: BlackjackTableProps) {
  const [numberOfHands, setNumberOfHands] = useState<number>(1);
  const [selectedHandIndexes, setSelectedHandIndexes] = useState<number[]>([]);
  const [hands, setHands] = useState<BlackjackHand[]>([
    {
      id: 0,
      cards: [],
      isPlayer: true,
      isYourHand: false,
    },
  ]);
  const [dealerHand, setDealerHand] = useState<BlackjackHand>({
    id: -1,
    cards: [],
    isPlayer: false,
    isYourHand: false,
  });
  const [activeHandIndex, setActiveHandIndex] = useState<number | null>(null);

  const handleNumberOfHandsChange = (value: string) => {
    const num = parseInt(value);
    setNumberOfHands(num);
    setHands(
      Array.from({ length: num }, (_, i) => ({
        id: i,
        cards: [],
        isPlayer: true,
        isYourHand: false,
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
      return "bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-200/50 dark:bg-blue-400/25 dark:hover:bg-blue-400/35 dark:text-blue-200";
    }
    if (["10", "J", "Q", "K", "A"].includes(card)) {
      return "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-200/50 dark:bg-red-400/25 dark:hover:bg-red-400/35 dark:text-red-200";
    }
    return "bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-200 border-zinc-200/50 dark:bg-zinc-400/25 dark:hover:bg-zinc-400/35 dark:text-zinc-200";
  };

  // Add function to handle card deletion
  const handleCardDelete = (handId: number, cardIndex: number) => {
    if (handId === -1) {
      // Dealer hand
      const deletedCard = dealerHand.cards[cardIndex];
      if (deletedCard !== "?") {
        // Return card to deck
        onCardSelect(deletedCard);
        // Remove from running count
        const cardValue = getCardValue(deletedCard);
        console.log(
          `Removing dealer card ${deletedCard} with value ${cardValue} from count`
        );
        onRunningCountChange(runningCount - cardValue);
      }
      setDealerHand((prev) => ({
        ...prev,
        cards: prev.cards.filter((_, i) => i !== cardIndex),
      }));
    } else {
      // Player hand
      const hand = hands.find((h) => h.id === handId);
      if (hand) {
        const deletedCard = hand.cards[cardIndex];
        // Return card to deck
        onCardSelect(deletedCard);
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

  return (
    <div className="space-y-6 text-white">
      <div className="bg-primary/20 dark:bg-primary/30 -mx-4 -mt-4 px-4 py-3 border-b border-border">
        <div className="text-lg font-semibold">Table Setup</div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">
            Number of Hands
          </label>
          <Select
            value={numberOfHands.toString()}
            onValueChange={handleNumberOfHandsChange}
            defaultValue="1"
          >
            <SelectTrigger className="w-full bg-background/80 border-border text-white">
              <SelectValue placeholder="Select number of hands" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "hand" : "hands"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {numberOfHands > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Your Hands</label>
            <div className="grid grid-cols-4 gap-2">
              {hands.map((hand) => (
                <Button
                  key={hand.id}
                  variant={hand.isYourHand ? "default" : "outline"}
                  onClick={() => handlePlayerHandSelect(hand.id.toString())}
                  className={cn(
                    "h-12 relative",
                    hand.isYourHand
                      ? "bg-background hover:bg-background/90 text-white border-primary"
                      : "bg-white/10 hover:bg-white/20 text-white border-border"
                  )}
                >
                  <span className="text-sm font-light tracking-wide">
                    Hand {hand.id + 1}
                  </span>
                  {hand.isYourHand && (
                    <Badge className="absolute -top-2 -right-2 bg-primary text-xs">
                      You
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}

        {numberOfHands > 0 && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Dealer&apos;s Hand</label>
              <div
                className={cn(
                  "flex gap-2 h-16 items-center rounded-lg px-3 border transition-colors",
                  activeHandIndex === -1
                    ? "border-primary bg-primary/20 dark:bg-primary/30"
                    : "border-border bg-background/80"
                )}
                onClick={() => setActiveHandIndex(-1)}
              >
                {dealerHand.cards.map((card, i) =>
                  renderCard(card, i === 1, -1, i)
                )}
                {dealerHand.cards.length < 2 && (
                  <Button
                    variant="ghost"
                    onClick={() => setActiveHandIndex(-1)}
                    className={cn(
                      "hover:bg-primary/20 text-white",
                      activeHandIndex === -1 && "border-primary"
                    )}
                  >
                    + Add Card
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">All Hands</label>
              <div className="space-y-3">
                {hands.map((hand, index) => (
                  <div
                    key={hand.id}
                    className={cn(
                      "flex gap-2 h-16 items-center rounded-lg px-3 border transition-colors",
                      activeHandIndex === hand.id
                        ? "border-primary"
                        : "border-border",
                      hand.isYourHand
                        ? "bg-background hover:bg-background/90"
                        : "bg-white/10 hover:bg-white/20"
                    )}
                    onClick={() => setActiveHandIndex(hand.id)}
                  >
                    <div className="flex items-center gap-2 min-w-[4rem]">
                      <span className="text-sm font-medium">
                        Hand {hand.id + 1}
                      </span>
                      {hand.isYourHand && (
                        <Badge
                          variant="outline"
                          className="text-xs border-primary text-white"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    {hand.cards.map((card, cardIndex) =>
                      renderCard(card, false, hand.id, cardIndex)
                    )}
                    {hand.cards.length < 2 && (
                      <Button
                        variant="ghost"
                        onClick={() => setActiveHandIndex(hand.id)}
                        className={cn(
                          "hover:bg-primary/20 text-white",
                          activeHandIndex === hand.id && "border-primary"
                        )}
                      >
                        + Add Card
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {activeHandIndex !== null && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Card</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {Object.entries(deckState).map(([card, count]) => (
                    <Button
                      key={card}
                      variant="outline"
                      onClick={() => handleCardSelect(card as Card)}
                      disabled={count === 0}
                      className={cn(
                        "h-12 text-lg font-medium relative transition-colors",
                        getCardColor(card as Card),
                        count === 0 && "opacity-50"
                      )}
                    >
                      {card}
                      <Badge
                        variant="outline"
                        className={cn(
                          "absolute -top-2 -right-2 h-5 w-5 text-xs",
                          getCardColor(card as Card)
                        )}
                      >
                        {count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Button
              className="w-full bg-primary/90 hover:bg-primary text-black"
              disabled={!isSetupComplete()}
              onClick={() => {
                const playerHands = hands.map((h) => ({
                  ...h,
                  isPlayer: true,
                }));
                onComplete(playerHands, dealerHand);
              }}
            >
              Complete Initial Deal
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
