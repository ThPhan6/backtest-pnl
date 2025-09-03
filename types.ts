
export enum TradeType {
  Buy = 'buy',
  Sell = 'sell',
}

export interface Trade {
  pair: string;
  startDate: Date;
  status: string;
  tradeType: TradeType;
  profitOrLoss: number;
}

export interface KPIs {
  finalPnl: number;
  weeklyAvgPnl: number;
  monthlyAvgPnl: number;
  winRate: number;
  totalTrades: number;
  avgTradesPerWeek: number;
  avgTradesPerMonth: number;
  totalWins: number;
  totalLosses: number;
  longestWinStreak: number;
  longestLossStreak: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss' | 'none';
  highestProfit: number;
  highestLoss: number;
}