export interface CountingSystem {
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
  10: number;
  J: number;
  Q: number;
  K: number;
  A: number;
}

export const hiLoSystem: CountingSystem = {
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
  7: 0,
  8: 0,
  9: 0,
  10: -1,
  J: -1,
  Q: -1,
  K: -1,
  A: -1,
};

export const calculateTrueCount = (
  runningCount: number,
  decksRemaining: number
): number => {
  return Math.round((runningCount / decksRemaining) * 100) / 100;
};

export const calculateWinLoss = (trueCount: number): number => {
  // Basic formula: -0.5% house edge + (0.5% * true count)
  return Math.round((-0.5 + 0.5 * trueCount) * 100) / 100;
};

export const calculateOptimalBet = (
  trueCount: number,
  minBet: number,
  maxBet: number
): number => {
  if (trueCount <= 1) return minBet;
  const betSpread = Math.min(Math.floor(trueCount) * minBet, maxBet);
  return Math.max(minBet, betSpread);
};

export const calculatePenetration = (
  totalDecks: number,
  cardsPlayed: number
): number => {
  return (cardsPlayed / (totalDecks * 52)) * 100;
};
