

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TrashIcon, PlusIcon } from '../components/ui/Icons';
import { OperatingCostItem, RevenueItem, RawMaterialCostItem, LaborCostItem, AdminCostItem } from '../types';
import { CostIncomeBarChart } from '../components/charts/CostIncomeBarChart';
import { Select } from '../components/ui/Select';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { analyzeOperatingInputs } from '../services/geminiService';

type CostCategory = OperatingCostItem['category'];
type TabType = 'Revenues' | CostCategory;

const TABS: TabType[] = ['Revenues', 'Raw Materials', 'Labor', 'General & Admin'];

const getDisplayAnnualCost = (item: OperatingCostItem): number => {
    if (item.category === 'Raw Materials') {
        return (item as RawMaterialCostItem).unitCost * (item as RawMaterialCostItem).quantity;
    }
    if (item.category === 'Labor') {
        return (item as LaborCostItem).count * (item as LaborCostItem).monthlySalary * 12;
    }
    if (item.category === 'General & Admin') {
        return (item as AdminCostItem).cost;
    }
    return 0; // Fallback
};


const M05_OperatingInputs = () => {
    const { t, i18n } = useTranslation();
    const { projectData,
        addOperatingCostItem, updateOperatingCostItem, removeOperatingCostItem,
        addRevenueItem, updateRevenueItem, removeRevenueItem
    } = useProjectStore();
    const [activeTab, setActiveTab] = useState<TabType>(TABS[0]);
    
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    
    const { costs, revenues } = projectData.operatingInputs;
    const { currency, projectLife } = projectData.estimationBasis;
    const { tasks } = projectData.timeline;

    const formatCurrency = (value: number) => {
        if (!isFinite(value)) {
            return t('m9_financialEvaluation.notApplicable');
        }
        return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
    };

    const handleRevenueChange = (id: string, field: keyof Omit<RevenueItem, 'id'>, value: string | number) => {
        const isNumeric = ['unitPrice', 'quantity'].includes(field as string);
        updateRevenueItem(id, { [field]: isNumeric ? Number(value) : value });
    };

    const handleAnalyzeInputs = async () => {
        if (costs.length === 0 && revenues.length === 0) return;
        setIsAiLoading(true);
        setAiInsight(null);
        try {
            const insight = await analyzeOperatingInputs(revenues, costs, i18n.language);
            setAiInsight(insight);
        } catch (error) {
            console.error("AI Operations Analysis Failed:", error);
            setAiInsight(t('m5_operatingInputs.aiAnalysis.error'));
        } finally {
            setIsAiLoading(false);
        }
    };

    const chartData = useMemo(() => {
        const totalRevenue = revenues.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        
        const costsByCategory = costs.reduce((acc, item) => {
            let key: string;
            if (item.category === 'Raw Materials') {
                key = t('m5_operatingInputs.chart.rawMaterials');
            } else if (item.category === 'Labor') {
                key = t('m5_operatingInputs.chart.labor');
            } else if (item.category === 'General & Admin') {
                key = t('m5_operatingInputs.chart.admin');
            } else {
                key = '';
            }
            
            const baseCost = getDisplayAnnualCost(item);
            
            if (key) {
                acc[key] = (acc[key] || 0) + baseCost;
            }
            return acc;
        }, {} as Record<string, number>);

        if(totalRevenue === 0 && Object.values(costsByCategory).every(v => v === 0)) return null;

        return [{
            name: 'Year 1',
            [t('m5_operatingInputs.chart.revenue')]: totalRevenue,
            ...costsByCategory
        }];
    }, [revenues, costs, t]);

    const renderTable = () => {
        if (activeTab === 'Revenues') {
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-2/6">{t('m5_operatingInputs.table.item')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m5_operatingInputs.table.unitPrice')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m5_operatingInputs.table.quantity')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m5_operatingInputs.table.totalRevenue')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m5_operatingInputs.table.timelineLink')}</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m5_operatingInputs.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {revenues.map(item => (
                                <tr key={item.id}>
                                    <td className="px-2 py-2"><Input type="text" value={item.item} onChange={e => handleRevenueChange(item.id, 'item', e.target.value)} /></td>
                                    <td className="px-2 py-2"><Input type="number" min="0" value={item.unitPrice} onChange={e => handleRevenueChange(item.id, 'unitPrice', e.target.value)} /></td>
                                    <td className="px-2 py-2"><Input type="number" min="0" value={item.quantity} onChange={e => handleRevenueChange(item.id, 'quantity', e.target.value)} /></td>
                                    <td className="px-2 py-2 font-medium">{formatCurrency(item.unitPrice * item.quantity)}</td>
                                    <td className="px-2 py-2">
                                         <Select
                                            value={item.linkedTaskId || ''}
                                            onChange={(e) => handleRevenueChange(item.id, 'linkedTaskId', e.target.value)}
                                        >
                                            <option value="">{t('common.none')}</option>
                                            {tasks.map(task => (
                                                <option key={task.id} value={task.id}>{task.name}</option>
                                            ))}
                                        </Select>
                                    </td>
                                    <td className="px-2 py-2">
                                        <Button variant="ghost" size="sm" onClick={() => removeRevenueItem(item.id)}><TrashIcon className="h-4 w-4 text-red-500" /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {revenues.length === 0 && <p className="text-center py-8 text-slate-500 dark:text-slate-400">{t('m5_operatingInputs.noItems')}</p>}
                    <div className="mt-4 flex justify-end">
                        <Button onClick={() => addRevenueItem()} className="flex items-center"><PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />{t('m5_operatingInputs.addRevenue')}</Button>
                    </div>
                </div>
            );
        }

        const commonTimelineCell = (item: OperatingCostItem) => (
            <td className="px-2 py-2 w-1/6">
                 <Select
                    value={item.linkedTaskId || ''}
                    onChange={(e) => updateOperatingCostItem(item.id, { linkedTaskId: e.target.value })}
                >
                    <option value="">{t('common.none')}</option>
                    {tasks.map(task => (
                        <option key={task.id} value={task.id}>{task.name}</option>
                    ))}
                </Select>
            </td>
        );

        let headers: string[] = [];
        let rows: React.ReactNode[] = [];
        
        if (activeTab === 'Raw Materials') {
            headers = [t('m5_operatingInputs.table.item'), t('m5_operatingInputs.table.unitCost'), t('m5_operatingInputs.table.quantity'), t('m5_operatingInputs.table.totalAnnualCost'), t('m5_operatingInputs.table.timelineLink'), t('m5_operatingInputs.table.actions')];
            rows = costs.filter((c): c is RawMaterialCostItem => c.category === 'Raw Materials').map(item => (
                <tr key={item.id}>
                    <td className="px-2 py-2 w-2/6"><Input type="text" value={item.item} onChange={e => updateOperatingCostItem(item.id, { item: e.target.value })} /></td>
                    <td className="px-2 py-2"><Input type="number" min="0" value={item.unitCost} onChange={e => updateOperatingCostItem(item.id, { unitCost: Number(e.target.value) })} /></td>
                    <td className="px-2 py-2"><Input type="number" min="0" value={item.quantity} onChange={e => updateOperatingCostItem(item.id, { quantity: Number(e.target.value) })} /></td>
                    <td className="px-2 py-2 font-medium">{formatCurrency(getDisplayAnnualCost(item))}</td>
                    {commonTimelineCell(item)}
                    <td className="px-2 py-2"><Button variant="ghost" size="sm" onClick={() => removeOperatingCostItem(item.id)}><TrashIcon className="h-4 w-4 text-red-500" /></Button></td>
                </tr>
            ));
        } else if (activeTab === 'Labor') {
            headers = [t('m5_operatingInputs.table.role'), t('m5_operatingInputs.table.count'), t('m5_operatingInputs.table.monthlySalary'), t('m5_operatingInputs.table.totalAnnualCost'), t('m5_operatingInputs.table.timelineLink'), t('m5_operatingInputs.table.actions')];
            rows = costs.filter((c): c is LaborCostItem => c.category === 'Labor').map(item => (
                <tr key={item.id}>
                    <td className="px-2 py-2 w-2/6"><Input type="text" value={item.item} onChange={e => updateOperatingCostItem(item.id, { item: e.target.value })} /></td>
                    <td className="px-2 py-2"><Input type="number" min="0" value={item.count} onChange={e => updateOperatingCostItem(item.id, { count: Number(e.target.value) })} /></td>
                    <td className="px-2 py-2"><Input type="number" min="0" value={item.monthlySalary} onChange={e => updateOperatingCostItem(item.id, { monthlySalary: Number(e.target.value) })} /></td>
                    <td className="px-2 py-2 font-medium">{formatCurrency(getDisplayAnnualCost(item))}</td>
                    {commonTimelineCell(item)}
                    <td className="px-2 py-2"><Button variant="ghost" size="sm" onClick={() => removeOperatingCostItem(item.id)}><TrashIcon className="h-4 w-4 text-red-500" /></Button></td>
                </tr>
            ));
        } else if (activeTab === 'General & Admin') {
            headers = [t('m5_operatingInputs.table.item'), t('m5_operatingInputs.table.cost'), t('m5_operatingInputs.table.timelineLink'), t('m5_operatingInputs.table.actions')];
            rows = costs.filter((c): c is AdminCostItem => c.category === 'General & Admin').map(item => (
                 <tr key={item.id}>
                    <td className="px-2 py-2 w-3/6"><Input type="text" value={item.item} onChange={e => updateOperatingCostItem(item.id, { item: e.target.value })} /></td>
                    <td className="px-2 py-2 w-1/6"><Input type="number" min="0" value={item.cost} onChange={e => updateOperatingCostItem(item.id, { cost: Number(e.target.value) })} /></td>
                    {commonTimelineCell(item)}
                    <td className="px-2 py-2"><Button variant="ghost" size="sm" onClick={() => removeOperatingCostItem(item.id)}><TrashIcon className="h-4 w-4 text-red-500" /></Button></td>
                </tr>
            ));
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            {headers.map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {rows}
                    </tbody>
                </table>
                {rows.length === 0 && <p className="text-center py-8 text-slate-500 dark:text-slate-400">{t('m5_operatingInputs.noItems')}</p>}
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => addOperatingCostItem(activeTab as CostCategory)} className="flex items-center"><PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />{t('m5_operatingInputs.addCost')}</Button>
                </div>
            </div>
        )
    };
    
    const getTabName = (tab: TabType) => {
        switch(tab) {
            case 'Revenues': return t('m5_operatingInputs.categories.revenues');
            case 'Raw Materials': return t('m5_operatingInputs.categories.rawMaterials');
            case 'Labor': return t('m5_operatingInputs.categories.labor');
            case 'General & Admin': return t('m5_operatingInputs.categories.admin');
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t('sidebar.m5')}</h1>

            <AIInsightBox
                title={t('m5_operatingInputs.aiAnalysis.title')}
                insight={aiInsight}
                isLoading={isAiLoading}
                onGenerate={handleAnalyzeInputs}
                onInsightChange={setAiInsight}
                generateButtonText={t('m5_operatingInputs.aiAnalysis.generateButton')}
                loadingText={t('m5_operatingInputs.aiAnalysis.generating')}
                placeholderText={t('m5_operatingInputs.aiAnalysis.placeholder')}
                isGenerateDisabled={costs.length === 0 && revenues.length === 0}
            />

            <Card className="!p-0">
                <div className="px-4">
                    <div className="border-b border-slate-200 dark:border-slate-700">
                        <nav className="-mb-px flex space-x-4 rtl:space-x-reverse overflow-x-auto" aria-label="Tabs">
                            {TABS.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`whitespace-nowrap shrink-0 py-4 px-2 border-b-2 font-medium text-sm transition-colors
                                        ${activeTab === tab
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    {getTabName(tab)}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>
                
                <div className="p-4">
                    {renderTable()}
                </div>
            </Card>

            {chartData && (
                <Card title={t('m5_operatingInputs.costIncomeChartTitle')}>
                    <CostIncomeBarChart data={chartData} />
                </Card>
            )}
        </div>
    );
};
export default M05_OperatingInputs;