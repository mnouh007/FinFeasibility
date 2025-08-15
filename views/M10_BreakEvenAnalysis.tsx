import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { BreakEvenChart } from '../components/charts/BreakEvenChart';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { analyzeBreakEven } from '../services/geminiService';
import { Select } from '../components/ui/Select';
import { TimeBasedBreakEvenChart } from '../components/charts/TimeBasedBreakEvenChart';

const StatCard = ({ title, value, className = '' }: { title: string, value: string, className?: string }) => (
    <div className={`p-4 rounded-lg bg-slate-100 dark:bg-slate-700/50 ${className}`}>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
);

const M10_BreakEvenAnalysis = () => {
  const { t, i18n } = useTranslation();
  const { calculatedOutputs, projectData } = useProjectStore();
  const { breakEvenAnalysis, revenueSchedule, timeBasedBreakEvenData } = calculatedOutputs;
  const { currency, projectLife, revenueGrowthRate } = projectData.estimationBasis;
  const { revenues } = projectData.operatingInputs;

  const firstOperationalYear = useMemo(() => {
    const yearIndex = revenueSchedule.findIndex(rev => rev > 0);
    return yearIndex === -1 ? 1 : yearIndex + 1;
  }, [revenueSchedule]);

  const [selectedYear, setSelectedYear] = useState(firstOperationalYear);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  useEffect(() => {
    setSelectedYear(firstOperationalYear);
  }, [firstOperationalYear]);

  const currentBreakEven = useMemo(() => {
    return breakEvenAnalysis.find(be => be.year === selectedYear);
  }, [breakEvenAnalysis, selectedYear]);

  const formatCurrency = (value: number) => {
    if (!isFinite(value)) {
      return t('m9_financialEvaluation.notApplicable');
    }
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }
  
  const formatNumber = (value: number) => {
    if (!isFinite(value)) {
        return t('m9_financialEvaluation.notApplicable');
    }
    return new Intl.NumberFormat(i18n.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }

  const formatPercentage = (value: number) => {
    if (!isFinite(value)) {
        return t('m9_financialEvaluation.notApplicable');
    }
    return new Intl.NumberFormat(i18n.language, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
  }

  const handleInterpretResults = async () => {
    if (!currentBreakEven) return;
    setIsAiLoading(true);
    setAiInsight(null);
    try {
        const insight = await analyzeBreakEven(currentBreakEven, timeBasedBreakEvenData, projectData.definition.projectName, i18n.language);
        setAiInsight(insight);
    } catch (error) {
        console.error("AI Break-even Analysis Failed:", error);
        setAiInsight(t('m10_breakEvenAnalysis.aiAnalysis.error'));
    } finally {
        setIsAiLoading(false);
    }
  };

 const chartData = useMemo(() => {
    if (!currentBreakEven) return [];
    
    const { totalRevenue, totalFixedCosts, totalVariableCosts } = currentBreakEven;
    const baseTotalQuantity = revenues.reduce((sum, r) => sum + r.quantity, 0);

    // Assuming revenueGrowthRate is a proxy for quantity growth
    const totalQuantityForYear = baseTotalQuantity * Math.pow(1 + revenueGrowthRate / 100, selectedYear - 1);

    if (totalQuantityForYear === 0 || totalRevenue <= 0) return [];

    const avgPricePerUnit = totalRevenue / totalQuantityForYear;
    const avgVarCostPerUnit = totalVariableCosts / totalQuantityForYear;
    const contributionMarginPerUnit = avgPricePerUnit - avgVarCostPerUnit;
    const breakEvenUnits = contributionMarginPerUnit > 0 ? totalFixedCosts / contributionMarginPerUnit : Infinity;
    
    const data = [];
    const dataPoints = 50;
    const maxUnits = Math.max(totalQuantityForYear, isFinite(breakEvenUnits) ? breakEvenUnits : 0) * 1.5;

    if (maxUnits === 0 || !isFinite(maxUnits)) return [];
    const step = maxUnits / dataPoints;

    for (let i = 0; i <= dataPoints; i++) {
        const currentQuantity = i * step;
        data.push({
            quantity: currentQuantity,
            revenueLine: currentQuantity * avgPricePerUnit,
            fixedCosts: totalFixedCosts,
            totalCosts: totalFixedCosts + (currentQuantity * avgVarCostPerUnit),
        });
    }
    return data;
  }, [currentBreakEven, revenues, revenueGrowthRate, selectedYear]);
  
  const quantityAnalysisData = useMemo(() => {
    if (!currentBreakEven) return [];
    const { totalFixedCosts, totalVariableCosts, totalRevenue } = currentBreakEven;
    const totalQuantity = revenues.reduce((sum, r) => sum + r.quantity, 0);

    if (totalQuantity === 0) return [];
    
    const avgPricePerUnit = totalRevenue / totalQuantity;
    const avgVarCostPerUnit = totalVariableCosts / totalQuantity;
    const contributionMarginPerUnit = avgPricePerUnit - avgVarCostPerUnit;
    const breakEvenUnits = contributionMarginPerUnit > 0 ? totalFixedCosts / contributionMarginPerUnit : Infinity;

    const data = [];
    const stepCount = 10;
    const maxUnits = isFinite(breakEvenUnits) ? breakEvenUnits * 2 : totalQuantity * 2;
    if (maxUnits === 0) return [];
    const step = maxUnits / stepCount;

    for (let i = 0; i <= stepCount; i++) {
        const quantity = i * step;
        const revenues = quantity * avgPricePerUnit;
        const variableCosts = quantity * avgVarCostPerUnit;
        const totalCosts = totalFixedCosts + variableCosts;
        const profitLoss = revenues - totalCosts;
        data.push({ quantity, fixedCosts: totalFixedCosts, variableCosts, totalCosts, totalRevenues: revenues, profitLoss });
    }
    return data;
  }, [currentBreakEven, revenues]);
  
  const productAnalysisData = useMemo(() => {
    if (!currentBreakEven || revenues.length === 0) return [];
    const { totalFixedCosts, totalVariableCosts } = currentBreakEven;
    const totalQuantity = revenues.reduce((sum, r) => sum + r.quantity, 0);
    if(totalQuantity === 0) return [];
    
    const avgVarCostPerUnit = totalVariableCosts / totalQuantity;

    return revenues.map(product => {
        const contributionMarginPerUnit = product.unitPrice - avgVarCostPerUnit;
        const breakEvenUnits = contributionMarginPerUnit > 0 ? totalFixedCosts / contributionMarginPerUnit : Infinity;
        return {
            product: product.item || `Product ${product.id}`,
            contributionMarginPerUnit,
            breakEvenUnits
        }
    });

  }, [currentBreakEven, revenues]);


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m10')}</h1>

      {currentBreakEven && (
        <AIInsightBox
          title={t('m10_breakEvenAnalysis.aiAnalysis.title')}
          insight={aiInsight}
          isLoading={isAiLoading}
          onGenerate={handleInterpretResults}
          onInsightChange={setAiInsight}
          generateButtonText={t('m10_breakEvenAnalysis.aiAnalysis.generateButton')}
          loadingText={t('m10_breakEvenAnalysis.aiAnalysis.generating')}
          placeholderText={t('m10_breakEvenAnalysis.aiAnalysis.placeholder')}
        />
      )}
      
      <Card title={t('m10_breakEvenAnalysis.title', { year: selectedYear })}>
        <div className="max-w-xs mb-4">
            <label htmlFor="year-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m10_breakEvenAnalysis.selectYear')}</label>
            <Select id="year-select" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {Array.from({ length: projectLife }, (_, i) => i + 1).map(year => (
                    <option key={year} value={year}>{t('m6_financingLoans.amortizationTable.year')} {year}</option>
                ))}
            </Select>
        </div>
        
        {currentBreakEven ? (
            <>
                <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
                  {t('m10_breakEvenAnalysis.description', { year: selectedYear })}
                </p>
                <p className="mb-6 text-xs italic text-slate-500 dark:text-slate-500">
                  {t('m10_breakEvenAnalysis.assumptionNote')}
                </p>
            </>
        ) : null}
        
        {currentBreakEven ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title={t('m10_breakEvenAnalysis.kpi.breakEvenRevenue')} value={formatCurrency(currentBreakEven.breakEvenRevenue)} className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200" />
              <StatCard title={t('m10_breakEvenAnalysis.kpi.marginOfSafety')} value={formatPercentage(currentBreakEven.marginOfSafety)} className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200" />
              <StatCard title={t('m10_breakEvenAnalysis.kpi.contributionMarginRatio')} value={formatPercentage(currentBreakEven.contributionMarginRatio)} className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200"/>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-2">{t('m10_breakEvenAnalysis.calculationBasis', { year: selectedYear })}</h4>
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m8_cashFlowStatement.table.metric')}</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    <tr>
                      <td className="px-4 py-2 font-medium">{t('m10_breakEvenAnalysis.table.totalRevenue')}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(currentBreakEven.totalRevenue)}</td>
                    </tr>
                     <tr>
                      <td className="px-4 py-2 font-medium">{t('m10_breakEvenAnalysis.table.totalVariableCosts')}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(currentBreakEven.totalVariableCosts)}</td>
                    </tr>
                     <tr>
                      <td className="px-4 py-2 font-medium">{t('m10_breakEvenAnalysis.table.totalFixedCosts')}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(currentBreakEven.totalFixedCosts)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">{t('m10_breakEvenAnalysis.noData')}</p>
          </div>
        )}
      </Card>
      
      {currentBreakEven && chartData.length > 0 && (
        <Card title={t('m10_breakEvenAnalysis.chartTitle', { year: selectedYear })}>
          <BreakEvenChart data={chartData} />
        </Card>
      )}

       {timeBasedBreakEvenData.length > 0 && (
        <Card title={t('m10_breakEvenAnalysis.timeBasedTitle')}>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                {t('m10_breakEvenAnalysis.timeBasedDescription')}
            </p>
            <TimeBasedBreakEvenChart data={timeBasedBreakEvenData} />
        </Card>
      )}

      {currentBreakEven && quantityAnalysisData && quantityAnalysisData.length > 0 && (
        <Card title={t('m10_breakEvenAnalysis.quantityAnalysisTitle')}>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-2 text-right font-medium">{t('m10_breakEvenAnalysis.quantityTable.quantity')}</th>
                            <th className="px-4 py-2 text-right font-medium">{t('m10_breakEvenAnalysis.quantityTable.fixedCosts')}</th>
                            <th className="px-4 py-2 text-right font-medium">{t('m10_breakEvenAnalysis.quantityTable.variableCosts')}</th>
                            <th className="px-4 py-2 text-right font-medium">{t('m10_breakEvenAnalysis.quantityTable.totalCosts')}</th>
                            <th className="px-4 py-2 text-right font-medium">{t('m10_breakEvenAnalysis.quantityTable.totalRevenues')}</th>
                            <th className="px-4 py-2 text-right font-medium">{t('m10_breakEvenAnalysis.quantityTable.profitLoss')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {quantityAnalysisData.map((row, i) => (
                            <tr key={i} className={row.profitLoss >= -0.01 ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                                <td className="px-4 py-2 text-right font-mono">{formatNumber(row.quantity)}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.fixedCosts)}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.variableCosts)}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.totalCosts)}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.totalRevenues)}</td>
                                <td className={`px-4 py-2 text-right font-mono font-bold ${row.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(row.profitLoss)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      )}

      {currentBreakEven && productAnalysisData && productAnalysisData.length > 0 && (
        <Card title={t('m10_breakEvenAnalysis.productAnalysisTitle')}>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium">{t('m10_breakEvenAnalysis.productTable.product')}</th>
                            <th className="px-4 py-2 text-right font-medium">{t('m10_breakEvenAnalysis.productTable.contributionMarginPerUnit')}</th>
                            <th className="px-4 py-2 text-right font-medium">{t('m10_breakEvenAnalysis.productTable.breakEvenUnits')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {productAnalysisData.map((row, i) => (
                            <tr key={i}>
                                <td className="px-4 py-2 font-medium">{row.product}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.contributionMarginPerUnit)}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatNumber(row.breakEvenUnits)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      )}

    </div>
  );
};
export default M10_BreakEvenAnalysis;