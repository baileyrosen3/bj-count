# At the start of the file, add bankroll initialization
def initialize_game():
    while True:
        try:
            bankroll = float(input("Enter your starting bankroll amount: $"))
            if bankroll <= 0:
                print("Please enter a positive amount.")
                continue
            # Add game statistics dictionary
            stats = {
                'hands_played': 0,
                'hands_won': 0,
                'hands_lost': 0,
                'biggest_win': 0,
                'biggest_loss': 0,
                'initial_bankroll': bankroll,
                'peak_bankroll': bankroll
            }
            return bankroll, stats
        except ValueError:
            print("Please enter a valid number.")

def get_bet(bankroll):
    while True:
        try:
            bet = float(input(f"\nYour bankroll is ${bankroll:.2f}. Enter your bet amount: $"))
            if bet <= 0:
                print("Bet must be greater than 0.")
            elif bet > bankroll:
                print("Bet cannot exceed your bankroll.")
            else:
                return bet
        except ValueError:
            print("Please enter a valid number.")

def display_stats(stats, current_bankroll):
    print("\n=== Game Statistics ===")
    print(f"Hands Played: {stats['hands_played']}")
    win_rate = (stats['hands_won'] / stats['hands_played'] * 100) if stats['hands_played'] > 0 else 0
    print(f"Win Rate: {win_rate:.1f}%")
    print(f"Biggest Win: ${stats['biggest_win']:.2f}")
    print(f"Biggest Loss: ${stats['biggest_loss']:.2f}")
    profit = current_bankroll - stats['initial_bankroll']
    print(f"Total Profit/Loss: ${profit:.2f}")
    print(f"Peak Bankroll: ${stats['peak_bankroll']:.2f}")
    print("=" * 20)

# In the main game loop, modify to include bankroll management
def play_game():
    bankroll, stats = initialize_game()
    
    while bankroll > 0:
        print("\n" + "="*50)
        bet = get_bet(bankroll)
        
        # Existing game setup code...
        deck = create_deck()
        player_hand = []
        dealer_hand = []
        deal_initial_cards(deck, player_hand, dealer_hand)
        
        # After playing hand, get result
        result = input("\nDid you win this hand? (y/n): ").lower()
        
        stats['hands_played'] += 1
        
        if result == 'y':
            winnings = bet
            bankroll += winnings
            stats['hands_won'] += 1
            stats['biggest_win'] = max(stats['biggest_win'], winnings)
            print(f"You won ${winnings:.2f}!")
        else:
            losses = bet
            bankroll -= losses
            stats['hands_lost'] += 1
            stats['biggest_loss'] = max(stats['biggest_loss'], losses)
            print(f"You lost ${losses:.2f}")
        
        # Update peak bankroll
        stats['peak_bankroll'] = max(stats['peak_bankroll'], bankroll)
            
        if bankroll <= 0:
            print("\nGame Over! You're out of money!")
            display_stats(stats, bankroll)
            break
            
        # Display current stats
        display_stats(stats, bankroll)
            
        play_again = input("\nWould you like to play again? (y/n): ").lower()
        if play_again != 'y':
            print(f"\nThanks for playing! You're leaving with ${bankroll:.2f}")
            display_stats(stats, bankroll)
            break 