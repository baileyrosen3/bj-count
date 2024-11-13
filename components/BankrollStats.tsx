import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BankrollStatsProps {
  bankroll: number;
  stats: GameStats;
}

interface GameStats {
  handsPlayed: number;
  handsWon: number;
  totalWinnings: number;
  totalLosses: number;
  biggestWin: number;
  biggestLoss: number;
  peakBankroll: number;
}

export function BankrollStats({ bankroll, stats }: BankrollStatsProps) {
  const winRate =
    stats.handsPlayed > 0
      ? ((stats.handsWon / stats.handsPlayed) * 100).toFixed(1)
      : "0.0";

  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="text-xl text-foreground">
          Session Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Current Bankroll</span>
            <span className="font-bold text-foreground">
              ${bankroll.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Win Rate</span>
            <span className="font-bold text-foreground">{winRate}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Hands Played</span>
            <span className="font-bold text-foreground">
              {stats.handsPlayed}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Peak Bankroll</span>
            <span className="font-bold text-foreground">
              ${stats.peakBankroll.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Biggest Win</span>
            <span className="font-bold text-green-400">
              ${stats.biggestWin.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Biggest Loss</span>
            <span className="font-bold text-red-400">
              ${stats.biggestLoss.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Total Winnings</span>
            <span className="font-bold text-green-400">
              ${stats.totalWinnings.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Total Losses</span>
            <span className="font-bold text-red-400">
              ${stats.totalLosses.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
