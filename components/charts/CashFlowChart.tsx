import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useProjectStore } from '../../store/projectStore';

interface CashFlowChartProps {
  data: any[];
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const [isDarkMode] = useDarkMode();
  const { currency } = useProjectStore(state => state.projectData.estimationBasis);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
  }
  
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400, slate-500
  
  const positiveColor = '#22c55e'; // green-500
  const negativeColor = '#ef4444'; // red-500

  return (
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis 
                    dataKey="year" 
                    tick={{ fill: tickColor, fontSize: 12 }} 
                    label={{ value: t('m8_cashFlowStatement.chart.year'), position: 'insideBottom', offset: -15, fill: tickColor }}
                />
                <YAxis 
                    tick={{ fill: tickColor, fontSize: 12 }} 
                    tickFormatter={formatCurrency}
                    label={{ value: t('m8_cashFlowStatement.chart.amount'), angle: -90, position: 'insideLeft', offset: 0, fill: tickColor, style: { textAnchor: 'middle' } }}
                />
                <Tooltip
                    formatter={(value: number) => {
                        if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
                        return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
                    }}
                    contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                        borderRadius: '0.5rem'
                    }}
                    cursor={{fill: isDarkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(226, 232, 240, 0.4)'}}
                />
                <Bar
                    dataKey="unleveredFreeCashFlow"
                    name={t('m8_cashFlowStatement.chart.ufcf') || ''}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.unleveredFreeCashFlow >= 0 ? positiveColor : negativeColor} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};