import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Cell, LabelList, ReferenceLine } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '../../hooks/useDarkMode';

interface TornadoChartProps {
  data: { name: string; impact: number }[];
}

const CustomTick = (props: any) => {
    const { x, y, payload } = props;
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={4} textAnchor="end" fill={props.fill} fontSize={12}>
                {payload.value}
            </text>
        </g>
    );
};

export const TornadoChart: React.FC<TornadoChartProps> = ({ data }) => {
  const { t } = useTranslation();
  const [isDarkMode] = useDarkMode();
  const tickColor = isDarkMode ? '#94a3b8' : '#64748b';

  const formatPercent = (value: number) => {
    if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
    return `${value.toFixed(1)}%`;
  }

  const favorableColor = '#22c55e'; // green-500
  const unfavorableColor = '#ef4444'; // red-500
  const labelColor = isDarkMode ? '#e2e8f0' : '#1e293b';

  return (
    <div style={{ width: '100%', height: 50 * data.length + 80 }}>
        <ResponsiveContainer>
            <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
                barCategoryGap="35%"
            >
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} horizontal={false}/>
                <XAxis 
                    type="number" 
                    tickFormatter={formatPercent} 
                    tick={{ fill: tickColor, fontSize: 12 }} 
                    domain={['auto', 'auto']}
                    label={{ value: t('m12_sensitivityAnalysis.outputChangeAxis'), position: 'insideBottom', offset: -10, fill: tickColor }}
                />
                <YAxis 
                    type="category" 
                    dataKey="name" 
                    width={120} 
                    tick={<CustomTick fill={tickColor}/>}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip
                    cursor={{fill: isDarkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(226, 232, 240, 0.4)'}}
                    formatter={(value: number) => [formatPercent(value), t('m12_sensitivityAnalysis.outputChangeAxis')]}
                    contentStyle={{
                        backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF',
                        borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    }}
                />
                <ReferenceLine x={0} stroke={isDarkMode ? '#64748b' : '#475569'} strokeWidth={2}/>
                <Bar dataKey="impact">
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.impact > 0 ? favorableColor : unfavorableColor} />
                    ))}
                     <LabelList 
                        dataKey="impact" 
                        position="inside" 
                        formatter={formatPercent}
                        style={{ fill: labelColor, fontSize: 12, fontWeight: 'bold' }} 
                     />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    </div>
  );
};