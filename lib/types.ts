export type CountingSystem =
  | "Hi-Lo"
  | "Hi-Opt I"
  | "Hi-Opt II"
  | "Omega II"
  | "Zen Count"
  | "KO";
export type Card =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A"
  | "?";
export type CardValueMap = Record<Card, number>;
export type Action = "H" | "S" | "D" | "Ds" | "Y" | "N" | "Y/N";

export const COUNTING_SYSTEM_VALUES: Record<CountingSystem, CardValueMap> = {
  "Hi-Lo": {
    "2": 1,
    "3": 1,
    "4": 1,
    "5": 1,
    "6": 1,
    "7": 0,
    "8": 0,
    "9": 0,
    "10": -1,
    J: -1,
    Q: -1,
    K: -1,
    A: -1,
    "?": 0,
  },
  "Hi-Opt I": {
    "2": 0,
    "3": 1,
    "4": 1,
    "5": 1,
    "6": 1,
    "7": 0,
    "8": 0,
    "9": 0,
    "10": -1,
    J: -1,
    Q: -1,
    K: -1,
    A: 0,
    "?": 0,
  },
  "Hi-Opt II": {
    "2": 1,
    "3": 1,
    "4": 2,
    "5": 2,
    "6": 1,
    "7": 1,
    "8": 0,
    "9": 0,
    "10": -2,
    J: -2,
    Q: -2,
    K: -2,
    A: 0,
    "?": 0,
  },
  KO: {
    "2": 1,
    "3": 1,
    "4": 1,
    "5": 1,
    "6": 1,
    "7": 1,
    "8": 0,
    "9": 0,
    "10": -1,
    J: -1,
    Q: -1,
    K: -1,
    A: -1,
    "?": 0,
  },
  "Omega II": {
    "2": 1,
    "3": 1,
    "4": 2,
    "5": 2,
    "6": 2,
    "7": 1,
    "8": 0,
    "9": -1,
    "10": -2,
    J: -2,
    Q: -2,
    K: -2,
    A: 0,
    "?": 0,
  },
  "Zen Count": {
    "2": 1,
    "3": 1,
    "4": 2,
    "5": 2,
    "6": 2,
    "7": 1,
    "8": 0,
    "9": 0,
    "10": -2,
    J: -2,
    Q: -2,
    K: -2,
    A: -1,
    "?": 0,
  },
};

export interface CountingSystemInfo {
  name: CountingSystem;
  description: string;
  complexity: "Basic" | "Intermediate" | "Advanced";
  tags: string[];
  cardValues: CardValueMap;
}

export const COUNTING_SYSTEMS: CountingSystemInfo[] = [
  {
    name: "Hi-Lo",
    description:
      "Most popular system. Easy to learn, balanced. +1, 0, -1 values.",
    complexity: "Basic",
    tags: ["Balanced", "Level 1"],
    cardValues: COUNTING_SYSTEM_VALUES["Hi-Lo"],
  },
  {
    name: "Hi-Opt II",
    description: "Very accurate, complex values for better precision.",
    complexity: "Advanced",
    tags: ["Balanced", "Level 2"],
    cardValues: COUNTING_SYSTEM_VALUES["Hi-Opt II"],
  },
  {
    name: "KO",
    description: "Unbalanced system, no true count conversion needed.",
    complexity: "Basic",
    tags: ["Unbalanced", "Level 1"],
    cardValues: COUNTING_SYSTEM_VALUES["KO"],
  },
  {
    name: "Omega II",
    description: "Highly accurate, uses multiple point values.",
    complexity: "Advanced",
    tags: ["Balanced", "Level 2"],
    cardValues: COUNTING_SYSTEM_VALUES["Omega II"],
  },
];
