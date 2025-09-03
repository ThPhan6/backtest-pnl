
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Trade, KPIs, TradeType } from './types';
import Header from './components/Header';
import FileImporter from './components/FileImporter';
import Dashboard from './components/Dashboard';
import TradeTable from './components/TradeTable';
import ExportButton from './components/ExportButton';
import Charts from './components/Charts';
import FilterControls from './components/FilterControls';
import { calculateKpis } from './utils/dataProcessor';

const App: React.FC = () => {
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    pair: 'all',
    tradeType: 'all',
  });

  const handleDataLoaded = useCallback((loadedTrades: Trade[], loadedFileName: string) => {
    if (loadedTrades.length > 0) {
      setAllTrades(loadedTrades);
      setFileName(loadedFileName);
      setError('');
      // Reset filters when new data is loaded
      setFilters({ startDate: '', endDate: '', pair: 'all', tradeType: 'all' });
    } else {
        // Clear previous state if new file is empty or invalid
        setAllTrades([]);
        setKpis(null);
        setFileName('');
    }
  }, []);

  const handleError = useCallback((message: string) => {
    setError(message);
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = useCallback(() => {
    setFilters({ startDate: '', endDate: '', pair: 'all', tradeType: 'all' });
  }, []);

  const handleClearFilter = useCallback((filterName: keyof typeof filters) => {
    const defaultValues = {
      startDate: '',
      endDate: '',
      pair: 'all',
      tradeType: 'all',
    };
    setFilters(prev => ({ ...prev, [filterName]: defaultValues[filterName] }));
  }, []);

  const uniquePairs = useMemo(() => {
    const pairs = new Set(allTrades.map(trade => trade.pair));
    return Array.from(pairs).sort();
  }, [allTrades]);

  const filteredTrades = useMemo(() => {
    return allTrades.filter(trade => {
      const tradeDate = trade.startDate;

      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        startDate.setHours(0, 0, 0, 0); // Start of the day
        if (tradeDate < startDate) return false;
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // End of the day
        if (tradeDate > endDate) return false;
      }
      if (filters.pair !== 'all' && trade.pair !== filters.pair) {
        return false;
      }
      if (filters.tradeType !== 'all' && trade.tradeType !== filters.tradeType) {
        return false;
      }
      return true;
    });
  }, [allTrades, filters]);

  useEffect(() => {
    if (allTrades.length > 0) {
      const calculatedKpis = calculateKpis(filteredTrades);
      setKpis(calculatedKpis);
    } else {
      setKpis(null);
    }
  }, [filteredTrades, allTrades.length]);


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

          {allTrades.length > 0 && (
            <FilterControls
              uniquePairs={uniquePairs}
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              onClearFilter={handleClearFilter}
            />
          )}

          {allTrades.length > 0 && kpis && (
            <>
              <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-brand-text-primary">
                      Analysis for: <span className="text-brand-primary">{fileName}</span>
                      <span className="text-sm text-brand-text-secondary ml-2">({filteredTrades.length} of {allTrades.length} trades shown)</span>
                  </h2>
                  <ExportButton trades={filteredTrades} kpis={kpis} fileName={fileName} />
              </div>
              <div id="dashboard-section">
                <Dashboard kpis={kpis} />
              </div>
              <div id="charts-section">
                 <Charts trades={filteredTrades} />
              </div>
              <div id="table-section">
                <TradeTable trades={filteredTrades} />
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
