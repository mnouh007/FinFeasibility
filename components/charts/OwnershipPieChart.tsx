import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';
import { Partner } from '../../types';

interface OwnershipPieChartProps {
  data: Partner[];
}

const COLORS = ['#3b82f6', '#16a34a', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const shareText = typeof data.value === 'number' && isFinite(data.value)
        ? `${data.value.toFixed(2)}%`
        : 'N/A';
    return (
      <div className="p-2 bg-slate-800 text-white rounded-md border border-slate-700 text-sm">
        <p className="font-bold">{`${data.name}`}</p>
        <p>{`Share: ${shareText}`}</p>
      </div>
    );
  }
  return null;
};

export const OwnershipPieChart: React.FC<OwnershipPieChartProps> = ({ data }) => {
  const { t } = useTranslation();
  const [isDarkMode] = useDarkMode();
  const legendColor = isDarkMode ? '#e2e8f0' : '#334155'; // slate-200, slate-700

  return (
    <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
            <PieChart>
                <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{fill: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}}
                />
                <Legend iconType="circle" wrapperStyle={{color: legendColor, fontSize: '14px'}}/>
                <Pie
                    data={data}
                    dataKey="share"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    labelLine={false}
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12px">
                                {`${(percent * 100).toFixed(0)}%`}
                            </text>
                        );
                    }}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};