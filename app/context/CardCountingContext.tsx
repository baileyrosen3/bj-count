"use client";

import React, { createContext, useContext, useState } from "react";
import {
  calculateTrueCount,
  calculateWinLoss,
  calculateOptimalBet,
} from "../utils/cardCounting";

interface CardCountingContextType {
  runningCount: number;
  decks: number;
  players: number;
  rules: string;
  minBet: number;
  maxBet: number;
  updateRunningCount: (count: number) => void;
  updateDecks: (decks: number) => void;
  updatePlayers: (players: number) => void;
  updateRules: (rules: string) => void;
  updateMinBet: (bet: number) => void;
  updateMaxBet: (bet: number) => void;
  getTrueCount: () => number;
  getWinLoss: () => number;
  getOptimalBet: () => number;
}

const CardCountingContext = createContext<CardCountingContextType | undefined>(
  undefined
);

export function CardCountingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [runningCount, setRunningCount] = useState(0);
  const [decks, setDecks] = useState(6);
  const [players, setPlayers] = useState(3);
  const [rules, setRules] = useState("H17 DAS");
  const [minBet, setMinBet] = useState(15);
  const [maxBet, setMaxBet] = useState(150);

  const getTrueCount = () => {
    return calculateTrueCount(runningCount, decks);
  };

  const getWinLoss = () => {
    return calculateWinLoss(getTrueCount());
  };

  const getOptimalBet = () => {
    return calculateOptimalBet(getTrueCount(), minBet, maxBet);
  };

  const value = {
    runningCount,
    decks,
    players,
    rules,
    minBet,
    maxBet,
    updateRunningCount: setRunningCount,
    updateDecks: setDecks,
    updatePlayers: setPlayers,
    updateRules: setRules,
    updateMinBet: setMinBet,
    updateMaxBet: setMaxBet,
    getTrueCount,
    getWinLoss,
    getOptimalBet,
  };

  return (
    <CardCountingContext.Provider value={value}>
      {children}
    </CardCountingContext.Provider>
  );
}

export function useCardCounting() {
  const context = useContext(CardCountingContext);
  if (context === undefined) {
    throw new Error(
      "useCardCounting must be used within a CardCountingProvider"
    );
  }
  return context;
}
