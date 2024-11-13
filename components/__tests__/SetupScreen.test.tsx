import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SetupScreen } from "../SetupScreen";
import { CountingSystem } from "@/lib/types";

describe("SetupScreen Component", () => {
  const mockOnStart = jest.fn();

  it("renders setup fields correctly", () => {
    render(<SetupScreen onStart={mockOnStart} />);

    expect(screen.getByText("Card Counter")).toBeInTheDocument();
    expect(screen.getByLabelText("Number of Decks")).toBeInTheDocument();
    expect(screen.getByLabelText("Bankroll")).toBeInTheDocument();
    expect(screen.getByLabelText("Unit Size")).toBeInTheDocument();
    expect(screen.getByLabelText("Counting System")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Start Game/i })
    ).toBeInTheDocument();
  });

  it("allows adjusting number of decks", () => {
    render(<SetupScreen onStart={mockOnStart} />);

    const incrementButton = screen.getByRole("button", { name: "Plus" });
    const decrementButton = screen.getByRole("button", { name: "Minus" });
    const decksDisplay = screen.getByText("6");

    fireEvent.click(incrementButton);
    expect(decksDisplay.textContent).toBe("7");

    fireEvent.click(decrementButton);
    expect(decksDisplay.textContent).toBe("6");
  });

  it("allows selecting a counting system", () => {
    render(<SetupScreen onStart={mockOnStart} />);

    const select = screen.getByLabelText("Counting System");
    fireEvent.change(select, { target: { value: "Omega II" } });

    expect(select).toHaveValue("Omega II");
  });

  it("calls onStart with correct parameters when starting the game", () => {
    render(<SetupScreen onStart={mockOnStart} />);

    const startButton = screen.getByRole("button", { name: /Start Game/i });

    fireEvent.click(startButton);

    expect(mockOnStart).toHaveBeenCalledWith(6, 1000, 25, "Hi-Lo");
  });
});
