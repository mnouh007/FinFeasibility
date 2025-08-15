import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useProjectStore } from '../../store/projectStore';

interface CostIncomeBarChartProps {
  data: any[];
}

const COLORS = {
  revenue: '#22c55e', // green-500
  costs: {
    rawMaterials: '#ef4444', // red-500
    labor: '#f97316', // orange-500
    admin: '#8b5cf6', // violet-500
  }
}

export const CostIncomeBarChart: React.FC<CostIncomeBarChartProps> = ({ data }) => {
  const { t, i18n } = useTranslation();
  const [isDarkMode] = useDarkMode();
  const { currency } = useProjectStore(state => state.projectData.estimationBasis);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
  }
  
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400, slate-500
  
  const revenueKey = t('m5_operatingInputs.chart.revenue');
  const rawMaterialsKey = t('m5_operatingInputs.chart.rawMaterials');
  const laborKey = t('m5_operatingInputs.chart.labor');
  const adminKey = t('m5_operatingInputs.chart.admin');
  
  const bars = [
    { key: revenueKey, color: COLORS.revenue },
    { key: rawMaterialsKey, color: COLORS.costs.rawMaterials },
    { key: laborKey, color: COLORS.costs.labor },
    { key: adminKey, color: COLORS.costs.admin },
  ];

  return (
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                <XAxis dataKey="name" tick={{ fill: tickColor, fontSize: 12 }} />
                <YAxis tick={{ fill: tickColor, fontSize: 12 }} tickFormatter={formatCurrency} />
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
                <Legend />
                {bars.map(bar => 
                  data[0] && data[0][bar.key] !== undefined && (
                    <Bar key={bar.key} dataKey={bar.key} fill={bar.color} />
                  )
                )}
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};