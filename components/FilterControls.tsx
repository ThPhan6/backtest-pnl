
import React from 'react';
import { TradeType } from '../types';

interface FilterControlsProps {
  uniquePairs: string[];
  filters: {
    startDate: string;
    endDate: string;
    pair: string;
    tradeType: string;
  };
  onFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onReset: () => void;
  onClearFilter: (filterName: 'startDate' | 'endDate' | 'pair' | 'tradeType') => void;
}

const FilterInput: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label htmlFor={label} className="block text-sm font-medium text-brand-text-secondary mb-1">
            {label}
        </label>
        {children}
    </div>
);

const ClearButton: React.FC<{ onClick: () => void; 'aria-label': string }> = (props) => (
    <button
        onClick={props.onClick}
        className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer group"
        aria-label={props['aria-label']}
    >
        <svg className="h-5 w-5 text-brand-text-secondary group-hover:text-brand-text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    </button>
);


const FilterControls: React.FC<FilterControlsProps> = ({ uniquePairs, filters, onFilterChange, onReset, onClearFilter }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-brand-surface p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
                <FilterInput label="Start Date">
                    <div className="relative">
                        <input
                            type="date"
                            name="startDate"
                            id="Start Date"
                            value={filters.startDate}
                            onChange={onFilterChange}
                            className="w-full bg-brand-bg border border-brand-border rounded-md shadow-sm pl-3 pr-10 py-2 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        />
                        {filters.startDate && <ClearButton onClick={() => onClearFilter('startDate')} aria-label="Clear start date" />}
                    </div>
                </FilterInput>

                <FilterInput label="End Date">
                    <div className="relative">
                        <input
                            type="date"
                            name="endDate"
                            id="End Date"
                            value={filters.endDate}
                            onChange={onFilterChange}
                            className="w-full bg-brand-bg border border-brand-border rounded-md shadow-sm pl-3 pr-10 py-2 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm"
                        />
                        {filters.endDate && <ClearButton onClick={() => onClearFilter('endDate')} aria-label="Clear end date" />}
                    </div>
                </FilterInput>

                <FilterInput label="Pair">
                    <div className="relative">
                        <select
                            name="pair"
                            id="Pair"
                            value={filters.pair}
                            onChange={onFilterChange}
                            className="w-full bg-brand-bg border border-brand-border rounded-md shadow-sm pl-3 pr-10 py-2 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm appearance-none"
                        >
                            <option value="all">All Pairs</option>
                            {uniquePairs.map(pair => (
                                <option key={pair} value={pair}>{pair}</option>
                            ))}
                        </select>
                        {filters.pair !== 'all' && <ClearButton onClick={() => onClearFilter('pair')} aria-label="Clear pair filter" />}
                    </div>
                </FilterInput>
                
                <FilterInput label="Trade Type">
                    <div className="relative">
                        <select
                            name="tradeType"
                            id="Trade Type"
                            value={filters.tradeType}
                            onChange={onFilterChange}
                            className="w-full bg-brand-bg border border-brand-border rounded-md shadow-sm pl-3 pr-10 py-2 text-brand-text-primary focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm appearance-none"
                        >
                            <option value="all">All Types</option>
                            <option value={TradeType.Buy}>Buy</option>
                            <option value={TradeType.Sell}>Sell</option>
                        </select>
                         {filters.tradeType !== 'all' && <ClearButton onClick={() => onClearFilter('tradeType')} aria-label="Clear trade type filter" />}
                    </div>
                </FilterInput>
                
                <button
                    onClick={onReset}
                    className="w-full px-4 py-2 border border-brand-border text-sm font-medium rounded-md shadow-sm text-brand-text-primary bg-brand-surface hover:bg-brand-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-primary transition-colors"
                >
                    Reset All
                </button>
            </div>
        </div>
    </div>
  );
};

export default FilterControls;
