"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/lib/blackjack";
import { cn } from "@/lib/utils";

interface ValueButtonProps {
  card: Card;
  count: number;
  onClick: () => void;
  disabled?: boolean;
}

export function ValueButton({
  card,
  count,
  onClick,
  disabled,
}: ValueButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-12 w-full text-lg font-medium border-border/50 flex flex-col gap-0.5 p-1 text-white",
        disabled && "opacity-50",
        ["2", "3", "4", "5", "6"].includes(card) &&
          "bg-blue-400/15 hover:bg-blue-400/25",
        ["10", "J", "Q", "K", "A"].includes(card) &&
          "bg-red-400/15 hover:bg-red-400/25"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="text-lg leading-none">{card}</span>
      <span className="text-[8px] text-muted-foreground/80 leading-none">
        {count}
      </span>
    </Button>
  );
}
