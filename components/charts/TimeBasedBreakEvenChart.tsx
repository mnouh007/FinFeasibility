import React from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Area, ReferenceLine } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../../store/projectStore';
import { useDarkMode } from '../../hooks/useDarkMode';
import { TimeBasedBreakEvenData } from '../../types';

interface TimeBasedBreakEvenChartProps {
  data: TimeBasedBreakEvenData[];
}

export const TimeBasedBreakEvenChart: React.FC<TimeBasedBreakEvenChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const [isDarkMode] = useDarkMode();
  const { currency } = useProjectStore(state => state.projectData.estimationBasis);

  const formatCurrency = (value: number) => {
    if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
  }
  
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b';

  const breakEvenPoint = data.find(d => d.cumulativeRevenue > d.cumulativeCosts);

  return (
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCosts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis 
                    dataKey="year" 
                    tick={{ fill: tickColor, fontSize: 12 }} 
                    label={{ value: t('m6_financingLoans.chart.year'), position: 'insideBottom', offset: -15, fill: tickColor }}
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
                <Legend wrapperStyle={{paddingTop: 20}}/>
                <Area
                    type="monotone"
                    dataKey="cumulativeRevenue"
                    name={t('m10_breakEvenAnalysis.chart.cumulativeRevenue') || ''}
                    stroke="#22c55e"
                    fillOpacity={1} 
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                />
                <Area
                    type="monotone"
                    dataKey="cumulativeCosts"
                    name={t('m10_breakEvenAnalysis.chart.cumulativeCosts') || ''}
                    stroke="#f97316"
                    fillOpacity={1} 
                    fill="url(#colorCosts)"
                    strokeWidth={2}
                />
                 {breakEvenPoint && (
                    <ReferenceLine x={breakEvenPoint.year} stroke={isDarkMode ? '#a78bfa' : '#7c3aed'} strokeDasharray="3 3" />
                 )}
            </AreaChart>
        </ResponsiveContainer>
    </div>
  );
};
