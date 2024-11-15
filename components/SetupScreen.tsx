"use client";

import { Button } from "../components/ui/button";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { CountingSystem, COUNTING_SYSTEMS } from "../lib/types";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils";

interface SetupScreenProps {
  onStart: (
    decks: number,
    bankroll: number,
    unitSize: number,
    system: CountingSystem
  ) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
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
    <div className="flex flex-col items-center space-y-10 p-6 w-full max-w-md mx-auto relative">
      <div className="absolute inset-0 pointer-events-none scanlines opacity-20" />

      <h1 className="text-4xl font-mono text-foreground tracking-tight relative glow-text">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
          Card Counter v1.0
        </span>
      </h1>

      <div className="flex flex-col w-full space-y-8 retro-terminal-bg p-6 rounded-lg border border-cyan-500/30 shadow-neon">
        <div className="w-full space-y-3">
          <Label className="text-lg font-mono text-cyan-400 uppercase tracking-wide">
            Select System.exe
          </Label>
          <Select
            value={selectedSystem}
            onValueChange={(value: string) =>
              setSelectedSystem(value as CountingSystem)
            }
          >
            <SelectTrigger className="w-full bg-black/50 border-cyan-500/50 text-cyan-300 h-12 text-base px-4 font-mono hover:border-pink-500/50 transition-colors pt-12 pb-12">
              <SelectValue placeholder="INITIALIZE COUNTING SYSTEM" />
            </SelectTrigger>
            <SelectContent className="bg-black/95 backdrop-blur-sm border-cyan-500/50 font-mono">
              {COUNTING_SYSTEMS.map((system) => (
                <SelectItem
                  key={system.name}
                  value={system.name}
                  className="py-2.5 px-4 focus:bg-cyan-500/20"
                >
                  <div className="flex flex-col space-y-1.5 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono truncate text-cyan-300">
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
                        className="font-mono text-xs shrink-0 bg-gradient-to-r from-cyan-500 to-purple-500"
                      >
                        {system.complexity}
                      </Badge>
                    </div>
                    <span className="text-xs text-cyan-300/70 line-clamp-2">
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
                  className="text-xs px-2 py-0.5 border-cyan-500/30 text-cyan-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col space-y-3 h-[104px]">
            <label className="text-lg font-mono text-cyan-400 uppercase tracking-wide">
              Deck Config
            </label>
            <div className="flex items-center gap-4 bg-black/50 p-3 rounded-xl border border-cyan-500/30 backdrop-blur-sm h-[48px]">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => adjustDecks(false)}
                disabled={numberOfDecks <= 1}
                className="h-8 w-8 hover:bg-cyan-500/20 border border-cyan-500/30"
              >
                <Minus className="h-4 w-4 text-cyan-400" />
              </Button>
              <span className="w-8 text-center text-2xl font-mono text-cyan-300">
                {numberOfDecks}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => adjustDecks(true)}
                disabled={numberOfDecks >= 8}
                className="h-8 w-8 hover:bg-cyan-500/20 border border-cyan-500/30"
              >
                <Plus className="h-4 w-4 text-cyan-400" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col space-y-3 h-[104px]">
            <Label className="text-lg font-mono text-cyan-400 uppercase tracking-wide">
              Bankroll
            </Label>
            <div className="relative h-[48px]">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-300 text-lg">
                $
              </span>
              <Input
                type="number"
                value={bankroll}
                onChange={(e) => handleBankrollChange(e.target.value)}
                className="pl-9 h-full bg-black/50 border-cyan-500/30 text-cyan-300 text-lg font-mono"
                min={1}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-lg font-mono text-cyan-400 uppercase tracking-wide">
              Unit Size
            </Label>
            <span className="text-lg font-mono text-cyan-300 bg-black/50 px-3 py-1.5 rounded-lg border border-cyan-500/30">
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
        className={cn(
          "w-full max-w-[250px] h-12 text-lg font-mono mx-auto",
          "bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500",
          "hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600",
          "text-white shadow-neon-lg transition-all duration-300"
        )}
        onClick={() =>
          onStart(numberOfDecks, bankroll, unitSize, selectedSystem)
        }
      >
        INITIALIZE GAME
      </Button>
    </div>
  );
}
