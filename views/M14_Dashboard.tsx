import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { CapexDonutChart } from '../components/charts/CapexDonutChart';
import { TrendsChart } from '../components/charts/TrendsChart';
import { CapitalInvestmentItem } from '../types';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { generateDashboardSummary } from '../services/geminiService';

const M14_Dashboard = () => {
    const { t, i18n } = useTranslation();
    const { projectData, calculatedOutputs, isDataLoaded } = useProjectStore();
    const { npv, irr, roi } = calculatedOutputs;
    const { currency } = projectData.estimationBasis;

    const [aiSummary, setAiSummary] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const handleGenerateSummary = async () => {
        setIsAiLoading(true);
        setAiSummary(null);
        try {
            const summary = await generateDashboardSummary(calculatedOutputs, projectData.definition.projectName, i18n.language);
            setAiSummary(summary);
        } catch (error) {
            console.error("AI Summary Generation Failed:", error);
            setAiSummary(t('m14_dashboard.aiSummary.error'));
        } finally {
            setIsAiLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        if (!isFinite(value)) {
            return t('m9_financialEvaluation.notApplicable');
        }
        return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    };

    const formatPercentage = (value: number) => {
        if (!isFinite(value)) {
            return t('m9_financialEvaluation.notApplicable');
        }
        return new Intl.NumberFormat(i18n.language, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
    };

    type Category = CapitalInvestmentItem['category'];
    const capexChartData = useMemo(() => {
        const items = projectData.capitalInvestment.items;
        const dataByCategory = items.reduce((acc, item) => {
            if (item.cost > 0) {
                acc[item.category] = (acc[item.category] || 0) + item.cost;
            }
            return acc;
        }, {} as Record<Category, number>);

        return Object.entries(dataByCategory).map(([name, value]) => ({
            name: t(`m3_capitalInvestment.categories.${name.toLowerCase() as 'buildings' | 'machinery' | 'furniture' | 'equipment'}` as const),
            value: value as number,
        }));
    }, [projectData.capitalInvestment.items, t]);
    
    const trendsChartData = useMemo(() => {
        if (!isDataLoaded || !calculatedOutputs.revenueSchedule) return [];
        
        const firstOpYearIndex = calculatedOutputs.revenueSchedule.findIndex(rev => rev > 0);
        if (firstOpYearIndex === -1) return [];

        return Array.from({ length: projectData.estimationBasis.projectLife - firstOpYearIndex }, (_, i) => {
            const yearIndex = firstOpYearIndex + i;
            return {
                year: yearIndex + 1, // Keep the original year number for the x-axis
                revenue: calculatedOutputs.revenueSchedule[yearIndex] || 0,
                costs: calculatedOutputs.operatingCostSchedule[yearIndex] || 0,
                profit: calculatedOutputs.cashFlowStatement[yearIndex]?.nopat || 0,
            };
        });
    }, [isDataLoaded, projectData.estimationBasis.projectLife, calculatedOutputs]);

    if (!isDataLoaded) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">{t('m14_dashboard.title')}</h1>
                <Card title={t('m14_dashboard.welcomeTitle')}>
                    <p className="text-slate-600 dark:text-slate-300">
                        {t('m14_dashboard.welcomeMessage')}
                    </p>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{projectData.definition.projectName || t('sidebar.m14')}</h1>

            <AIInsightBox
                title={t('m14_dashboard.aiSummary.title')}
                insight={aiSummary}
                isLoading={isAiLoading}
                onGenerate={handleGenerateSummary}
                onInsightChange={setAiSummary}
                generateButtonText={t('m14_dashboard.aiSummary.generateButton')}
                loadingText={t('m14_dashboard.aiSummary.generating')}
                placeholderText={t('m14_dashboard.aiSummary.placeholder')}
            />

            {/* KPI Cards */}
            <Card title={t('m14_dashboard.kpiTitle')}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <KpiCard
                        title={t('m9_financialEvaluation.npvTitle')}
                        value={formatCurrency(npv)}
                        colorClass={npv >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                    />
                    <KpiCard
                        title={t('m9_financialEvaluation.irrTitle')}
                        value={formatPercentage(irr)}
                        colorClass={!isNaN(irr) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}
                    />
                    <KpiCard
                        title={t('m9_financialEvaluation.roiTitle')}
                        value={formatPercentage(roi)}
                        colorClass={roi >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
                    />
                </div>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {trendsChartData.length > 0 && (
                    <Card title={t('m14_dashboard.trendsTitle')}>
                        <TrendsChart data={trendsChartData} />
                    </Card>
                )}
                
                {capexChartData.length > 0 && (
                    <Card title={t('m14_dashboard.capexTitle')}>
                        <CapexDonutChart data={capexChartData} />
                    </Card>
                )}
            </div>
        </div>
    );
};
export default M14_Dashboard;