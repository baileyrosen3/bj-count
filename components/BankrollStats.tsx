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
    <Card className="w-full bg-black/40 border-cyan-500/30 shadow-neon backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl font-mono text-cyan-300 tracking-wide">
          SYSTEM METRICS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-2 font-mono">
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400">CURRENT BANKROLL</span>
            <span className="font-bold text-cyan-300">
              ${bankroll.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400">WIN RATE</span>
            <span className="font-bold text-cyan-300">{winRate}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400">HANDS PLAYED</span>
            <span className="font-bold text-cyan-300">{stats.handsPlayed}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400">PEAK BANKROLL</span>
            <span className="font-bold text-cyan-300">
              ${stats.peakBankroll.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400">BIGGEST WIN</span>
            <span className="font-bold text-green-400">
              ${stats.biggestWin.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400">BIGGEST LOSS</span>
            <span className="font-bold text-red-400">
              ${stats.biggestLoss.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400">TOTAL WINNINGS</span>
            <span className="font-bold text-green-400">
              ${stats.totalWinnings.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-cyan-400">TOTAL LOSSES</span>
            <span className="font-bold text-red-400">
              ${stats.totalLosses.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
