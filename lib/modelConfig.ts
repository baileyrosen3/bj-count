export const MODEL_CONFIG = {
  modelPath: "/models/cards/model.json",
  inputSize: {
    width: 416,
    height: 416,
  },
  confidenceThreshold: 0.7,
  frameSkip: 2,
};

export const CARD_MAPPINGS = {
  // Add your card mappings here
  ace_spades: "A♠",
  two_spades: "2♠",
  // ... add all card mappings
} as const;
