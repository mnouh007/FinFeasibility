import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjectStore } from '../store/projectStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { MonteCarloVariableKey, Distribution, MonteCarloVariable } from '../types';
import { AIInsightBox } from '../components/ui/AIInsightBox';
import { summarizeSimulationResults } from '../services/geminiService';
import { SimulationHistogram } from '../components/charts/SimulationHistogram';

// --- Worker Script Inlining ---
// The worker and its dependencies are inlined into a single string to create a Blob.
// This bypasses CORS issues when creating the worker in secure environments.
const workerScript = `
/* --- Types removed for JS compatibility in worker --- */

/* --- Inlined from lib/distributions.ts --- */
let spare_normal = null;
function normal(mean, stdDev) {
    let u, v, s;
    if (spare_normal !== null) {
        const temp = spare_normal;
        spare_normal = null;
        return mean + stdDev * temp;
    }
    do {
        u = Math.random() * 2 - 1;
        v = Math.random() * 2 - 1;
        s = u * u + v * v;
    } while (s >= 1 || s === 0);
    s = Math.sqrt(-2.0 * Math.log(s) / s);
    spare_normal = v * s;
    return mean + stdDev * (u * s);
}
function uniform(min, max) { return min + Math.random() * (max - min); }
function triangular(min, mode, max) {
    const F = (mode - min) / (max - min);
    const rand = Math.random();
    if (rand < F) {
        return min + Math.sqrt(rand * (max - min) * (mode - min));
    } else {
        return max - Math.sqrt((1 - rand) * (max - min) * (max - mode));
    }
}
function beta(alpha, betaParam) {
    if (alpha <= 0 || betaParam <= 0) return NaN;
    while (true) {
        const u1 = Math.random();
        const u2 = Math.random();
        const v1 = Math.pow(u1, 1 / alpha);
        const v2 = Math.pow(u2, 1 / betaParam);
        if (v1 + v2 <= 1) {
            if (v1 + v2 > 0) return v1 / (v1 + v2);
        }
    }
}
function pert(min, mode, max, gamma = 4) {
    if (min > max || mode < min || mode > max) return mode;
    if (min === max) return min;
    const alpha = 1 + gamma * (mode - min) / (max - min);
    const betaParam = 1 + gamma * (max - mode) / (max - min);
    const betaSample = beta(alpha, betaParam);
    return min + betaSample * (max - min);
}
function lognormal(logMean, logStdDev) {
    const normalSample = normal(logMean, logStdDev);
    return Math.exp(normalSample);
}

/* --- Inlined from lib/financial.ts (abbreviated) --- */
function getYearFromTask(taskStartDateStr, allTasks) { if (allTasks.length === 0 || !taskStartDateStr) return 1; const validTasksWithDates = allTasks.filter(t => t.startDate); if (validTasksWithDates.length === 0) return 1; const taskStartDate = new Date(taskStartDateStr); const projectStartDate = new Date(Math.min(...validTasksWithDates.map(t => new Date(t.startDate).getTime()))); if (taskStartDate < projectStartDate) return 1; const diffTime = taskStartDate.getTime() - projectStartDate.getTime(); const diffDays = diffTime / (1000 * 60 * 60 * 24); return Math.floor(diffDays / 365) + 1; }
function getBaseCost(item) { switch (item.category) { case 'Raw Materials': return item.unitCost * item.quantity; case 'Labor': return item.count * item.monthlySalary * 12; case 'General & Admin': return item.cost; default: return 0; } }
function calculateRevenueSchedule(revenues, projectLife, growthRate, allTasks) { const annualRevenues = Array(projectLife).fill(0); const rate = 1 + growthRate / 100; revenues.forEach(item => { const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1; let currentRevenue = item.unitPrice * item.quantity; for (let year = startYear - 1; year < projectLife; year++) { annualRevenues[year] += currentRevenue; currentRevenue *= rate; } }); return annualRevenues; }
function calculateOperatingCostSchedule(costs, projectLife, fixedRate, variableRate, allTasks) { const annualCosts = Array(projectLife).fill(0); const fixedGrowth = 1 + fixedRate / 100; const variableGrowth = 1 + variableRate / 100; costs.forEach(item => { let currentCost = getBaseCost(item); const growthRate = item.category === 'Raw Materials' ? variableGrowth : fixedGrowth; const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1; for (let year = startYear - 1; year < projectLife; year++) { annualCosts[year] += currentCost; currentCost *= growthRate; } }); return annualCosts; }
function calculateVariableCostSchedule(costs, projectLife, variableRate, allTasks) { const variableItems = costs.filter(c => c.category === 'Raw Materials'); const annualCosts = Array(projectLife).fill(0); const growthRate = 1 + variableRate / 100; variableItems.forEach(item => { const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1; let currentCost = getBaseCost(item); for (let year = startYear - 1; year < projectLife; year++) { annualCosts[year] += currentCost; currentCost *= growthRate; } }); return annualCosts; }
function calculateFixedCostSchedule(costs, projectLife, fixedRate, allTasks) { const fixedItems = costs.filter(c => c.category === 'Labor' || c.category === 'General & Admin'); const annualCosts = Array(projectLife).fill(0); const growthRate = 1 + fixedRate / 100; fixedItems.forEach(item => { const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1; let currentCost = getBaseCost(item); for (let year = startYear - 1; year < projectLife; year++) { annualCosts[year] += currentCost; currentCost *= growthRate; } }); return annualCosts; }
function calculateDepreciationSchedule(items, projectLife, method, depreciationRates, salvageValues, allTasks) { const annualDepreciation = Array(projectLife).fill(0); if (projectLife <= 0) return annualDepreciation; items.forEach(item => { const cost = item.cost; const salvageValuePercent = salvageValues[item.category] / 100; const salvageValue = cost * salvageValuePercent; const depreciableBase = cost - salvageValue; const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1; const effectiveLife = projectLife - (startYear - 1); if (effectiveLife <= 0) return; if (method === 'Straight-line') { const yearlyDepreciation = depreciableBase / effectiveLife; for (let year = startYear - 1; year < projectLife; year++) { annualDepreciation[year] += yearlyDepreciation; } } else if (method === 'Declining Balance') { let bookValue = cost; const rate = depreciationRates[item.category] / 100; for (let year = startYear - 1; year < projectLife; year++) { let yearlyDepreciation = bookValue * rate; if (bookValue - yearlyDepreciation < salvageValue) { yearlyDepreciation = bookValue - salvageValue; } if (yearlyDepreciation < 0) yearlyDepreciation = 0; annualDepreciation[year] += yearlyDepreciation; bookValue -= yearlyDepreciation; } } else if (method === 'Sum-of-Years Digits') { const syd = effectiveLife * (effectiveLife + 1) / 2; if (syd === 0) return; for (let i = 0; i < effectiveLife; i++) { const year = (startYear - 1) + i; const remainingLife = effectiveLife - i; const yearlyDepreciation = (remainingLife / syd) * depreciableBase; annualDepreciation[year] += yearlyDepreciation; } } }); return annualDepreciation; }
function calculateLoanSchedules(loans, projectLife) { const interestSchedule = Array(projectLife).fill(0); const principalSchedule = Array(projectLife).fill(0); const consolidatedSchedule = Array.from({ length: projectLife }, (_, i) => ({ year: i + 1, openingBalance: 0, principal: 0, interest: 0, closingBalance: 0, })); loans.forEach(loan => { let balance = loan.principal; const rate = loan.interestRate / 100; const term = loan.term; const startYear = loan.startYear || 1; if (rate <= 0 || term <= 0) return; const pmt = balance * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1); if (!isFinite(pmt)) return; for (let i = 0; i < term; i++) { const yearIndex = (startYear - 1) + i; if (yearIndex >= projectLife) break; const interestPayment = balance * rate; const principalPayment = pmt - interestPayment > balance ? balance : pmt - interestPayment; interestSchedule[yearIndex] += interestPayment; principalSchedule[yearIndex] += principalPayment; balance -= principalPayment; } }); let openingBalance = 0; for (let i = 0; i < projectLife; i++) { const newLoanPrincipals = loans.filter(l => (l.startYear || 1) === i + 1).reduce((sum, l) => sum + l.principal, 0); openingBalance += newLoanPrincipals; const scheduleItem = consolidatedSchedule[i]; scheduleItem.openingBalance = openingBalance; scheduleItem.interest = interestSchedule[i]; scheduleItem.principal = principalSchedule[i]; openingBalance -= scheduleItem.principal; scheduleItem.closingBalance = openingBalance > 0 ? openingBalance : 0; } return { interest: interestSchedule, principal: principalSchedule, schedule: consolidatedSchedule }; }
function calculateNPV(cashFlows, discountRate) { const rate = discountRate / 100; return cashFlows.reduce((acc, cashFlow, t) => acc + cashFlow / Math.pow(1 + rate, t), 0); }
function calculateIRR(cashFlows, guess = 0.1, maxIterations = 100, tolerance = 1e-6) { if (cashFlows.every(cf => cf >= 0) || cashFlows.every(cf => cf <= 0)) { return NaN; } let rate = guess; for (let i = 0; i < maxIterations; i++) { const npv = calculateNPV(cashFlows, rate * 100); if (Math.abs(npv) < tolerance) { return rate * 100; } const npvPlusEpsilon = calculateNPV(cashFlows, (rate + tolerance) * 100); const derivative = (npvPlusEpsilon - npv) / tolerance; if (Math.abs(derivative) < tolerance) break; rate = rate - npv / derivative; } return NaN; }
function calculatePaybackPeriod(cashFlows) { if (cashFlows.length === 0 || cashFlows[0] >= 0) return -1; let cumulativeCashFlow = cashFlows[0]; for (let i = 1; i < cashFlows.length; i++) { const prevCumulative = cumulativeCashFlow; cumulativeCashFlow += cashFlows[i]; if (cumulativeCashFlow > 0) { return (i - 1) + (-prevCumulative / cashFlows[i]); } } return -1; }
function calculateDiscountedPaybackPeriod(cashFlows, discountRate) { const rate = discountRate / 100; const discountedCashFlows = cashFlows.map((cf, t) => cf / Math.pow(1 + rate, t)); return calculatePaybackPeriod(discountedCashFlows); }
function calculateROI(cashFlows, initialInvestment) { if (initialInvestment <= 0) return 0; const netGain = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0); return (netGain / initialInvestment) * 100; }
function calculateBreakEven(revenueSchedule, variableCostSchedule, fixedCostSchedule) { const firstOpYearIndex = revenueSchedule.findIndex(rev => rev > 0); if (firstOpYearIndex === -1) { return null; } const operationalYear = firstOpYearIndex + 1; const totalRevenue = revenueSchedule[firstOpYearIndex]; const totalVariableCosts = variableCostSchedule[firstOpYearIndex]; const totalFixedCosts = fixedCostSchedule[firstOpYearIndex]; if (totalRevenue <= totalVariableCosts) { return { year: operationalYear, totalRevenue, totalVariableCosts, totalFixedCosts, contributionMarginRatio: 0, breakEvenRevenue: Infinity, marginOfSafety: -Infinity, }; } const contributionMarginRatio = (totalRevenue - totalVariableCosts) / totalRevenue; const breakEvenRevenue = contributionMarginRatio > 0 ? totalFixedCosts / contributionMarginRatio : Infinity; const marginOfSafety = totalRevenue > breakEvenRevenue ? (totalRevenue - breakEvenRevenue) / totalRevenue : 0; return { year: operationalYear, totalRevenue, totalVariableCosts, totalFixedCosts, contributionMarginRatio: contributionMarginRatio * 100, breakEvenRevenue, marginOfSafety: marginOfSafety * 100, }; }
function calculateFinancialOutputs(projectData) { if (!projectData) return null; const { estimationBasis, operatingInputs, capitalInvestment, financing, timeline } = projectData; const { projectLife, taxRate, discountRate, workingCapitalPercentage, revenueGrowthRate, variableCostGrowthRate, fixedCostGrowthRate, initialCurrentAssets, initialCurrentLiabilities, initialInventory, ebitMultiple, depreciationMethod, depreciationRates, salvageValues } = estimationBasis; const allTasks = timeline.tasks; const revenueSchedule = calculateRevenueSchedule(operatingInputs.revenues, projectLife, revenueGrowthRate, allTasks); const operatingCostSchedule = calculateOperatingCostSchedule(operatingInputs.costs, projectLife, fixedCostGrowthRate, variableCostGrowthRate, allTasks); const depreciationSchedule = calculateDepreciationSchedule(capitalInvestment.items, projectLife, depreciationMethod, depreciationRates, salvageValues, allTasks); const variableCostSchedule = calculateVariableCostSchedule(operatingInputs.costs, projectLife, variableCostGrowthRate, allTasks); const fixedCostSchedule = calculateFixedCostSchedule(operatingInputs.costs, projectLife, fixedCostGrowthRate, allTasks); const { interest: annualInterestSchedule, schedule: loanAmortizationSchedule } = calculateLoanSchedules(financing.loans, projectLife); const initialInvestment = capitalInvestment.items.reduce((sum, item) => sum + item.cost, 0); const capexSchedule = Array(projectLife).fill(0); capitalInvestment.items.forEach(item => { const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1; if (startYear > 1 && startYear <= projectLife) { capexSchedule[startYear - 1] += item.cost; } }); const T0_capex = initialInvestment - capexSchedule.reduce((s, c) => s + c, 0); const cashFlowStatement = []; const workingCapitalSchedule = []; const unleveredFreeCashFlows = []; const grossMargins = []; const operatingMargins = []; const netMargins = []; const initialWorkingCapital = initialCurrentAssets - initialCurrentLiabilities; unleveredFreeCashFlows.push(-T0_capex - initialWorkingCapital); let previousWc = initialWorkingCapital; for (let i = 0; i < projectLife; i++) { const year = i + 1; const revenue = revenueSchedule[i] || 0; const operatingCosts = operatingCostSchedule[i] || 0; const depreciation = depreciationSchedule[i] || 0; const ebit = revenue - operatingCosts - depreciation; const taxOnEbit = ebit > 0 ? ebit * (taxRate / 100) : 0; const nopat = ebit - taxOnEbit; const currentWc = revenue * (workingCapitalPercentage / 100); const changeInWc = currentWc - previousWc; previousWc = currentWc; workingCapitalSchedule.push({ year, revenue, wc: currentWc, changeInWc }); const capexForYear = capexSchedule[i] || 0; let unleveredFreeCashFlow = nopat + depreciation - changeInWc - capexForYear; if (i === projectLife - 1) { const terminalValue = ebit > 0 ? ebit * ebitMultiple : 0; const salvageTotal = capitalInvestment.items.reduce((sum, item) => { const itemSalvage = item.cost * (salvageValues[item.category] / 100); return sum + itemSalvage; }, 0); unleveredFreeCashFlow += terminalValue + salvageTotal + currentWc; } cashFlowStatement.push({ year, revenue, operatingCosts, ebit, tax: taxOnEbit, nopat, depreciation, capex: capexForYear, changeInWc, unleveredFreeCashFlow, }); unleveredFreeCashFlows.push(unleveredFreeCashFlow); if (revenue > 0) { const variableCost = variableCostSchedule[i] || 0; grossMargins.push(((revenue - variableCost) / revenue) * 100); operatingMargins.push((ebit / revenue) * 100); const interest = annualInterestSchedule[i] || 0; const ebt = ebit - interest; const taxOnEbt = ebt > 0 ? ebt * (taxRate / 100) : 0; const netIncome = ebt - taxOnEbt; netMargins.push((netIncome / revenue) * 100); } else { grossMargins.push(0); operatingMargins.push(0); netMargins.push(0); } } const totalInitialInvestment = T0_capex + initialWorkingCapital; unleveredFreeCashFlows[0] = -totalInitialInvestment; const npv = calculateNPV(unleveredFreeCashFlows, discountRate); const irr = calculateIRR(unleveredFreeCashFlows); const paybackPeriod = calculatePaybackPeriod(unleveredFreeCashFlows); const discountedPaybackPeriod = calculateDiscountedPaybackPeriod(unleveredFreeCashFlows, discountRate); const roi = calculateROI(unleveredFreeCashFlows, totalInitialInvestment); const breakEvenAnalysis = calculateBreakEven(revenueSchedule, variableCostSchedule, fixedCostSchedule); const initialLoanPrincipals = financing.loans.reduce((sum, l) => sum + l.principal, 0); const initialEquity = initialInvestment + initialWorkingCapital - initialLoanPrincipals; const debtToEquityRatio = initialEquity > 0 ? initialLoanPrincipals / initialEquity : Infinity; const totalInitialAssets = initialInvestment + initialCurrentAssets; const debtToAssetsRatio = totalInitialAssets > 0 ? initialLoanPrincipals / totalInitialAssets : 0; const currentRatio = initialCurrentLiabilities > 0 ? initialCurrentAssets / initialCurrentLiabilities : Infinity; const quickRatio = initialCurrentLiabilities > 0 ? (initialCurrentAssets - initialInventory) / initialCurrentLiabilities : Infinity; let enterpriseValue = 0; const lastYearIndex = projectLife - 1; if (lastYearIndex >= 0 && cashFlowStatement[lastYearIndex]) { const lastYearEbit = cashFlowStatement[lastYearIndex].ebit; enterpriseValue = lastYearEbit > 0 ? lastYearEbit * ebitMultiple : 0; } const firstOpYearIndex = revenueSchedule.findIndex(rev => rev > 0); return { npv, irr, roi, paybackPeriod, discountedPaybackPeriod, breakEvenRevenue: breakEvenAnalysis?.breakEvenRevenue || 0, grossProfitMarginY1: firstOpYearIndex !== -1 ? (grossMargins[firstOpYearIndex] || 0) : 0, operatingProfitMarginY1: firstOpYearIndex !== -1 ? (operatingMargins[firstOpYearIndex] || 0) : 0, netProfitMarginY1: firstOpYearIndex !== -1 ? (netMargins[firstOpYearIndex] || 0) : 0, debtToEquityRatio, debtToAssetsRatio, currentRatio, quickRatio, enterpriseValue, dcfValuation: npv, revenueSchedule, operatingCostSchedule, depreciationSchedule, capexSchedule, workingCapitalSchedule, cashFlowStatement, breakEvenAnalysis, financialRatios: { grossMargin: grossMargins, operatingMargin: operatingMargins, netMargin: netMargins, }, loanAmortizationSchedule, }; }

/* --- Inlined from simulation.worker.ts --- */
self.onmessage = (event) => {
    try {
        const { projectData } = event.data;
        const { iterations, variables } = projectData.monteCarlo;
        
        const baseCaseOutput = calculateFinancialOutputs(projectData);
        const firstOperationalYearIndex = baseCaseOutput.revenueSchedule.findIndex(rev => rev > 0);

        if (firstOperationalYearIndex === -1) {
            const zeroStats = { mean: 0, median: 0, stdDev: 0, p10: 0, p25: 0, p75: 0, p90: 0 };
            self.postMessage({ type: 'result', payload: { results: { npv: zeroStats, irr: zeroStats, roi: zeroStats, paybackPeriod: zeroStats, probabilityNPVPositive: 0, probabilityIRRgtDiscountRate: 0 }, rawData: { npv: [], irr: [], roi: [], paybackPeriod: [] } } });
            return;
        }

        const results = { npv: [], irr: [], roi: [], paybackPeriod: [], };
        const activeVariables = Object.entries(variables).filter(([, v]) => v.distribution !== 'None');
        
        for (let i = 0; i < iterations; i++) {
            const modifiedProjectData = JSON.parse(JSON.stringify(projectData));
            
            activeVariables.forEach(([id, settings]) => {
                let value;
                switch (settings.distribution) {
                    case 'Normal': value = normal(settings.param1, settings.param2); break;
                    case 'Uniform': value = uniform(settings.param1, settings.param2); break;
                    case 'Triangular': value = triangular(settings.param1, settings.param2, settings.param3); break;
                    case 'Lognormal': value = lognormal(settings.param1, settings.param2); break;
                    case 'Beta': value = beta(settings.param1, settings.param2); break;
                    case 'PERT': value = pert(settings.param1, settings.param2, settings.param3); break;
                    default: return;
                }

                const [type, ...rest] = id.split('-');
                if (type === 'eb') {
                    const key = rest[0];
                    modifiedProjectData.estimationBasis[key] = value;
                } else if (type === 'rev') {
                    const itemId = rest[0];
                    const field = rest[1];
                    const revenueItem = modifiedProjectData.operatingInputs.revenues.find((r) => r.id === itemId);
                    if (revenueItem) {
                        revenueItem[field] = value;
                    }
                }
            });
            
            const output = calculateFinancialOutputs(modifiedProjectData);

            if (!isNaN(output.npv) && isFinite(output.npv)) results.npv.push(output.npv);
            if (!isNaN(output.irr) && isFinite(output.irr)) results.irr.push(output.irr);
            if (!isNaN(output.roi) && isFinite(output.roi)) results.roi.push(output.roi);
            if (output.paybackPeriod > 0 && isFinite(output.paybackPeriod)) {
                results.paybackPeriod.push(output.paybackPeriod);
            }

            if ((i + 1) % Math.max(1, Math.floor(iterations / 100)) === 0) {
                self.postMessage({ type: 'progress', payload: { progress: ((i + 1) / iterations) * 100 } });
            }
        }

        const getStats = (data) => {
            if (data.length === 0) return { mean: NaN, median: NaN, stdDev: NaN, p10: NaN, p25: NaN, p75: NaN, p90: NaN };
            data.sort((a, b) => a - b);
            const sum = data.reduce((a, b) => a + b, 0);
            const mean = sum / data.length;
            const mid = Math.floor(data.length / 2);
            const median = data.length % 2 === 0 ? (data[mid - 1] + data[mid]) / 2 : data[mid];
            const stdDev = Math.sqrt(data.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / (data.length > 1 ? data.length - 1 : 1));
            const p10 = data[Math.floor(data.length * 0.1)];
            const p25 = data[Math.floor(data.length * 0.25)];
            const p75 = data[Math.floor(data.length * 0.75)];
            const p90 = data[Math.floor(data.length * 0.9)];
            return { mean, median, stdDev, p10, p25, p75, p90 };
        };
        
        const probabilityNPVPositive = results.npv.length > 0 ? results.npv.filter(v => v > 0).length / results.npv.length : 0;
        const probabilityIRRgtDiscountRate = results.irr.length > 0 ? results.irr.filter(v => v > projectData.estimationBasis.discountRate).length / results.irr.length : 0;
        
        const rawDataForChart = { ...results };

        const finalResults = {
            npv: getStats(results.npv),
            irr: getStats(results.irr),
            roi: getStats(results.roi),
            paybackPeriod: getStats(results.paybackPeriod),
            probabilityNPVPositive,
            probabilityIRRgtDiscountRate
        };

        self.postMessage({ type: 'result', payload: { results: finalResults, rawData: rawDataForChart } });
    } catch (e) {
        console.error('Simulation Worker Error:', e);
        self.postMessage({ type: 'error', payload: { error: e.message }});
    }
};
`;

interface ParamLabels {
    p1: string;
    p2: string;
    p3?: string;
}

type KpiKey = 'npv' | 'irr' | 'roi' | 'paybackPeriod';

const ParameterInputGroup = ({ label, value, onChange, ...props }: { label: string, value: any, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, [key: string]: any }) => (
    <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
        <label htmlFor={props.id} className="text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{label}:</label>
        <Input type="number" step="any" value={value} onChange={onChange} className="py-1 px-2 text-xs w-full" {...props} />
    </div>
);

const ParametersCell = ({ variableId, settings }: { variableId: string, settings: MonteCarloVariable }) => {
    const { t } = useTranslation();
    const { updateMonteCarloParameter } = useProjectStore();

    if (settings.distribution === 'None') {
        return <span className="text-slate-500">N/A</span>;
    }

    const getParamLabels = (dist: Distribution): ParamLabels => {
        const labels = t(`m13_monteCarloSimulation.distributions.paramLabels.${dist}`, { returnObjects: true }) as ParamLabels;
        if (typeof labels === 'object' && labels.p1 && labels.p2) {
            return labels;
        }
        return { p1: 'Param 1', p2: 'Param 2', p3: 'Param 3' };
    };

    const labels = getParamLabels(settings.distribution);

    return (
        <div className="flex flex-wrap gap-2 items-center">
            <ParameterInputGroup
                id={`${variableId}-p1`}
                label={labels.p1}
                value={settings.param1}
                onChange={(e) => updateMonteCarloParameter(variableId, { param1: Number(e.target.value) })}
            />
            <ParameterInputGroup
                id={`${variableId}-p2`}
                label={labels.p2}
                value={settings.param2}
                onChange={(e) => updateMonteCarloParameter(variableId, { param2: Number(e.target.value) })}
            />
            {labels.p3 && (
                <ParameterInputGroup
                    id={`${variableId}-p3`}
                    label={labels.p3}
                    value={settings.param3 ?? ''}
                    onChange={(e) => updateMonteCarloParameter(variableId, { param3: Number(e.target.value) })}
                />
            )}
        </div>
    );
};

const M13_MonteCarloSimulation = () => {
    const { t, i18n } = useTranslation();
    const store = useProjectStore();
    const { 
        projectData, 
        updateMonteCarloIterations, updateMonteCarloParameter,
        simulationStatus, simulationProgress, simulationResults,
        setSimulationStatus, setSimulationProgress, setSimulationResults,
        setSimulationRawData, simulationRawData
    } = store;

    const workerRef = useRef<Worker | null>(null);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [visualizedKpi, setVisualizedKpi] = useState<KpiKey>('npv');
    const [chartType, setChartType] = useState<'pdf' | 'cdf'>('pdf');
    
    // Create worker on mount
    useEffect(() => {
        const blob = new Blob([workerScript], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        workerRef.current = new Worker(workerUrl);

        workerRef.current.onmessage = (event) => {
            const { type, payload } = event.data;
            if (type === 'progress') {
                setSimulationProgress(payload.progress);
            } else if (type === 'result') {
                setSimulationResults(payload.results);
                setSimulationRawData(payload.rawData);
                setSimulationStatus('done');
            } else if (type === 'error') {
                console.error('Simulation Worker Error:', payload.error);
                setSimulationStatus('idle');
            }
        };
        
        return () => {
            workerRef.current?.terminate();
            URL.revokeObjectURL(workerUrl);
        };
    }, []);

    const runSimulation = useCallback(() => {
        if (simulationStatus === 'running') return;
        setSimulationStatus('running');
        setSimulationProgress(0);
        setSimulationResults(null);
        setSimulationRawData(null);
        setAiInsight(null);
        workerRef.current?.postMessage({ projectData });
    }, [projectData, simulationStatus]);

    const handleGenerateAnalysis = async () => {
        if (!simulationResults) return;
        setIsAiLoading(true);
        setAiInsight(null);
        try {
            const insight = await summarizeSimulationResults(simulationResults, projectData.definition.projectName, i18n.language);
            setAiInsight(insight);
        } catch (error) {
            console.error("AI Simulation Analysis Failed:", error);
            setAiInsight(t('m13_monteCarloSimulation.aiSummary.error'));
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const formatNumber = (val: number | undefined, precision = 2) => (val !== undefined && isFinite(val) ? val.toFixed(precision) : 'N/A');
    const formatPercent = (val: number | undefined) => (val !== undefined && isFinite(val) ? `${(val * 100).toFixed(1)}%` : 'N/A');

    const variables: { id: string; name: string; baseValue: number; }[] = useMemo(() => [
        { id: 'eb-discountRate', name: t('m2_estimationBasis.discountRate'), baseValue: projectData.estimationBasis.discountRate },
        { id: 'eb-taxRate', name: t('m2_estimationBasis.taxRate'), baseValue: projectData.estimationBasis.taxRate },
        { id: 'eb-revenueGrowthRate', name: t('m2_estimationBasis.revenueGrowthRate'), baseValue: projectData.estimationBasis.revenueGrowthRate },
        { id: 'eb-variableCostGrowthRate', name: t('m2_estimationBasis.variableCostGrowthRate'), baseValue: projectData.estimationBasis.variableCostGrowthRate },
        { id: 'eb-fixedCostGrowthRate', name: t('m2_estimationBasis.fixedCostGrowthRate'), baseValue: projectData.estimationBasis.fixedCostGrowthRate },
        ...projectData.operatingInputs.revenues.map(r => ({ id: `rev-${r.id}-unitPrice`, name: `${r.item} (${t('m5_operatingInputs.table.unitPrice')})`, baseValue: r.unitPrice })),
    ], [projectData, t]);

    const kpiDisplayData = useMemo(() => {
        if (!simulationResults) return [];
        return [
            { key: 'npv', label: t('m9_financialEvaluation.npvTitle'), isCurrency: true, isPercent: false },
            { key: 'irr', label: t('m9_financialEvaluation.irrTitle'), isCurrency: false, isPercent: true },
            { key: 'roi', label: t('m9_financialEvaluation.roiTitle'), isCurrency: false, isPercent: true },
            { key: 'paybackPeriod', label: t('m9_financialEvaluation.paybackPeriodTitle'), isCurrency: false, isPercent: false },
        ];
    }, [simulationResults, t]);


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">{t('sidebar.m13')}</h1>
            <p className="text-slate-600 dark:text-slate-300">{t('m13_monteCarloSimulation.description')}</p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card title={t('m13_monteCarloSimulation.variablesTitle')}>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/4">{t('m13_monteCarloSimulation.table.variable')}</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-1/4">{t('m13_monteCarloSimulation.table.distribution')}</th>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider w-2/4">{t('m13_monteCarloSimulation.table.parameters')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {variables.map(v => {
                                        const settings = projectData.monteCarlo.variables[v.id] || { distribution: 'None', param1: v.baseValue, param2: 0 };
                                        return (
                                        <tr key={v.id}>
                                            <td className="px-3 py-2 text-sm font-medium">{v.name}</td>
                                            <td className="px-3 py-2">
                                                <Select
                                                    value={settings.distribution}
                                                    onChange={(e) => updateMonteCarloParameter(v.id, { distribution: e.target.value as Distribution })}
                                                    className="py-1 px-2 text-xs"
                                                >
                                                    {Object.keys(t('m13_monteCarloSimulation.distributions', { returnObjects: true })).map(dist => (
                                                        <option key={dist} value={dist}>
                                                            {t(`m13_monteCarloSimulation.distributions.${dist}`)}
                                                        </option>
                                                    ))}
                                                </Select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <ParametersCell variableId={v.id} settings={settings} />
                                            </td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                     <Card title={t('m13_monteCarloSimulation.setupTitle')}>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="iterations" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('m13_monteCarloSimulation.iterationsLabel')}</label>
                                <Input
                                    id="iterations"
                                    type="number"
                                    value={projectData.monteCarlo.iterations}
                                    onChange={(e) => updateMonteCarloIterations(Number(e.target.value))}
                                    min="100"
                                    max="50000"
                                    step="100"
                                    disabled={simulationStatus === 'running'}
                                />
                             </div>
                             <Button onClick={runSimulation} disabled={simulationStatus === 'running'} className="w-full">
                                {simulationStatus === 'running' ? t('m13_monteCarloSimulation.runningButton') : t('m13_monteCarloSimulation.runButton')}
                             </Button>

                             {simulationStatus === 'running' && (
                                <div>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${simulationProgress}%` }}></div>
                                    </div>
                                    <p className="text-center text-sm mt-2">{t('m13_monteCarloSimulation.simulationInProgress')} ({simulationProgress.toFixed(0)}%)</p>
                                </div>
                             )}
                        </div>
                     </Card>
                </div>
            </div>

            {simulationStatus === 'done' && simulationResults && (
                <>
                    <AIInsightBox
                        title={t('m13_monteCarloSimulation.aiSummary.title')}
                        insight={aiInsight}
                        isLoading={isAiLoading}
                        onGenerate={handleGenerateAnalysis}
                        onInsightChange={setAiInsight}
                        generateButtonText={t('m13_monteCarloSimulation.aiSummary.generateButton')}
                        loadingText={t('m13_monteCarloSimulation.aiSummary.generating')}
                        placeholderText={t('m13_monteCarloSimulation.aiSummary.placeholder')}
                    />
                    
                    <Card title={t('m13_monteCarloSimulation.resultsTitle')}>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-center">
                                <p className="text-sm text-green-800 dark:text-green-200">{t('m13_monteCarloSimulation.probNPVPositive')}</p>
                                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{formatPercent(simulationResults.probabilityNPVPositive)}</p>
                            </div>
                            <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-center">
                                <p className="text-sm text-blue-800 dark:text-blue-200">{t('m13_monteCarloSimulation.probIRRgtDiscount')}</p>
                                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{formatPercent(simulationResults.probabilityIRRgtDiscountRate)}</p>
                            </div>
                        </div>

                         <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-3 py-3 text-left text-xs font-medium text-slate-500 uppercase">{t('m13_monteCarloSimulation.resultsTable.kpi')}</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('m13_monteCarloSimulation.resultsTable.mean')}</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('m13_monteCarloSimulation.resultsTable.median')}</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('m13_monteCarloSimulation.resultsTable.stdDev')}</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('m13_monteCarloSimulation.resultsTable.p10')}</th>
                                        <th className="px-3 py-3 text-right text-xs font-medium text-slate-500 uppercase">{t('m13_monteCarloSimulation.resultsTable.p90')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                    {kpiDisplayData.map(kpi => {
                                        const stats = simulationResults[kpi.key as KpiKey];
                                        const formatter = kpi.isCurrency ? (val: number | undefined) => formatNumber(val, 0) : (kpi.isPercent ? formatPercent : formatNumber);
                                        return (
                                        <tr key={kpi.key}>
                                            <td className="px-3 py-2 font-medium">{kpi.label}</td>
                                            <td className="px-3 py-2 text-right font-mono">{formatter(stats.mean)}</td>
                                            <td className="px-3 py-2 text-right font-mono">{formatter(stats.median)}</td>
                                            <td className="px-3 py-2 text-right font-mono">{formatter(stats.stdDev)}</td>
                                            <td className="px-3 py-2 text-right font-mono">{formatter(stats.p10)}</td>
                                            <td className="px-3 py-2 text-right font-mono">{formatter(stats.p90)}</td>
                                        </tr>
                                    )})}
                                </tbody>
                            </table>
                         </div>
                    </Card>

                    <Card title={t('m13_monteCarloSimulation.visualizationTitle')}>
                        <div className="flex flex-wrap gap-4 items-center mb-4">
                            <div>
                                <label htmlFor="kpi-select" className="text-sm font-medium mr-2">{t('m13_monteCarloSimulation.visualizeKpi')}</label>
                                <Select id="kpi-select" value={visualizedKpi} onChange={e => setVisualizedKpi(e.target.value as KpiKey)}>
                                    {kpiDisplayData.map(kpi => <option key={kpi.key} value={kpi.key}>{kpi.label}</option>)}
                                </Select>
                            </div>
                            <div>
                                <label htmlFor="chart-type-select" className="text-sm font-medium mr-2">{t('m13_monteCarloSimulation.chartType')}</label>
                                <Select id="chart-type-select" value={chartType} onChange={e => setChartType(e.target.value as 'pdf' | 'cdf')}>
                                     <option value="pdf">{t('m13_monteCarloSimulation.histogram')}</option>
                                     <option value="cdf">{t('m13_monteCarloSimulation.cdf')}</option>
                                </Select>
                            </div>
                        </div>

                         {simulationRawData && simulationResults && (
                            <SimulationHistogram
                                data={simulationRawData[visualizedKpi]}
                                stats={simulationResults[visualizedKpi]}
                                kpiLabel={kpiDisplayData.find(k => k.key === visualizedKpi)?.label || ''}
                                chartType={chartType}
                                isCurrency={kpiDisplayData.find(k => k.key === visualizedKpi)?.isCurrency || false}
                                isPercent={kpiDisplayData.find(k => k.key === visualizedKpi)?.isPercent || false}
                             />
                         )}

                    </Card>
                </>
            )}

            {simulationStatus === 'idle' && !simulationResults && (
                <Card>
                    <div className="text-center py-12">
                        <p className="text-slate-500 dark:text-slate-400">{t('m13_monteCarloSimulation.noResults')}</p>
                    </div>
                </Card>
            )}
        </div>
    );
};
export default M13_MonteCarloSimulation;
