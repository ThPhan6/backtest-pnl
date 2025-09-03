
import React, { useState, useCallback } from 'react';
import { Trade, KPIs } from './types';
import Header from './components/Header';
import FileImporter from './components/FileImporter';
import Dashboard from './components/Dashboard';
import TradeTable from './components/TradeTable';
import ExportButton from './components/ExportButton';
import Charts from './components/Charts';
import { calculateKpis } from './utils/dataProcessor';

const App: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleDataLoaded = useCallback((loadedTrades: Trade[], loadedFileName: string) => {
    if (loadedTrades.length > 0) {
      const calculatedKpis = calculateKpis(loadedTrades);
      setTrades(loadedTrades);
      setKpis(calculatedKpis);
      setFileName(loadedFileName);
      setError('');
    } else {
        // Clear previous state if new file is empty or invalid
        setTrades([]);
        setKpis(null);
        setFileName('');
    }
  }, []);

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <div className="container mx-auto max-w-7xl">
        <Header />
        <main>
          <FileImporter onDataLoaded={handleDataLoaded} onError={handleError} />
          {error && (
             <div className="px-4 sm:px-6 lg:px-8 py-2">
                <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md relative" role="alert">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              </div>
          )}
          {trades.length > 0 && kpis && (
            <>
              <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-brand-text-primary">Analysis for: <span className="text-brand-primary">{fileName}</span></h2>
                  <ExportButton trades={trades} kpis={kpis} fileName={fileName} />
              </div>
              <div id="dashboard-section">
                <Dashboard kpis={kpis} />
              </div>
              <div id="charts-section">
                 <Charts trades={trades} />
              </div>
              <div id="table-section">
                <TradeTable trades={trades} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
