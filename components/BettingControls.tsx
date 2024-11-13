import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Check, X } from "lucide-react";

interface BettingControlsProps {
  bankroll: number;
  minBet: number;
  onHandResult: (bet: number, isWin: boolean) => void;
}

export function BettingControls({
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
    <div className="space-y-4 bg-card/50 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
      <div className="flex justify-between items-center">
        <span className="text-sm text-foreground">Current Bankroll</span>
        <span className="font-bold text-foreground">
          ${bankroll.toFixed(2)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground">
            $
          </span>
          <Input
            type="number"
            value={currentBet}
            onChange={(e) => handleBetChange(e.target.value)}
            className="pl-7 text-foreground"
            min={minBet}
            max={bankroll}
          />
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => handleResult(true)}
            disabled={parseFloat(currentBet) > bankroll}
          >
            <Check className="w-4 h-4 mr-2" />
            Win
          </Button>
          <Button
            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
            onClick={() => handleResult(false)}
            disabled={parseFloat(currentBet) > bankroll}
          >
            <X className="w-4 h-4 mr-2" />
            Loss
          </Button>
        </div>
      </div>
    </div>
  );
}
