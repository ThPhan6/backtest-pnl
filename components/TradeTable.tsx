
import React from 'react';
import { Trade, TradeType } from '../types';

interface TradeTableProps {
  trades: Trade[];
}

const TradeTable: React.FC<TradeTableProps> = ({ trades }) => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-brand-border sm:rounded-lg">
              <table className="min-w-full divide-y divide-brand-border">
                <thead className="bg-brand-surface">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Pair</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Start Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Trade Type</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-brand-text-secondary uppercase tracking-wider">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody className="bg-brand-bg divide-y divide-brand-surface">
                  {trades.map((trade, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-text-primary">{trade.pair}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary">{trade.startDate.toLocaleString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-text-secondary">{trade.status}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          trade.tradeType === TradeType.Buy ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                        }`}>
                          {trade.tradeType}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                        trade.profitOrLoss >= 0 ? 'text-brand-success' : 'text-brand-danger'
                      }`}>
                        {trade.profitOrLoss.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeTable;
