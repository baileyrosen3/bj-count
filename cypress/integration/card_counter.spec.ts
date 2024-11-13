describe("Blackjack Card Counter App", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("allows the user to set up a game and start", () => {
    // Verify setup screen
    cy.contains("Card Counter").should("be.visible");

    // Adjust number of decks
    cy.get("button").contains("Plus").click();
    cy.get("button").contains("Plus").click();

    // Set bankroll
    cy.get('input[placeholder="Bankroll"]').clear().type("2000");

    // Set unit size
    cy.get('input[placeholder="Unit Size"]').clear().type("50");

    // Select counting system
    cy.get("select").select("Omega II");

    // Start the game
    cy.get("button").contains("Start Game").click();

    // Verify main game screen
    cy.contains("True Count").should("be.visible");
    cy.contains("Deck Statistics").should("be.visible");
    cy.contains("Strategy").should("be.visible");
    cy.contains("Statistics").should("be.visible");
  });

  it("allows the user to select dealer card and updates count", () => {
    // Assume the user starts a game first
    // You can abstract this into a custom Cypress command for reuse

    // Setup and start the game
    cy.get("button").contains("Start Game").click();

    // Select a dealer card
    cy.get("button").contains("5").click();

    // Verify that the running count and true count are updated
    cy.contains("True Count:").should("have.text", "True Count: 1");
  });

  // Add more tests to cover different scenarios
});
