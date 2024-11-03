import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface SetupScreenProps {
  onStart: (decks: number) => void;
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [numberOfDecks, setNumberOfDecks] = useState(6);

  const adjustDecks = (increment: boolean) => {
    const newNumberOfDecks = increment ? numberOfDecks + 1 : numberOfDecks - 1;
    const clampedDecks = Math.max(1, Math.min(8, newNumberOfDecks));
    setNumberOfDecks(clampedDecks);
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-4">
      <h1 className="text-3xl font-medium text-foreground">Card Counter</h1>

      <div className="flex flex-col items-center space-y-4">
        <label className="text-lg text-muted-foreground">Number of Decks</label>
        <div className="flex items-center gap-2 bg-card/50 p-2 rounded-xl border border-border/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => adjustDecks(false)}
            disabled={numberOfDecks <= 1}
            className="h-8 w-8 hover:bg-background/50"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-6 text-center text-foreground">
            {numberOfDecks}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => adjustDecks(true)}
            disabled={numberOfDecks >= 8}
            className="h-8 w-8 hover:bg-background/50"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Button
        className="w-full max-w-[200px] bg-primary hover:bg-primary/90"
        onClick={() => onStart(numberOfDecks)}
      >
        Start Game
      </Button>
    </div>
  );
}
