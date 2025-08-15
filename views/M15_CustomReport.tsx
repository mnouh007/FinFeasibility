import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { NAV_ITEMS } from '../constants';
import { generateReport, generateDocxReport } from '../lib/reportGenerator';
import { CapitalInvestmentItem, OperatingCostItem } from '../types';
import * as gemini from '../services/geminiService';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { calculateFinancialOutputs } from '../lib/financial';


// Import all chart components for rendering
import { OwnershipPieChart } from '../components/charts/OwnershipPieChart';
import { CapexDonutChart } from '../components/charts/CapexDonutChart';
import { GanttChart } from '../components/charts/GanttChart';
import { CostIncomeBarChart } from '../components/charts/CostIncomeBarChart';
import { AmortizationChart } from '../components/charts/AmortizationChart';
import { CashFlowChart } from '../components/charts/CashFlowChart';
import { InflowOutflowChart } from '../components/charts/InflowOutflowChart';
import { BreakEvenChart } from '../components/charts/BreakEvenChart';
import { RatiosChart } from '../components/charts/RatiosChart';
import { TrendsChart } from '../components/charts/TrendsChart';
import { TornadoChart } from '../components/charts/TornadoChart';
import { SimulationHistogram } from '../components/charts/SimulationHistogram';


const M15_CustomReport = () => {
    const { t, i18n } = useTranslation();
    const { projectData, calculatedOutputs, simulationResults, simulationRawData } = useProjectStore(state => ({
        projectData: state.projectData,
        calculatedOutputs: state.calculatedOutputs,
        simulationResults: state.simulationResults,
        simulationRawData: state.simulationRawData,
    }));

    const reportableSections = NAV_ITEMS.filter(item => !['m15', 'm16'].includes(item.id));
    const defaultSelected = Object.fromEntries(reportableSections.map(s => [s.id, true]));

    const [selectedSections, setSelectedSections] = useState<Record<string, boolean>>(defaultSelected);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [isDocxLoading, setIsDocxLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [reportContent, setReportContent] = useState<Record<string, string> | null>(null);

    const handleToggleSection = (id: string) => {
        setSelectedSections(prev => ({ ...prev, [id]: !prev[id] }));
    };
    
    const handleSelectAll = () => setSelectedSections(defaultSelected);
    const handleDeselectAll = () => setSelectedSections(Object.fromEntries(reportableSections.map(s => [s.id, false])));

    const handleGeneratePreview = async () => {
        setIsPreviewLoading(true);
        setReportContent(null);
        const sectionsToInclude = Object.entries(selectedSections)
            .filter(([, isSelected]) => isSelected)
            .map(([id]) => id);
        
        const summaries: Record<string, string> = {};
        for (const sectionId of sectionsToInclude) {
            setStatus(t('m15_customReport.status.generatingAI', { section: t(`sidebar.${sectionId}`) }));
            let summary = 'AI summary could not be generated for this section.';
            const lang = i18n.language;
            try {
                switch(sectionId) {
                    case 'm1': summary = await gemini.summarizeProjectDefinition(projectData.definition, lang); break;
                    case 'm2': summary = await gemini.analyzeEstimationBasis(projectData.estimationBasis, projectData.definition.projectName, lang); break;
                    case 'm3': summary = await gemini.analyzeCapex(projectData.capitalInvestment.items, lang); break;
                    case 'm4': summary = await gemini.validateSchedule(projectData.timeline.tasks, lang); break;
                    case 'm5': summary = await gemini.analyzeOperatingInputs(projectData.operatingInputs.revenues, projectData.operatingInputs.costs, lang); break;
                    case 'm6': summary = await gemini.analyzeFinancing(projectData.financing.loans, calculatedOutputs.loanAmortizationSchedule, calculatedOutputs.cashFlowStatement, lang); break;
                    case 'm7': summary = await gemini.analyzeWorkingCapital(calculatedOutputs.workingCapitalSchedule, projectData.definition.projectName, lang); break;
                    case 'm8': summary = await gemini.analyzeCashFlow(calculatedOutputs.cashFlowStatement, projectData.definition.projectName, lang); break;
                    case 'm9': summary = await gemini.analyzeFinancialKpis(calculatedOutputs, lang); break;
                    case 'm10': summary = await gemini.analyzeBreakEven(calculatedOutputs.breakEvenAnalysis[0] || null, calculatedOutputs.timeBasedBreakEvenData, projectData.definition.projectName, lang); break;
                    case 'm11': summary = await gemini.analyzeRatios(calculatedOutputs.financialRatios, projectData.definition.projectName, lang); break;
                    case 'm12': {
                        const scenarioResults = projectData.sensitivityAnalysis.scenarios.map(scenario => {
                            const modifiedProjectData = { ...projectData, estimationBasis: { ...projectData.estimationBasis, ...scenario.modifications } };
                            return { name: scenario.name, outputs: calculateFinancialOutputs(modifiedProjectData) };
                        });
                        summary = await gemini.analyzeSensitivityResults(calculatedOutputs, scenarioResults, lang);
                        break;
                    }
                    case 'm13': {
                        if (simulationResults) {
                            summary = await gemini.summarizeSimulationResults(simulationResults, projectData.definition.projectName, lang);
                        } else {
                            summary = "Monte Carlo simulation has not been run.";
                        }
                        break;
                    }
                    case 'm14': summary = await gemini.generateDashboardSummary(calculatedOutputs, projectData.definition.projectName, lang); break;
                }
            } catch (e) { console.error(`AI summary failed for ${sectionId}`, e); }
            summaries[sectionId] = summary;
        }
        setReportContent(summaries);
        setIsPreviewLoading(false);
        setStatus('');
    };
    
    const handleUpdateSectionContent = (sectionId: string, newContent: string) => {
        setReportContent(prev => prev ? { ...prev, [sectionId]: newContent } : null);
    };

    const handleGeneratePdf = async () => {
        if (!reportContent) return;
        setIsPdfLoading(true);
        await generateReport({
            projectData,
            calculatedOutputs,
            simulationResults,
            selectedSections: Object.keys(reportContent),
            aiSummaries: reportContent,
            t,
            i18n,
            updateStatus: (newStatus) => setStatus(newStatus)
        });
        setIsPdfLoading(false);
    };

    const handleGenerateDocx = async () => {
        if (!reportContent) return;
        setIsDocxLoading(true);
        await generateDocxReport({
            projectData,
            calculatedOutputs,
            simulationResults,
            selectedSections: Object.keys(reportContent),
            aiSummaries: reportContent,
            t,
            i18n,
            updateStatus: (newStatus) => setStatus(newStatus)
        });
        setIsDocxLoading(false);
    };

    // --- Prepare Data for Hidden Charts ---
    const capexChartData = useMemo(() => {
        type Category = CapitalInvestmentItem['category'];
        const items = projectData.capitalInvestment.items;
        const dataByCategory = items.reduce((acc, item) => {
            if (item.cost > 0) { acc[item.category] = (acc[item.category] || 0) + item.cost; }
            return acc;
        }, {} as Record<Category, number>);
        return Object.entries(dataByCategory).map(([name, value]) => ({
            name: t(`m3_capitalInvestment.categories.${name.toLowerCase()}` as const),
            value: value as number,
        }));
    }, [projectData.capitalInvestment.items, t]);

    const getDisplayAnnualCost = (item: OperatingCostItem): number => {
      switch(item.category) {
          case 'Raw Materials': return item.unitCost * item.quantity;
          case 'Labor': return item.count * item.monthlySalary * 12;
          case 'General & Admin': return item.cost;
      }
    };

    const costIncomeChartData = useMemo(() => {
        const totalRevenue = projectData.operatingInputs.revenues.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const costsByCategory = projectData.operatingInputs.costs.reduce((acc, item) => {
            const key = t(`m5_operatingInputs.chart.${item.category.replace(' ', '').replace('&', '').toLowerCase()}` as const);
            acc[key] = (acc[key] || 0) + getDisplayAnnualCost(item);
            return acc;
        }, {} as Record<string, number>);
        return [{
            name: 'Year 1',
            [t('m5_operatingInputs.chart.revenue')]: totalRevenue,
            ...costsByCategory
        }];
    }, [projectData.operatingInputs, t]);

    const inflowOutflowChartData = useMemo(() => {
      return calculatedOutputs.cashFlowStatement.map(item => ({
          year: item.year,
          inflows: item.revenue,
          outflows: item.operatingCosts + item.capex + item.tax,
      }));
    }, [calculatedOutputs.cashFlowStatement]);

     const breakEvenChartData = useMemo(() => {
        if (!calculatedOutputs.breakEvenAnalysis || calculatedOutputs.breakEvenAnalysis.length === 0) return [];
        const firstYearAnalysis = calculatedOutputs.breakEvenAnalysis[0];
        if (!firstYearAnalysis) return [];
        const { totalRevenue, totalFixedCosts, totalVariableCosts, breakEvenRevenue } = firstYearAnalysis;
        
        if (totalRevenue <= 0 && totalFixedCosts <= 0) return [];
        
        const variableCostRatio = totalRevenue > 0 ? totalVariableCosts / totalRevenue : 0;
        
        const dataPoints = 50;
        const maxRevenue = Math.max(totalRevenue, breakEvenRevenue) * 1.5;
        if (!isFinite(maxRevenue) || maxRevenue === 0) return [];
        const step = maxRevenue / dataPoints;
        const data = [];

        for (let i = 0; i <= dataPoints; i++) {
            const currentRevenue = i * step;
            data.push({
                revenue: currentRevenue,
                revenueLine: currentRevenue,
                fixedCosts: totalFixedCosts,
                totalCosts: totalFixedCosts + (currentRevenue * variableCostRatio)
            });
        }
        return data;
      }, [calculatedOutputs.breakEvenAnalysis]);

    const ratiosChartData = useMemo(() => {
        const { projectLife } = projectData.estimationBasis;
        const { financialRatios, debtToEquityRatioSchedule, revenueSchedule } = calculatedOutputs;
        const firstOpYearIndex = revenueSchedule.findIndex(rev => rev > 0);
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
    }, [projectData.estimationBasis.projectLife, calculatedOutputs]);

    const trendsChartData = useMemo(() => {
        const { projectLife } = projectData.estimationBasis;
        const firstOpYearIndex = calculatedOutputs.revenueSchedule.findIndex(rev => rev > 0);
        if (firstOpYearIndex === -1) return [];

        return Array.from({ length: projectLife - firstOpYearIndex }, (_, i) => {
            const yearIndex = firstOpYearIndex + i;
            return {
                year: yearIndex + 1,
                revenue: calculatedOutputs.revenueSchedule[yearIndex] || 0,
                costs: calculatedOutputs.operatingCostSchedule[yearIndex] || 0,
                profit: calculatedOutputs.cashFlowStatement[yearIndex]?.nopat || 0,
            };
        });
    }, [projectData.estimationBasis.projectLife, calculatedOutputs]);

     const tornadoData = useMemo(() => {
        const analyzedKpi = 'npv';
        const baseValue = calculatedOutputs[analyzedKpi];
        if (typeof baseValue !== 'number' || !isFinite(baseValue)) return [];

        const variablesToTest = [
          { name: t('m12_sensitivityAnalysis.variables.investmentCost'), key: 'investmentCost' },
          { name: t('m12_sensitivityAnalysis.variables.revenue'), key: 'revenue' },
          { name: t('m12_sensitivityAnalysis.variables.variableCosts'), key: 'variableCosts' },
          { name: t('m12_sensitivityAnalysis.variables.fixedCosts'), key: 'fixedCosts' },
          { name: t('m12_sensitivityAnalysis.variables.discountRate'), key: 'discountRate' }
        ];

        return variablesToTest.map(variable => {
          const modifiedProjectData = JSON.parse(JSON.stringify(projectData));
          const changeFactor = 1.10;
          switch(variable.key) {
            case 'investmentCost': modifiedProjectData.capitalInvestment.items.forEach((item: any) => item.cost *= changeFactor); break;
            case 'revenue': modifiedProjectData.operatingInputs.revenues.forEach((item: any) => item.unitPrice *= changeFactor); break;
            case 'variableCosts': modifiedProjectData.operatingInputs.costs.filter((c: any) => c.category === 'Raw Materials').forEach((item: any) => item.unitCost *= changeFactor); break;
            case 'fixedCosts': modifiedProjectData.operatingInputs.costs.filter((c: any) => c.category !== 'Raw Materials').forEach((item: any) => { if (item.monthlySalary) item.monthlySalary *= changeFactor; if (item.cost) item.cost *= changeFactor; }); break;
            case 'discountRate': modifiedProjectData.estimationBasis.discountRate *= changeFactor; break;
          }
          const newOutputs = calculateFinancialOutputs(modifiedProjectData);
          const newValue = newOutputs[analyzedKpi];
          let percentageChange = baseValue !== 0 ? ((newValue - baseValue) / Math.abs(baseValue)) * 100 : (newValue > 0 ? 1000 : -1000);
          return { name: variable.name, impact: percentageChange };
        });
    }, [projectData, calculatedOutputs, t]);


    return (
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">{t('m15_customReport.title')}</h1>
                <p className="text-slate-600 dark:text-slate-300">{t('m15_customReport.description')}</p>

                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">{t('m15_customReport.sectionsTitle')}</h3>
                        <div className="space-x-2 rtl:space-x-reverse">
                            <Button variant="secondary" size="sm" onClick={handleSelectAll}>{t('m15_customReport.selectAll')}</Button>
                            <Button variant="secondary" size="sm" onClick={handleDeselectAll}>{t('m15_customReport.deselectAll')}</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {reportableSections.map(section => (
                            <div key={section.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    id={`section-${section.id}`}
                                    checked={selectedSections[section.id] ?? false}
                                    onChange={() => handleToggleSection(section.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor={`section-${section.id}`} className="ml-3 rtl:mr-3 rtl:ml-0 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t(`sidebar.${section.id}` as const)}
                                </label>
                            </div>
                        ))}
                    </div>
                </Card>

                <div className="flex flex-col items-center space-y-4">
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button onClick={handleGeneratePreview} disabled={isPreviewLoading || isPdfLoading || isDocxLoading || Object.values(selectedSections).every(v => !v)}>
                            {isPreviewLoading ? t('m15_customReport.generatingPreviewButton') : t('m15_customReport.previewReportButton')}
                        </Button>
                         <Button variant="secondary" onClick={handleGeneratePdf} disabled={!reportContent || isPreviewLoading || isPdfLoading || isDocxLoading}>
                            {isPdfLoading ? t('m15_customReport.exportingPdfButton') : t('m15_customReport.exportPdfButton')}
                        </Button>
                         <Button variant="secondary" onClick={handleGenerateDocx} disabled={!reportContent || isPreviewLoading || isPdfLoading || isDocxLoading}>
                            {isDocxLoading ? t('m15_customReport.exportingDocxButton') : t('m15_customReport.exportDocxButton')}
                        </Button>
                    </div>

                    {(isPreviewLoading || isPdfLoading || isDocxLoading) && (
                        <div className="mt-4 text-center">
                            <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3 rtl:ml-3 rtl:mr-0"></div>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{status}</p>
                            </div>
                        </div>
                    )}
                </div>

                {reportContent && (
                    <div className="space-y-4">
                        {Object.entries(reportContent).map(([sectionId, content]) => (
                            <AIInsightBox
                                key={sectionId}
                                title={t(`sidebar.${sectionId}` as const)}
                                insight={content}
                                isLoading={false}
                                onInsightChange={(newContent) => handleUpdateSectionContent(sectionId, newContent)}
                                placeholderText=""
                            />
                        ))}
                    </div>
                )}


                {/* Hidden container for rendering charts for PDF/DOCX capture */}
                <div style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px' }}>
                    <div id="report-chart-m1" style={{width: 500, height: 400}}><OwnershipPieChart data={projectData.definition.partners} /></div>
                    <div id="report-chart-m3" style={{width: 800, height: 500}}><CapexDonutChart data={capexChartData} /></div>
                    <div id="report-chart-m4" style={{width: 800, height: 600}}><GanttChart tasks={projectData.timeline.tasks} /></div>
                    <div id="report-chart-m5" style={{width: 800, height: 500}}><CostIncomeBarChart data={costIncomeChartData} /></div>
                    <div id="report-chart-m6" style={{width: 800, height: 500}}><AmortizationChart data={calculatedOutputs.loanAmortizationSchedule} /></div>
                    <div id="report-chart-m8-1" style={{width: 800, height: 500}}><CashFlowChart data={calculatedOutputs.cashFlowStatement} /></div>
                    <div id="report-chart-m8-2" style={{width: 800, height: 500}}><InflowOutflowChart data={inflowOutflowChartData} /></div>
                    <div id="report-chart-m9" style={{width: 800, height: 500}}><RatiosChart data={ratiosChartData} showDebtEquity={true}/></div>
                    <div id="report-chart-m10" style={{width: 800, height: 500}}><BreakEvenChart data={breakEvenChartData} /></div>
                    <div id="report-chart-m11" style={{width: 800, height: 500}}><RatiosChart data={ratiosChartData} /></div>
                    <div id="report-chart-m12" style={{width: 800, height: 500}}><TornadoChart data={tornadoData} /></div>
                     {simulationRawData && simulationResults && (
                        <div id="report-chart-m13" style={{width: 800, height: 500}}>
                           <SimulationHistogram
                                data={simulationRawData['npv']}
                                stats={simulationResults['npv']}
                                kpiLabel={t('m9_financialEvaluation.npvTitle')}
                                chartType="pdf"
                                isCurrency={true}
                                isPercent={false}
                             />
                        </div>
                     )}
                    <div id="report-chart-m14" style={{width: 800, height: 500}}><TrendsChart data={trendsChartData} /></div>
                </div>
            </div>
        </>
    );
};

export default M15_CustomReport;