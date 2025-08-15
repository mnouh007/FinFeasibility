import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';

interface RatiosChartProps {
  data: any[];
  showDebtEquity?: boolean;
}

export const RatiosChart: React.FC<RatiosChartProps> = ({ data, showDebtEquity = false }) => {
  const { t } = useTranslation();
  const [isDarkMode] = useDarkMode();

  const formatPercent = (value: number) => {
    if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
    return `${value.toFixed(2)}%`;
  }

  const formatRatio = (value: any) => {
    if (value === null || typeof value !== 'number' || !isFinite(value)) return 'N/A';
    return value.toFixed(2);
  }
  
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400, slate-500
  
  // Check if there is any valid data for the debt to equity ratio to prevent render failures.
  const hasValidDebtEquityData = useMemo(() => {
    if (!showDebtEquity || !data) return false;
    return data.some(d => typeof d.debtToEquity === 'number' && isFinite(d.debtToEquity));
  }, [data, showDebtEquity]);


  return (
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis 
                    dataKey="year" 
                    tick={{ fill: tickColor, fontSize: 12 }} 
                    label={{ value: t('m11_financialRatios.chart.xAxis'), position: 'insideBottom', offset: -15, fill: tickColor }}
                />
                <YAxis 
                    yAxisId="left"
                    tick={{ fill: tickColor, fontSize: 12 }} 
                    tickFormatter={formatPercent}
                    domain={['auto', 'auto']}
                    label={{ value: t('m11_financialRatios.chart.yAxis'), angle: -90, position: 'insideLeft', offset: 0, fill: tickColor, style: { textAnchor: 'middle' } }}
                />
                {showDebtEquity && hasValidDebtEquityData && (
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: tickColor, fontSize: 12 }}
                        tickFormatter={formatRatio}
                        domain={['auto', 'auto']}
                        label={{ value: t('m9_financialEvaluation.deRatioTitle'), angle: 90, position: 'insideRight', fill: tickColor, style: { textAnchor: 'middle' } }}
                    />
                )}
                <Tooltip
                    formatter={(value: any, name: string, props) => {
                        if (value === null || typeof value !== 'number' || !isFinite(value)) return ['N/A', name];
                        const formattedValue = props.dataKey === 'debtToEquity' ? formatRatio(value) : formatPercent(value);
                        return [formattedValue, name];
                    }}
                    contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    }}
                />
                <Legend wrapperStyle={{paddingTop: 20}} />
                
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="grossMargin"
                    name={t('m11_financialRatios.table.grossProfitMargin') || ''}
                    stroke="#22c55e" // green-500
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />

                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="operatingMargin"
                    name={t('m11_financialRatios.table.operatingProfitMargin') || ''}
                    stroke="#3b82f6" // blue-500
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />
                
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="netMargin"
                    name={t('m11_financialRatios.table.netProfitMargin') || ''}
                    stroke="#8b5cf6" // violet-500
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />

                {showDebtEquity && hasValidDebtEquityData && (
                    <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="debtToEquity"
                        name={t('m9_financialEvaluation.deRatioTitle') || ''}
                        stroke="#f97316" // orange-500
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        connectNulls
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};