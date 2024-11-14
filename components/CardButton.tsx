"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CardButtonProps {
  card: Card;
  onClick: () => void;
  disabled?: boolean;
}

export function CardButton({ card, onClick, disabled }: CardButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-16 w-12 text-lg font-mono border-2",
        "bg-black/40 border-cyan-500/30",
        "hover:bg-cyan-500/20 hover:border-cyan-500/50",
        "text-cyan-300",
        disabled && "opacity-50"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex flex-col items-center">
        <span>{card}</span>
      </div>
    </Button>
  );
}
