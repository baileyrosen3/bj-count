import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface SetupScreenProps {
  onStart: (decks: number, bankroll: number, unitSize: number) => void;
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [decks, setDecks] = useState(6);
  const [bankroll, setBankroll] = useState(1000);
  const [unitSize, setUnitSize] = useState(25);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(decks, bankroll, unitSize);
  };

  return (
    <div className="w-full max-w-md p-6 bg-card/30 rounded-xl backdrop-blur-sm border border-border/30">
      <h1 className="text-2xl font-bold text-center mb-6 text-foreground/80">
        Blackjack Counter Setup
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">
            Number of Decks
          </label>
          <input
            type="number"
            value={decks}
            onChange={(e) => setDecks(Number(e.target.value))}
            min={1}
            max={8}
            className="w-full p-2 rounded-md bg-background/30 border border-border/30 text-foreground/80 placeholder:text-foreground/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">
            Total Bankroll ($)
          </label>
          <input
            type="number"
            value={bankroll}
            onChange={(e) => setBankroll(Number(e.target.value))}
            min={100}
            className="w-full p-2 rounded-md bg-background/30 border border-border/30 text-foreground/80 placeholder:text-foreground/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/70">
            Minimum Bet/Unit Size ($)
          </label>
          <input
            type="number"
            value={unitSize}
            onChange={(e) => setUnitSize(Number(e.target.value))}
            min={1}
            className="w-full p-2 rounded-md bg-background/30 border border-border/30 text-foreground/80 placeholder:text-foreground/50"
          />
        </div>

        <Button type="submit" className="w-full">
          Start Game
        </Button>
      </form>
    </div>
  );
}
