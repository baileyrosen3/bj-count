"use client";

import { useState } from "react";
import { Card } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StrategyAdvice } from "@/components/StrategyAdvice";
import { CountingSystem } from "@/lib/types";
import {
  calculateTrueCount,
  calculateRemainingDecks,
  getCardValue,
} from "@/lib/blackjack";
import { DealerPlay } from "@/components/DealerPlay";

interface PlayingHand {
  id: number;
  cards: Card[];
  isYourHand: boolean;
  bet: number;
  isDoubled: boolean;
  isSplit: boolean;
  isComplete: boolean;
}

interface DealerHand {
  cards: Card[];
  hiddenCard: Card | null;
}

interface PlayingTableProps {
  initialHands: PlayingHand[];
  dealerUpCard: Card;
  deckState: Record<Card, number>;
  onCardSelect: (card: Card) => void;
  onHandComplete: (hand: PlayingHand) => void;
  onAllHandsComplete: () => void;
  runningCount: number;
  countingSystem: CountingSystem;
  onRunningCountChange: (count: number) => void;
}

export function PlayingTable({
  initialHands,
  dealerUpCard,
  deckState,
  onCardSelect,
  onHandComplete,
  onAllHandsComplete,
  runningCount,
  countingSystem,
  onRunningCountChange,
}: PlayingTableProps) {
  const [hands, setHands] = useState<PlayingHand[]>(initialHands);
  const [dealerHand, setDealerHand] = useState<DealerHand>({
    cards: [dealerUpCard],
    hiddenCard: null,
  });
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);
  const [showActions, setShowActions] = useState(true);
  const [showDealerPlay, setShowDealerPlay] = useState(false);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [currentRunningCount, setCurrentRunningCount] = useState(runningCount);
  const [gameComplete, setGameComplete] = useState(false);
  const [handResults, setHandResults] = useState<
    Record<number, "win" | "lose" | "push">
  >({});

  // Calculate true count whenever the running count or deck state changes
  const trueCount = calculateTrueCount(
    currentRunningCount,
    calculateRemainingDecks(deckState)
  );

  const getCardColor = (card: Card) => {
    if (["2", "3", "4", "5", "6"].includes(card)) {
      return "bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-200/50 dark:bg-blue-400/25 dark:hover:bg-blue-400/35 dark:text-blue-200";
    }
    if (["10", "J", "Q", "K", "A"].includes(card)) {
      return "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-200/50 dark:bg-red-400/25 dark:hover:bg-red-400/35 dark:text-red-200";
    }
    return "bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-200 border-zinc-200/50 dark:bg-zinc-400/25 dark:hover:bg-zinc-400/35 dark:text-zinc-200";
  };

  const canSplit = (hand: PlayingHand) => {
    console.log("Split Check:", {
      hand,
      cardLength: hand.cards.length,
      cardsMatch: hand.cards[0] === hand.cards[1],
      notDoubled: !hand.isDoubled,
      notSplit: !hand.isSplit,
    });

    // Check for face cards (10, J, Q, K should be splittable)
    const isSameValue = (card1: Card, card2: Card) => {
      const faceCards = ["10", "J", "Q", "K"];
      if (faceCards.includes(card1) && faceCards.includes(card2)) return true;
      return card1 === card2;
    };

    return (
      hand.cards.length === 2 &&
      isSameValue(hand.cards[0], hand.cards[1]) &&
      !hand.isDoubled &&
      !hand.isSplit &&
      // Add check for available deck cards
      deckState[hand.cards[0]] > 0
    );
  };

  const handleAction = async (action: "hit" | "stand" | "double" | "split") => {
    const currentHand = hands[activeHandIndex];
    if (!currentHand) return;

    switch (action) {
      case "stand":
        // Mark current hand as complete and move to next
        setHands((prev) =>
          prev.map((hand, idx) =>
            idx === activeHandIndex ? { ...hand, isComplete: true } : hand
          )
        );
        moveToNextHand();
        break;

      case "hit":
        // Set state to show card selection UI
        setIsSelectingCard(true);
        break;

      case "double":
        if (currentHand.cards.length === 2) {
          // Double bet and allow only one more card
          setHands((prev) =>
            prev.map((hand, idx) =>
              idx === activeHandIndex
                ? { ...hand, bet: hand.bet * 2, isDoubled: true }
                : hand
            )
          );
          setShowActions(false); // Show card selection for final card
        }
        break;

      case "split":
        if (canSplit(currentHand)) {
          console.log("Splitting hand:", currentHand);
          // Create two new hands from the split pair
          const newHands: PlayingHand[] = [
            {
              ...currentHand,
              cards: [currentHand.cards[0]],
              isSplit: true,
              isComplete: false,
              isDoubled: false,
            },
            {
              ...currentHand,
              id: hands.length,
              cards: [currentHand.cards[1]],
              isSplit: true,
              isComplete: false,
              isDoubled: false,
            },
          ];

          setHands((prev) => [
            ...prev.slice(0, activeHandIndex),
            ...newHands,
            ...prev.slice(activeHandIndex + 1),
          ]);
          setShowActions(false); // Show card selection for first split hand
        } else {
          console.log("Cannot split hand:", currentHand);
        }
        break;
    }
  };

  const calculateHandTotal = (cards: Card[]): number => {
    let total = 0;
    let aces = 0;

    cards.forEach((card) => {
      if (card === "A") {
        aces += 1;
        total += 11;
      } else if (["K", "Q", "J"].includes(card)) {
        total += 10;
      } else {
        total += parseInt(card);
      }
    });

    // Adjust for aces
    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }

    return total;
  };

  const isHandBust = (cards: Card[]): boolean => {
    return calculateHandTotal(cards) > 21;
  };

  const handleCardSelected = (card: Card) => {
    console.log("Card Selected:", card);
    const currentHand = hands[activeHandIndex];
    if (!currentHand) return;

    // Add card to current hand
    setHands((prev) =>
      prev.map((hand, idx) =>
        idx === activeHandIndex
          ? { ...hand, cards: [...hand.cards, card] }
          : hand
      )
    );
    onCardSelect(card);

    // Update running count
    const cardValue = getCardValue(card);
    console.log("Card Value for counting:", card, cardValue);
    onRunningCountChange(runningCount + cardValue);
    setCurrentRunningCount(runningCount + cardValue);

    // Reset card selection state
    setIsSelectingCard(false);

    // Check for bust after adding card
    const updatedCards = [...currentHand.cards, card];
    if (isHandBust(updatedCards)) {
      setHands((prev) =>
        prev.map((hand, idx) =>
          idx === activeHandIndex
            ? { ...hand, cards: updatedCards, isComplete: true }
            : hand
        )
      );
      moveToNextHand();
    } else if (currentHand.isDoubled) {
      setHands((prev) =>
        prev.map((hand, idx) =>
          idx === activeHandIndex
            ? { ...hand, cards: updatedCards, isComplete: true }
            : hand
        )
      );
      moveToNextHand();
    } else {
      setShowActions(true);
    }
  };

  const moveToNextHand = () => {
    const nextIncompleteIndex = hands.findIndex(
      (hand, idx) => idx > activeHandIndex && !hand.isComplete
    );

    if (nextIncompleteIndex !== -1) {
      setActiveHandIndex(nextIncompleteIndex);
      setShowActions(true);
    } else {
      setShowDealerPlay(true);
    }
  };

  const handleNewSetup = () => {
    // Keep the running count and deck state
    // Only reset the hands and game state
    setHands(
      initialHands.map((hand) => ({ ...hand, cards: [], isComplete: false }))
    );
    setDealerHand({ cards: [dealerUpCard], hiddenCard: null });
    setActiveHandIndex(0);
    setShowActions(true);
    setShowDealerPlay(false);
    setGameComplete(false);
    setHandResults({});
    // Don't reset currentRunningCount - keep it!
    onAllHandsComplete(); // This should now preserve the count and deck state
  };

  const handleLeaveTable = () => {
    // This is the only place where we should fully reset everything
    setHands([]);
    setDealerHand({ cards: [], hiddenCard: null });
    setActiveHandIndex(0);
    setShowActions(false);
    setShowDealerPlay(false);
    setGameComplete(false);
    setHandResults({});
    setCurrentRunningCount(0);
    onAllHandsComplete();
    // Now you can safely navigate away or end the game
    window.location.href = "/";
  };

  const calculateHandResult = (
    playerHand: PlayingHand,
    dealerCards: Card[]
  ) => {
    const playerTotal = calculateHandTotal(playerHand.cards);
    const dealerTotal = calculateHandTotal(dealerCards);

    if (isHandBust(playerHand.cards)) return "lose";
    if (isHandBust(dealerCards)) return "win";

    if (playerTotal > dealerTotal) return "win";
    if (playerTotal < dealerTotal) return "lose";
    return "push";
  };

  const handleDealerComplete = (finalDealerCards: Card[]) => {
    // Calculate results for all hands
    const results: Record<number, "win" | "lose" | "push"> = {};
    hands.forEach((hand) => {
      results[hand.id] = calculateHandResult(hand, finalDealerCards);
    });

    setHandResults(results);
    setDealerHand((prev) => ({
      ...prev,
      cards: finalDealerCards,
    }));
    setGameComplete(true);
    onAllHandsComplete();
  };

  return (
    <div className="space-y-6 text-white">
      <div className="bg-primary/20 dark:bg-primary/30 -mx-4 -mt-4 px-4 py-3 border-b border-border">
        <div className="text-lg font-semibold">Playing Hands</div>
      </div>

      <div className="space-y-4">
        {/* Display Running Count and True Count */}
        <div className="flex justify-between text-sm font-medium">
          <span>Running Count: {currentRunningCount}</span>
          <span>True Count: {trueCount}</span>
        </div>

        {/* Dealer's Hand */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dealer&apos;s Hand</label>
          <div className="flex gap-2 h-16 items-center rounded-lg px-3 border border-border bg-background/80">
            {dealerHand.cards.map((card, i) => (
              <Badge
                key={i}
                variant="outline"
                className={cn(
                  "h-10 w-8 flex items-center justify-center text-lg font-medium",
                  getCardColor(card)
                )}
              >
                {card}
              </Badge>
            ))}
            <Badge
              variant="outline"
              className="h-10 w-8 flex items-center justify-center text-lg font-medium bg-primary/25 text-primary-foreground"
            >
              ?
            </Badge>
          </div>
        </div>

        {/* Player Hands */}
        {!showDealerPlay && (
          <div className="space-y-3">
            {hands.map((hand, index) => (
              <div
                key={hand.id}
                className={cn(
                  "space-y-2 p-3 rounded-lg border",
                  index === activeHandIndex
                    ? "border-primary bg-background"
                    : "border-border bg-background/60",
                  hand.isComplete && "opacity-60"
                )}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Hand {index + 1}
                    </span>
                    {hand.isYourHand && (
                      <Badge
                        variant="outline"
                        className="text-xs border-primary"
                      >
                        You
                      </Badge>
                    )}
                    {isHandBust(hand.cards) ? (
                      <Badge variant="destructive" className="text-xs">
                        Bust ({calculateHandTotal(hand.cards)})
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Total: {calculateHandTotal(hand.cards)}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline">${hand.bet}</Badge>
                </div>

                <div className="flex gap-2">
                  {hand.cards.map((card, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className={cn(
                        "h-10 w-8 flex items-center justify-center text-lg font-medium",
                        getCardColor(card)
                      )}
                    >
                      {card}
                    </Badge>
                  ))}
                </div>

                {index === activeHandIndex &&
                  !hand.isComplete &&
                  !isHandBust(hand.cards) && (
                    <>
                      <StrategyAdvice
                        dealerUpCard={dealerHand.cards[0]}
                        playerCards={hand.cards}
                        deckState={deckState}
                        runningCount={currentRunningCount}
                        countingSystem={countingSystem}
                      />
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          variant="outline"
                          onClick={() => handleAction("stand")}
                          className="text-white"
                        >
                          Stand
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleAction("hit")}
                          className="text-white"
                        >
                          Hit
                        </Button>
                        {hand.cards.length === 2 && (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => handleAction("double")}
                              disabled={hand.isDoubled || hand.isSplit}
                              className="text-white"
                            >
                              Double
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleAction("split")}
                              disabled={!canSplit(hand)}
                              className="text-white"
                            >
                              Split
                              {process.env.NODE_ENV === "development" && (
                                <span className="text-xs opacity-50">
                                  ({hand.cards.join(",")})
                                </span>
                              )}
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Dealer Play */}
        {showDealerPlay && (
          <DealerPlay
            upCard={dealerHand.cards[0]}
            deckState={deckState}
            onCardSelect={(card) => {
              onCardSelect(card);
              const cardValue = getCardValue(card);
              console.log("Dealer card value for counting:", card, cardValue);
              onRunningCountChange(runningCount + cardValue);
              setCurrentRunningCount(runningCount + cardValue);
            }}
            onComplete={handleDealerComplete}
          />
        )}

        {/* Next Round Button */}
        {gameComplete && (
          <div className="space-y-4">
            <div className="bg-primary/20 p-4 rounded-lg border border-primary/30">
              <h3 className="text-lg font-semibold mb-3">Hand Results</h3>
              <div className="space-y-2">
                {hands.map((hand) => (
                  <div
                    key={hand.id}
                    className="flex justify-between items-center p-2 bg-background/50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Hand {hand.id + 1}</span>
                      {hand.isYourHand && (
                        <Badge
                          variant="outline"
                          className="text-xs border-primary"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {calculateHandTotal(hand.cards)} vs{" "}
                        {calculateHandTotal(dealerHand.cards)}
                      </span>
                      <Badge
                        variant={
                          handResults[hand.id] === "win"
                            ? "default"
                            : handResults[hand.id] === "lose"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {handResults[hand.id]?.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleNewSetup}
                className="bg-primary text-white hover:bg-primary/90"
              >
                New Setup
              </Button>
              <Button
                onClick={handleLeaveTable}
                variant="outline"
                className="text-white"
              >
                Leave Table
              </Button>
            </div>
          </div>
        )}

        {isSelectingCard && (
          <div className="grid grid-cols-5 gap-1.5">
            {Object.entries(deckState).map(([card, count]) => (
              <Button
                key={card}
                variant="outline"
                onClick={() => {
                  console.log("Button Clicked:", card);
                  handleCardSelected(card as Card);
                }}
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
        )}
      </div>
    </div>
  );
}
