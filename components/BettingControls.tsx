import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { Check, X } from "lucide-react";

interface BettingControlsProps {
  bankroll: number;
  minBet: number;
  onHandResult: (bet: number, isWin: boolean) => void;
}

export default function BettingControls({
  bankroll,
  minBet,
  onHandResult,
}: BettingControlsProps) {
  const [currentBet, setCurrentBet] = useState<string>(minBet.toString());

  const handleBetChange = (value: string) => {
    const bet = parseFloat(value);
    if (!isNaN(bet) && bet >= minBet && bet <= bankroll) {
      setCurrentBet(value);
    }
  };

  const handleResult = (isWin: boolean) => {
    const bet = parseFloat(currentBet);
    if (!isNaN(bet) && bet >= minBet && bet <= bankroll) {
      onHandResult(bet, isWin);
      setCurrentBet(minBet.toString()); // Reset to minimum bet
    }
  };

  return (
    <div className="space-y-4 bg-black/40 p-4 rounded-xl border border-cyan-500/30 shadow-neon backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <span className="text-sm font-mono text-cyan-400">
          CURRENT BANKROLL
        </span>
        <span className="font-mono font-bold text-cyan-300">
          ${bankroll.toFixed(2)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300">
            $
          </span>
          <Input
            type="number"
            value={currentBet}
            onChange={(e) => handleBetChange(e.target.value)}
            className="pl-7 bg-black/30 border-cyan-500/30 text-cyan-300 font-mono"
            min={minBet}
            max={bankroll}
          />
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-gradient-to-r from-cyan-500 to-green-500 text-white font-mono"
            onClick={() => handleResult(true)}
            disabled={parseFloat(currentBet) > bankroll}
          >
            <Check className="w-4 h-4 mr-2" />
            WIN
          </Button>
          <Button
            className="flex-1 bg-gradient-to-r from-red-500 to-purple-500 text-white font-mono"
            onClick={() => handleResult(false)}
            disabled={parseFloat(currentBet) > bankroll}
          >
            <X className="w-4 h-4 mr-2" />
            LOSS
          </Button>
        </div>
      </div>
    </div>
  );
}
