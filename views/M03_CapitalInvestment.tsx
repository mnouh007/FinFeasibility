import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TrashIcon } from '../components/ui/Icons';
import { CapitalInvestmentItem } from '../types';
import { CapexDonutChart } from '../components/charts/CapexDonutChart';
import { Select } from '../components/ui/Select';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { analyzeCapex } from '../services/geminiService';

type Category = CapitalInvestmentItem['category'];

const CATEGORIES: Category[] = ['Buildings', 'Machinery', 'Furniture', 'Equipment'];

const M03_CapitalInvestment = () => {
    const { t, i18n } = useTranslation();
    const { projectData, addCapitalItem, updateCapitalItem, removeCapitalItem } = useProjectStore();
    const [activeTab, setActiveTab] = useState<Category>(CATEGORIES[0]);
    
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);

    const { items } = projectData.capitalInvestment;
    const { tasks } = projectData.timeline;

    const handleItemChange = (id: string, field: keyof Omit<CapitalInvestmentItem, 'id' | 'category'>, value: string | number) => {
        const isNumeric = field === 'cost';
        updateCapitalItem(id, { [field]: isNumeric ? Number(value) : value });
    };

    const handleAnalyzeCapex = async () => {
        if (items.length === 0) return;
        setIsAiLoading(true);
        setAiInsight(null);
        try {
            const insight = await analyzeCapex(items, i18n.language);
            setAiInsight(insight);
        } catch (error) {
            console.error("AI CAPEX Analysis Failed:", error);
            setAiInsight(t('m3_capitalInvestment.aiAnalysis.error'));
        } finally {
            setIsAiLoading(false);
        }
    };

    const filteredItems = items.filter(item => item.category === activeTab);
    
    const chartData = useMemo(() => {
        const dataByCategory = items.reduce((acc, item) => {
            if (item.cost > 0) {
                acc[item.category] = (acc[item.category] || 0) + item.cost;
            }
            return acc;
        }, {} as Record<Category, number>);

        return Object.entries(dataByCategory).map(([name, value]) => ({
            name: t(`m3_capitalInvestment.categories.${name.toLowerCase()}` as const),
            value: value as number
        }));
    }, [items, t]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t('sidebar.m3')}</h1>

            <AIInsightBox
                title={t('m3_capitalInvestment.aiAnalysis.title')}
                insight={aiInsight}
                isLoading={isAiLoading}
                onGenerate={handleAnalyzeCapex}
                onInsightChange={setAiInsight}
                generateButtonText={t('m3_capitalInvestment.aiAnalysis.generateButton')}
                loadingText={t('m3_capitalInvestment.aiAnalysis.generating')}
                placeholderText={t('m3_capitalInvestment.aiAnalysis.placeholder')}
                isGenerateDisabled={items.length === 0}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card className="!p-0 h-full">
                        <div className="px-4">
                            <div className="border-b border-slate-200 dark:border-slate-700">
                                <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
                                    {CATEGORIES.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setActiveTab(category)}
                                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                                ${activeTab === category
                                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            {t(`m3_capitalInvestment.categories.${category.toLowerCase()}` as const)}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                        
                        <div className="p-4">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-2/5">{t('m3_capitalInvestment.table.item')}</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m3_capitalInvestment.table.cost')}</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/4">{t('m3_capitalInvestment.table.timelineLink')}</th>
                                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m3_capitalInvestment.table.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                        {filteredItems.map(item => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 whitespace-nowrap"><Input type="text" value={item.item} onChange={e => handleItemChange(item.id, 'item', e.target.value)} placeholder={t('m3_capitalInvestment.table.item') || ''} /></td>
                                                <td className="px-4 py-2 whitespace-nowrap"><Input type="number" min="0" value={item.cost} onChange={e => handleItemChange(item.id, 'cost', e.target.value)} /></td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <Select
                                                        value={item.linkedTaskId || ''}
                                                        onChange={(e) => handleItemChange(item.id, 'linkedTaskId', e.target.value)}
                                                    >
                                                        <option value="">{t('common.none')}</option>
                                                        {tasks.map(task => (
                                                            <option key={task.id} value={task.id}>{task.name}</option>
                                                        ))}
                                                    </Select>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap">
                                                    <Button variant="ghost" size="sm" onClick={() => removeCapitalItem(item.id)} aria-label={`Delete ${item.item}`}>
                                                        <TrashIcon className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {filteredItems.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-slate-500 dark:text-slate-400">{t('m3_capitalInvestment.noItems')}</p>
                                </div>
                            )}
                            <div className="mt-4 flex justify-end">
                                <Button onClick={() => addCapitalItem(activeTab)}>{t('m3_capitalInvestment.addItem')}</Button>
                            </div>
                        </div>
                    </Card>
                </div>
                {chartData.length > 0 && (
                     <div className="lg:col-span-2">
                        <Card title={t('m3_capitalInvestment.capexChartTitle')} className="h-full">
                            <CapexDonutChart data={chartData} />
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
export default M03_CapitalInvestment;