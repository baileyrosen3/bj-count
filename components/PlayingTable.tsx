"use client";

import { useState } from "react";
import { Card } from "../lib/types";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";
import StrategyAdvice from "../components/StrategyAdvice";
import { CountingSystem } from "../lib/types";
import {
  calculateTrueCount,
  calculateRemainingDecks,
  getCardValue,
} from "../lib/blackjack";
import DealerPlay from "../components/DealerPlay";

interface PlayingHand {
  id: number;
  cards: Card[];
  isYourHand: boolean;
  bet: number;
  isDoubled: boolean;
  isSplit: boolean;
  isComplete: boolean;
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

// Add this interface for round stats
interface RoundStats {
  dealerTotal: number;
  dealerCards: Card[];
  dealerHasBlackjack: boolean;
  playerHands: {
    cards: Card[];
    total: number;
    bet: number;
    payout: number;
    result: "win" | "lose" | "push";
    isYourHand: boolean;
    isBlackjack: boolean;
  }[];
}

// Add new interface for table statistics
interface TableStats {
  totalHands: number;
  handsWon: number;
  handsLost: number;
  handsPushed: number;
  totalBetsWon: number;
  totalBetsLost: number;
  biggestWin: number;
  biggestLoss: number;
  currentStreak: number;
  longestWinStreak: number;
  longestLoseStreak: number;
}

// Add this helper function near the top of the file
const calculateDealerWinProbability = (
  dealerUpCard: Card,
  playerTotal: number
): number => {
  // Basic probability calculation
  const dealerValue = ["10", "J", "Q", "K"].includes(dealerUpCard)
    ? 10
    : dealerUpCard === "A"
    ? 11
    : parseInt(dealerUpCard);

  // If player has busted, dealer wins 100%
  if (playerTotal > 21) return 100;

  // If dealer has blackjack potential (A showing)
  if (dealerUpCard === "A") return 35;

  // If dealer has 10-value showing
  if (dealerValue === 10) return 30;

  // For other dealer upcards, rough probability based on card value
  return Math.max(0, Math.min(100, (dealerValue / playerTotal) * 25));
};

export default function PlayingTable({
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
  const [dealerHand, setDealerHand] = useState<{ cards: Card[] }>({
    cards: [dealerUpCard],
  });
  const [activeHandIndex, setActiveHandIndex] = useState<number>(0);
  const [showActions, setShowActions] = useState(true);
  const [showDealerPlay, setShowDealerPlay] = useState(false);
  const [isSelectingCard, setIsSelectingCard] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [roundStats, setRoundStats] = useState<RoundStats | null>(null);
  const [tableStats, setTableStats] = useState<TableStats>({
    totalHands: 0,
    handsWon: 0,
    handsLost: 0,
    handsPushed: 0,
    totalBetsWon: 0,
    totalBetsLost: 0,
    biggestWin: 0,
    biggestLoss: 0,
    currentStreak: 0,
    longestWinStreak: 0,
    longestLoseStreak: 0,
  });

  const getCardColor = (card: Card) => {
    if (["2", "3", "4", "5", "6"].includes(card)) {
      return "bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border-blue-200/50";
    }
    if (["10", "J", "Q", "K", "A"].includes(card)) {
      return "bg-red-500/20 hover:bg-red-500/30 text-red-200 border-red-200/50";
    }
    return "bg-zinc-500/20 hover:bg-zinc-500/30 text-zinc-200 border-zinc-200/50";
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

  const handleAction = (action: "hit" | "stand" | "double" | "split") => {
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
        setShowActions(false);
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
          setIsSelectingCard(true);
          setShowActions(false);
        }
        break;

      case "split":
        if (canSplit(currentHand)) {
          // Create two new hands from the split pair
          const newHands = [...hands];
          newHands.splice(
            activeHandIndex,
            1,
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
            }
          );
          setHands(newHands);
          setIsSelectingCard(true);
          setShowActions(false);
        }
        break;
    }
  };

  const canSplit = (hand: PlayingHand) => {
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

  const handleCardSelect = (card: Card) => {
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
    onRunningCountChange(runningCount + cardValue);

    // Check if hand should be completed
    const updatedCards = [...currentHand.cards, card];
    const total = calculateTotal(updatedCards);

    if (total > 21 || currentHand.isDoubled) {
      setHands((prev) =>
        prev.map((hand, idx) =>
          idx === activeHandIndex ? { ...hand, isComplete: true } : hand
        )
      );
      moveToNextHand();
    } else {
      setShowActions(true);
    }

    setIsSelectingCard(false);
  };

  const calculateTotal = (cards: Card[]): number => {
    let total = 0;
    let aces = 0;

    cards.forEach((card) => {
      if (card === "A") {
        aces += 1;
        total += 11;
      } else if (["K", "Q", "J", "10"].includes(card)) {
        total += 10;
      } else {
        total += parseInt(card);
      }
    });

    while (total > 21 && aces > 0) {
      total -= 10;
      aces -= 1;
    }

    return total;
  };

  const handleDealerComplete = (finalDealerCards: Card[]) => {
    const dealerTotal = calculateTotal(finalDealerCards);
    const dealerHasBlackjack =
      dealerTotal === 21 && finalDealerCards.length === 2;

    // Calculate results for all hands
    const handResults = hands.map((hand) => {
      const playerTotal = calculateTotal(hand.cards);
      const playerHasBlackjack = playerTotal === 21 && hand.cards.length === 2;
      let result: "win" | "lose" | "push" = "push";
      let payout = hand.bet; // Default payout is 1:1

      // Determine result and payout
      if (playerHasBlackjack) {
        if (dealerHasBlackjack) {
          result = "push";
          payout = hand.bet; // Push on both blackjack
        } else {
          result = "win";
          payout = hand.bet * 2.5; // 3:2 payout for blackjack
        }
      } else if (playerTotal > 21) {
        result = "lose";
        payout = 0;
      } else if (dealerTotal > 21) {
        result = "win";
        payout = hand.bet * 2; // Regular 1:1 payout
      } else if (playerTotal > dealerTotal) {
        result = "win";
        payout = hand.bet * 2; // Regular 1:1 payout
      } else if (playerTotal < dealerTotal) {
        result = "lose";
        payout = 0;
      } else {
        result = "push";
        payout = hand.bet; // Return original bet on push
      }

      // Call onHandComplete for each hand with the correct payout
      onHandComplete({
        ...hand,
        isComplete: true,
        bet: payout, // Pass the calculated payout
      });

      return {
        cards: hand.cards,
        total: playerTotal,
        bet: hand.bet, // Original bet amount for display
        payout: payout, // Add payout to track actual winnings
        result,
        isYourHand: hand.isYourHand,
        isBlackjack: playerHasBlackjack,
      };
    });

    // Update round stats with blackjack information
    setRoundStats({
      dealerTotal,
      dealerCards: finalDealerCards,
      dealerHasBlackjack,
      playerHands: handResults,
    });

    // Update table statistics
    const newTableStats = { ...tableStats };
    handResults.forEach((hand) => {
      newTableStats.totalHands++;

      if (hand.result === "win") {
        newTableStats.handsWon++;
        newTableStats.totalBetsWon += hand.payout - hand.bet; // Track actual profit
        newTableStats.biggestWin = Math.max(
          newTableStats.biggestWin,
          hand.payout - hand.bet
        );
        newTableStats.currentStreak++;
        newTableStats.longestWinStreak = Math.max(
          newTableStats.longestWinStreak,
          newTableStats.currentStreak
        );
      } else if (hand.result === "lose") {
        newTableStats.handsLost++;
        newTableStats.totalBetsLost += hand.bet;
        newTableStats.biggestLoss = Math.max(
          newTableStats.biggestLoss,
          hand.bet
        );
        newTableStats.currentStreak = Math.min(
          0,
          newTableStats.currentStreak - 1
        );
        newTableStats.longestLoseStreak = Math.min(
          newTableStats.longestLoseStreak,
          newTableStats.currentStreak
        );
      } else {
        newTableStats.handsPushed++;
      }
    });

    setTableStats(newTableStats);
    setIsRoundComplete(true);
    setHands(hands.map((hand) => ({ ...hand, isComplete: true })));
  };

  const renderRoundSummary = () => {
    if (!roundStats) return null;

    return (
      <div className="space-y-6 text-cyan-100">
        <div className="text-lg font-mono font-semibold text-cyan-300">
          ROUND COMPLETE
        </div>

        <div className="space-y-6">
          {/* Dealer's Final Hand */}
          <div className="space-y-2">
            <label className="text-sm font-mono text-cyan-400 uppercase tracking-wide">
              Dealer Final Hand
            </label>
            <div className="bg-black/50 p-4 rounded-lg border border-cyan-500/30 backdrop-blur-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-cyan-300">
                  TOTAL: {roundStats.dealerTotal}
                </span>
                {roundStats.dealerHasBlackjack && (
                  <Badge
                    variant="default"
                    className="bg-yellow-500/20 text-yellow-300"
                  >
                    BLACKJACK
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {roundStats.dealerCards.map((card, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className={cn(
                      "h-10 w-8 flex items-center justify-center text-lg font-mono",
                      getCardColor(card)
                    )}
                  >
                    {card}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Player Hands Results */}
          <div className="space-y-2">
            <label className="text-sm font-mono text-cyan-400 uppercase tracking-wide">
              Player Hands
            </label>
            <div className="space-y-3">
              {roundStats.playerHands.map((hand, index) => (
                <div
                  key={index}
                  className="bg-black/50 p-4 rounded-lg border border-cyan-500/30 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-300">
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
                    <Badge
                      variant={
                        hand.result === "win"
                          ? "default"
                          : hand.result === "lose"
                          ? "destructive"
                          : "secondary"
                      }
                      className="font-mono"
                    >
                      {hand.result.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex gap-2">
                      {hand.cards.map((card, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className={cn(
                            "h-10 w-8 flex items-center justify-center text-lg font-mono",
                            getCardColor(card)
                          )}
                        >
                          {card}
                        </Badge>
                      ))}
                    </div>
                    {hand.cards.length > 0 && (
                      <Badge
                        variant="outline"
                        className="h-10 px-3 flex items-center justify-center text-lg font-mono bg-cyan-500/10 border-cyan-500/30 ml-2"
                      >
                        {calculateTotal(hand.cards)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-mono text-cyan-300">
                      TOTAL: {hand.total}
                      {hand.isBlackjack && (
                        <Badge
                          variant="default"
                          className="ml-2 bg-yellow-500/20 text-yellow-300"
                        >
                          BLACKJACK
                        </Badge>
                      )}
                    </span>
                    <span className="font-mono text-cyan-300">
                      BET: ${hand.bet}
                      {hand.payout > hand.bet && (
                        <span className="text-green-400 ml-2">
                          (WIN: ${hand.payout - hand.bet})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Table Statistics Section */}
          <div className="space-y-2">
            <label className="text-sm font-mono text-cyan-400 uppercase tracking-wide">
              Table Statistics
            </label>
            <div className="bg-black/50 p-4 rounded-lg border border-cyan-500/30 backdrop-blur-sm space-y-4">
              {/* Win/Loss Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400">
                    TOTAL HANDS
                  </div>
                  <div className="text-lg font-mono text-cyan-300">
                    {tableStats.totalHands}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400">
                    WIN RATE
                  </div>
                  <div className="text-lg font-mono text-green-400">
                    {(
                      (tableStats.handsWon / tableStats.totalHands) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400">
                    PUSH RATE
                  </div>
                  <div className="text-lg font-mono text-cyan-300">
                    {(
                      (tableStats.handsPushed / tableStats.totalHands) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>

              {/* Money Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400">
                    TOTAL WON
                  </div>
                  <div className="text-lg font-mono text-green-400">
                    ${tableStats.totalBetsWon}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400">
                    TOTAL LOST
                  </div>
                  <div className="text-lg font-mono text-red-400">
                    ${tableStats.totalBetsLost}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400">
                    BIGGEST WIN
                  </div>
                  <div className="text-lg font-mono text-green-400">
                    ${tableStats.biggestWin}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400">
                    BIGGEST LOSS
                  </div>
                  <div className="text-lg font-mono text-red-400">
                    ${tableStats.biggestLoss}
                  </div>
                </div>
              </div>

              {/* Streak Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400">
                    CURRENT STREAK
                  </div>
                  <div
                    className={cn(
                      "text-lg font-mono",
                      tableStats.currentStreak > 0
                        ? "text-green-400"
                        : tableStats.currentStreak < 0
                        ? "text-red-400"
                        : "text-cyan-300"
                    )}
                  >
                    {Math.abs(tableStats.currentStreak)}
                    {tableStats.currentStreak > 0
                      ? " WINS"
                      : tableStats.currentStreak < 0
                      ? " LOSSES"
                      : " NONE"}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-mono text-cyan-400">
                    BEST STREAK
                  </div>
                  <div className="text-lg font-mono text-green-400">
                    {tableStats.longestWinStreak} WINS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* New Round Button */}
          <Button
            className={cn(
              "w-full h-12 text-lg font-mono mt-6",
              "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500",
              "hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600",
              "text-white shadow-neon-lg transition-all duration-300"
            )}
            onClick={onAllHandsComplete}
          >
            NEW ROUND
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 text-cyan-100 p-4">
      {isRoundComplete ? (
        renderRoundSummary()
      ) : (
        <>
          <div className="text-lg font-mono font-semibold text-cyan-300">
            {showDealerPlay
              ? "DEALER'S TURN"
              : `PLAYING HAND ${activeHandIndex + 1}/${hands.length}`}
          </div>

          <div className="space-y-4">
            {/* Dealer's Hand */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-mono text-cyan-400 uppercase tracking-wide">
                  Dealer Protocol
                </label>
                {!showDealerPlay && hands[activeHandIndex] && (
                  <span className="text-sm font-mono text-cyan-400">
                    {calculateDealerWinProbability(
                      dealerHand.cards[0],
                      calculateTotal(hands[activeHandIndex].cards)
                    ).toFixed(0)}
                    % chance to beat your hand
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center h-16 bg-black/50 rounded-lg px-3 border border-cyan-500/30 backdrop-blur-sm">
                <div className="flex gap-2">
                  {dealerHand.cards.map((card, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className={cn(
                        "h-10 w-8 flex items-center justify-center text-lg font-mono",
                        getCardColor(card)
                      )}
                    >
                      {card}
                    </Badge>
                  ))}
                </div>
                {dealerHand.cards.length > 0 && (
                  <Badge
                    variant="outline"
                    className="h-10 px-3 flex items-center justify-center text-lg font-mono bg-cyan-500/10 border-cyan-500/30 ml-2"
                  >
                    {calculateTotal(dealerHand.cards)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Player Hands */}
            {!showDealerPlay && (
              <div className="space-y-3">
                {hands.map((hand, index) => (
                  <div key={hand.id} className="space-y-2">
                    <div
                      className={cn(
                        "p-3 rounded-lg border backdrop-blur-sm",
                        index === activeHandIndex
                          ? "border-cyan-500 bg-black/60 shadow-neon"
                          : "border-cyan-500/30 bg-black/40",
                        hand.isComplete && "opacity-60"
                      )}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-cyan-300">
                            HAND {index + 1}
                          </span>
                          {hand.isYourHand && (
                            <Badge
                              variant="outline"
                              className="text-xs border-cyan-500/30 font-mono"
                            >
                              YOU
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-mono text-cyan-300 border-cyan-500/30"
                          >
                            BET: ${hand.bet}
                          </Badge>
                          {hand.isDoubled && (
                            <Badge
                              variant="outline"
                              className="font-mono text-purple-300 border-purple-500/30"
                            >
                              DOUBLED
                            </Badge>
                          )}
                          {hand.isSplit && (
                            <Badge
                              variant="outline"
                              className="font-mono text-blue-300 border-blue-500/30"
                            >
                              SPLIT
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <div className="flex gap-2">
                          {hand.cards.map((card, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className={cn(
                                "h-10 w-8 flex items-center justify-center text-lg font-mono",
                                getCardColor(card)
                              )}
                            >
                              {card}
                            </Badge>
                          ))}
                        </div>
                        {hand.cards.length > 0 && (
                          <Badge
                            variant="outline"
                            className="h-10 px-3 flex items-center justify-center text-lg font-mono bg-cyan-500/10 border-cyan-500/30 ml-2"
                          >
                            {calculateTotal(hand.cards)}
                          </Badge>
                        )}
                      </div>

                      {index === activeHandIndex &&
                        !hand.isComplete &&
                        showActions && (
                          <>
                            <StrategyAdvice
                              dealerUpCard={dealerHand.cards[0]}
                              playerCards={hand.cards}
                              deckState={deckState}
                              runningCount={runningCount}
                              countingSystem={countingSystem}
                            />
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Button
                                variant="outline"
                                onClick={() => handleAction("stand")}
                                className="font-mono text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
                              >
                                STAND
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => handleAction("hit")}
                                className="font-mono text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
                              >
                                HIT
                              </Button>
                              {hand.cards.length === 2 && (
                                <>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleAction("double")}
                                    disabled={hand.isDoubled || hand.isSplit}
                                    className="font-mono text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
                                  >
                                    DOUBLE
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleAction("split")}
                                    disabled={!canSplit(hand)}
                                    className="font-mono text-cyan-300 border-cyan-500/30 hover:bg-cyan-500/20"
                                  >
                                    SPLIT
                                  </Button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                    </div>

                    {/* Card Selection Grid - Show directly under active hand */}
                    {index === activeHandIndex &&
                      !hand.isComplete &&
                      isSelectingCard && (
                        <div className="grid grid-cols-5 gap-1.5 p-4 bg-black/40 rounded-lg border border-cyan-500/30">
                          {Object.entries(deckState).map(([card, count]) => (
                            <Button
                              key={card}
                              variant="outline"
                              onClick={() => handleCardSelect(card as Card)}
                              disabled={count === 0}
                              className={cn(
                                "h-12 text-lg font-mono relative",
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
                onCardSelect={onCardSelect}
                onComplete={handleDealerComplete}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
