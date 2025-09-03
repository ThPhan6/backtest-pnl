
import React from 'react';
import { Trade, KPIs } from '../types';

interface ExportButtonProps {
  trades: Trade[];
  kpis: KPIs | null;
  fileName: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ trades, kpis, fileName }) => {
  const handleExport = () => {
    if (!kpis) return;

    // Helper to escape commas in strings for CSV
    const escapeCsvCell = (cellData: any): string => {
        const stringData = String(cellData);
        if (stringData.includes(',')) {
            return `"${stringData}"`;
        }
        return stringData;
    };

    // 1. Prepare Summary data
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Trades', kpis.totalTrades],
      ['Winning Trades', kpis.totalWins],
      ['Losing Trades', kpis.totalLosses],
      ['Win Rate (%)', kpis.winRate.toFixed(2)],
      ['Final PnL', kpis.finalPnl],
      ['Weekly Avg PnL', kpis.weeklyAvgPnl],
      ['Monthly Avg PnL', kpis.monthlyAvgPnl],
      ['Avg Trades / Week', kpis.avgTradesPerWeek.toFixed(1)],
      ['Avg Trades / Month', kpis.avgTradesPerMonth.toFixed(1)],
    ];
    const summaryCsv = summaryData.map(row => row.join(',')).join('\n');

    // 2. Prepare Trades data
    const tradesHeader = ['Pair', 'Start Date', 'Status', 'Trade Type', 'Profit/Loss'];
    const tradesRows = trades.map(trade => [
      escapeCsvCell(trade.pair),
      escapeCsvCell(trade.startDate.toISOString()),
      escapeCsvCell(trade.status),
      escapeCsvCell(trade.tradeType),
      trade.profitOrLoss,
    ].join(','));
    const tradesCsv = [tradesHeader.join(','), ...tradesRows].join('\n');

    // 3. Combine and create blob
    const csvContent = `${summaryCsv}\n\n${tradesCsv}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 4. Trigger download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const exportFileName = fileName ? `analysis_${fileName.split('.')[0]}.csv` : 'trade_analysis.csv';
    link.setAttribute('download', exportFileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      disabled={trades.length === 0}
      className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-blue-500 disabled:bg-brand-border disabled:cursor-not-allowed"
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      Export to CSV
    </button>
  );
};

export default ExportButton;