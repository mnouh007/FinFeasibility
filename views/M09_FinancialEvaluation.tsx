import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { analyzeFinancialKpis } from '../services/geminiService';
import { RatiosChart } from '../components/charts/RatiosChart';

const M09_FinancialEvaluation = () => {
  const { t, i18n } = useTranslation();
  const { calculatedOutputs, projectData } = useProjectStore();
  const { 
    npv, irr, roi, paybackPeriod, discountedPaybackPeriod,
    breakEvenRevenue, grossProfitMarginY1, operatingProfitMarginY1, netProfitMarginY1,
    debtToEquityRatio, enterpriseValue, dcfValuation,
    debtToAssetsRatio, currentRatio, quickRatio, financialRatios,
    debtToEquityRatioSchedule
  } = calculatedOutputs;
  const { currency, projectLife } = projectData.estimationBasis;

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const formatCurrency = (value: number) => {
    if (!isFinite(value)) {
      return t('m9_financialEvaluation.notApplicable');
    }
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
  }
  
  const formatPercentage = (value: number) => {
    if (!isFinite(value)) {
        return t('m9_financialEvaluation.notApplicable');
    }
    return new Intl.NumberFormat(i18n.language, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
  }
  
  const formatYears = (value: number) => {
    if (value < 0 || !isFinite(value)) {
      return t('m9_financialEvaluation.notAchieved');
    }
    return value.toFixed(2);
  }

  const formatRatio = (value: number) => {
    if (!isFinite(value)) {
      return value === Infinity ? "∞" : t('m9_financialEvaluation.notApplicable');
    }
    return value.toFixed(2);
  }

  const hasData = calculatedOutputs.cashFlowStatement.length > 0;

  const ratiosChartData = useMemo(() => {
    if (!hasData || !financialRatios.grossMargin || !debtToEquityRatioSchedule) return [];

    const firstOpYearIndex = calculatedOutputs.revenueSchedule.findIndex(rev => rev > 0);
    if (firstOpYearIndex === -1) return [];

    return Array.from({ length: projectLife - firstOpYearIndex }, (_, i) => {
        const yearIndex = firstOpYearIndex + i;
        return {
            year: yearIndex + 1,
            grossMargin: financialRatios.grossMargin[yearIndex] || 0,
            operatingMargin: financialRatios.operatingMargin[yearIndex] || 0,
            netMargin: financialRatios.netMargin[yearIndex] || 0,
            debtToEquity: debtToEquityRatioSchedule[yearIndex],
        };
    });
  }, [hasData, projectLife, financialRatios, debtToEquityRatioSchedule, calculatedOutputs.revenueSchedule]);

  const handleGenerateVerdict = async () => {
    setIsAiLoading(true);
    setAiInsight(null);
    try {
        const insight = await analyzeFinancialKpis(calculatedOutputs, i18n.language);
        setAiInsight(insight);
    } catch (error) {
        console.error("AI Verdict Generation Failed:", error);
        setAiInsight(t('m9_financialEvaluation.aiError'));
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m9')}</h1>
      
      {hasData ? (
        <>
          <AIInsightBox
            title={t('m9_financialEvaluation.aiVerdictTitle')}
            insight={aiInsight}
            isLoading={isAiLoading}
            onGenerate={handleGenerateVerdict}
            onInsightChange={setAiInsight}
            generateButtonText={t('m9_financialEvaluation.generateVerdict')}
            loadingText={t('m9_financialEvaluation.generating')}
            placeholderText={t('m9_financialEvaluation.aiPlaceholder')}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <KpiCard
                title={t('m9_financialEvaluation.npvTitle')}
                value={formatCurrency(npv)}
                description={t('m9_financialEvaluation.npvDescription')}
                colorClass={npv >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
              />
              <KpiCard
                title={t('m9_financialEvaluation.irrTitle')}
                value={formatPercentage(irr)}
                description={t('m9_financialEvaluation.irrDescription')}
                colorClass={!isNaN(irr) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}
              />
              <KpiCard
                title={t('m9_financialEvaluation.roiTitle')}
                value={formatPercentage(roi)}
                description={t('m9_financialEvaluation.roiDescription')}
                colorClass={roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
              />
              <KpiCard
                title={t('m9_financialEvaluation.paybackPeriodTitle')}
                value={formatYears(paybackPeriod)}
                unit={paybackPeriod > 0 && isFinite(paybackPeriod) ? t('m9_financialEvaluation.years') : ''}
                description={t('m9_financialEvaluation.paybackPeriodDescription')}
                colorClass="text-purple-600 dark:text-purple-400"
              />
              <KpiCard
                title={t('m9_financialEvaluation.discountedPaybackPeriodTitle')}
                value={formatYears(discountedPaybackPeriod)}
                unit={discountedPaybackPeriod > 0 && isFinite(discountedPaybackPeriod) ? t('m9_financialEvaluation.years') : ''}
                description={t('m9_financialEvaluation.discountedPaybackPeriodDescription')}
                colorClass="text-indigo-600 dark:text-indigo-400"
              />
              <KpiCard
                title={t('m9_financialEvaluation.breakEvenRevenueTitle')}
                value={formatCurrency(breakEvenRevenue)}
                description={t('m9_financialEvaluation.breakEvenRevenueDescription')}
                colorClass="text-teal-600 dark:text-teal-400"
              />
              <KpiCard
                title={t('m9_financialEvaluation.gpmY1Title')}
                value={formatPercentage(grossProfitMarginY1)}
                description={t('m9_financialEvaluation.gpmY1Description')}
                colorClass="text-green-500 dark:text-green-400"
              />
              <KpiCard
                title={t('m9_financialEvaluation.opmY1Title')}
                value={formatPercentage(operatingProfitMarginY1)}
                description={t('m9_financialEvaluation.opmY1Description')}
                colorClass="text-blue-500 dark:text-blue-400"
              />
              <KpiCard
                title={t('m9_financialEvaluation.npmY1Title')}
                value={formatPercentage(netProfitMarginY1)}
                description={t('m9_financialEvaluation.npmY1Description')}
                colorClass="text-violet-500 dark:text-violet-400"
              />
              <KpiCard
                title={t('m9_financialEvaluation.deRatioTitle')}
                value={formatRatio(debtToEquityRatio)}
                description={t('m9_financialEvaluation.deRatioDescription')}
                colorClass="text-pink-600 dark:text-pink-400"
              />
               <KpiCard
                title={t('m9_financialEvaluation.daRatioTitle')}
                value={formatRatio(debtToAssetsRatio)}
                description={t('m9_financialEvaluation.daRatioDescription')}
                colorClass="text-rose-600 dark:text-rose-400"
              />
              <KpiCard
                title={t('m9_financialEvaluation.currentRatioTitle')}
                value={formatRatio(currentRatio)}
                description={t('m9_financialEvaluation.currentRatioDescription')}
                colorClass="text-amber-600 dark:text-amber-400"
              />
              <KpiCard
                title={t('m9_financialEvaluation.quickRatioTitle')}
                value={formatRatio(quickRatio)}
                description={t('m9_financialEvaluation.quickRatioDescription')}
                colorClass="text-lime-600 dark:text-lime-400"
              />
              <KpiCard
                title={t('m9_financialEvaluation.evTitle')}
                value={formatCurrency(enterpriseValue)}
                description={t('m9_financialEvaluation.evDescription')}
                colorClass="text-fuchsia-600 dark:text-fuchsia-400"
              />
              <KpiCard
                title={t('m9_financialEvaluation.dcfTitle')}
                value={formatCurrency(dcfValuation)}
                description={t('m9_financialEvaluation.dcfDescription')}
                colorClass="text-green-600 dark:text-green-400"
              />
          </div>
          {ratiosChartData.length > 0 && (
            <Card title={t('m9_financialEvaluation.ratiosOverTimeChartTitle')}>
                <RatiosChart data={ratiosChartData} showDebtEquity={true} />
            </Card>
           )}
        </>
      ) : (
        <Card>
            <div className="text-center py-12">
                <p className="text-slate-500 dark:text-slate-400">{t('m9_financialEvaluation.noData')}</p>
            </div>
        </Card>
      )}
    </div>
  );
};
export default M09_FinancialEvaluation;