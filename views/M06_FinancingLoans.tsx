import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TrashIcon, PlusIcon } from '../components/ui/Icons';
import { Loan } from '../types';
import { AmortizationChart } from '../components/charts/AmortizationChart';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { analyzeFinancing } from '../services/geminiService';
import { Select } from '../components/ui/Select';
import { calculateSingleLoanSchedule } from '../lib/financial';

const M06_FinancingLoans = () => {
  const { t, i18n } = useTranslation();
  const { projectData, calculatedOutputs, addLoan, updateLoan, removeLoan } = useProjectStore();
  
  const { loans } = projectData.financing;
  const { loanAmortizationSchedule, cashFlowStatement } = calculatedOutputs;
  const { projectLife, currency } = projectData.estimationBasis;
  
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState('consolidated');

  const handleLoanChange = (id: string, field: keyof Omit<Loan, 'id'>, value: string | number) => {
      const isNumeric = field !== 'source';
      updateLoan(id, { [field]: isNumeric ? Number(value) : value });
  };

  const handleAnalyzeFinancing = async () => {
    if (loans.length === 0) return;
    setIsAiLoading(true);
    setAiInsight(null);
    try {
        const insight = await analyzeFinancing(loans, loanAmortizationSchedule, cashFlowStatement, i18n.language);
        setAiInsight(insight);
    } catch (error) {
        console.error("AI Financing Analysis Failed:", error);
        setAiInsight(t('m6_financingLoans.aiAnalysis.error'));
    } finally {
        setIsAiLoading(false);
    }
  };
  
  const formatCurrency = (value: number) => {
    if (isNaN(value) || !isFinite(value)) return 'N/A';
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency, minimumFractionDigits: 0 }).format(value);
  }

  const hasAnyAmortizationData = loanAmortizationSchedule.some(d => d.principal > 0 || d.interest > 0);

  const displayedSchedule = useMemo(() => {
    if (selectedLoanId === 'consolidated') {
        return loanAmortizationSchedule;
    }
    const selectedLoan = loans.find(l => l.id === selectedLoanId);
    if (selectedLoan) {
        return calculateSingleLoanSchedule(selectedLoan, projectLife);
    }
    return [];
  }, [selectedLoanId, loans, loanAmortizationSchedule, projectLife]);

  const selectedLoan = loans.find(l => l.id === selectedLoanId);
  const scheduleTitle = selectedLoanId === 'consolidated' 
    ? t('m6_financingLoans.amortizationScheduleTitle') 
    : t('m6_financingLoans.individualAmortizationTitle', { loanSource: selectedLoan?.source || `Loan ${selectedLoan?.id.slice(-4)}` });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t('sidebar.m6')}</h1>
      
      <AIInsightBox
        title={t('m6_financingLoans.aiAnalysis.title')}
        insight={aiInsight}
        isLoading={isAiLoading}
        onGenerate={handleAnalyzeFinancing}
        onInsightChange={setAiInsight}
        generateButtonText={t('m6_financingLoans.aiAnalysis.generateButton')}
        loadingText={t('m6_financingLoans.aiAnalysis.generating')}
        placeholderText={t('m6_financingLoans.aiAnalysis.placeholder')}
        isGenerateDisabled={loans.length === 0}
      />
      
      <Card title={t('m6_financingLoans.title')}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-2/6">{t('m6_financingLoans.table.source')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m6_financingLoans.table.principal')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m6_financingLoans.table.interestRate')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m6_financingLoans.table.termYears')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m6_financingLoans.table.startYear')}</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('m6_financingLoans.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {loans.map(loan => (
                <tr key={loan.id}>
                  <td className="px-4 py-2 whitespace-nowrap"><Input type="text" value={loan.source} onChange={e => handleLoanChange(loan.id, 'source', e.target.value)} /></td>
                  <td className="px-4 py-2 whitespace-nowrap"><Input type="number" min="0" value={loan.principal} onChange={e => handleLoanChange(loan.id, 'principal', e.target.value)} /></td>
                  <td className="px-4 py-2 whitespace-nowrap"><Input type="number" min="0" max="100" step="0.1" value={loan.interestRate} onChange={e => handleLoanChange(loan.id, 'interestRate', e.target.value)} /></td>
                  <td className="px-4 py-2 whitespace-nowrap"><Input type="number" min="0" value={loan.term} onChange={e => handleLoanChange(loan.id, 'term', e.target.value)} /></td>
                  <td className="px-4 py-2 whitespace-nowrap"><Input type="number" min="1" max={projectLife} value={loan.startYear} onChange={e => handleLoanChange(loan.id, 'startYear', e.target.value)} /></td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => removeLoan(loan.id)} aria-label={`Delete ${loan.source}`}>
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loans.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">{t('m6_financingLoans.noLoans')}</p>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button onClick={addLoan} className="flex items-center">
            <PlusIcon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0"/>
            {t('m6_financingLoans.addLoan')}
          </Button>
        </div>
      </Card>

      {hasAnyAmortizationData && (
        <Card title={scheduleTitle}>
            <div className="mb-4 max-w-xs">
                <label htmlFor="loan-select" className="sr-only">Select Loan</label>
                <Select id="loan-select" value={selectedLoanId} onChange={e => setSelectedLoanId(e.target.value)}>
                    <option value="consolidated">{t('m6_financingLoans.consolidated')}</option>
                    {loans.map(loan => (
                        <option key={loan.id} value={loan.id}>{loan.source || `Loan ${loan.id.slice(-4)}`}</option>
                    ))}
                </Select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">{t('m6_financingLoans.amortizationTable.year')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">{t('m6_financingLoans.amortizationTable.openingBalance')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">{t('m6_financingLoans.amortizationTable.principalPaid')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">{t('m6_financingLoans.amortizationTable.interestPaid')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">{t('m6_financingLoans.amortizationTable.closingBalance')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {displayedSchedule.filter(row => row.openingBalance > 0 || row.closingBalance > 0 || row.interest > 0 || row.principal > 0).map(row => (
                            <tr key={row.year}>
                                <td className="px-4 py-2 font-medium">{row.year}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.openingBalance)}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.principal)}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.interest)}</td>
                                <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.closingBalance)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      )}

      {hasAnyAmortizationData && (
          <Card title={t('m6_financingLoans.chartTitle')}>
              <AmortizationChart data={displayedSchedule} />
          </Card>
      )}
    </div>
  );
};
export default M06_FinancingLoans;