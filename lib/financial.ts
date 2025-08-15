import { ProjectData, CalculatedOutputs, RevenueItem, OperatingCostItem, CapitalInvestmentItem, WorkingCapitalScheduleItem, CashFlowItem, BreakEvenAnalysis, initialCalculatedOutputs, LoanAmortizationScheduleItem, EstimationBasis, RawMaterialCostItem, Task, Loan, TimeBasedBreakEvenData } from "../types";

/**
 * Helper function to determine the project year based on a task's start date.
 * @param taskStartDateStr - The start date of the task (YYYY-MM-DD).
 * @param allTasks - The array of all project tasks to find the project's start date.
 * @returns The 1-indexed year of the project (e.g., 1, 2, 3...).
 */
function getYearFromTask(taskStartDateStr: string | undefined, allTasks: Task[]): number {
    if (allTasks.length === 0 || !taskStartDateStr) return 1;

    const validTasksWithDates = allTasks.filter(t => t.startDate);
    if (validTasksWithDates.length === 0) return 1;

    const taskStartDate = new Date(taskStartDateStr);
    const projectStartDate = new Date(Math.min(...validTasksWithDates.map(t => new Date(t.startDate).getTime())));

    if (taskStartDate < projectStartDate) {
        return 1;
    }

    const diffTime = taskStartDate.getTime() - projectStartDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    // Year 1 is from day 0 to 364. Year 2 is 365 to 729 etc.
    return Math.floor(diffDays / 365) + 1;
}

function getBaseCost(item: OperatingCostItem): number {
    switch (item.category) {
        case 'Raw Materials':
            return item.unitCost * item.quantity;
        case 'Labor':
            return item.count * item.monthlySalary * 12;
        case 'General & Admin':
            return item.cost;
        default:
            return 0;
    }
}

// These schedule functions now depend on the timeline
function calculateRevenueSchedule(revenues: RevenueItem[], projectLife: number, growthRate: number, allTasks: Task[]): number[] {
    const annualRevenues: number[] = Array(projectLife).fill(0);
    const rate = 1 + growthRate / 100;
    revenues.forEach(item => {
        const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1;
        let currentRevenue = item.unitPrice * item.quantity;
        for (let year = startYear - 1; year < projectLife; year++) {
            annualRevenues[year] += currentRevenue;
            currentRevenue *= rate; // Growth for the next year
        }
    });
    return annualRevenues;
}

function calculateOperatingCostSchedule(costs: OperatingCostItem[], projectLife: number, fixedRate: number, variableRate: number, allTasks: Task[]): number[] {
    const annualCosts: number[] = Array(projectLife).fill(0);
    const fixedGrowth = 1 + fixedRate / 100;
    const variableGrowth = 1 + variableRate / 100;

    costs.forEach(item => {
        let currentCost = getBaseCost(item);
        const growthRate = item.category === 'Raw Materials' ? variableGrowth : fixedGrowth;
        const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1;

        for (let year = startYear - 1; year < projectLife; year++) {
            annualCosts[year] += currentCost;
            currentCost *= growthRate; // Growth for the next year
        }
    });
    return annualCosts;
}


function calculateVariableCostSchedule(costs: OperatingCostItem[], projectLife: number, variableRate: number, allTasks: Task[]): number[] {
    const variableItems = costs.filter(c => c.category === 'Raw Materials') as RawMaterialCostItem[];
    const annualCosts: number[] = Array(projectLife).fill(0);
    const growthRate = 1 + variableRate / 100;
    variableItems.forEach(item => {
        const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1;
        let currentCost = getBaseCost(item);
        for (let year = startYear - 1; year < projectLife; year++) {
            annualCosts[year] += currentCost;
            currentCost *= growthRate;
        }
    });
    return annualCosts;
}

function calculateFixedCostSchedule(costs: OperatingCostItem[], projectLife: number, fixedRate: number, allTasks: Task[]): number[] {
    const fixedItems = costs.filter(c => c.category === 'Labor' || c.category === 'General & Admin');
    const annualCosts: number[] = Array(projectLife).fill(0);
    const growthRate = 1 + fixedRate / 100;
    fixedItems.forEach(item => {
        const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1;
        let currentCost = getBaseCost(item);
        for (let year = startYear - 1; year < projectLife; year++) {
            annualCosts[year] += currentCost;
            currentCost *= growthRate;
        }
    });
    return annualCosts;
}

function calculateDepreciationSchedule(
    items: CapitalInvestmentItem[], 
    projectLife: number, 
    method: EstimationBasis['depreciationMethod'],
    depreciationRates: EstimationBasis['depreciationRates'],
    salvageValues: EstimationBasis['salvageValues'],
    allTasks: Task[]
): number[] {
    const annualDepreciation: number[] = Array(projectLife).fill(0);
    if (projectLife <= 0) return annualDepreciation;

    items.forEach(item => {
        const cost = item.cost;
        const salvageValuePercent = salvageValues[item.category] / 100;
        const salvageValue = cost * salvageValuePercent;
        const depreciableBase = cost - salvageValue;
        const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1;
        const effectiveLife = projectLife - (startYear - 1);
        if (effectiveLife <= 0) return;
        
        if (method === 'Straight-line') {
            const yearlyDepreciation = depreciableBase / effectiveLife;
            for (let year = startYear - 1; year < projectLife; year++) {
                annualDepreciation[year] += yearlyDepreciation;
            }
        } else if (method === 'Declining Balance') {
            let bookValue = cost;
            const rate = depreciationRates[item.category] / 100;
            for (let year = startYear - 1; year < projectLife; year++) {
                let yearlyDepreciation = bookValue * rate;
                if (bookValue - yearlyDepreciation < salvageValue) {
                    yearlyDepreciation = bookValue - salvageValue;
                }
                if (yearlyDepreciation < 0) yearlyDepreciation = 0;
                
                annualDepreciation[year] += yearlyDepreciation;
                bookValue -= yearlyDepreciation;
            }
        } else if (method === 'Sum-of-Years Digits') {
            const syd = effectiveLife * (effectiveLife + 1) / 2;
            if (syd === 0) return;
            for (let i = 0; i < effectiveLife; i++) {
                const year = (startYear - 1) + i;
                const remainingLife = effectiveLife - i;
                const yearlyDepreciation = (remainingLife / syd) * depreciableBase;
                annualDepreciation[year] += yearlyDepreciation;
            }
        }
    });
    return annualDepreciation;
}

function calculateLoanSchedules(loans: ProjectData['financing']['loans'], projectLife: number): { interest: number[], principal: number[], schedule: LoanAmortizationScheduleItem[] } {
    const interestSchedule: number[] = Array(projectLife).fill(0);
    const principalSchedule: number[] = Array(projectLife).fill(0);
    const consolidatedSchedule: LoanAmortizationScheduleItem[] = Array.from({ length: projectLife }, (_, i) => ({
      year: i + 1,
      openingBalance: 0,
      principal: 0,
      interest: 0,
      closingBalance: 0,
    }));

    loans.forEach(loan => {
      let balance = loan.principal;
      const rate = loan.interestRate / 100;
      const term = loan.term;
      const startYear = loan.startYear || 1;

      if (rate <= 0 || term <= 0) return;
      
      const pmt = balance * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
      if (!isFinite(pmt)) return;

      for (let i = 0; i < term; i++) {
        const yearIndex = (startYear - 1) + i;
        if (yearIndex >= projectLife) break;

        const interestPayment = balance * rate;
        const principalPayment = pmt - interestPayment > balance ? balance : pmt - interestPayment;
        
        interestSchedule[yearIndex] += interestPayment;
        principalSchedule[yearIndex] += principalPayment;
        balance -= principalPayment;
      }
    });

    // Recalculate consolidated schedule based on aggregated payments
    let openingBalance = 0;
    for (let i = 0; i < projectLife; i++) {
        const newLoanPrincipals = loans
            .filter(l => (l.startYear || 1) === i + 1)
            .reduce((sum, l) => sum + l.principal, 0);

        openingBalance += newLoanPrincipals;
        
        const scheduleItem = consolidatedSchedule[i];
        scheduleItem.openingBalance = openingBalance;
        scheduleItem.interest = interestSchedule[i];
        scheduleItem.principal = principalSchedule[i];
        
        openingBalance -= scheduleItem.principal;
        scheduleItem.closingBalance = openingBalance > 0 ? openingBalance : 0;
    }

    return { interest: interestSchedule, principal: principalSchedule, schedule: consolidatedSchedule };
}


function calculateNPV(cashFlows: number[], discountRate: number): number {
    const rate = discountRate / 100;
    return cashFlows.reduce((acc, cashFlow, t) => acc + cashFlow / Math.pow(1 + rate, t), 0);
}

function calculateIRR(cashFlows: number[], guess: number = 0.1, maxIterations: number = 100, tolerance: number = 1e-6): number {
    if (cashFlows.every(cf => cf >= 0) || cashFlows.every(cf => cf <= 0)) {
        return NaN;
    }
    let rate = guess;
    for (let i = 0; i < maxIterations; i++) {
        const npv = calculateNPV(cashFlows, rate * 100);
        if (Math.abs(npv) < tolerance) {
            return rate * 100;
        }
        const npvPlusEpsilon = calculateNPV(cashFlows, (rate + tolerance) * 100);
        const derivative = (npvPlusEpsilon - npv) / tolerance;
        if (Math.abs(derivative) < tolerance) break;
        rate = rate - npv / derivative;
    }
    return NaN; // Failed to converge
}

function calculatePaybackPeriod(cashFlows: number[]): number {
    if (cashFlows.length === 0 || cashFlows[0] >= 0) return -1;
    let cumulativeCashFlow = cashFlows[0];
    for (let i = 1; i < cashFlows.length; i++) {
        const prevCumulative = cumulativeCashFlow;
        cumulativeCashFlow += cashFlows[i];
        if (cumulativeCashFlow > 0) {
            return (i - 1) + (-prevCumulative / cashFlows[i]);
        }
    }
    return -1; // Not paid back
}

function calculateDiscountedPaybackPeriod(cashFlows: number[], discountRate: number): number {
    const rate = discountRate / 100;
    const discountedCashFlows = cashFlows.map((cf, t) => cf / Math.pow(1 + rate, t));
    return calculatePaybackPeriod(discountedCashFlows);
}

function calculateROI(cashFlows: number[], initialInvestment: number): number {
    if (initialInvestment <= 0) return 0;
    const netGain = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);
    return (netGain / initialInvestment) * 100;
}

function calculateBreakEvenForYear(
    totalRevenue: number, 
    totalVariableCosts: number,
    totalFixedCosts: number,
    year: number
): BreakEvenAnalysis {
    if (totalRevenue === 0 && totalVariableCosts === 0 && totalFixedCosts === 0) {
        return {
            year, totalRevenue: 0, totalVariableCosts: 0, totalFixedCosts: 0,
            contributionMarginRatio: 0, breakEvenRevenue: 0, marginOfSafety: 0,
        };
    }
    if (totalRevenue <= totalVariableCosts) {
        return {
            year, totalRevenue, totalVariableCosts, totalFixedCosts,
            contributionMarginRatio: 0, breakEvenRevenue: Infinity, marginOfSafety: -Infinity,
        };
    }

    const contributionMarginRatio = (totalRevenue - totalVariableCosts) / totalRevenue;
    const breakEvenRevenue = contributionMarginRatio > 0 ? totalFixedCosts / contributionMarginRatio : Infinity;
    const marginOfSafety = totalRevenue > breakEvenRevenue ? (totalRevenue - breakEvenRevenue) / totalRevenue : 0;
    
    return {
        year, totalRevenue, totalVariableCosts, totalFixedCosts,
        contributionMarginRatio: contributionMarginRatio * 100,
        breakEvenRevenue,
        marginOfSafety: marginOfSafety * 100,
    };
}


export function calculateFinancialOutputs(projectData: ProjectData): CalculatedOutputs {
    if (!projectData) return initialCalculatedOutputs;

    const { estimationBasis, operatingInputs, capitalInvestment, financing, timeline } = projectData;
    const { 
        projectLife, taxRate, discountRate, workingCapitalPercentage,
        revenueGrowthRate, variableCostGrowthRate, fixedCostGrowthRate,
        initialCurrentAssets, initialCurrentLiabilities, initialInventory,
        ebitMultiple, depreciationMethod, depreciationRates, salvageValues
    } = estimationBasis;
    const allTasks = timeline.tasks;

    const revenueSchedule = calculateRevenueSchedule(operatingInputs.revenues, projectLife, revenueGrowthRate, allTasks);
    const operatingCostSchedule = calculateOperatingCostSchedule(operatingInputs.costs, projectLife, fixedCostGrowthRate, variableCostGrowthRate, allTasks);
    
    const depreciationSchedule = calculateDepreciationSchedule(
        capitalInvestment.items, projectLife, depreciationMethod,
        depreciationRates, salvageValues, allTasks
    );
    
    const variableCostSchedule = calculateVariableCostSchedule(operatingInputs.costs, projectLife, variableCostGrowthRate, allTasks);
    const fixedCostSchedule = calculateFixedCostSchedule(operatingInputs.costs, projectLife, fixedCostGrowthRate, allTasks);
    const { interest: annualInterestSchedule, schedule: loanAmortizationSchedule } = calculateLoanSchedules(financing.loans, projectLife);
    
    // --- Capex Schedules ---
    const initialInvestment = capitalInvestment.items.reduce((sum, item) => sum + item.cost, 0);
    
    const capexSchedule: number[] = Array(projectLife).fill(0);
    capitalInvestment.items.forEach(item => {
        const startYear = item.linkedTaskId ? getYearFromTask(allTasks.find(t => t.id === item.linkedTaskId)?.startDate, allTasks) : 1;
        if (startYear > 1 && startYear <= projectLife) {
            capexSchedule[startYear - 1] += item.cost;
        }
    });
    const T0_capex = initialInvestment - capexSchedule.reduce((s,c) => s+c, 0);


    // --- Cash Flow Calculation ---
    const cashFlowStatement: CashFlowItem[] = [];
    const workingCapitalSchedule: WorkingCapitalScheduleItem[] = [];
    const unleveredFreeCashFlows: number[] = [];
    
    const grossMargins: number[] = [];
    const operatingMargins: number[] = [];
    const netMargins: number[] = [];
    const debtToEquityRatioSchedule: (number | null)[] = [];

    const initialWorkingCapital = initialCurrentAssets - initialCurrentLiabilities;
    
    unleveredFreeCashFlows.push(-T0_capex - initialWorkingCapital);

    let previousWc = initialWorkingCapital;

    const initialLoanPrincipals = financing.loans.reduce((sum, l) => sum + l.principal, 0);
    const initialEquity = initialInvestment + initialWorkingCapital - initialLoanPrincipals;
    let cumulativeEquity = initialEquity;

    for (let i = 0; i < projectLife; i++) {
        const year = i + 1;
        const revenue = revenueSchedule[i] || 0;
        const operatingCosts = operatingCostSchedule[i] || 0;
        const depreciation = depreciationSchedule[i] || 0;
        
        const ebit = revenue - operatingCosts - depreciation;
        const taxOnEbit = ebit > 0 ? ebit * (taxRate / 100) : 0;
        const nopat = ebit - taxOnEbit;
        
        const currentWc = revenue * (workingCapitalPercentage / 100);
        const changeInWc = currentWc - previousWc;
        previousWc = currentWc;
        
        workingCapitalSchedule.push({
            year,
            revenue,
            wc: currentWc,
            changeInWc
        });

        const capexForYear = capexSchedule[i] || 0;
        let unleveredFreeCashFlow = nopat + depreciation - changeInWc - capexForYear;

        if (i === projectLife - 1) {
            const terminalValue = ebit > 0 ? ebit * ebitMultiple : 0;
            const salvageTotal = capitalInvestment.items.reduce((sum, item) => {
                const itemSalvage = item.cost * (salvageValues[item.category] / 100);
                return sum + itemSalvage;
            }, 0);
            unleveredFreeCashFlow += terminalValue + salvageTotal + currentWc; // Add terminal value, salvage, and recover all WC
        }
        
        cashFlowStatement.push({
            year,
            revenue,
            operatingCosts,
            ebit,
            tax: taxOnEbit,
            nopat,
            depreciation,
            capex: capexForYear,
            changeInWc,
            unleveredFreeCashFlow,
        });
        unleveredFreeCashFlows.push(unleveredFreeCashFlow);

        // Calculate Ratios
        const interest = annualInterestSchedule[i] || 0;
        const ebt = ebit - interest;
        const taxOnEbt = ebt > 0 ? ebt * (taxRate / 100) : 0;
        const netIncome = ebt - taxOnEbt;
        cumulativeEquity += netIncome;
        
        const closingDebt = loanAmortizationSchedule[i]?.closingBalance || 0;
        const currentD2ERatio = cumulativeEquity > 0 ? (closingDebt / cumulativeEquity) : null;
        debtToEquityRatioSchedule.push(currentD2ERatio);

        if (revenue > 0) {
            const variableCost = variableCostSchedule[i] || 0;
            grossMargins.push(((revenue - variableCost) / revenue) * 100);
            operatingMargins.push((ebit / revenue) * 100);
            netMargins.push((netIncome / revenue) * 100);
        } else {
            grossMargins.push(0);
            operatingMargins.push(0);
            netMargins.push(0);
        }
    }
    
    const totalInitialInvestment = T0_capex + initialWorkingCapital;
    
    unleveredFreeCashFlows[0] = -totalInitialInvestment;

    const npv = calculateNPV(unleveredFreeCashFlows, discountRate);
    const irr = calculateIRR(unleveredFreeCashFlows);
    const paybackPeriod = calculatePaybackPeriod(unleveredFreeCashFlows);
    const discountedPaybackPeriod = calculateDiscountedPaybackPeriod(unleveredFreeCashFlows, discountRate);
    const roi = calculateROI(unleveredFreeCashFlows, totalInitialInvestment);
    
    const breakEvenAnalysis: BreakEvenAnalysis[] = [];
    for(let i=0; i < projectLife; i++) {
        const beData = calculateBreakEvenForYear(
            revenueSchedule[i],
            variableCostSchedule[i],
            fixedCostSchedule[i],
            i + 1
        );
        breakEvenAnalysis.push(beData);
    }
    
    const timeBasedBreakEvenData: TimeBasedBreakEvenData[] = [];
    let cumulativeRevenue = 0;
    let cumulativeCosts = totalInitialInvestment; // Start with the total initial outlay
    for(let i=0; i < projectLife; i++) {
        cumulativeRevenue += revenueSchedule[i];
        cumulativeCosts += operatingCostSchedule[i] + capexSchedule[i];
        timeBasedBreakEvenData.push({
            year: i + 1,
            cumulativeRevenue,
            cumulativeCosts,
        });
    }

    // --- Final KPIs ---
    const debtToEquityRatio = initialEquity > 0 ? initialLoanPrincipals / initialEquity : Infinity;
    const totalInitialAssets = initialInvestment + initialCurrentAssets;
    const debtToAssetsRatio = totalInitialAssets > 0 ? initialLoanPrincipals / totalInitialAssets : 0;
    
    const currentRatio = initialCurrentLiabilities > 0 ? initialCurrentAssets / initialCurrentLiabilities : Infinity;
    const quickRatio = initialCurrentLiabilities > 0 ? (initialCurrentAssets - initialInventory) / initialCurrentLiabilities : Infinity;

    let enterpriseValue = 0;
    const lastYearIndex = projectLife - 1;
    if (lastYearIndex >= 0 && cashFlowStatement[lastYearIndex]) {
        const lastYearEbit = cashFlowStatement[lastYearIndex].ebit;
        enterpriseValue = lastYearEbit > 0 ? lastYearEbit * ebitMultiple : 0;
    }

    const firstOpYearIndex = revenueSchedule.findIndex(rev => rev > 0);
    const firstYearBreakEven = breakEvenAnalysis.find(be => be.year === (firstOpYearIndex + 1));

    return {
        npv,
        irr,
        roi,
        paybackPeriod,
        discountedPaybackPeriod,
        breakEvenRevenue: firstYearBreakEven?.breakEvenRevenue || 0,
        grossProfitMarginY1: firstOpYearIndex !== -1 ? (grossMargins[firstOpYearIndex] || 0) : 0,
        operatingProfitMarginY1: firstOpYearIndex !== -1 ? (operatingMargins[firstOpYearIndex] || 0) : 0,
        netProfitMarginY1: firstOpYearIndex !== -1 ? (netMargins[firstOpYearIndex] || 0) : 0,
        debtToEquityRatio,
        debtToAssetsRatio,
        currentRatio,
        quickRatio,
        enterpriseValue,
        dcfValuation: npv,
        revenueSchedule,
        operatingCostSchedule,
        depreciationSchedule,
        capexSchedule,
        workingCapitalSchedule,
        cashFlowStatement,
        breakEvenAnalysis,
        financialRatios: {
            grossMargin: grossMargins,
            operatingMargin: operatingMargins,
            netMargin: netMargins,
        },
        loanAmortizationSchedule,
        timeBasedBreakEvenData,
        debtToEquityRatioSchedule
    };
}

export function calculateSingleLoanSchedule(loan: Loan, projectLife: number): LoanAmortizationScheduleItem[] {
    const schedule: LoanAmortizationScheduleItem[] = Array.from({ length: projectLife }, (_, i) => ({
      year: i + 1,
      openingBalance: 0,
      principal: 0,
      interest: 0,
      closingBalance: 0,
    }));

    let balance = loan.principal;
    const rate = loan.interestRate / 100;
    const term = loan.term;
    const startYear = loan.startYear || 1;

    if (!isFinite(balance) || balance <= 0 || !isFinite(rate) || rate < 0 || !isFinite(term) || term <= 0) {
        return schedule;
    }

    if (rate === 0) {
        const principalPayment = balance / term;
        for (let i = 0; i < term; i++) {
             const yearIndex = (startYear - 1) + i;
             if (yearIndex >= projectLife) break;

             const scheduleItem = schedule[yearIndex];
             scheduleItem.openingBalance = balance;
             scheduleItem.principal = principalPayment;
             scheduleItem.interest = 0;
             balance -= principalPayment;
             scheduleItem.closingBalance = balance > 0 ? balance : 0;
        }
        return schedule;
    }

    const pmt = balance * (rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    if (!isFinite(pmt)) return schedule;

    for (let i = 0; i < term; i++) {
        const yearIndex = (startYear - 1) + i;
        if (yearIndex >= projectLife) break;
        
        const scheduleItem = schedule[yearIndex];
        scheduleItem.openingBalance = balance;

        const interestPayment = balance * rate;
        const principalPayment = pmt - interestPayment > balance ? balance : pmt - interestPayment;
        
        scheduleItem.interest = interestPayment;
        scheduleItem.principal = principalPayment > 0 ? principalPayment : 0;
        
        balance -= principalPayment;
        scheduleItem.closingBalance = balance > 0 ? balance : 0;
    }

    return schedule;
}