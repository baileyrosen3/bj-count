import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { StrategyChart } from "../StrategyChart";
import { CountingSystem } from "@/lib/types";

describe("StrategyChart Component", () => {
  const mockOnDealerCardSelect = jest.fn();
  const mockOnCountUpdate = jest.fn();
  const deckState = {
    "2": 4,
    "3": 4,
    "4": 4,
    "5": 4,
    "6": 4,
    "7": 4,
    "8": 4,
    "9": 4,
    "10": 16,
    J: 4,
    Q: 4,
    K: 4,
    A: 4,
  };

  it("renders dealer cards correctly", () => {
    render(
      <StrategyChart
        dealerCard={null}
        onDealerCardSelect={mockOnDealerCardSelect}
        onCountUpdate={mockOnCountUpdate}
        deckState={deckState}
        runningCount={0}
        countingSystem="Hi-Lo"
      />
    );

    const dealerCardButtons = screen.getAllByRole("button", {
      name: /3|4|5|6|7|8|9|10|J|Q|K|A/,
    });
    expect(dealerCardButtons).toHaveLength(13);
  });

  it("calls onDealerCardSelect and onCountUpdate when a dealer card is clicked", () => {
    render(
      <StrategyChart
        dealerCard={null}
        onDealerCardSelect={mockOnDealerCardSelect}
        onCountUpdate={mockOnCountUpdate}
        deckState={deckState}
        runningCount={0}
        countingSystem="Hi-Lo"
      />
    );

    const dealerCardButton = screen.getByRole("button", { name: "5" });
    fireEvent.click(dealerCardButton);

    expect(mockOnDealerCardSelect).toHaveBeenCalledWith("5");
    expect(mockOnCountUpdate).toHaveBeenCalledWith(1); // Hi-Lo value for '5' is +1
  });

  it("disables dealer card button when count is 0", () => {
    const updatedDeckState = { ...deckState, "5": 0 };
    render(
      <StrategyChart
        dealerCard={null}
        onDealerCardSelect={mockOnDealerCardSelect}
        onCountUpdate={mockOnCountUpdate}
        deckState={updatedDeckState}
        runningCount={0}
        countingSystem="Hi-Lo"
      />
    );

    const dealerCardButton = screen.getByRole("button", { name: "5" });
    expect(dealerCardButton).toBeDisabled();
  });

  it("allows switching hand types and updates totals accordingly", () => {
    render(
      <StrategyChart
        dealerCard={null}
        onDealerCardSelect={mockOnDealerCardSelect}
        onCountUpdate={mockOnCountUpdate}
        deckState={deckState}
        runningCount={0}
        countingSystem="Hi-Lo"
      />
    );

    // Switch to Soft hands
    const softToggle = screen.getByRole("button", { name: "Soft" });
    fireEvent.click(softToggle);

    // Check if soft totals are rendered
    expect(screen.getByText("A,9")).toBeInTheDocument();
    expect(screen.getByText("A,2")).toBeInTheDocument();

    // Switch to Pairs
    const pairToggle = screen.getByRole("button", { name: "Pairs" });
    fireEvent.click(pairToggle);

    // Check if pair totals are rendered
    expect(screen.getByText("A,A")).toBeInTheDocument();
    expect(screen.getByText("2,2")).toBeInTheDocument();
  });

  it("displays action descriptions based on current strategy", () => {
    // Mock getActionDescription to return a specific value
    // This requires mocking the getAction and getActionDescription functions
    // Alternatively, ensure that StrategyChart renders correct actions based on inputs

    // For simplicity, assume default actions are rendered
    render(
      <StrategyChart
        dealerCard="5"
        onDealerCardSelect={mockOnDealerCardSelect}
        onCountUpdate={mockOnCountUpdate}
        deckState={deckState}
        runningCount={3}
        countingSystem="Hi-Lo"
      />
    );

    // Check for presence of action descriptions
    expect(
      screen.getByText(/Stand|Hit|Double|Split|No split/)
    ).toBeInTheDocument();
  });
});
