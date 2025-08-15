import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { RatiosChart } from '../components/charts/RatiosChart';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { analyzeRatios } from '../services/geminiService';

const M11_FinancialRatios = () => {
  const { t, i18n } = useTranslation();
  const { calculatedOutputs, projectData } = useProjectStore();
  const { financialRatios } = calculatedOutputs;
  const { projectLife } = projectData.estimationBasis;

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const formatPercentage = (value: number) => {
    if (!isFinite(value)) {
      return t('m9_financialEvaluation.notApplicable');
    }
    return new Intl.NumberFormat(i18n.language, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
  }

  const handleAnalyzeRatios = async () => {
    if (!hasData) return;
    setIsAiLoading(true);
    setAiInsight(null);
    try {
        const insight = await analyzeRatios(financialRatios, projectData.definition.projectName, i18n.language);
        setAiInsight(insight);
    } catch (error) {
        console.error("AI Ratio Analysis Failed:", error);
        setAiInsight(t('m11_financialRatios.aiAnalysis.error'));
    } finally {
        setIsAiLoading(false);
    }
  };
  
  const hasData = financialRatios.grossMargin.length > 0;
  
  const ratioRows = [
    { key: 'grossMargin', label: t('m11_financialRatios.table.grossProfitMargin'), data: financialRatios.grossMargin },
    { key: 'operatingMargin', label: t('m11_financialRatios.table.operatingProfitMargin'), data: financialRatios.operatingMargin },
    { key: 'netMargin', label: t('m11_financialRatios.table.netProfitMargin'), data: financialRatios.netMargin },
  ];

  const chartData = React.useMemo(() => {
    if (!hasData) return [];

    const firstOpYearIndex = calculatedOutputs.revenueSchedule.findIndex(rev => rev > 0);
    if (firstOpYearIndex === -1) return [];

    return Array.from({ length: projectLife - firstOpYearIndex }, (_, i) => {
        const yearIndex = firstOpYearIndex + i;
        return {
            year: yearIndex + 1,
            grossMargin: financialRatios.grossMargin[yearIndex] || 0,
            operatingMargin: financialRatios.operatingMargin[yearIndex] || 0,
            netMargin: financialRatios.netMargin[yearIndex] || 0,
        };
    });
  }, [hasData, projectLife, financialRatios, calculatedOutputs.revenueSchedule]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m11')}</h1>

      {hasData && (
        <AIInsightBox
          title={t('m11_financialRatios.aiAnalysis.title')}
          insight={aiInsight}
          isLoading={isAiLoading}
          onGenerate={handleAnalyzeRatios}
          onInsightChange={setAiInsight}
          generateButtonText={t('m11_financialRatios.aiAnalysis.generateButton')}
          loadingText={t('m11_financialRatios.aiAnalysis.generating')}
          placeholderText={t('m11_financialRatios.aiAnalysis.placeholder')}
        />
      )}
      
      <Card title={t('m11_financialRatios.title')}>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          {t('m11_financialRatios.description')}
        </p>
        
        {hasData ? (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th scope="col" className="sticky left-0 bg-slate-50 dark:bg-slate-700/50 z-10 px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-48">{t('m11_financialRatios.table.metric')}</th>
                  {Array.from({ length: projectLife }, (_, i) => (
                    <th key={i} scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m7_workingCapital.table.year')} {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {ratioRows.map(row => (
                  <tr key={row.key}>
                    <td className="sticky left-0 bg-white dark:bg-slate-800 z-10 px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-700 dark:text-slate-300">
                      {row.label}
                    </td>
                    {row.data.map((value, yearIndex) => (
                      <td key={yearIndex} className="px-4 py-2 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400 text-right">
                        {formatPercentage(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
              <p className="text-slate-500 dark:text-slate-400">{t('m11_financialRatios.noData')}</p>
          </div>
        )}
      </Card>

      {hasData && (
        <Card title={t('m11_financialRatios.chartTitle')}>
            <RatiosChart data={chartData} />
        </Card>
      )}
    </div>
  );
};
export default M11_FinancialRatios;