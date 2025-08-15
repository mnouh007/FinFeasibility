

// --- M1: Project Definition ---
export interface Partner {
  id: string;
  name: string;
  share: number;
}

export interface ProjectDefinition {
  projectName: string;
  projectDescription: string;
  objectives: string;
  baseCase: string;
  projectLocation: string;
  latitude?: number;
  longitude?: number;
  geographicScope: string;
  stakeholders: string[];
  partners: Partner[];
}

// --- M2: Estimation Basis ---
export interface EstimationBasis {
    currency: string;
    projectLife: number; // in years
    discountRate: number; // percentage
    taxRate: number; // percentage
    inflationRate: number; // percentage
    revenueGrowthRate: number; // percentage
    variableCostGrowthRate: number; // percentage
    fixedCostGrowthRate: number; // percentage
    depreciationMethod: 'Straight-line' | 'Declining Balance' | 'Sum-of-Years Digits';
    depreciationRates: {
      Buildings: number;
      Machinery: number;
      Furniture: number;
      Equipment: number;
    };
    salvageValues: {
      Buildings: number;
      Machinery: number;
      Furniture: number;
      Equipment: number;
    };
    workingCapitalPercentage: number; // percentage of sales
    initialCurrentAssets: number;
    initialCurrentLiabilities: number;
    initialInventory: number;
    ebitMultiple: number;
}

// --- M3: Capital Investment ---
export interface CapitalInvestmentItem {
    id: string;
    category: 'Buildings' | 'Machinery' | 'Furniture' | 'Equipment';
    item: string;
    cost: number;
    linkedTaskId?: string;
}

// --- M4: Project Timeline ---
export interface Task {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  progress: number; // percentage 0-100
  dependencies: string[]; // array of task ids
}

// --- M5: Operating Inputs ---

// Discriminated union for Operating Costs
export interface RawMaterialCostItem {
  id: string;
  category: 'Raw Materials';
  item: string;
  unitCost: number;
  quantity: number;
  linkedTaskId?: string;
}

export interface LaborCostItem {
  id: string;
  category: 'Labor';
  item: string; // Role
  count: number;
  monthlySalary: number;
  linkedTaskId?: string;
}

export interface AdminCostItem {
  id: string;
  category: 'General & Admin';
  item: string;
  cost: number; // Annual Cost
  linkedTaskId?: string;
}

export type OperatingCostItem = RawMaterialCostItem | LaborCostItem | AdminCostItem;

export interface RevenueItem {
  id: string;
  item: string;
  unitPrice: number;
  quantity: number;
  linkedTaskId?: string;
}

export interface OperatingInputs {
  costs: OperatingCostItem[];
  revenues: RevenueItem[];
}

// --- M6: Financing / Loans ---
export interface Loan {
  id: string;
  source: string;
  principal: number;
  interestRate: number; // percentage
  term: number; // years
  startYear: number;
}

export interface LoanAmortizationScheduleItem {
  year: number;
  openingBalance: number;
  principal: number;
  interest: number;
  closingBalance: number;
}

// --- M12: Sensitivity Analysis ---
export interface Scenario {
  id: string;
  name: string;
  modifications: Partial<EstimationBasis>;
}

// --- M13: Monte Carlo Simulation ---
export type Distribution = 'None' | 'Normal' | 'Uniform' | 'Triangular' | 'Lognormal' | 'Beta' | 'PERT';

export interface MonteCarloVariable {
    distribution: Distribution;
    param1: number; // Mean (Normal), Min (Uniform), Min (Triangular), Log Mean (Lognormal), Alpha (Beta), Min (PERT)
    param2: number; // Std Dev (Normal), Max (Uniform), Mode (Triangular), Log Std Dev (Lognormal), Beta (Beta), Mode (PERT)
    param3?: number; // Max (Triangular), Max (PERT)
}

export type MonteCarloVariableKey = 'discountRate' | 'taxRate' | 'revenueGrowthRate' | 'variableCostGrowthRate' | 'fixedCostGrowthRate' | 'inflationRate';

export interface MonteCarloSettings {
    iterations: number;
    variables: {
        [uniqueId: string]: MonteCarloVariable; // e.g., 'eb-discountRate', 'rev-item1-price'
    };
}

export interface MonteCarloResultStats {
    mean: number;
    median: number;
    stdDev: number;
    p10: number;
    p25: number;
    p75: number;
    p90: number;
}

export interface MonteCarloResults {
    npv: MonteCarloResultStats;
    irr: MonteCarloResultStats;
    roi: MonteCarloResultStats;
    paybackPeriod: MonteCarloResultStats;
    probabilityNPVPositive: number;
    probabilityIRRgtDiscountRate: number;
}

/**
 * Represents the core user-input data for the entire project.
 * Each property corresponds to a module in the application.
 */
export interface ProjectData {
  definition: ProjectDefinition;
  estimationBasis: EstimationBasis;
  capitalInvestment: {
    items: CapitalInvestmentItem[];
  };
  timeline: {
    tasks: Task[];
  };
  operatingInputs: OperatingInputs;
  financing: {
    loans: Loan[];
  };
  sensitivityAnalysis: {
    scenarios: Scenario[];
  };
  monteCarlo: MonteCarloSettings;
}

export interface WorkingCapitalScheduleItem {
    year: number;
    revenue: number;
    wc: number;
    changeInWc: number;
}

export interface CashFlowItem {
    year: number;
    revenue: number;
    operatingCosts: number;
    ebit: number;
    tax: number;
    nopat: number;
    depreciation: number;
    capex: number;
    changeInWc: number;
    unleveredFreeCashFlow: number;
}

export interface BreakEvenAnalysis {
  year: number;
  breakEvenRevenue: number;
  contributionMarginRatio: number;
  marginOfSafety: number;
  totalFixedCosts: number;
  totalVariableCosts: number;
  totalRevenue: number;
}

export interface FinancialRatios {
    grossMargin: number[];
    operatingMargin: number[];
    netMargin: number[];
}

export interface TimeBasedBreakEvenData {
    year: number;
    cumulativeRevenue: number;
    cumulativeCosts: number;
}

/**
 * Represents the calculated outputs derived from the ProjectData.
 * This data is read-only in the UI for most modules.
 */
export interface CalculatedOutputs {
  npv: number;
  irr: number;
  roi: number;
  paybackPeriod: number; // in years, -1 if not achieved
  discountedPaybackPeriod: number; // in years, -1 if not achieved
  
  // New KPIs for M9
  breakEvenRevenue: number; // This will now represent the first operational year's BEP
  grossProfitMarginY1: number;
  operatingProfitMarginY1: number;
  netProfitMarginY1: number;
  debtToEquityRatio: number;
  debtToAssetsRatio: number;
  currentRatio: number;
  quickRatio: number;
  enterpriseValue: number;
  dcfValuation: number;

  // Schedules and other detailed outputs
  revenueSchedule: number[];
  operatingCostSchedule: number[];
  depreciationSchedule: number[];
  capexSchedule: number[];
  workingCapitalSchedule: WorkingCapitalScheduleItem[];
  cashFlowStatement: CashFlowItem[];
  breakEvenAnalysis: BreakEvenAnalysis[];
  financialRatios: FinancialRatios;
  loanAmortizationSchedule: LoanAmortizationScheduleItem[];
  timeBasedBreakEvenData: TimeBasedBreakEvenData[];
  debtToEquityRatioSchedule: (number | null)[];
}

// Initial empty state for a new project
export const initialProjectData: ProjectData = {
    definition: {
        projectName: '',
        projectDescription: '',
        objectives: '',
        baseCase: '',
        projectLocation: '',
        latitude: undefined,
        longitude: undefined,
        geographicScope: '',
        stakeholders: [],
        partners: [],
    },
    estimationBasis: {
        currency: 'USD',
        projectLife: 10,
        discountRate: 10,
        taxRate: 15,
        inflationRate: 2,
        revenueGrowthRate: 2,
        variableCostGrowthRate: 2,
        fixedCostGrowthRate: 2,
        depreciationMethod: 'Straight-line',
        depreciationRates: {
            Buildings: 5,
            Machinery: 15,
            Furniture: 10,
            Equipment: 20,
        },
        salvageValues: {
            Buildings: 10,
            Machinery: 5,
            Furniture: 5,
            Equipment: 0,
        },
        workingCapitalPercentage: 5,
        initialCurrentAssets: 0,
        initialCurrentLiabilities: 0,
        initialInventory: 0,
        ebitMultiple: 0,
    },
    capitalInvestment: {
        items: [],
    },
    timeline: {
      tasks: [],
    },
    operatingInputs: {
        costs: [],
        revenues: [],
    },
    financing: {
        loans: [],
    },
    sensitivityAnalysis: {
        scenarios: [],
    },
    monteCarlo: {
        iterations: 5000,
        variables: {}
    }
};

export const initialCalculatedOutputs: CalculatedOutputs = {
    npv: 0,
    irr: 0,
    roi: 0,
    paybackPeriod: -1,
    discountedPaybackPeriod: -1,
    breakEvenRevenue: 0,
    grossProfitMarginY1: 0,
    operatingProfitMarginY1: 0,
    netProfitMarginY1: 0,
    debtToEquityRatio: 0,
    debtToAssetsRatio: 0,
    currentRatio: 0,
    quickRatio: 0,
    enterpriseValue: 0,
    dcfValuation: 0,
    revenueSchedule: [],
    operatingCostSchedule: [],
    depreciationSchedule: [],
    capexSchedule: [],
    workingCapitalSchedule: [],
    cashFlowStatement: [],
    breakEvenAnalysis: [],
    financialRatios: {
        grossMargin: [],
        operatingMargin: [],
        netMargin: [],
    },
    loanAmortizationSchedule: [],
    timeBasedBreakEvenData: [],
    debtToEquityRatioSchedule: [],
};