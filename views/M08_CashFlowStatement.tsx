import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { CashFlowItem } from '../types';
import { CashFlowChart } from '../components/charts/CashFlowChart';
import { InflowOutflowChart } from '../components/charts/InflowOutflowChart';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { analyzeCashFlow } from '../services/geminiService';

const M08_CashFlowStatement = () => {
  const { t, i18n } = useTranslation();
  const { calculatedOutputs, projectData } = useProjectStore();
  const { cashFlowStatement } = calculatedOutputs;
  const { currency, projectLife } = projectData.estimationBasis;

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const formatCurrency = (value: number) => {
    if (!isFinite(value)) {
      return t('m9_financialEvaluation.notApplicable');
    }
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }

  const handleAnalyzeCashFlow = async () => {
    if (!hasData) return;
    setIsAiLoading(true);
    setAiInsight(null);
    try {
        const insight = await analyzeCashFlow(cashFlowStatement, projectData.definition.projectName, i18n.language);
        setAiInsight(insight);
    } catch (error) {
        console.error("AI Cash Flow Analysis Failed:", error);
        setAiInsight(t('m8_cashFlowStatement.aiAnalysis.error'));
    } finally {
        setIsAiLoading(false);
    }
  };

  const rows: { key: keyof Omit<CashFlowItem, 'year'>; label: string; bold?: boolean }[] = [
    { key: 'revenue', label: t('m8_cashFlowStatement.table.revenue') },
    { key: 'operatingCosts', label: t('m8_cashFlowStatement.table.operatingCosts') },
    { key: 'depreciation', label: t('m8_cashFlowStatement.table.depreciation') },
    { key: 'ebit', label: t('m8_cashFlowStatement.table.ebit'), bold: true },
    { key: 'tax', label: t('m8_cashFlowStatement.table.tax') },
    { key: 'nopat', label: t('m8_cashFlowStatement.table.nopat'), bold: true },
    { key: 'depreciation', label: `(+) ${t('m8_cashFlowStatement.table.depreciation')}` },
    { key: 'capex', label: `(-) ${t('m8_cashFlowStatement.table.capex')}` },
    { key: 'changeInWc', label: `(-) ${t('m8_cashFlowStatement.table.changeInWc')}` },
    { key: 'unleveredFreeCashFlow', label: t('m8_cashFlowStatement.table.unleveredFreeCashFlow'), bold: true },
  ];

  const hasData = cashFlowStatement.length > 0;

  const inflowOutflowChartData = React.useMemo(() => {
    if (!hasData) return [];
    return cashFlowStatement.map(item => ({
        year: item.year,
        inflows: item.revenue,
        outflows: item.operatingCosts + item.capex + item.tax,
    }));
  }, [hasData, cashFlowStatement]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m8')}</h1>

      {hasData && (
        <AIInsightBox
            title={t('m8_cashFlowStatement.aiAnalysis.title')}
            insight={aiInsight}
            isLoading={isAiLoading}
            onGenerate={handleAnalyzeCashFlow}
            onInsightChange={setAiInsight}
            generateButtonText={t('m8_cashFlowStatement.aiAnalysis.generateButton')}
            loadingText={t('m8_cashFlowStatement.aiAnalysis.generating')}
            placeholderText={t('m8_cashFlowStatement.aiAnalysis.placeholder')}
        />
      )}
      
      <Card title={t('m8_cashFlowStatement.title')}>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          {t('m8_cashFlowStatement.description')}
        </p>
        
        {hasData ? (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th scope="col" className="sticky left-0 bg-slate-50 dark:bg-slate-700/50 z-10 px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-48">{t('m8_cashFlowStatement.table.metric')}</th>
                  {Array.from({ length: projectLife }, (_, i) => (
                    <th key={i} scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m7_workingCapital.table.year')} {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {rows.map(row => (
                  <tr key={row.key} className={row.bold ? 'bg-slate-50 dark:bg-slate-700/50' : ''}>
                    <td className={`sticky left-0 bg-white dark:bg-slate-800 z-10 px-4 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300 ${row.bold ? 'font-bold' : ''} ${row.bold && 'dark:bg-slate-700/50'}`}>
                      {row.label}
                    </td>
                    {cashFlowStatement.map(item => (
                      <td key={item.year} className="px-4 py-2 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 text-right">
                        {formatCurrency(item[row.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">{t('m8_cashFlowStatement.noData')}</p>
          </div>
        )}
      </Card>

      {hasData && (
        <Card title={t('m8_cashFlowStatement.chartTitle')}>
          <CashFlowChart data={cashFlowStatement} />
        </Card>
      )}

      {hasData && (
        <Card title={t('m8_cashFlowStatement.inflowOutflowChartTitle')}>
          <InflowOutflowChart data={inflowOutflowChartData} />
        </Card>
      )}
    </div>
  );
};
export default M08_CashFlowStatement;