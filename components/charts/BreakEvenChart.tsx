import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../../store/projectStore';
import { useDarkMode } from '../../hooks/useDarkMode';

interface BreakEvenChartProps {
  data: any[];
}

export const BreakEvenChart: React.FC<BreakEvenChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const [isDarkMode] = useDarkMode();
  const { currency } = useProjectStore(state => state.projectData.estimationBasis);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
  }

  const formatNumber = (value: number) => {
    if (typeof value !== 'number' || !isFinite(value)) return '';
    return new Intl.NumberFormat(i18n.language, { notation: 'compact', compactDisplay: 'short' }).format(value);
  };
  
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400, slate-500

  return (
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis 
                    dataKey="quantity" 
                    tick={{ fill: tickColor, fontSize: 12 }} 
                    tickFormatter={formatNumber}
                    label={{ value: t('m10_breakEvenAnalysis.chart.quantityAxis'), position: 'insideBottom', offset: -15, fill: tickColor }}
                    type="number"
                />
                <YAxis 
                    tick={{ fill: tickColor, fontSize: 12 }} 
                    tickFormatter={formatCurrency}
                    label={{ value: t('m10_breakEvenAnalysis.chart.costsAxis'), angle: -90, position: 'insideLeft', offset: 0, fill: tickColor, style: { textAnchor: 'middle' } }}
                />
                <Tooltip
                    formatter={(value: number) => {
                        if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
                        return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
                    }}
                    labelFormatter={(label: number) => {
                        if (typeof label !== 'number' || !isFinite(label)) return 'Quantity';
                        return `${t('m10_breakEvenAnalysis.quantityTable.quantity')}: ${new Intl.NumberFormat(i18n.language).format(Math.round(label))}`;
                    }}
                    contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    }}
                />
                <Legend wrapperStyle={{paddingTop: 20}}/>
                <Line
                    type="monotone"
                    dataKey="revenueLine"
                    name={t('m10_breakEvenAnalysis.chart.revenueLine') || ''}
                    stroke="#16a34a" // green-600
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="totalCosts"
                    name={t('m10_breakEvenAnalysis.chart.totalCostsLine') || ''}
                    stroke="#dc2626" // red-600
                    strokeWidth={2}
                    dot={false}
                />
                <Line
                    type="monotone"
                    dataKey="fixedCosts"
                    name={t('m10_breakEvenAnalysis.chart.fixedCostsLine') || ''}
                    stroke="#7c3aed" // violet-600
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                />
            </LineChart>
        </ResponsiveContainer>
    </div>
  );
};