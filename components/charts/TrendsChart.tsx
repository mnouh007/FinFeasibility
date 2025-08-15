import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useProjectStore } from '../../store/projectStore';

interface TrendsChartProps {
  data: any[];
}

export const TrendsChart: React.FC<TrendsChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const [isDarkMode] = useDarkMode();
  const { currency } = useProjectStore(state => state.projectData.estimationBasis);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
  };

  const tickColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400, slate-500

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
            tick={{ fill: tickColor, fontSize: 12 }} 
            tickFormatter={formatCurrency}
            label={{ value: t('m6_financingLoans.chart.amount'), angle: -90, position: 'insideLeft', offset: 0, fill: tickColor, style: { textAnchor: 'middle' } }}
          />
          <Tooltip
            formatter={(value: number) => {
                if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
                return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
            }}
            contentStyle={{
              backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF',
              borderColor: isDarkMode ? '#334155' : '#e2e8f0',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: 20 }} />
          <Line
            type="monotone"
            dataKey="revenue"
            name={t('m14_dashboard.trendsChart.revenue') || ''}
            stroke="#22c55e" // green-500
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="costs"
            name={t('m14_dashboard.trendsChart.costs') || ''}
            stroke="#ef4444" // red-500
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name={t('m14_dashboard.trendsChart.profit') || ''}
            stroke="#3b82f6" // blue-500
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};