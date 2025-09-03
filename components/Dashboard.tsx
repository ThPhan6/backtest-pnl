
import React from 'react';
import { KPIs } from '../types';

interface DashboardProps {
  kpis: KPIs | null;
}

const formatCurrency = (value: number) => {
  const colorClass = value >= 0 ? 'text-brand-success' : 'text-brand-danger';
  return (
    <span className={colorClass}>
      {value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
    </span>
  );
};

const KpiCard: React.FC<{ title: string; children: React.ReactNode, description: string }> = ({ title, children, description }) => (
  <div className="bg-brand-surface p-6 rounded-lg shadow-lg">
    <h3 className="text-sm font-medium text-brand-text-secondary uppercase tracking-wider">{title}</h3>
    <p className="mt-2 text-3xl font-bold text-brand-text-primary">{children}</p>
    <p className="mt-1 text-xs text-brand-text-secondary">{description}</p>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ kpis }) => {
  if (!kpis) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Row 1: High-level performance */}
        <KpiCard title="Final PnL" description="Net profit or loss from all trades.">{formatCurrency(kpis.finalPnl)}</KpiCard>
        <KpiCard title="Win Rate" description="Percentage of profitable trades.">
          <span className={kpis.winRate >= 50 ? 'text-brand-success' : 'text-brand-danger'}>
             {kpis.winRate.toFixed(2)}%
          </span>
        </KpiCard>
        <KpiCard title="Winning Trades" description="Total number of profitable trades.">
          <span className="text-brand-success">{kpis.totalWins}</span>
        </KpiCard>
        <KpiCard title="Losing Trades" description="Total number of unprofitable trades.">
          <span className="text-brand-danger">{kpis.totalLosses}</span>
        </KpiCard>

        {/* Row 2: Averages */}
        <KpiCard title="Monthly Avg PnL" description="Average profit or loss per month.">{formatCurrency(kpis.monthlyAvgPnl)}</KpiCard>
        <KpiCard title="Weekly Avg PnL" description="Average profit or loss per week.">{formatCurrency(kpis.weeklyAvgPnl)}</KpiCard>
        <KpiCard title="Avg Trades / Month" description="Average number of trades per month.">{kpis.avgTradesPerMonth.toFixed(1)}</KpiCard>
        <KpiCard title="Avg Trades / Week" description="Average number of trades per week.">{kpis.avgTradesPerWeek.toFixed(1)}</KpiCard>
        
        {/* Row 3: Other stats */}
        <KpiCard title="Total Trades" description="Total number of trades analyzed.">{kpis.totalTrades}</KpiCard>
        <KpiCard title="Current Streak" description={`Longest Win: ${kpis.longestWinStreak}, Longest Loss: ${kpis.longestLossStreak}`}>
          {kpis.currentStreak > 0 ? (
            <span className={kpis.currentStreakType === 'win' ? 'text-brand-success' : 'text-brand-danger'}>
              {kpis.currentStreak} {kpis.currentStreakType === 'win' ? 'Wins' : 'Losses'}
            </span>
          ) : (
            'N/A'
          )}
        </KpiCard>
      </div>
    </div>
  );
};

export default Dashboard;
