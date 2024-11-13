import {
  getCardValue,
  setCurrentCountingSystem,
  calculateTrueCount,
  initialDeckState,
} from "../blackjack";
import {
  COUNTING_SYSTEM_VALUES,
  CountingSystem,
  Card,
  CardValueMap,
} from "../types";

describe("Card Counting Logic", () => {
  beforeEach(() => {
    // Reset to default system before each test
    setCurrentCountingSystem("Hi-Lo");
  });

  it("should return correct card values for Hi-Lo system", () => {
    const system: CountingSystem = "Hi-Lo";
    setCurrentCountingSystem(system);

    Object.entries(COUNTING_SYSTEM_VALUES[system]).forEach(([card, value]) => {
      expect(getCardValue(card as Card)).toBe(value);
    });
  });

  it("should return correct card values for KO system", () => {
    const system: CountingSystem = "KO";
    setCurrentCountingSystem(system);

    Object.entries(COUNTING_SYSTEM_VALUES[system]).forEach(([card, value]) => {
      expect(getCardValue(card as Card)).toBe(value);
    });
  });

  it("should return correct card values for Hi-Opt II system", () => {
    const system: CountingSystem = "Hi-Opt II";
    setCurrentCountingSystem(system);

    Object.entries(COUNTING_SYSTEM_VALUES[system]).forEach(([card, value]) => {
      expect(getCardValue(card as Card)).toBe(value);
    });
  });

  it("should fallback to Hi-Lo if counting system is not found", () => {
    // @ts-ignore
    setCurrentCountingSystem("Unknown-System");

    expect(getCardValue("2")).toBe(COUNTING_SYSTEM_VALUES["Hi-Lo"]["2"]);
    expect(getCardValue("A")).toBe(COUNTING_SYSTEM_VALUES["Hi-Lo"]["A"]);
  });

  describe("calculateTrueCount", () => {
    it("should calculate true count correctly for balanced systems", () => {
      const system: CountingSystem = "Hi-Lo";
      setCurrentCountingSystem(system);

      expect(calculateTrueCount(10, 2)).toBe(5);
      expect(calculateTrueCount(15, 3)).toBe(5);
      expect(calculateTrueCount(-5, 2)).toBe(-2.5);
    });

    it("should return running count for unbalanced systems", () => {
      const system: CountingSystem = "KO";
      setCurrentCountingSystem(system);

      expect(calculateTrueCount(10, 2)).toBe(10);
      expect(calculateTrueCount(15, 3)).toBe(15);
      expect(calculateTrueCount(-5, 2)).toBe(-5);
    });

    it("should handle zero remaining decks gracefully", () => {
      const system: CountingSystem = "Hi-Lo";
      setCurrentCountingSystem(system);

      expect(calculateTrueCount(10, 0)).toBe(0);
    });
  });

  describe("initialDeckState", () => {
    it("should initialize deck state correctly for 6 decks", () => {
      const decks = 6;
      const deckState = initialDeckState(decks);

      expect(Object.keys(deckState).length).toBe(13); // 2-10, J, Q, K, A

      Object.entries(COUNTING_SYSTEM_VALUES["Hi-Lo"]).forEach(
        ([card, value]) => {
          expect(deckState[card as Card]).toBe(decks * 4);
        }
      );
    });

    it("should initialize deck state correctly for 1 deck", () => {
      const decks = 1;
      const deckState = initialDeckState(decks);

      expect(Object.keys(deckState).length).toBe(13);

      Object.entries(COUNTING_SYSTEM_VALUES["Hi-Lo"]).forEach(
        ([card, value]) => {
          expect(deckState[card as Card]).toBe(decks * 4);
        }
      );
    });
  });
});
