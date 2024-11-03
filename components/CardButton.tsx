"use client";

import { Button } from "@/components/ui/button";
import { Card, Suit } from "@/lib/blackjack";
import { cn } from "@/lib/utils";

interface CardButtonProps {
  card: Card;
  suit: Suit;
  onClick: () => void;
  disabled?: boolean;
}

export function CardButton({ card, suit, onClick, disabled }: CardButtonProps) {
  const isRed = suit === '♥' || suit === '♦';
  
  return (
    <Button
      variant="outline"
      className={cn(
        "h-16 w-12 text-lg font-bold border-2",
        isRed ? "text-red-500" : "text-black",
        disabled && "opacity-50"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex flex-col items-center">
        <span>{card}</span>
        <span className="text-sm">{suit}</span>
      </div>
    </Button>
  );
}