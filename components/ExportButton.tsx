
import React, { useState, useRef, useEffect } from 'react';
import { Trade, KPIs } from '../types';

// Let TypeScript know about the global variables from the script tags
declare var html2canvas: any;
declare var jspdf: any;

interface ExportButtonProps {
  trades: Trade[];
  kpis: KPIs | null;
  fileName: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ trades, kpis, fileName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCsvExport = () => {
    if (!kpis) return;
    setIsOpen(false);
    
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
      ['Highest Profit', kpis.highestProfit],
      ['Highest Loss', kpis.highestLoss],
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

  const handlePdfExport = async () => {
    if (!kpis) return;
    setIsOpen(false);
    setIsExporting(true);

    const reportElement = document.getElementById('report-content');
    if (!reportElement) {
        console.error("Report content element not found!");
        setIsExporting(false);
        return;
    }
    
    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2, // Higher scale for better quality
            backgroundColor: '#111827', // Match brand background
            useCORS: true,
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = jspdf;
        
        // A4 page size: 210mm x 297mm
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;

        let imgWidth = pdfWidth - 20; // with margin
        let imgHeight = imgWidth / ratio;
        
        let heightLeft = imgHeight;
        let position = 10; // top margin

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= (pdfHeight - 20);

        while (heightLeft > 0) {
            position = - (imgHeight - heightLeft) - 10;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= (pdfHeight - 20);
        }
        
        const exportFileName = fileName ? `analysis_${fileName.split('.')[0]}.pdf` : 'trade_analysis.pdf';
        pdf.save(exportFileName);

    } catch (error) {
        console.error("Error generating PDF:", error);
    } finally {
        setIsExporting(false);
    }
  };

  const isDisabled = trades.length === 0 || isExporting;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDisabled}
        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-blue-500 disabled:bg-brand-border disabled:cursor-not-allowed transition-all"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {isExporting ? 'Exporting...' : 'Export'}
        <svg className={`-mr-1 ml-2 h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-brand-surface ring-1 ring-black ring-opacity-5 focus:outline-none z-10" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
          <div className="py-1" role="none">
            <button onClick={handleCsvExport} className="text-brand-text-primary block w-full text-left px-4 py-2 text-sm hover:bg-brand-border" role="menuitem">
              Export as CSV
            </button>
            <button onClick={handlePdfExport} className="text-brand-text-primary block w-full text-left px-4 py-2 text-sm hover:bg-brand-border" role="menuitem">
              Export as PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;