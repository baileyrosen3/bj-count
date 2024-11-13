import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountingSystem, COUNTING_SYSTEMS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface SetupScreenProps {
  onStart: (
    decks: number,
    bankroll: number,
    unitSize: number,
    system: CountingSystem
  ) => void;
}

export function SetupScreen({ onStart }: SetupScreenProps) {
  const [numberOfDecks, setNumberOfDecks] = useState(6);
  const [bankroll, setBankroll] = useState(1000);
  const [unitSize, setUnitSize] = useState(25);
  const [selectedSystem, setSelectedSystem] = useState<CountingSystem>("Hi-Lo");

  const adjustDecks = (increment: boolean) => {
    const newNumberOfDecks = increment ? numberOfDecks + 1 : numberOfDecks - 1;
    const clampedDecks = Math.max(1, Math.min(8, newNumberOfDecks));
    setNumberOfDecks(clampedDecks);
  };

  const handleBankrollChange = (value: string) => {
    const amount = parseFloat(value);
    if (!isNaN(amount) && amount > 0) {
      setBankroll(amount);
      if (unitSize > amount) {
        setUnitSize(Math.min(25, amount));
      }
    }
  };

  const handleUnitSizeChange = (value: number[]) => {
    setUnitSize(value[0]);
  };

  const selectedSystemInfo = COUNTING_SYSTEMS.find(
    (sys) => sys.name === selectedSystem
  );

  return (
    <div className="flex flex-col items-center space-y-10 p-6 w-full max-w-md mx-auto">
      <h1 className="text-4xl font-semibold text-foreground tracking-tight">
        Card Counter
      </h1>

      <div className="flex flex-col w-full space-y-8">
        <div className="w-full space-y-3">
          <Label className="text-lg font-medium text-foreground">
            Counting System
          </Label>
          <Select
            value={selectedSystem}
            onValueChange={(value) =>
              setSelectedSystem(value as CountingSystem)
            }
          >
            <SelectTrigger className="w-full bg-card/50 border-border/50 text-foreground h-12 text-base px-4 pt-12 pb-12">
              <SelectValue placeholder="Select a counting system" />
            </SelectTrigger>
            <SelectContent
              className="bg-background/95 backdrop-blur-sm border-border/50 w-[var(--radix-select-trigger-width)] max-h-[300px]"
              position="popper"
              sideOffset={5}
            >
              {COUNTING_SYSTEMS.map((system) => (
                <SelectItem
                  key={system.name}
                  value={system.name}
                  className="py-2.5 px-4 focus:bg-accent/50"
                >
                  <div className="flex flex-col space-y-1.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">
                        {system.name}
                      </span>
                      <Badge
                        variant={
                          system.complexity === "Basic"
                            ? "default"
                            : system.complexity === "Intermediate"
                            ? "secondary"
                            : "destructive"
                        }
                        className="font-medium text-xs shrink-0"
                      >
                        {system.complexity}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {system.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedSystemInfo && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSystemInfo.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs px-2 py-0.5"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <label className="text-lg font-medium text-foreground">
            Number of Decks
          </label>
          <div className="flex items-center gap-4 bg-card/50 p-3 rounded-xl border border-border/50 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => adjustDecks(false)}
              disabled={numberOfDecks <= 1}
              className="h-10 w-10 hover:bg-background/50"
            >
              <Minus className="h-5 w-5" />
            </Button>
            <span className="w-8 text-center text-2xl font-medium text-foreground">
              {numberOfDecks}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => adjustDecks(true)}
              disabled={numberOfDecks >= 8}
              className="h-10 w-10 hover:bg-background/50"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-lg font-medium text-foreground">
            Starting Bankroll
          </Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground text-lg">
              $
            </span>
            <Input
              type="number"
              value={bankroll}
              onChange={(e) => handleBankrollChange(e.target.value)}
              className="pl-9 h-12 bg-card/50 border-border/50 text-foreground text-lg"
              min={1}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-medium text-foreground">
              Unit Size
            </Label>
            <span className="text-lg font-medium text-foreground bg-card/50 px-3 py-1.5 rounded-lg border border-border/50">
              ${unitSize}
            </span>
          </div>
          <Slider
            value={[unitSize]}
            onValueChange={handleUnitSizeChange}
            min={1}
            max={Math.min(bankroll, 100)}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      <Button
        className="w-full max-w-[250px] h-12 text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
        onClick={() =>
          onStart(numberOfDecks, bankroll, unitSize, selectedSystem)
        }
      >
        Start Game
      </Button>
    </div>
  );
}
