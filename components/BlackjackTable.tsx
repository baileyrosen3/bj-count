"use client";

import { useState } from "react";
import { Card } from "@/lib/blackjack";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ValueButton } from "@/components/ValueButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface BlackjackHand {
  id: number;
  cards: Card[];
  isPlayer: boolean;
  isYourHand: boolean;
}

interface BlackjackTableProps {
  deckState: Record<Card, number>;
  onCardSelect: (card: Card) => void;
  onComplete: (playerHands: BlackjackHand[], dealerHand: BlackjackHand) => void;
}

export function BlackjackTable({
  deckState,
  onCardSelect,
  onComplete,
}: BlackjackTableProps) {
  const [numberOfHands, setNumberOfHands] = useState<number>(0);
  const [selectedHandIndexes, setSelectedHandIndexes] = useState<number[]>([]);
  const [hands, setHands] = useState<BlackjackHand[]>([]);
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

  const handleCardSelect = (card: Card) => {
    if (activeHandIndex === null) return;

    if (activeHandIndex === -1) {
      // Dealer hand
      if (dealerHand.cards.length < 1) {
        // Add the visible card
        setDealerHand((prev) => ({
          ...prev,
          cards: [...prev.cards, card],
        }));
        onCardSelect(card);

        // Automatically add the hidden card (represented as "?")
        setDealerHand((prev) => ({
          ...prev,
          cards: [...prev.cards, "?" as Card],
        }));
      }
    } else {
      // Player hand
      const hand = hands[activeHandIndex];
      if (hand && hand.cards.length < 2) {
        setHands((prev) =>
          prev.map((h) =>
            h.id === activeHandIndex ? { ...h, cards: [...h.cards, card] } : h
          )
        );
        onCardSelect(card);
      }
    }
  };

  const isSetupComplete = () => {
    if (selectedHandIndexes.length === 0) return false;
    if (dealerHand.cards.length !== 2) return false;
    return hands.every((hand) =>
      hand.isPlayer ? hand.cards.length === 2 : true
    );
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

  const renderCard = (card: Card, isHidden: boolean = false) => (
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
  );

  return (
    <div className="space-y-6 text-white">
      <div className="bg-primary/20 dark:bg-primary/30 -mx-4 -mt-4 px-4 py-3 border-b border-border">
        <div className="text-lg font-semibold">Table Setup</div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Number of Hands</label>
          <Select
            value={numberOfHands.toString()}
            onValueChange={handleNumberOfHandsChange}
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
                {dealerHand.cards.map((card, i) => renderCard(card, i === 1))}
                {dealerHand.cards.length === 0 && (
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
                {hands.map((hand) => (
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
                    {hand.cards.map((card) => renderCard(card))}
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
              className="w-full bg-primary/90 hover:bg-primary text-white"
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
