import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { analyzeWorkingCapital } from '../services/geminiService';

const M07_WorkingCapital = () => {
  const { t, i18n } = useTranslation();
  const { calculatedOutputs, projectData } = useProjectStore();
  const { workingCapitalSchedule } = calculatedOutputs;
  const { currency } = projectData.estimationBasis;

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAnalyzeWC = async () => {
    if (workingCapitalSchedule.length === 0) return;
    setIsAiLoading(true);
    setAiInsight(null);
    try {
        const insight = await analyzeWorkingCapital(workingCapitalSchedule, projectData.definition.projectName, i18n.language);
        setAiInsight(insight);
    } catch (error) {
        console.error("AI Working Capital Analysis Failed:", error);
        setAiInsight(t('m7_workingCapital.aiAnalysis.error'));
    } finally {
        setIsAiLoading(false);
    }
  };
  
  const formatCurrency = (value: number) => {
    if (!isFinite(value)) {
      return t('m9_financialEvaluation.notApplicable');
    }
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(value);
  }

  const hasData = workingCapitalSchedule.length > 0;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m7')}</h1>

      {hasData && (
        <AIInsightBox
          title={t('m7_workingCapital.aiAnalysis.title')}
          insight={aiInsight}
          isLoading={isAiLoading}
          onGenerate={handleAnalyzeWC}
          onInsightChange={setAiInsight}
          generateButtonText={t('m7_workingCapital.aiAnalysis.generateButton')}
          loadingText={t('m7_workingCapital.aiAnalysis.generating')}
          placeholderText={t('m7_workingCapital.aiAnalysis.placeholder')}
        />
      )}
      
      <Card title={t('m7_workingCapital.title')}>
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
          {t('m7_workingCapital.description')}
        </p>
        
        {hasData ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-700/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m7_workingCapital.table.year')}</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m7_workingCapital.table.totalRevenue')}</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m7_workingCapital.table.workingCapital')}</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m7_workingCapital.table.changeInWorkingCapital')}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                {workingCapitalSchedule.map(item => (
                  <tr key={item.year}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.year}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300 text-right">{formatCurrency(item.revenue)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300 text-right">{formatCurrency(item.wc)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300 text-right">{formatCurrency(item.changeInWc)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
              <p className="text-slate-500 dark:text-slate-400">{t('m7_workingCapital.noData')}</p>
          </div>
        )}
      </Card>
    </div>
  );
};
export default M07_WorkingCapital;