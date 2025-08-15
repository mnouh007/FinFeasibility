import React, { useMemo } from 'react';
import { bin } from 'd3';
import { ResponsiveContainer, ComposedChart, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, Line, Area, ReferenceLine, Legend } from 'recharts';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../../store/projectStore';
import { useDarkMode } from '../../hooks/useDarkMode';
import { MonteCarloResultStats } from '../../types';

interface SimulationHistogramProps {
    data: number[];
    stats: MonteCarloResultStats;
    kpiLabel: string;
    chartType: 'pdf' | 'cdf';
    isCurrency: boolean;
    isPercent: boolean;
}

export const SimulationHistogram: React.FC<SimulationHistogramProps> = ({ data, stats, kpiLabel, chartType, isCurrency, isPercent }) => {
    const { t, i18n } = useTranslation();
    const [isDarkMode] = useDarkMode();
    const { currency } = useProjectStore(state => state.projectData.estimationBasis);
    const tickColor = isDarkMode ? '#94a3b8' : '#64748b';

    const formatter = (value: number) => {
        if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
        if (isCurrency) return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, notation: 'compact', compactDisplay: 'short' }).format(value);
        if (isPercent) return `${value.toFixed(1)}%`;
        return new Intl.NumberFormat(i18n.language, { notation: 'compact', compactDisplay: 'short' }).format(value);
    };

    const fullFormatter = (value: number) => {
        if (typeof value !== 'number' || !isFinite(value)) return 'N/A';
        if (isCurrency) return new Intl.NumberFormat(i18n.language, { style: 'currency', currency }).format(value);
        if (isPercent) return `${value.toFixed(2)}%`;
        return new Intl.NumberFormat(i18n.language, {}).format(value);
    }
    
    const chartData = useMemo(() => {
        if (!data || data.length === 0 || !stats || !isFinite(stats.mean) || !isFinite(stats.stdDev)) return [];

        if (chartType === 'pdf') {
            const bins = bin().thresholds(40)(data);
            if(bins.length === 0 || bins[0].x1 === undefined || bins[0].x0 === undefined) return [];
            
            const binWidth = bins[0].x1 - bins[0].x0;

            const normalPDF = (x: number, mean: number, stdDev: number) => {
                if (stdDev <= 0) return 0;
                return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
            };
            
            return bins.map(bin => {
                const x = (bin.x0! + bin.x1!) / 2;
                const pdfValue = normalPDF(x, stats.mean, stats.stdDev);
                const scaledPdf = pdfValue * data.length * binWidth;
                
                return {
                    x,
                    frequency: bin.length,
                    normalCurve: scaledPdf,
                };
            });
        } else { // cdf
            const sortedData = [...data].sort((a, b) => a - b);
            return sortedData.map((value, index) => ({
                x: value,
                cdf: (index + 1) / sortedData.length,
            }));
        }
    }, [data, chartType, stats]);

    if (!data || data.length === 0 || !stats) {
        return <div className="text-center p-8">No data to display.</div>;
    }

    if (chartType === 'pdf') {
        return (
             <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                        <XAxis 
                            dataKey="x" 
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tick={{ fill: tickColor, fontSize: 12 }} 
                            tickFormatter={formatter}
                            label={{ value: kpiLabel, position: 'insideBottom', offset: -15, fill: tickColor }}
                        />
                        <YAxis 
                            tick={{ fill: tickColor, fontSize: 12 }} 
                            label={{ value: t('m13_monteCarloSimulation.frequency'), angle: -90, position: 'insideLeft', fill: tickColor, style: { textAnchor: 'middle' } }}
                            allowDecimals={false}
                        />
                        <Tooltip
                            formatter={(value: number, name: string) => {
                                if (name === t('m13_monteCarloSimulation.normalCurve')) return null;
                                return [value.toFixed(0), name];
                            }}
                            labelFormatter={(label) => `${kpiLabel}: ${fullFormatter(label)}`}
                            contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                        />
                        <Legend />
                        <Bar dataKey="frequency" fill="#81e6d9" name={t('m13_monteCarloSimulation.frequency') || ''} />
                        <Line type="monotone" dataKey="normalCurve" stroke="#f472b6" strokeWidth={2} dot={false} name={t('m13_monteCarloSimulation.normalCurve') || ''}/>
                        
                        {isFinite(stats.mean) && <ReferenceLine x={stats.mean} stroke="#16a34a" strokeWidth={2} strokeDasharray="3 3" label={{ value: 'Mean', position: 'top', fill: '#16a34a' }} />}
                        {isFinite(stats.median) && <ReferenceLine x={stats.median} stroke="#f97316" strokeWidth={2} strokeDasharray="3 3" label={{ value: 'Median', position: 'top', fill: '#f97316' }} />}
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        );
    }

    // CDF Chart
    return (
         <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#334155' : '#e2e8f0'} />
                    <XAxis 
                        dataKey="x" 
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        tick={{ fill: tickColor, fontSize: 12 }} 
                        tickFormatter={formatter}
                        label={{ value: kpiLabel, position: 'insideBottom', offset: -15, fill: tickColor }}
                    />
                    <YAxis 
                        tick={{ fill: tickColor, fontSize: 12 }} 
                        tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                        domain={[0, 1]}
                        label={{ value: t('m13_monteCarloSimulation.cumulativeProbability'), angle: -90, position: 'insideLeft', fill: tickColor, style: { textAnchor: 'middle' } }}
                    />
                    <Tooltip
                        labelFormatter={(label) => `${kpiLabel}: ${fullFormatter(label)}`}
                        formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, t('m13_monteCarloSimulation.cdf')]}
                        contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#FFFFFF', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="cdf" stroke="#3b82f6" fill="#bfdbfe" strokeWidth={2} dot={false} name={t('m13_monteCarloSimulation.cdf') || ''} />
                    
                    {isFinite(stats.p10) && <ReferenceLine x={stats.p10} stroke="#ef4444" strokeWidth={1} strokeDasharray="2 2" label={{ value: 'P10', position: 'insideTopLeft', fill: '#ef4444' }} />}
                    {isFinite(stats.p90) && <ReferenceLine x={stats.p90} stroke="#ef4444" strokeWidth={1} strokeDasharray="2 2" label={{ value: 'P90', position: 'insideTopLeft', fill: '#ef4444' }} />}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};
