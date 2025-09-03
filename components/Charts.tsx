
import React from 'react';
import { Trade } from '../types';
import { calculateChartData } from '../utils/dataProcessor';

interface BarChartProps {
  data: { label: string; value: number }[];
  title: string;
  description: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, description }) => {
    const maxValue = Math.max(...data.map(d => Math.abs(d.value)), 1);
    const chartHeight = 200;
    const barWidth = 30;
    const barMargin = 15;
    const svgWidth = data.length * (barWidth + barMargin);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    return (
        <div className="bg-brand-surface p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-brand-text-primary">{title}</h3>
            <p className="text-sm text-brand-text-secondary mb-4">{description}</p>
            <div className="overflow-x-auto">
                <svg width={svgWidth} height={chartHeight + 40} className="font-sans">
                    <g transform="translate(0, 10)">
                        {data.map((d, i) => {
                            const barHeight = (Math.abs(d.value) / maxValue) * chartHeight * 0.9;
                            const y = d.value >= 0 ? chartHeight / 2 - barHeight : chartHeight / 2;
                            const x = i * (barWidth + barMargin);
                            const fillColor = d.value >= 0 ? '#10B981' : '#EF4444';

                            return (
                                <g key={i} role="figure" aria-label={`${d.label}: ${formatCurrency(d.value)}`}>
                                    <title>{`${d.label}: ${formatCurrency(d.value)}`}</title>
                                    <rect
                                        x={x}
                                        y={y}
                                        width={barWidth}
                                        height={barHeight}
                                        fill={fillColor}
                                        className="transition-opacity opacity-80 hover:opacity-100"
                                    />
                                    <text
                                        x={x + barWidth / 2}
                                        y={d.value >= 0 ? y - 5 : y + barHeight + 15}
                                        textAnchor="middle"
                                        className="text-xs text-brand-text-secondary fill-current"
                                    >
                                        {formatCurrency(d.value)}
                                    </text>
                                    <text
                                        x={x + barWidth / 2}
                                        y={chartHeight + 15}
                                        textAnchor="middle"
                                        className="text-xs text-brand-text-primary font-semibold fill-current"
                                    >
                                        {d.label}
                                    </text>
                                </g>
                            );
                        })}
                        <line x1="0" y1={chartHeight / 2} x2={svgWidth} y2={chartHeight / 2} className="text-brand-border stroke-current" strokeWidth="1" />
                    </g>
                </svg>
            </div>
        </div>
    );
};

interface HighLowChartProps {
    data: { label: string, highest: number, lowest: number }[];
    title: string;
    description: string;
}

const HighLowChart: React.FC<HighLowChartProps> = ({ data, title, description }) => {
    const maxVal = Math.max(...data.map(d => Math.max(d.highest, Math.abs(d.lowest))), 1);
    const chartHeight = 200;
    const barWidth = 15;
    const barGroupMargin = 30;
    const svgWidth = data.length * ((barWidth * 2) + barGroupMargin);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    return (
        <div className="bg-brand-surface p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-brand-text-primary">{title}</h3>
            <p className="text-sm text-brand-text-secondary mb-4">{description}</p>
            <div className="overflow-x-auto">
                <svg width={svgWidth} height={chartHeight + 40} className="font-sans">
                     <g transform="translate(0, 10)">
                        {data.map((d, i) => {
                            const groupX = i * ((barWidth * 2) + barGroupMargin);
                            const highHeight = (d.highest / maxVal) * chartHeight * 0.9;
                            const lowHeight = (Math.abs(d.lowest) / maxVal) * chartHeight * 0.9;
                            
                            const highY = chartHeight / 2 - highHeight;
                            const lowY = chartHeight / 2;

                            return (
                                <g key={i}>
                                     {d.highest > 0 && (
                                        <g role="figure" aria-label={`Highest in ${d.label}: ${formatCurrency(d.highest)}`}>
                                            <title>{`Highest in ${d.label}: ${formatCurrency(d.highest)}`}</title>
                                            <rect x={groupX} y={highY} width={barWidth} height={highHeight} fill="#10B981" className="transition-opacity opacity-80 hover:opacity-100" />
                                        </g>
                                     )}
                                     {d.lowest < 0 && (
                                        <g role="figure" aria-label={`Lowest in ${d.label}: ${formatCurrency(d.lowest)}`}>
                                            <title>{`Lowest in ${d.label}: ${formatCurrency(d.lowest)}`}</title>
                                            <rect x={groupX + barWidth} y={lowY} width={barWidth} height={lowHeight} fill="#EF4444" className="transition-opacity opacity-80 hover:opacity-100" />
                                        </g>
                                     )}
                                    <text
                                        x={groupX + barWidth}
                                        y={chartHeight + 15}
                                        textAnchor="middle"
                                        className="text-xs text-brand-text-primary font-semibold fill-current"
                                    >
                                        {d.label}
                                    </text>
                                </g>
                            );
                        })}
                        <line x1="0" y1={chartHeight / 2} x2={svgWidth} y2={chartHeight / 2} className="text-brand-border stroke-current" strokeWidth="1" />
                    </g>
                </svg>
            </div>
        </div>
    );
};


interface ChartsProps {
  trades: Trade[];
}

const Charts: React.FC<ChartsProps> = ({ trades }) => {
  const { monthlyPnl, monthlyHighLow } = calculateChartData(trades);

  const monthlyPnlChartData = monthlyPnl.map(d => ({ label: d.month, value: d.pnl }));
  const monthlyHighLowChartData = monthlyHighLow.map(d => ({ label: d.month, highest: d.highest, lowest: d.lowest }));

  if (trades.length === 0 || monthlyPnlChartData.length === 0) {
    return null;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart data={monthlyPnlChartData} title="Monthly PnL" description="Total profit and loss for each month." />
        <HighLowChart data={monthlyHighLowChartData} title="Monthly High/Low Trade" description="Highest profit and lowest loss trade for each month." />
      </div>
    </div>
  );
};

export default Charts;
