import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useProjectStore } from '../../store/projectStore';

interface CapexDonutChartProps {
  data: {name: string, value: number}[];
}

const COLORS = ['#3b82f6', '#16a34a', '#f97316', '#8b5cf6', '#ec4899', '#f59e0b'];

export const CapexDonutChart: React.FC<CapexDonutChartProps> = ({ data }) => {
  const { i18n } = useTranslation();
  const [isDarkMode] = useDarkMode();
  const { currency } = useProjectStore(state => state.projectData.estimationBasis);
  const legendColor = isDarkMode ? '#e2e8f0' : '#334155'; // slate-200, slate-700

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      if (typeof value !== 'number' || !isFinite(value)) return null;
      const formattedValue = new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(value);
      return (
        <div className="p-2 bg-slate-800 text-white rounded-md border border-slate-700 text-sm">
          <p className="font-bold">{`${name}`}</p>
          <p>{`Cost: ${formattedValue}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
            <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{color: legendColor, fontSize: '14px', paddingTop: '20px'}}/>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                >
                    {data.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
            </PieChart>
        </ResponsiveContainer>
    </div>
  );
};