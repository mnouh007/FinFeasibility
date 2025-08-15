import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { calculateFinancialOutputs } from '../lib/financial';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TrashIcon, PlusIcon } from '../components/ui/Icons';
import { EstimationBasis, CalculatedOutputs } from '../types';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { analyzeSensitivityResults } from '../services/geminiService';
import { Select } from '../components/ui/Select';
import { TornadoChart } from '../components/charts/TornadoChart';

type NumericEstimationBasisKeys = {
  [K in keyof EstimationBasis]: EstimationBasis[K] extends number ? K : never
}[keyof EstimationBasis];

const M12_SensitivityAnalysis = () => {
  const { t, i18n } = useTranslation();
  const { projectData, calculatedOutputs, addScenario, removeScenario, updateScenarioName, updateScenarioModifications } = useProjectStore();
  
  const { sensitivityAnalysis, estimationBasis } = projectData;

  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<{isOpen: boolean, scenarioId: string | null}>({isOpen: false, scenarioId: null});
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [analyzedKpi, setAnalyzedKpi] = useState<'npv' | 'irr' | 'roi'>('npv');


  const scenarioResults = useMemo(() => {
    const results: { name: string; outputs: CalculatedOutputs }[] = [
      { name: t('m12_sensitivityAnalysis.baseCase'), outputs: calculatedOutputs },
    ];

    sensitivityAnalysis.scenarios.forEach(scenario => {
      const modifiedProjectData = {
        ...projectData,
        estimationBasis: {
          ...projectData.estimationBasis,
          ...scenario.modifications,
        },
      };
      results.push({
        name: scenario.name,
        outputs: calculateFinancialOutputs(modifiedProjectData),
      });
    });

    return results;
  }, [projectData, calculatedOutputs, t]);

  const tornadoData = useMemo(() => {
    const baseValue = calculatedOutputs[analyzedKpi];
    if (typeof baseValue !== 'number' || !isFinite(baseValue)) return [];

    const variablesToTest = [
      { name: t('m12_sensitivityAnalysis.variables.investmentCost'), key: 'investmentCost', direction: -1 },
      { name: t('m12_sensitivityAnalysis.variables.revenue'), key: 'revenue', direction: 1 },
      { name: t('m12_sensitivityAnalysis.variables.variableCosts'), key: 'variableCosts', direction: -1 },
      { name: t('m12_sensitivityAnalysis.variables.fixedCosts'), key: 'fixedCosts', direction: -1 },
      { name: t('m12_sensitivityAnalysis.variables.discountRate'), key: 'discountRate', direction: -1 }
    ];

    const results = variablesToTest.map(variable => {
      const modifiedProjectData = JSON.parse(JSON.stringify(projectData));
      
      const changeFactor = 1.10; // +10% change

      switch(variable.key) {
        case 'investmentCost':
          modifiedProjectData.capitalInvestment.items.forEach((item: any) => item.cost *= changeFactor);
          break;
        case 'revenue':
          modifiedProjectData.operatingInputs.revenues.forEach((item: any) => item.unitPrice *= changeFactor);
          break;
        case 'variableCosts':
          modifiedProjectData.operatingInputs.costs
            .filter((c: any) => c.category === 'Raw Materials')
            .forEach((item: any) => item.unitCost *= changeFactor);
          break;
        case 'fixedCosts':
          modifiedProjectData.operatingInputs.costs
            .filter((c: any) => c.category === 'Labor' || c.category === 'General & Admin')
            .forEach((item: any) => {
              if (item.category === 'Labor') item.monthlySalary *= changeFactor;
              if (item.category === 'General & Admin') item.cost *= changeFactor;
            });
          break;
        case 'discountRate':
           modifiedProjectData.estimationBasis.discountRate *= changeFactor;
           break;
      }

      const newOutputs = calculateFinancialOutputs(modifiedProjectData);
      const newValue = newOutputs[analyzedKpi];

      let percentageChange = 0;
      if (typeof newValue === 'number' && isFinite(newValue) && baseValue !== 0) {
        percentageChange = ((newValue - baseValue) / Math.abs(baseValue)) * 100;
      } else if (typeof newValue === 'number' && isFinite(newValue) && baseValue === 0) {
        percentageChange = newValue > 0 ? 1000 : -1000; // Represent large change
      }
      
      return {
        name: variable.name,
        impact: percentageChange
      };
    });
    
    // Don't sort, keep a logical order for presentation
    // results.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    return results;

  }, [projectData, calculatedOutputs, analyzedKpi, t]);

  const selectedScenario = sensitivityAnalysis.scenarios.find(s => s.id === selectedScenarioId);

  const handleModificationChange = (field: NumericEstimationBasisKeys, value: string | number) => {
    if (selectedScenario) {
        const numericValue = Number(value);
        if(!isNaN(numericValue)){
            updateScenarioModifications(selectedScenario.id, { [field]: numericValue });
        }
    }
  };
  
  const openDeleteConfirmation = (scenarioId: string) => {
    setConfirmDeleteModal({isOpen: true, scenarioId});
  };

  const closeDeleteConfirmation = () => {
    setConfirmDeleteModal({isOpen: false, scenarioId: null});
  };

  const handleDeleteScenario = () => {
    if(confirmDeleteModal.scenarioId) {
        removeScenario(confirmDeleteModal.scenarioId);
        if(selectedScenarioId === confirmDeleteModal.scenarioId) {
            setSelectedScenarioId(null);
        }
    }
    closeDeleteConfirmation();
  };
  
  const handleGenerateAnalysis = async () => {
    if (sensitivityAnalysis.scenarios.length === 0) return;

    setIsAiLoading(true);
    setAiInsight(null);

    try {
        const insight = await analyzeSensitivityResults(
            calculatedOutputs, 
            scenarioResults,
            i18n.language
        );
        setAiInsight(insight);
    } catch (error) {
        console.error("AI Sensitivity Analysis Failed:", error);
        setAiInsight(t('m12_sensitivityAnalysis.aiSummary.error'));
    } finally {
        setIsAiLoading(false);
    }
  };


  const kpiRows: { key: keyof CalculatedOutputs; label: string; isCurrency: boolean; isPercent: boolean, isYears: boolean }[] = [
    { key: 'npv', label: t('m9_financialEvaluation.npvTitle'), isCurrency: true, isPercent: false, isYears: false },
    { key: 'irr', label: t('m9_financialEvaluation.irrTitle'), isCurrency: false, isPercent: true, isYears: false },
    { key: 'roi', label: t('m9_financialEvaluation.roiTitle'), isCurrency: false, isPercent: true, isYears: false },
    { key: 'paybackPeriod', label: t('m9_financialEvaluation.paybackPeriodTitle'), isCurrency: false, isPercent: false, isYears: true },
    { key: 'discountedPaybackPeriod', label: t('m9_financialEvaluation.discountedPaybackPeriodTitle'), isCurrency: false, isPercent: false, isYears: true },
    { key: 'breakEvenRevenue', label: t('m9_financialEvaluation.breakEvenRevenueTitle'), isCurrency: true, isPercent: false, isYears: false },
    { key: 'grossProfitMarginY1', label: t('m9_financialEvaluation.gpmY1Title'), isCurrency: false, isPercent: true, isYears: false },
    { key: 'operatingProfitMarginY1', label: t('m9_financialEvaluation.opmY1Title'), isCurrency: false, isPercent: true, isYears: false },
    { key: 'netProfitMarginY1', label: t('m9_financialEvaluation.npmY1Title'), isCurrency: false, isPercent: true, isYears: false },
    { key: 'debtToEquityRatio', label: t('m9_financialEvaluation.deRatioTitle'), isCurrency: false, isPercent: false, isYears: false },
    { key: 'enterpriseValue', label: t('m9_financialEvaluation.evTitle'), isCurrency: true, isPercent: false, isYears: false },
  ];
  
  const formatValue = (value: any, isCurrency: boolean, isPercent: boolean, isYears: boolean) => {
    if (isYears && value < 0) return t('m9_financialEvaluation.notAchieved');
    if (typeof value !== 'number' || !isFinite(value)) return t('m9_financialEvaluation.notApplicable');

    if (isCurrency) return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: estimationBasis.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    if (isPercent) return new Intl.NumberFormat(i18n.language, { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value / 100);
    if (isYears) return value.toFixed(2);
    return value.toFixed(2);
  }

  const editableParams: {key: NumericEstimationBasisKeys, label: string}[] = [
      { key: 'discountRate', label: t('m2_estimationBasis.discountRate')},
      { key: 'taxRate', label: t('m2_estimationBasis.taxRate')},
      { key: 'revenueGrowthRate', label: t('m2_estimationBasis.revenueGrowthRate')},
      { key: 'variableCostGrowthRate', label: t('m2_estimationBasis.variableCostGrowthRate')},
      { key: 'fixedCostGrowthRate', label: t('m2_estimationBasis.fixedCostGrowthRate')},
      { key: 'inflationRate', label: t('m2_estimationBasis.inflationRate') },
      { key: 'ebitMultiple', label: t('m2_estimationBasis.ebitMultiple') },
      { key: 'workingCapitalPercentage', label: t('m2_estimationBasis.workingCapitalPercentage') },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m12')}</h1>
      <p className="text-slate-600 dark:text-slate-300">{t('m12_sensitivityAnalysis.description')}</p>

      <Card title={t('m12_sensitivityAnalysis.tornadoTitle')}>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            {t('m12_sensitivityAnalysis.tornadoSubtitle')}
        </p>
        <div className="max-w-xs mb-4">
            <label htmlFor="kpi-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m12_sensitivityAnalysis.selectKpi')}</label>
            <Select id="kpi-select" value={analyzedKpi} onChange={e => setAnalyzedKpi(e.target.value as any)}>
                <option value="npv">{t('m9_financialEvaluation.npvTitle')}</option>
                <option value="irr">{t('m9_financialEvaluation.irrTitle')}</option>
                <option value="roi">{t('m9_financialEvaluation.roiTitle')}</option>
            </Select>
        </div>
        <TornadoChart data={tornadoData} />
      </Card>


       <AIInsightBox
        title={t('m12_sensitivityAnalysis.aiSummary.title')}
        insight={aiInsight}
        isLoading={isAiLoading}
        onGenerate={handleGenerateAnalysis}
        onInsightChange={setAiInsight}
        generateButtonText={t('m12_sensitivityAnalysis.aiSummary.generateButton')}
        loadingText={t('m12_sensitivityAnalysis.aiSummary.generating')}
        placeholderText={t('m12_sensitivityAnalysis.aiSummary.placeholder')}
        isGenerateDisabled={sensitivityAnalysis.scenarios.length === 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card title={t('m12_sensitivityAnalysis.manageScenariosTitle')}>
                <ul className="space-y-2">
                    {sensitivityAnalysis.scenarios.map(s => (
                        <li key={s.id} className={`flex items-center p-2 rounded-md transition-colors ${selectedScenarioId === s.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>
                           <div className="flex-grow cursor-pointer" onClick={() => setSelectedScenarioId(s.id)}>
                             <Input 
                                type="text"
                                value={s.name}
                                onChange={(e) => updateScenarioName(s.id, e.target.value)}
                                placeholder={t('m12_sensitivityAnalysis.scenarioNamePlaceholder') || ''}
                                className="bg-transparent border-0 !ring-0 !shadow-none p-0"
                             />
                           </div>
                           <Button variant="ghost" size="sm" onClick={() => openDeleteConfirmation(s.id)} aria-label={`Delete ${s.name}`}>
                                <TrashIcon className="h-4 w-4 text-red-500" />
                           </Button>
                        </li>
                    ))}
                </ul>
                <Button onClick={addScenario} className="w-full mt-4 flex items-center justify-center">
                    <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0"/>
                    {t('m12_sensitivityAnalysis.addScenario')}
                </Button>
            </Card>
        </div>

        <div className="lg:col-span-2">
            <Card title={t('m12_sensitivityAnalysis.editScenarioTitle')}>
                {selectedScenario ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {editableParams.map(param => (
                            <div key={param.key}>
                                <label htmlFor={param.key} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{param.label}</label>
                                <Input
                                    id={param.key}
                                    type="number"
                                    step="0.1"
                                    placeholder={estimationBasis[param.key].toString()}
                                    value={selectedScenario.modifications[param.key] ?? ''}
                                    onChange={(e) => handleModificationChange(param.key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-slate-500 dark:text-slate-400">{t('m12_sensitivityAnalysis.selectScenarioPrompt')}</p>
                    </div>
                )}
            </Card>
        </div>
      </div>
      
      <Card title={t('m12_sensitivityAnalysis.resultsComparisonTitle')}>
          <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                          <th className="sticky left-0 bg-slate-50 dark:bg-slate-700/50 px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m12_sensitivityAnalysis.kpi')}</th>
                          {scenarioResults.map((result, i) => (
                              <th key={i} className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{result.name}</th>
                          ))}
                      </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {kpiRows.map(row => (
                          <tr key={row.key}>
                              <td className="sticky left-0 bg-white dark:bg-slate-800 px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-800 dark:text-slate-200">{row.label}</td>
                              {scenarioResults.map((result, i) => {
                                const value = result.outputs[row.key];
                                const baseValue = scenarioResults[0].outputs[row.key];
                                let colorClass = 'text-slate-600 dark:text-slate-400';
                                if (i > 0 && typeof value === 'number' && typeof baseValue === 'number') {
                                    if(row.key === 'paybackPeriod' || row.key === 'discountedPaybackPeriod'){
                                        if (value < 0) { // If scenario doesn't payback
                                            colorClass = 'text-red-500';
                                        } else if (baseValue < 0) { // If base doesn't payback but scenario does
                                            colorClass = 'text-green-500';
                                        } else { // both payback
                                            colorClass = value < baseValue ? 'text-green-500' : 'text-red-500';
                                        }
                                    } else {
                                        colorClass = value > baseValue ? 'text-green-500' : 'text-red-500';
                                    }
                                }
                                return (
                                    <td key={i} className={`px-4 py-2 whitespace-nowrap text-sm text-right font-mono ${colorClass}`}>
                                        {formatValue(value, row.isCurrency, row.isPercent, row.isYears)}
                                    </td>
                                );
                              })}
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </Card>
      
      <ConfirmationModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={closeDeleteConfirmation}
        onConfirm={handleDeleteScenario}
        title={t('confirmations.deleteScenarioTitle')}
        message={t('confirmations.deleteScenarioMessage')}
        confirmButtonText={t('confirmations.deleteScenarioConfirm')}
      />
    </div>
  );
};
export default M12_SensitivityAnalysis;