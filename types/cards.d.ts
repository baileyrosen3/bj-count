import { Card as CardType } from "@/lib/blackjack";

export interface DetectedCard {
  card: CardType;
  confidence: number;
  position: { x: number; y: number };
}

export interface CardDetection {
  bbox: [number, number, number, number]; // [x, y, width, height]
  class: string;
  score: number;
}
