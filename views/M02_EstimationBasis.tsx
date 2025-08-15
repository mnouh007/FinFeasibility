import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { EstimationBasis } from '../types';
import { Tooltip } from '../components/ui/Tooltip';
import { InfoIcon } from '../components/ui/Icons';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { analyzeEstimationBasis } from '../services/geminiService';

type AssetCategory = keyof EstimationBasis['depreciationRates'];

const M02_EstimationBasis = () => {
  const { t, i18n } = useTranslation();
  const { projectData, updateField } = useProjectStore();
  const { estimationBasis, definition } = projectData;

  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numericFields = [
        'projectLife', 'discountRate', 'taxRate', 'inflationRate', 
        'revenueGrowthRate', 'variableCostGrowthRate', 'fixedCostGrowthRate',
        'workingCapitalPercentage', 'initialCurrentAssets', 'initialCurrentLiabilities',
        'initialInventory', 'ebitMultiple'
    ];
    const isNumeric = numericFields.includes(name);
    updateField('estimationBasis', name as keyof EstimationBasis, isNumeric ? Number(value) : value);
  };
  
  const handleNestedInputChange = (
    group: 'depreciationRates' | 'salvageValues', 
    category: AssetCategory, 
    value: string
  ) => {
    const newGroupData = {
      ...estimationBasis[group],
      [category]: Number(value),
    };
    updateField('estimationBasis', group, newGroupData as any);
  };

  const handleAnalyzeAssumptions = async () => {
    setIsAiLoading(true);
    setAiInsight(null);
    try {
        const insight = await analyzeEstimationBasis(estimationBasis, definition.projectName, i18n.language);
        setAiInsight(insight);
    } catch (error) {
        console.error("AI Analysis Failed:", error);
        setAiInsight(t('m2_estimationBasis.aiAnalysis.error'));
    } finally {
        setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m2')}</h1>
      
      <AIInsightBox
        title={t('m2_estimationBasis.aiAnalysis.title')}
        insight={aiInsight}
        isLoading={isAiLoading}
        onGenerate={handleAnalyzeAssumptions}
        onInsightChange={setAiInsight}
        generateButtonText={t('m2_estimationBasis.aiAnalysis.generateButton')}
        loadingText={t('m2_estimationBasis.aiAnalysis.generating')}
        placeholderText={t('m2_estimationBasis.aiAnalysis.placeholder')}
      />

      <Card title={t('m2_estimationBasis.title')}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {/* Currency */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('m2_estimationBasis.currency')}
            </label>
            <Input
              id="currency"
              name="currency"
              type="text"
              value={estimationBasis.currency}
              onChange={handleInputChange}
            />
          </div>

          {/* Project Life */}
          <div>
            <label htmlFor="projectLife" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('m2_estimationBasis.projectLife')}
            </label>
            <Input
              id="projectLife"
              name="projectLife"
              type="number"
              min="0"
              value={estimationBasis.projectLife}
              onChange={handleInputChange}
            />
          </div>

          {/* Discount Rate */}
          <div>
             <label htmlFor="discountRate" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>{t('m2_estimationBasis.discountRate')}</span>
                <Tooltip text={t('m2_estimationBasis.discountRateTooltip')}>
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 dark:text-slate-500 cursor-help">
                        <InfoIcon />
                    </span>
                </Tooltip>
            </label>
            <Input
              id="discountRate"
              name="discountRate"
              type="number"
              step="0.1"
              min="0"
              value={estimationBasis.discountRate}
              onChange={handleInputChange}
            />
          </div>

          {/* Tax Rate */}
          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('m2_estimationBasis.taxRate')}
            </label>
            <Input
              id="taxRate"
              name="taxRate"
              type="number"
              step="0.1"
              min="0"
              value={estimationBasis.taxRate}
              onChange={handleInputChange}
            />
          </div>

          {/* General Inflation Rate */}
          <div>
            <label htmlFor="inflationRate" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
               <span>{t('m2_estimationBasis.inflationRate')}</span>
                <Tooltip text={t('m2_estimationBasis.inflationRateTooltip')}>
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 dark:text-slate-500 cursor-help">
                        <InfoIcon />
                    </span>
                </Tooltip>
            </label>
            <Input
              id="inflationRate"
              name="inflationRate"
              type="number"
              step="0.1"
              min="0"
              value={estimationBasis.inflationRate}
              onChange={handleInputChange}
            />
          </div>

          {/* Revenue Growth Rate */}
          <div>
            <label htmlFor="revenueGrowthRate" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
               <span>{t('m2_estimationBasis.revenueGrowthRate')}</span>
                <Tooltip text={t('m2_estimationBasis.revenueGrowthRateTooltip')}>
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 dark:text-slate-500 cursor-help">
                        <InfoIcon />
                    </span>
                </Tooltip>
            </label>
            <Input
              id="revenueGrowthRate"
              name="revenueGrowthRate"
              type="number"
              step="0.1"
              min="0"
              value={estimationBasis.revenueGrowthRate}
              onChange={handleInputChange}
            />
          </div>

          {/* Variable Cost Growth Rate */}
          <div>
            <label htmlFor="variableCostGrowthRate" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
               <span>{t('m2_estimationBasis.variableCostGrowthRate')}</span>
                <Tooltip text={t('m2_estimationBasis.variableCostGrowthRateTooltip')}>
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 dark:text-slate-500 cursor-help">
                        <InfoIcon />
                    </span>
                </Tooltip>
            </label>
            <Input
              id="variableCostGrowthRate"
              name="variableCostGrowthRate"
              type="number"
              step="0.1"
              min="0"
              value={estimationBasis.variableCostGrowthRate}
              onChange={handleInputChange}
            />
          </div>

          {/* Fixed Cost Growth Rate */}
          <div>
            <label htmlFor="fixedCostGrowthRate" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
               <span>{t('m2_estimationBasis.fixedCostGrowthRate')}</span>
                <Tooltip text={t('m2_estimationBasis.fixedCostGrowthRateTooltip')}>
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 dark:text-slate-500 cursor-help">
                        <InfoIcon />
                    </span>
                </Tooltip>
            </label>
            <Input
              id="fixedCostGrowthRate"
              name="fixedCostGrowthRate"
              type="number"
              step="0.1"
              min="0"
              value={estimationBasis.fixedCostGrowthRate}
              onChange={handleInputChange}
            />
          </div>

          {/* Working Capital Percentage */}
           <div>
             <label htmlFor="workingCapitalPercentage" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>{t('m2_estimationBasis.workingCapitalPercentage')}</span>
                 <Tooltip text={t('m2_estimationBasis.workingCapitalTooltip')}>
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 dark:text-slate-500 cursor-help">
                        <InfoIcon />
                    </span>
                </Tooltip>
            </label>
            <Input
              id="workingCapitalPercentage"
              name="workingCapitalPercentage"
              type="number"
              step="0.1"
              min="0"
              value={estimationBasis.workingCapitalPercentage}
              onChange={handleInputChange}
            />
          </div>

          {/* Initial Current Assets */}
          <div>
             <label htmlFor="initialCurrentAssets" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>{t('m2_estimationBasis.initialCurrentAssets')}</span>
                 <Tooltip text={t('m2_estimationBasis.initialCurrentAssetsTooltip')}>
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 dark:text-slate-500 cursor-help">
                        <InfoIcon />
                    </span>
                </Tooltip>
            </label>
            <Input
              id="initialCurrentAssets"
              name="initialCurrentAssets"
              type="number"
              min="0"
              value={estimationBasis.initialCurrentAssets}
              onChange={handleInputChange}
            />
          </div>

          {/* Initial Current Liabilities */}
          <div>
             <label htmlFor="initialCurrentLiabilities" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>{t('m2_estimationBasis.initialCurrentLiabilities')}</span>
                 <Tooltip text={t('m2_estimationBasis.initialCurrentLiabilitiesTooltip')}>
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 dark:text-slate-500 cursor-help">
                        <InfoIcon />
                    </span>
                </Tooltip>
            </label>
            <Input
              id="initialCurrentLiabilities"
              name="initialCurrentLiabilities"
              type="number"
              min="0"
              value={estimationBasis.initialCurrentLiabilities}
              onChange={handleInputChange}
            />
          </div>

          {/* Initial Inventory */}
          <div>
             <label htmlFor="initialInventory" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>{t('m2_estimationBasis.initialInventory')}</span>
                 <Tooltip text={t('m2_estimationBasis.initialInventoryTooltip')}>
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 dark:text-slate-500 cursor-help">
                        <InfoIcon />
                    </span>
                </Tooltip>
            </label>
            <Input
              id="initialInventory"
              name="initialInventory"
              type="number"
              min="0"
              value={estimationBasis.initialInventory}
              onChange={handleInputChange}
            />
          </div>

          {/* EBIT Multiple */}
          <div>
             <label htmlFor="ebitMultiple" className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <span>{t('m2_estimationBasis.ebitMultiple')}</span>
                 <Tooltip text={t('m2_estimationBasis.ebitMultipleTooltip')}>
                    <span className="ml-2 rtl:mr-2 rtl:ml-0 text-slate-400 dark:text-slate-500 cursor-help">
                        <InfoIcon />
                    </span>
                </Tooltip>
            </label>
            <Input
              id="ebitMultiple"
              name="ebitMultiple"
              type="number"
              min="0"
              value={estimationBasis.ebitMultiple}
              onChange={handleInputChange}
            />
          </div>


          {/* Depreciation Method */}
          <div className="md:col-span-3">
            <label htmlFor="depreciationMethod" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {t('m2_estimationBasis.depreciationMethod')}
            </label>
            <Select
              id="depreciationMethod"
              name="depreciationMethod"
              value={estimationBasis.depreciationMethod}
              onChange={handleInputChange}
            >
              <option value="Straight-line">{t('m2_estimationBasis.straightLine')}</option>
              <option value="Declining Balance">{t('m2_estimationBasis.decliningBalance')}</option>
              <option value="Sum-of-Years Digits">{t('m2_estimationBasis.sumOfYearsDigits')}</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card title={t('m2_estimationBasis.depreciationAndSalvageTitle')}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="py-2 text-left text-sm font-medium text-slate-500 dark:text-slate-300 uppercase">Category</th>
                  <th className="py-2 px-2 text-left text-sm font-medium text-slate-500 dark:text-slate-300 uppercase">{t('m2_estimationBasis.depreciationRate')}</th>
                  <th className="py-2 px-2 text-left text-sm font-medium text-slate-500 dark:text-slate-300 uppercase">{t('m2_estimationBasis.salvageValue')}</th>
                </tr>
              </thead>
              <tbody>
                {(Object.keys(estimationBasis.depreciationRates) as AssetCategory[]).map(category => (
                  <tr key={category} className="border-t border-slate-200 dark:border-slate-700">
                    <td className="py-2 pr-2 text-sm font-medium text-slate-800 dark:text-slate-200">{t(`m2_estimationBasis.${category.toLowerCase()}`)}</td>
                    <td className="py-2 px-2">
                       <Input
                          type="number"
                          min="0" max="100" step="0.1"
                          value={estimationBasis.depreciationRates[category]}
                          onChange={(e) => handleNestedInputChange('depreciationRates', category, e.target.value)}
                        />
                    </td>
                    <td className="py-2 pl-2">
                      <Input
                          type="number"
                           min="0" max="100" step="0.1"
                          value={estimationBasis.salvageValues[category]}
                          onChange={(e) => handleNestedInputChange('salvageValues', category, e.target.value)}
                        />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </Card>
    </div>
  );
};
export default M02_EstimationBasis;