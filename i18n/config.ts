

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const en = {
  "apiKeyError": "Gemini API key is not configured. Please set up the API_KEY environment variable in your deployment settings.",
  "common": {
    "cancel": "Cancel",
    "confirm": "Confirm",
    "none": "None",
    "select": "Select..."
  },
  "header": {
    "generateIdea": "Generate Idea",
    "newStudy": "New",
    "loadStudy": "Load",
    "saveStudy": "Save",
    "loadSample": "Load Sample"
  },
  "sidebar": {
    "title": "Modules",
    "m1": "Project Definition",
    "m2": "Estimation Basis",
    "m3": "Capital Investment",
    "m4": "Project Timeline",
    "m5": "Operating Inputs",
    "m6": "Financing / Loans",
    "m7": "Working Capital",
    "m8": "Cash Flow Statement",
    "m9": "Financial Evaluation",
    "m10": "Break-even Analysis",
    "m11": "Financial Ratios",
    "m12": "Sensitivity Analysis",
    "m13": "Monte Carlo Simulation",
    "m14": "Dashboard",
    "m15": "Custom Report",
    "m16": "Data Management"
  },
  "modals": {
    "generateIdea": {
      "title": "Generate a New Project Idea",
      "promptLabel": "Describe your project concept",
      "placeholder": "e.g., 'A modern coffee shop in the city center with a co-working space'",
      "generateButton": "Generate",
      "generatingButton": "Generating...",
      "error": "Failed to generate project. The AI may be unavailable or the response was invalid. Please try again.",
      "samplePrompts": {
        "title": "Or try one of our samples:",
        "prompts": [
          "A luxury boutique hotel in a historic downtown district. 50 rooms, a fine-dining restaurant, a rooftop bar, and spa services. Target market: high-end tourists and business travelers. The project will involve renovating a historic building.",
          "A subscription-based mobile app for farm-to-table grocery delivery. Focus on organic produce and local artisans. The business model involves partnerships with local farms, a small warehouse for sorting, and a fleet of electric delivery vans.",
          "An urban vertical farming facility producing leafy greens and herbs. The facility will use hydroponic systems and renewable energy. The business aims to supply local restaurants and supermarkets, reducing food miles and ensuring year-round availability."
        ]
      }
    }
  },
  "confirmations": {
    "newStudyTitle": "Start a New Study?",
    "newStudy": "Are you sure you want to start a new study? Any unsaved changes will be lost.",
    "newStudyConfirm": "Start New",
    "loadSampleTitle": "Load Sample Project?",
    "loadSample": "This will replace all current data with the sample project. Are you sure?",
    "loadSampleConfirm": "Load Sample",
    "deleteScenarioTitle": "Delete Scenario?",
    "deleteScenarioMessage": "Are you sure you want to delete this scenario? This action cannot be undone.",
    "deleteScenarioConfirm": "Delete"
  },
  "notifications": {
    "studySaved": "Study saved successfully as project.hosp",
    "studyLoaded": "Study loaded successfully.",
    "loadError": "Error loading file. Please ensure it is a valid .hosp file.",
    "sampleLoaded": "Sample project loaded successfully."
  },
   "welcome": {
    "title": "Welcome to FinFeasibility",
    "subtitle": "Your AI-powered financial planning co-pilot.",
    "uploadTitle": "Upload Study",
    "uploadDesc": "Load a .hosp file",
    "newTitle": "Start New Study",
    "newDesc": "Begin with a blank slate",
    "sampleTitle": "Load Sample Data",
    "sampleDesc": "Explore with pre-filled examples"
  },
  "m1_projectDefinition": {
    "title": "Project Definition",
    "projectName": "Project Name",
    "projectDescription": "Project Description",
    "descriptionPlaceholder": "Describe the core purpose and scope of the project.",
    "objectives": "Objectives",
    "objectivesPlaceholder": "List the key welfare outcomes or goals.",
    "partnersTitle": "Partners & Ownership",
    "partnerName": "Partner Name",
    "sharePercentage": "Share (%)",
    "actions": "Actions",
    "addPartner": "Add Partner",
    "totalShare": "Total Share",
    "shareError": "Total share must be 100%.",
    "ownershipChartTitle": "Ownership Distribution",
    "aiSummary": {
      "title": "AI Project Summary",
      "generateButton": "Generate Summary",
      "generating": "Generating...",
      "placeholder": "Click 'Generate Summary' to get an AI-powered overview of your project's definition and ownership structure.",
      "error": "Failed to generate summary. Please try again."
    },
    "baseCaseDescription": "Base Case Description",
    "baseCasePlaceholder": "Describe the current situation or the 'do-nothing' scenario.",
    "projectLocation": "Project Location",
    "latitude": "Latitude",
    "longitude": "Longitude",
    "geographicScope": "Geographic Scope",
    "stakeholders": "Stakeholders",
    "addStakeholder": "Add Stakeholder",
    "stakeholderPlaceholder": "e.g., Ministry of Health",
    "profitShareTitle": "Partner Profit Share (Year 1)",
    "partner": "Partner",
    "profitShare": "Profit Share",
    "noProfitData": "Profit data for Year 1 is not available.",
    "geographicScopeOptions": {
        "singleGov": "Single Governorate",
        "multiGov": "Multi Governorates Region",
        "wholeCountry": "Whole Country",
        "specificDistrict": "Specific District in a Governorate"
    },
    "mapModal": {
      "title": "Select Location on Map",
      "buttonLabel": "Select on Map",
      "prompt": "Click on the map to select a location.",
      "fetchingAddress": "Fetching address",
      "selectedAddress": "Selected Address"
    }
  },
  "m2_estimationBasis": {
    "title": "Estimation Basis",
    "currency": "Currency",
    "projectLife": "Project Life (years)",
    "discountRate": "Discount Rate (%)",
    "taxRate": "Tax Rate (%)",
    "inflationRate": "General Inflation Rate (%)",
    "revenueGrowthRate": "Revenue Growth Rate (%)",
    "variableCostGrowthRate": "Variable Cost Growth Rate (%)",
    "fixedCostGrowthRate": "Fixed Cost Growth Rate (%)",
    "depreciationMethod": "Depreciation Method",
    "straightLine": "Straight-line",
    "decliningBalance": "Declining Balance",
    "sumOfYearsDigits": "Sum-of-Years Digits",
    "workingCapitalPercentage": "Working Capital (% of Sales)",
    "initialCurrentAssets": "Initial Current Assets",
    "initialCurrentLiabilities": "Initial Current Liabilities",
    "initialInventory": "Initial Inventory",
    "ebitMultiple": "EBIT Multiple (for Terminal Value)",
    "discountRateTooltip": "The rate used to discount future cash flows to their present value.",
    "workingCapitalTooltip": "The percentage of annual sales held as working capital.",
    "initialCurrentAssetsTooltip": "The value of current assets (like cash, receivables) at the start of the project (Time 0).",
    "initialCurrentLiabilitiesTooltip": "The value of current liabilities (like accounts payable) at the start of the project (Time 0).",
    "initialInventoryTooltip": "The initial value of inventory required to start operations. This is often part of initial current assets.",
    "ebitMultipleTooltip": "A multiplier applied to the final year's EBIT to estimate the project's ongoing value after the projection period.",
    "inflationRateTooltip": "A general rate of inflation, which can be used as a default for specific growth rates.",
    "revenueGrowthRateTooltip": "The annual percentage increase expected for all revenue streams.",
    "variableCostGrowthRateTooltip": "The annual percentage increase for variable costs (e.g., Raw Materials).",
    "fixedCostGrowthRateTooltip": "The annual percentage increase for fixed costs (e.g., Labor, General & Admin).",
    "depreciationAndSalvageTitle": "Depreciation & Salvage Rates by Category",
    "depreciationRate": "Depreciation Rate (%)",
    "salvageValue": "Salvage Value (%)",
    "buildings": "Buildings",
    "machinery": "Machinery",
    "furniture": "Furniture",
    "equipment": "Equipment",
    "aiAnalysis": {
      "title": "AI Assumptions Analysis",
      "generateButton": "Analyze Assumptions",
      "generating": "Analyzing...",
      "placeholder": "Click 'Analyze Assumptions' to get an AI-powered feedback on your financial parameters for consistency and reasonableness.",
      "error": "Failed to generate analysis. Please try again."
    }
  },
  "m3_capitalInvestment": {
    "title": "Capital Investment",
    "categories": {
      "buildings": "Buildings",
      "machinery": "Machinery",
      "furniture": "Furniture",
      "equipment": "Equipment"
    },
    "table": {
      "item": "Item",
      "cost": "Cost",
      "timelineLink": "Timeline Link",
      "actions": "Actions"
    },
    "addItem": "Add Item",
    "noItems": "No items added for this category yet.",
    "capexChartTitle": "CAPEX by Category",
    "aiAnalysis": {
      "title": "AI CAPEX Analysis",
      "generateButton": "Analyze CAPEX",
      "generating": "Analyzing...",
      "placeholder": "Click 'Analyze CAPEX' to get an AI-powered summary of your top capital expenditures and investment focus.",
      "error": "Failed to generate analysis. Please try again."
    }
  },
  "m4_projectTimeline": {
    "title": "Project Timeline & Tasks",
    "ganttChartTitle": "Gantt Chart Visualization",
    "table": {
      "taskName": "Task Name",
      "startDate": "Start Date",
      "endDate": "End Date",
      "progress": "Progress (%)",
      "actions": "Actions"
    },
    "addTask": "Add Task",
    "noTasks": "No tasks have been added yet.",
    "noTasksForChart": "Add some tasks with valid dates to see the Gantt Chart.",
    "aiValidator": {
      "title": "AI Schedule Validator",
      "generateButton": "Validate Schedule",
      "generating": "Validating...",
      "placeholder": "Click 'Validate Schedule' to get an AI-powered analysis of your project timeline for logical errors and dependency issues.",
      "error": "Failed to validate schedule. Please try again."
    }
  },
  "m5_operatingInputs": {
    "title": "Operating Inputs",
    "categories": {
      "revenues": "Revenues",
      "rawMaterials": "Raw Materials",
      "labor": "Labor Costs",
      "admin": "General & Admin"
    },
    "table": {
      "item": "Item/Product",
      "cost": "Annual Cost",
      "unitPrice": "Unit Price",
      "quantity": "Annual Quantity",
      "totalRevenue": "Total Annual Revenue",
      "timelineLink": "Timeline Link",
      "actions": "Actions",
      "unitCost": "Unit Cost",
      "totalAnnualCost": "Total Annual Cost",
      "role": "Role / Title",
      "count": "# of Staff",
      "monthlySalary": "Monthly Salary"
    },
    "addRevenue": "Add Revenue Item",
    "addCost": "Add Cost Item",
    "noItems": "No items added for this category yet.",
    "costIncomeChartTitle": "Year 1: Revenue vs. Costs",
    "chart": {
      "revenue": "Total Revenue",
      "rawMaterials": "Raw Materials",
      "labor": "Labor",
      "admin": "General & Admin"
    },
    "aiAnalysis": {
      "title": "AI Operations Analysis",
      "generateButton": "Analyze Inputs",
      "generating": "Analyzing...",
      "placeholder": "Click 'Analyze Inputs' to get an AI-powered review of your revenue diversification and cost structure.",
      "error": "Failed to generate analysis. Please try again."
    }
  },
  "m6_financingLoans": {
    "title": "Financing / Loans",
    "table": {
      "source": "Source",
      "principal": "Principal Amount",
      "interestRate": "Interest Rate (%)",
      "termYears": "Term (Years)",
      "startYear": "Start Year",
      "actions": "Actions"
    },
    "addLoan": "Add Loan",
    "noLoans": "No loans added yet.",
    "amortizationScheduleTitle": "Consolidated Amortization Schedule",
    "individualAmortizationTitle": "Amortization Schedule: {{loanSource}}",
    "consolidated": "Consolidated",
    "amortizationTable": {
      "year": "Year",
      "openingBalance": "Opening Balance",
      "principalPaid": "Principal Paid",
      "interestPaid": "Interest Paid",
      "closingBalance": "Closing Balance"
    },
    "chartTitle": "Loan Amortization Schedule",
    "chart": {
      "principal": "Principal",
      "interest": "Interest",
      "year": "Year",
      "amount": "Amount"
    },
    "aiAnalysis": {
      "title": "AI Financing Analysis",
      "generateButton": "Analyze Financing",
      "generating": "Analyzing...",
      "placeholder": "Click 'Analyze Financing' to get an AI-powered review of your project's debt structure and repayment risks.",
      "error": "Failed to generate analysis. Please try again."
    }
  },
  "m7_workingCapital": {
    "title": "Working Capital Analysis",
    "description": "This table shows the projected working capital required based on annual revenues and initial inputs.",
    "table": {
        "year": "Year",
        "totalRevenue": "Total Revenue",
        "workingCapital": "Working Capital",
        "changeInWorkingCapital": "Change in Working Capital"
    },
    "noData": "Revenue data is required to calculate working capital. Please add items in the 'Operating Inputs' module.",
    "aiAnalysis": {
      "title": "AI Working Capital Analysis",
      "generateButton": "Analyze WC",
      "generating": "Analyzing...",
      "placeholder": "Click 'Analyze WC' to get an AI-powered interpretation of your working capital trends and their impact on cash flow.",
      "error": "Failed to generate analysis. Please try again."
    }
  },
  "m8_cashFlowStatement": {
    "title": "Cash Flow Statement",
    "description": "This statement projects the flow of cash from operating, investing, and financing activities.",
    "table": {
      "metric": "Metric",
      "revenue": "Total Revenue",
      "operatingCosts": "Total Operating Costs",
      "ebit": "EBIT (Earnings Before Interest & Tax)",
      "tax": "Tax",
      "nopat": "NOPAT (Net Operating Profit After Tax)",
      "depreciation": "Depreciation",
      "capex": "Capital Expenditures (CapEx)",
      "changeInWc": "Change in Working Capital",
      "unleveredFreeCashFlow": "Unlevered Free Cash Flow (UFCF)"
    },
    "noData": "Cash flow cannot be calculated. Please ensure all required input modules are filled out.",
    "chartTitle": "Unlevered Free Cash Flow (UFCF) per Year",
    "inflowOutflowChartTitle": "Annual Cash Inflows vs. Outflows",
    "chart": {
      "ufcf": "UFCF",
      "year": "Year",
      "amount": "Amount",
      "inflows": "Inflows (Revenue)",
      "outflows": "Outflows (Costs + CapEx + Tax)"
    },
    "aiAnalysis": {
      "title": "AI Cash Flow Analysis",
      "generateButton": "Analyze Cash Flow",
      "generating": "Analyzing...",
      "placeholder": "Click 'Analyze Cash Flow' to get an AI-powered summary of the project's financial trajectory and sustainability.",
      "error": "Failed to generate analysis. Please try again."
    }
  },
  "m9_financialEvaluation": {
    "title": "Financial Evaluation",
    "npvTitle": "Net Present Value (NPV)",
    "npvDescription": "Measures the profitability of an investment by calculating the present value of all future cash flows. A positive NPV indicates a profitable project.",
    "irrTitle": "Internal Rate of Return (IRR)",
    "irrDescription": "The discount rate at which the project's NPV becomes zero. It represents the project's expected annual rate of return. A higher IRR is generally better.",
    "roiTitle": "Return on Investment (ROI)",
    "roiDescription": "Measures the efficiency of an investment. It's the ratio of net profit over the project life to the initial investment cost.",
    "paybackPeriodTitle": "Payback Period",
    "paybackPeriodDescription": "The time required for the cumulative cash flows to equal the initial investment. A shorter period means lower risk.",
    "discountedPaybackPeriodTitle": "Discounted Payback Period",
    "discountedPaybackPeriodDescription": "Similar to the Payback Period, but uses discounted cash flows to account for the time value of money.",
    "breakEvenRevenueTitle": "Break-even Revenue (Y1)",
    "breakEvenRevenueDescription": "The total sales revenue required in the first year to cover all fixed and variable costs. This KPI is a key indicator of operational risk.",
    "gpmY1Title": "Gross Profit Margin (Y1)",
    "gpmY1Description": "The percentage of revenue left after subtracting the cost of goods sold (variable costs). Indicates production efficiency.",
    "opmY1Title": "Operating Profit Margin (Y1)",
    "opmY1Description": "The percentage of revenue left after all operating costs (variable and fixed, including depreciation) are subtracted. A measure of core business profitability.",
    "npmY1Title": "Net Profit Margin (Y1)",
    "npmY1Description": "The percentage of revenue remaining after all expenses, including interest and taxes, have been accounted for. The ultimate measure of profitability.",
    "deRatioTitle": "Debt-to-Equity Ratio",
    "deRatioDescription": "Measures the company's financial leverage by comparing total debt to total equity. Indicates how much of the initial project is financed by debt versus equity.",
    "daRatioTitle": "Debt-to-Assets Ratio",
    "daRatioDescription": "Indicates the proportion of a company's assets that are being financed through debt. A higher ratio indicates higher financial risk.",
    "currentRatioTitle": "Current Ratio (Year 0)",
    "currentRatioDescription": "Measures a company's ability to pay short-term obligations. A value above 1 is generally considered healthy. Calculated based on initial inputs.",
    "quickRatioTitle": "Quick Ratio (Year 0)",
    "quickRatioDescription": "Also known as the acid-test ratio, it measures the ability to pay current liabilities without relying on the sale of inventory.",
    "evTitle": "Enterprise Value (Terminal)",
    "evDescription": "An estimated value of the project's ongoing operations beyond the explicit forecast period, calculated using an EBIT multiple.",
    "dcfTitle": "DCF Valuation",
    "dcfDescription": "Discounted Cash Flow (DCF) valuation is the project's value based on its expected future cash flows. This is represented by the Net Present Value (NPV).",
    "noData": "Financial evaluation metrics cannot be calculated. Please ensure you have entered data for capital investments and operating inputs.",
    "notApplicable": "N/A",
    "notAchieved": "Not Achieved",
    "years": "Years",
    "aiVerdictTitle": "AI Executive Verdict",
    "generateVerdict": "Generate Verdict",
    "generating": "Generating...",
    "aiPlaceholder": "Click 'Generate Verdict' to get an AI-powered analysis of these financial indicators.",
    "aiError": "Failed to generate AI verdict. Please check the API configuration and try again.",
    "ratiosOverTimeChartTitle": "Ratio Over Time Trends"
  },
  "m10_breakEvenAnalysis": {
    "title": "Break-even Analysis (Year {{year}})",
    "description": "This analysis calculates the sales revenue needed to cover all costs in year {{year}} of operation. A low break-even point indicates lower risk.",
    "assumptionNote": "Note: 'Raw Materials' are treated as variable costs. 'Labor' and 'General & Admin' costs are treated as fixed costs.",
    "selectYear": "Select Year for Analysis",
    "kpi": {
      "breakEvenRevenue": "Break-even Revenue",
      "marginOfSafety": "Margin of Safety",
      "contributionMarginRatio": "Contribution Margin Ratio"
    },
    "calculationBasis": "Calculation Basis (Year {{year}})",
    "table": {
      "totalRevenue": "Total Revenue",
      "totalVariableCosts": "Total Variable Costs",
      "totalFixedCosts": "Total Fixed Costs"
    },
    "noData": "Break-even analysis cannot be performed. Please provide revenue and cost data in the 'Operating Inputs' module.",
    "chartTitle": "Break-even Point Visualization (Year {{year}})",
    "chart": {
      "quantityAxis": "Units Sold",
      "costsAxis": "Costs & Revenue",
      "totalCostsLine": "Total Costs",
      "fixedCostsLine": "Fixed Costs",
      "revenueLine": "Total Revenue",
      "cumulativeRevenue": "Cumulative Revenue",
      "cumulativeCosts": "Cumulative Costs"
    },
    "timeBasedTitle": "Time-based Break-even",
    "timeBasedDescription": "Visualizing cumulative revenue vs. cumulative costs over time.",
    "aiAnalysis": {
      "title": "AI Break-even Interpretation",
      "generateButton": "Interpret Results",
      "generating": "Interpreting...",
      "placeholder": "Click 'Interpret Results' to get an AI-powered analysis of the project's operational and investment risk.",
      "error": "Failed to generate analysis. Please try again."
    },
    "quantityAnalysisTitle": "Break-even Analysis by Quantity",
    "quantityTable": {
      "quantity": "Quantity",
      "fixedCosts": "Fixed Costs",
      "variableCosts": "Variable Costs",
      "totalCosts": "Total Costs",
      "totalRevenues": "Total Revenues",
      "profitLoss": "Profit/Loss"
    },
    "productAnalysisTitle": "Break-even Analysis by Product/Service",
    "productTable": {
      "product": "Product",
      "contributionMarginPerUnit": "Contribution Margin per Unit",
      "breakEvenUnits": "Break-even Units"
    }
  },
  "m11_financialRatios": {
    "title": "Financial Ratios",
    "description": "This table shows key profitability ratios over the life of the project, giving insight into its financial performance and efficiency.",
    "table": {
      "metric": "Metric",
      "grossProfitMargin": "Gross Profit Margin",
      "operatingProfitMargin": "Operating Profit Margin",
      "netProfitMargin": "Net Profit Margin"
    },
    "noData": "Financial ratios cannot be calculated. Please ensure operating inputs are filled out.",
    "chartTitle": "Profitability Ratios Over Time",
    "chart": {
      "yAxis": "Margin (%)",
      "xAxis": "Year"
    },
    "aiAnalysis": {
      "title": "AI Ratio Analysis",
      "generateButton": "Analyze Ratios",
      "generating": "Analyzing...",
      "placeholder": "Click 'Analyze Ratios' to get an AI-powered interpretation of profitability trends.",
      "error": "Failed to generate analysis. Please try again."
    }
  },
  "m12_sensitivityAnalysis": {
    "title": "Sensitivity Analysis",
    "description": "Analyze how changes in key financial assumptions impact the project's outcomes. Create different scenarios to compare results against the base case.",
    "manageScenariosTitle": "Manage Scenarios",
    "addScenario": "Add Scenario",
    "scenarioNamePlaceholder": "Scenario Name (e.g., Optimistic)",
    "editScenarioTitle": "Edit Scenario Parameters",
    "selectScenarioPrompt": "Select a scenario from the list to start editing its parameters.",
    "resultsComparisonTitle": "Results Comparison",
    "baseCase": "Base Case",
    "kpi": "KPI",
    "aiSummary": {
      "title": "AI Sensitivity Interpretation",
      "generateButton": "Analyze Scenarios",
      "generating": "Analyzing...",
      "placeholder": "Create at least one scenario, then click 'Analyze Scenarios' to get an AI-powered interpretation of the results.",
      "error": "Failed to generate AI analysis. Please try again."
    },
    "tornadoTitle": "Local Sensitivity Analysis",
    "tornadoSubtitle": "% Change in Output for ±10% Change in Input Variables",
    "selectKpi": "Select KPI to Analyze",
    "inputVariablesAxis": "Input Variables",
    "outputChangeAxis": "Output Change (%)",
    "variables": {
      "investmentCost": "Investment Cost",
      "revenue": "Revenue",
      "variableCosts": "Variable Costs",
      "fixedCosts": "Fixed Costs",
      "discountRate": "Discount Rate"
    }
  },
  "m13_monteCarloSimulation": {
    "title": "Monte Carlo Simulation",
    "description": "Run a simulation to understand the impact of uncertainty on project outcomes. Configure variables with statistical distributions to generate a range of possible results.",
    "setupTitle": "Simulation Setup",
    "iterationsLabel": "Number of Iterations",
    "runButton": "Run Simulation",
    "runningButton": "Running Simulation...",
    "variablesTitle": "Define Uncertain Variables",
    "table": {
      "variable": "Variable",
      "distribution": "Distribution",
      "parameters": "Parameters"
    },
    "distributions": {
      "None": "None (Fixed)",
      "Normal": "Normal",
      "Uniform": "Uniform",
      "Triangular": "Triangular",
      "Lognormal": "Lognormal",
      "Beta": "Beta",
      "PERT": "PERT",
      "paramLabels": {
        "Normal": { "p1": "Mean", "p2": "Std Dev" },
        "Uniform": { "p1": "Min", "p2": "Max" },
        "Triangular": { "p1": "Min", "p2": "Most Likely", "p3": "Max" },
        "Lognormal": { "p1": "Log Mean", "p2": "Log Std Dev" },
        "Beta": { "p1": "Alpha", "p2": "Beta" },
        "PERT": { "p1": "Min", "p2": "Most Likely", "p3": "Max" }
      }
    },
    "resultsTitle": "Simulation Results",
    "resultsTable": {
      "kpi": "KPI",
      "mean": "Mean",
      "median": "Median",
      "stdDev": "Std. Dev.",
      "p10": "P10",
      "p25": "P25",
      "p75": "P75",
      "p90": "P90"
    },
    "probabilitiesTitle": "Probabilities",
    "probNPVPositive": "Probability NPV > 0",
    "probIRRgtDiscount": "Probability IRR > Discount Rate",
    "noResults": "No simulation results yet. Configure and run a simulation to see the outcome.",
    "simulationInProgress": "Simulation in progress...",
    "visualizationTitle": "Results Visualization",
    "visualizeKpi": "Visualize KPI",
    "chartType": "Chart Type",
    "histogram": "Histogram (PDF)",
    "cdf": "Cumulative (CDF)",
    "frequency": "Frequency",
    "normalCurve": "Normal Curve",
    "cumulativeProbability": "Cumulative Probability",
    "distributionTitle": "{{kpi}} Distribution",
    "cdfTitle": "{{kpi}} Cumulative Distribution (CDF)",
    "aiSummary": {
      "title": "AI Risk Analysis",
      "generateButton": "Generate Analysis",
      "generating": "Analyzing Results...",
      "placeholder": "After the simulation is complete, click 'Generate Analysis' to get an AI-powered interpretation of the risk profile.",
      "error": "Failed to generate AI analysis. Please try again."
    }
  },
  "m14_dashboard": {
    "title": "Dashboard",
    "welcomeTitle": "Welcome to FinFeasibility!",
    "welcomeMessage": "Start by generating a new project idea, loading a sample project, or uploading your own study file using the buttons in the header. You can also begin entering data manually in the modules on the left.",
    "kpiTitle": "Key Performance Indicators",
    "trendsTitle": "Financial Trends",
    "capexTitle": "Capital Expenditure Breakdown",
    "trendsChart": {
        "revenue": "Revenue",
        "costs": "Operating Costs",
        "profit": "Net Profit (NOPAT)"
    },
    "aiSummary": {
      "title": "AI Executive Summary",
      "generateButton": "Generate Summary",
      "generating": "Analyzing...",
      "placeholder": "Click 'Generate Summary' to get a high-level overview of the project's financial health and key trends.",
      "error": "Failed to generate AI summary. Please try again."
    }
  },
  "m15_customReport": {
    "title": "Custom Report Builder",
    "description": "Select the modules you want to include in your final report. The report will be generated with the latest data and AI insights.",
    "previewReportButton": "Preview Report",
    "generatingPreviewButton": "Generating Preview...",
    "exportPdfButton": "Export to PDF",
    "exportingPdfButton": "Exporting PDF...",
    "exportDocxButton": "Export to DOCX",
    "exportingDocxButton": "Exporting DOCX...",
    "status": {
      "starting": "Starting report generation...",
      "generatingAI": "Generating AI summary for: {{section}}",
      "capturingCharts": "Capturing charts...",
      "assembling": "Assembling document...",
      "done": "Document generated successfully!"
    },
    "sectionsTitle": "Select Report Sections",
    "selectAll": "Select All",
    "deselectAll": "Deselect All"
  },
  "m16_dataManagement": {
    "title": "Data Management Guide",
    "description": "This application provides several ways to manage your project data. All functions are located in the application header at the top of the page.",
    "functions": {
      "newStudy": "New Study",
      "newStudyDesc": "Clears all current data and starts a fresh, empty project.",
      "loadSample": "Load Sample Data",
      "loadSampleDesc": "Loads a pre-built, realistic sample project to demonstrate the application's features.",
      "loadStudy": "Load Study",
      "loadStudyDesc": "Opens a file dialog to upload a previously saved project file (.hosp).",
      "saveStudy": "Save Study",
      "saveStudyDesc": "Downloads all of your current project data into a single file with a '.hosp' extension."
    }
  },
  "aiTransform": {
    "toolbarTitle": "Transform:",
    "rewrite": "Rewrite",
    "formal": "Make Formal",
    "summarize": "Summarize",
    "longer": "Make Longer",
    "translate": "Translate",
    "error": "Failed to transform text."
  }
};

const ar = {
  "apiKeyError": "مفتاح Gemini API غير مهيأ. يرجى إعداد متغير البيئة API_KEY في إعدادات النشر الخاصة بك.",
  "common": {
    "cancel": "إلغاء",
    "confirm": "تأكيد",
    "none": "لا شيء",
    "select": "اختر..."
  },
  "header": {
    "generateIdea": "توليد فكرة",
    "newStudy": "جديد",
    "loadStudy": "تحميل",
    "saveStudy": "حفظ",
    "loadSample": "تحميل عينة"
  },
  "sidebar": {
    "title": "الوحدات",
    "m1": "تعريف المشروع",
    "m2": "أساس التقدير",
    "m3": "الاستثمار الرأسمالي",
    "m4": "الجدول الزمني للمشروع",
    "m5": "مدخلات التشغيل",
    "m6": "التمويل / القروض",
    "m7": "رأس المال العامل",
    "m8": "قائمة التدفقات النقدية",
    "m9": "التقييم المالي",
    "m10": "تحليل نقطة التعادل",
    "m11": "النسب المالية",
    "m12": "تحليل الحساسية",
    "m13": "محاكاة مونت كارلو",
    "m14": "لوحة المعلومات",
    "m15": "تقرير مخصص",
    "m16": "إدارة البيانات"
  },
  "modals": {
    "generateIdea": {
      "title": "توليد فكرة مشروع جديد",
      "promptLabel": "صف مفهوم مشروعك",
      "placeholder": "مثال: 'مقهى حديث في وسط المدينة مع مساحة عمل مشتركة'",
      "generateButton": "توليد",
      "generatingButton": "جاري التوليد...",
      "error": "فشل توليد المشروع. قد تكون خدمة الذكاء الاصطناعي غير متاحة أو كانت الاستجابة غير صالحة. يرجى المحاولة مرة أخرى.",
       "samplePrompts": {
        "title": "أو جرب إحدى عيناتنا:",
        "prompts": [
          "فندق بوتيك فاخر في منطقة وسط المدينة التاريخية. يضم 50 غرفة ومطعمًا فاخرًا وبارًا على السطح وخدمات سبا. يستهدف السياح من الدرجة الأولى ورجال الأعمال. يتضمن المشروع تجديد مبنى تاريخي.",
          "تطبيق جوال قائم على الاشتراك لتوصيل البقالة من المزرعة إلى المائدة. يركز على المنتجات العضوية والحرفيين المحليين. يعتمد نموذج العمل على شراكات مع المزارع المحلية ومستودع صغير للفرز وأسطول من شاحنات التوصيل الكهربائية.",
          "منشأة زراعة عمودية حضرية لإنتاج الخضروات الورقية والأعشاب. ستستخدم المنشأة أنظمة الزراعة المائية والطاقة المتجددة. تهدف الشركة إلى تزويد المطاعم ومحلات السوبر ماركت المحلية، مما يقلل من أميال الغذاء ويضمن التوافر على مدار العام."
        ]
      }
    }
  },
  "confirmations": {
    "newStudyTitle": "بدء دراسة جديدة؟",
    "newStudy": "هل أنت متأكد أنك تريد بدء دراسة جديدة؟ ستفقد أي تغييرات غير محفوظة.",
    "newStudyConfirm": "بدء جديد",
    "loadSampleTitle": "تحميل مشروع نموذجي؟",
    "loadSample": "سيؤدي هذا إلى استبدال جميع البيانات الحالية بالمشروع النموجي. هل أنت متأكد؟",
    "loadSampleConfirm": "تحميل العينة",
    "deleteScenarioTitle": "حذف السيناريو؟",
    "deleteScenarioMessage": "هل أنت متأكد أنك تريد حذف هذا السيناريو؟ لا يمكن التراجع عن هذا الإجراء.",
    "deleteScenarioConfirm": "حذف"
  },
  "notifications": {
    "studySaved": "تم حفظ الدراسة بنجاح باسم project.hosp",
    "studyLoaded": "تم تحميل الدراسة بنجاح.",
    "loadError": "خطأ في تحميل الملف. يرجى التأكد من أنه ملف .hosp صالح.",
    "sampleLoaded": "تم تحميل المشروع النموذجي بنجاح."
  },
  "welcome": {
    "title": "أهلاً بك في FinFeasibility",
    "subtitle": "مساعدك المالي المدعوم بالذكاء الاصطناعي.",
    "uploadTitle": "تحميل دراسة",
    "uploadDesc": "تحميل ملف بصيغة .hosp",
    "newTitle": "بدء دراسة جديدة",
    "newDesc": "ابدأ بصفحة فارغة",
    "sampleTitle": "تحميل بيانات العينة",
    "sampleDesc": "استكشف بمثال جاهز"
  },
  "m1_projectDefinition": {
    "title": "تعريف المشروع",
    "projectName": "اسم المشروع",
    "projectDescription": "وصف المشروع",
    "descriptionPlaceholder": "صف الغرض الأساسي ونطاق المشروع.",
    "objectives": "الأهداف",
    "objectivesPlaceholder": "اذكر النتائج أو الأهداف الرئيسية للمنفعة العامة.",
    "partnersTitle": "الشركاء والملكية",
    "partnerName": "اسم الشريك",
    "sharePercentage": "الحصة (%)",
    "actions": "إجراءات",
    "addPartner": "إضافة شريك",
    "totalShare": "إجمالي الحصص",
    "shareError": "يجب أن يكون إجمالي الحصص 100٪.",
    "ownershipChartTitle": "توزيع الملكية",
    "aiSummary": {
      "title": "ملخص المشروع بالذكاء الاصطناعي",
      "generateButton": "توليد الملخص",
      "generating": "جاري التوليد...",
      "placeholder": "انقر على 'توليد الملخص' للحصول على نظرة عامة مدعومة بالذكاء الاصطناعي لتعريف مشروعك وهيكل الملكية.",
      "error": "فشل توليد الملخص. يرجى المحاولة مرة أخرى."
    },
    "baseCaseDescription": "وصف الحالة الأساسية",
    "baseCasePlaceholder": "صف الوضع الحالي أو سيناريو 'عدم فعل شيء'.",
    "projectLocation": "موقع المشروع",
    "latitude": "خط العرض",
    "longitude": "خط الطول",
    "geographicScope": "النطاق الجغرافي",
    "stakeholders": "الأطراف المعنية",
    "addStakeholder": "إضافة طرف معني",
    "stakeholderPlaceholder": "مثال: وزارة الصحة",
    "profitShareTitle": "حصة الشركاء من الأرباح (السنة الأولى)",
    "partner": "الشريك",
    "profitShare": "حصة الربح",
    "noProfitData": "بيانات الأرباح للسنة الأولى غير متوفرة.",
    "geographicScopeOptions": {
        "singleGov": "محافظة واحدة",
        "multiGov": "منطقة متعددة المحافظات",
        "wholeCountry": "كامل الدولة",
        "specificDistrict": "منطقة معينة في محافظة"
    },
    "mapModal": {
      "title": "اختر الموقع على الخريطة",
      "buttonLabel": "اختر على الخريطة",
      "prompt": "انقر على الخريطة لاختيار موقع.",
      "fetchingAddress": "جاري جلب العنوان",
      "selectedAddress": "العنوان المحدد"
    }
  },
  "m2_estimationBasis": {
    "title": "أساس التقدير",
    "currency": "العملة",
    "projectLife": "عمر المشروع (سنوات)",
    "discountRate": "معدل الخصم (%)",
    "taxRate": "معدل الضريبة (%)",
    "inflationRate": "معدل التضخم العام (%)",
    "revenueGrowthRate": "معدل نمو الإيرادات (%)",
    "variableCostGrowthRate": "معدل نمو التكاليف المتغيرة (%)",
    "fixedCostGrowthRate": "معدل نمو التكاليف الثابتة (%)",
    "depreciationMethod": "طريقة الإهلاك",
    "straightLine": "القسط الثابت",
    "decliningBalance": "القسط المتناقص",
    "sumOfYearsDigits": "مجموع أرقام السنوات",
    "workingCapitalPercentage": "رأس المال العامل (% من المبيعات)",
    "initialCurrentAssets": "الأصول المتداولة الأولية",
    "initialCurrentLiabilities": "الخصوم المتداولة الأولية",
    "initialInventory": "المخزون الأولي",
    "ebitMultiple": "مضاعف الربح قبل الفوائد والضرائب (للقيمة النهائية)",
    "discountRateTooltip": "المعدل المستخدم لخصم التدفقات النقدية المستقبلية إلى قيمتها الحالية.",
    "workingCapitalTooltip": "النسبة المئوية من المبيعات السنوية المحتفظ بها كرأس مال عامل.",
    "initialCurrentAssetsTooltip": "قيمة الأصول المتداولة (مثل النقد والذمم المدينة) في بداية المشروع (الوقت 0).",
    "initialCurrentLiabilitiesTooltip": "قيمة الخصوم المتداولة (مثل حسابات الدائنين) في بداية المشروع (الوقت 0).",
    "initialInventoryTooltip": "القيمة الأولية للمخزون اللازمة لبدء العمليات. غالبًا ما يكون هذا جزءًا من الأصول المتداولة الأولية.",
    "ebitMultipleTooltip": "مضاعف يتم تطبيقه على الربح قبل الفوائد والضرائب للسنة الأخيرة لتقدير القيمة المستمرة للمشروع بعد فترة التوقع.",
    "inflationRateTooltip": "معدل تضخم عام، يمكن استخدامه كقيمة افتراضية لمعدلات النمو المحددة.",
    "revenueGrowthRateTooltip": "الزيادة السنوية المتوقعة لجميع مصادر الإيرادات.",
    "variableCostGrowthRateTooltip": "الزيادة السنوية للتكاليف المتغيرة (مثل المواد الخام).",
    "fixedCostGrowthRateTooltip": "الزيادة السنوية للتكاليف الثابتة (مثل العمالة، والمصاريف الإدارية).",
    "depreciationAndSalvageTitle": "معدلات الإهلاك وقيم الخردة حسب الفئة",
    "depreciationRate": "معدل الإهلاك (%)",
    "salvageValue": "قيمة الخردة (%)",
    "buildings": "المباني",
    "machinery": "الآلات",
    "furniture": "الأثاث",
    "equipment": "المعدات",
    "aiAnalysis": {
      "title": "تحليل الافتراضات بالذكاء الاصطناعي",
      "generateButton": "تحليل الافتراضات",
      "generating": "جاري التحليل...",
      "placeholder": "انقر على 'تحليل الافتراضات' للحصول على ملاحظات مدعومة بالذكاء الاصطناعي حول المعلمات المالية الخاصة بك من حيث الاتساق والمعقولية.",
      "error": "فشل توليد التحليل. يرجى المحاولة مرة أخرى."
    }
  },
  "m3_capitalInvestment": {
    "title": "الاستثمار الرأسمالي",
    "categories": {
      "buildings": "المباني",
      "machinery": "الآلات",
      "furniture": "الأثاث",
      "equipment": "المعدات"
    },
    "table": {
      "item": "البند",
      "cost": "التكلفة",
      "timelineLink": "رابط الجدول الزمني",
      "actions": "إجراءات"
    },
    "addItem": "إضافة بند",
    "noItems": "لم تتم إضافة أي بنود لهذه الفئة بعد.",
    "capexChartTitle": "الإنفاق الرأسمالي حسب الفئة",
    "aiAnalysis": {
      "title": "تحليل الإنفاق الرأسمالي بالذكاء الاصطناعي",
      "generateButton": "تحليل الإنفاق",
      "generating": "جاري التحليل...",
      "placeholder": "انقر على 'تحليل الإنفاق' للحصول على ملخص مدعوم بالذكاء الاصطناعي لأهم نفقاتك الرأسمالية وتركيز استثماراتك.",
      "error": "فشل توليد التحليل. يرجى المحاولة مرة أخرى."
    }
  },
  "m4_projectTimeline": {
    "title": "الجدول الزمني للمشروع والمهام",
    "ganttChartTitle": "مخطط جانت البياني",
    "table": {
      "taskName": "اسم المهمة",
      "startDate": "تاريخ البدء",
      "endDate": "تاريخ الانتهاء",
      "progress": "التقدم (%)",
      "actions": "إجراءات"
    },
    "addTask": "إضافة مهمة",
    "noTasks": "لم تتم إضافة أي مهام بعد.",
    "noTasksForChart": "أضف بعض المهام بتواريخ صالحة لرؤية مخطط جانت.",
    "aiValidator": {
      "title": "مدقق الجدول الزمني بالذكاء الاصطناعي",
      "generateButton": "تدقيق الجدول",
      "generating": "جاري التدقيق...",
      "placeholder": "انقر على 'تدقيق الجدول' للحصول على تحليل مدعوم بالذكاء الاصطناعي للجدول الزمني لمشروعك بحثًا عن الأخطاء المنطقية ومشاكل التبعية.",
      "error": "فشل تدقيق الجدول الزمني. يرجى المحاولة مرة أخرى."
    }
  },
  "m5_operatingInputs": {
    "title": "مدخلات التشغيل",
    "categories": {
      "revenues": "الإيرادات",
      "rawMaterials": "المواد الخام",
      "labor": "تكاليف العمالة",
      "admin": "عمومية وإدارية"
    },
    "table": {
      "item": "البند/المنتج",
      "cost": "التكلفة السنوية",
      "unitPrice": "سعر الوحدة",
      "quantity": "الكمية السنوية",
      "totalRevenue": "إجمالي الإيرادات السنوية",
      "timelineLink": "رابط الجدول الزمني",
      "actions": "إجراءات",
      "unitCost": "تكلفة الوحدة",
      "totalAnnualCost": "إجمالي التكلفة السنوية",
      "role": "الدور / المسمى الوظيفي",
      "count": "عدد الموظفين",
      "monthlySalary": "الراتب الشهري"
    },
    "addRevenue": "إضافة بند إيراد",
    "addCost": "إضافة بند تكلفة",
    "noItems": "لم تتم إضافة أي بنود لهذه الفئة بعد.",
    "costIncomeChartTitle": "السنة 1: الإيرادات مقابل التكاليف",
    "chart": {
      "revenue": "إجمالي الإيرادات",
      "rawMaterials": "المواد الخام",
      "labor": "العمالة",
      "admin": "إدارية وعمومية"
    },
    "aiAnalysis": {
      "title": "تحليل العمليات بالذكاء الاصطناعي",
      "generateButton": "تحليل المدخلات",
      "generating": "جاري التحليل...",
      "placeholder": "انقر على 'تحليل المدخلات' للحصول على مراجعة مدعومة بالذكاء الاصطناعي لتنويع إيراداتك وهيكل التكاليف.",
      "error": "فشل توليد التحليل. يرجى المحاولة مرة أخرى."
    }
  },
  "m6_financingLoans": {
    "title": "التمويل / القروض",
    "table": {
      "source": "المصدر",
      "principal": "المبلغ الأساسي",
      "interestRate": "معدل الفائدة (%)",
      "termYears": "المدة (سنوات)",
      "startYear": "سنة البدء",
      "actions": "إجراءات"
    },
    "addLoan": "إضافة قرض",
    "noLoans": "لم تتم إضافة أي قروض بعد.",
    "amortizationScheduleTitle": "جدول سداد القروض الموحد",
    "individualAmortizationTitle": "جدول السداد: {{loanSource}}",
    "consolidated": "عرض موحد",
    "amortizationTable": {
      "year": "السنة",
      "openingBalance": "الرصيد الافتتاحي",
      "principalPaid": "الأصل المدفوع",
      "interestPaid": "الفائدة المدفوعة",
      "closingBalance": "الرصيد الختامي"
    },
    "chartTitle": "جدول سداد القرض",
    "chart": {
      "principal": "الأصل",
      "interest": "الفائدة",
      "year": "السنة",
      "amount": "المبلغ"
    },
    "aiAnalysis": {
      "title": "تحليل التمويل بالذكاء الاصطناعي",
      "generateButton": "تحليل التمويل",
      "generating": "جاري التحليل...",
      "placeholder": "انقر على 'تحليل التمويل' للحصول على مراجعة مدعومة بالذكاء الاصطناعي لهيكل ديون مشروعك ومخاطر السداد.",
      "error": "فشل توليد التحليل. يرجى المحاولة مرة أخرى."
    }
  },
  "m7_workingCapital": {
    "title": "تحليل رأس المال العامل",
    "description": "يوضح هذا الجدول رأس المال العامل المتوقع المطلوب بناءً على الإيرادات السنوية والمدخلات الأولية.",
    "table": {
      "year": "السنة",
      "totalRevenue": "إجمالي الإيرادات",
      "workingCapital": "رأس المال العامل",
      "changeInWorkingCapital": "التغير في رأس المال العامل"
    },
    "noData": "بيانات الإيرادات مطلوبة لحساب رأس المال العامل. يرجى إضافة بنود في وحدة 'مدخلات التشغيل'.",
    "aiAnalysis": {
      "title": "تحليل رأس المال العامل بالذكاء الاصطناعي",
      "generateButton": "تحليل رأس المال",
      "generating": "جاري التحليل...",
      "placeholder": "انقر على 'تحليل رأس المال' للحصول على تفسير مدعوم بالذكاء الاصطناعي لاتجاهات رأس المال العامل وتأثيرها على التدفق النقدي.",
      "error": "فشل توليد التحليل. يرجى المحاولة مرة أخرى."
    }
  },
  "m8_cashFlowStatement": {
    "title": "قائمة التدفقات النقدية",
    "description": "تتوقع هذه القائمة تدفق النقد من الأنشطة التشغيلية والاستثمارية والتمويلية.",
    "table": {
      "metric": "المؤشر",
      "revenue": "إجمالي الإيرادات",
      "operatingCosts": "إجمالي تكاليف التشغيل",
      "ebit": "الربح قبل الفوائد والضرائب",
      "tax": "الضريبة",
      "nopat": "صافي ربح التشغيل بعد الضريبة",
      "depreciation": "الإهلاك",
      "capex": "النفقات الرأسمالية",
      "changeInWc": "التغير في رأس المال العامل",
      "unleveredFreeCashFlow": "التدفق النقدي الحر غير المعتمد على الرافعة المالية"
    },
    "noData": "لا يمكن حساب التدفق النقدي. يرجى التأكد من ملء جميع وحدات الإدخال المطلوبة.",
    "chartTitle": "التدفق النقدي الحر غير المعتمد على الرافعة المالية (UFCF) لكل سنة",
    "inflowOutflowChartTitle": "التدفقات النقدية السنوية الداخلة مقابل الخارجة",
    "chart": {
      "ufcf": "التدفق النقدي الحر",
      "year": "السنة",
      "amount": "المبلغ",
      "inflows": "التدفقات الداخلة (الإيرادات)",
      "outflows": "التدفقات الخارجة (التكاليف + الإنفاق الرأسمالي + الضرائب)"
    },
    "aiAnalysis": {
      "title": "تحليل التدفق النقدي بالذكاء الاصطناعي",
      "generateButton": "تحليل التدفق النقدي",
      "generating": "جاري التحليل...",
      "placeholder": "انقر على 'تحليل التدفق النقدي' للحصول على ملخص مدعوم بالذكاء الاصطناعي للمسار المالي للمشروع واستدامته.",
      "error": "فشل توليد التحليل. يرجى المحاولة مرة أخرى."
    }
  },
  "m9_financialEvaluation": {
    "title": "التقييم المالي",
    "npvTitle": "صافي القيمة الحالية (NPV)",
    "npvDescription": "يقيس ربحية الاستثمار عن طريق حساب القيمة الحالية لجميع التدفقات النقدية المستقبلية. يشير صافي القيمة الحالية الإيجابي إلى مشروع مربح.",
    "irrTitle": "معدل العائد الداخلي (IRR)",
    "irrDescription": "معدل الخصم الذي يصبح عنده صافي القيمة الحالية للمشروع صفرًا. يمثل معدل العائد السنوي المتوقع للمشروع. كلما ارتفع معدل العائد الداخلي كان أفضل بشكل عام.",
    "roiTitle": "العائد على الاستثمار (ROI)",
    "roiDescription": "يقيس كفاءة الاستثمار. وهو نسبة صافي الربح على مدى عمر المشروع إلى تكلفة الاستثمار الأولية.",
    "paybackPeriodTitle": "فترة الاسترداد",
    "paybackPeriodDescription": "الوقت اللازم لتساوي التدفقات النقدية التراكمية مع الاستثمار الأولي. فترة أقصر تعني مخاطر أقل.",
    "discountedPaybackPeriodTitle": "فترة الاسترداد المخصومة",
    "discountedPaybackPeriodDescription": "على غرار فترة الاسترداد، ولكنها تستخدم التدفقات النقدية المخصومة لمراعاة القيمة الزمنية للنقود.",
    "breakEvenRevenueTitle": "إيرادات نقطة التعادل (س1)",
    "breakEvenRevenueDescription": "إجمالي إيرادات المبيعات المطلوبة في السنة الأولى لتغطية جميع التكاليف الثابتة والمتغيرة. هذا المؤشر هو مؤشر رئيسي للمخاطر التشغيلية.",
    "gpmY1Title": "هامش الربح الإجمالي (س1)",
    "gpmY1Description": "النسبة المئوية من الإيرادات المتبقية بعد طرح تكلفة البضائع المباعة (التكاليف المتغيرة). يشير إلى كفاءة الإنتاج.",
    "opmY1Title": "هامش الربح التشغيلي (س1)",
    "opmY1Description": "النسبة المئوية من الإيرادات المتبقية بعد طرح جميع تكاليف التشغيل (المتغيرة والثابتة، بما في ذلك الإهلاك). مقياس لربحية النشاط الأساسي.",
    "npmY1Title": "هامش صافي الربح (س1)",
    "npmY1Description": "النسبة المئوية من الإيرادات المتبقية بعد حساب جميع النفقات، بما في ذلك الفوائد والضرائب. المقياس النهائي للربحية.",
    "deRatioTitle": "نسبة الدين إلى حقوق الملكية",
    "deRatioDescription": "تقيس الرافعة المالية للشركة من خلال مقارنة إجمالي الدين بإجمالي حقوق الملكية. تشير إلى مقدار تمويل المشروع الأولي عن طريق الدين مقابل حقوق الملكية.",
    "daRatioTitle": "نسبة الدين إلى الأصول",
    "daRatioDescription": "تشير إلى نسبة أصول الشركة التي يتم تمويلها عن طريق الديون. نسبة أعلى تشير إلى مخاطر مالية أعلى.",
    "currentRatioTitle": "النسبة الحالية (السنة 0)",
    "currentRatioDescription": "تقيس قدرة الشركة على سداد الالتزامات قصيرة الأجل. تعتبر القيمة فوق 1 صحية بشكل عام. محسوبة بناءً على المدخلات الأولية.",
    "quickRatioTitle": "النسبة السريعة (السنة 0)",
    "quickRatioDescription": "تُعرف أيضًا بنسبة الاختبار الحمضي، وتقيس القدرة على سداد الالتزامات الحالية دون الاعتماد على بيع المخزون.",
    "evTitle": "قيمة المنشأة (النهائية)",
    "evDescription": "قيمة تقديرية للعمليات الجارية للمشروع بعد فترة التنبؤ الصريحة، محسوبة باستخدام مضاعف الربح قبل الفوائد والضرائب.",
    "dcfTitle": "تقييم التدفقات النقدية المخصومة",
    "dcfDescription": "تقييم التدفقات النقدية المخصومة (DCF) هو قيمة المشروع بناءً na تدفقاته النقدية المستقبلية المتوقعة. يتم تمثيل هذا بصافي القيمة الحالية (NPV).",
    "noData": "لا يمكن حساب مقاييس التقييم المالي. يرجى التأكد من إدخال بيانات للاستثمارات الرأسمالية ومدخلات التشغيل.",
    "notApplicable": "غير متاح",
    "notAchieved": "لم يتحقق",
    "years": "سنوات",
    "aiVerdictTitle": "الحكم التنفيذي بالذكاء الاصطناعي",
    "generateVerdict": "توليد الحكم",
    "generating": "جاري التوليد...",
    "aiPlaceholder": "انقر على 'توليد الحكم' للحصول على تحليل مدعوم بالذكاء الاصطناعي لهذه المؤشرات المالية.",
    "aiError": "فشل توليد حكم الذكاء الاصطناعي. يرجى التحقق من تكوين الواجهة البرمجية والمحاولة مرة أخرى.",
    "ratiosOverTimeChartTitle": "اتجاهات النسب المالية مع مرور الوقت"
  },
  "m10_breakEvenAnalysis": {
    "title": "تحليل نقطة التعادل (السنة {{year}})",
    "description": "يحلل هذا التحليل إيرادات المبيعات اللازمة لتغطية جميع التكاليف في السنة {{year}} من التشغيل. نقطة تعادل منخفضة تشير إلى مخاطر أقل.",
    "assumptionNote": "ملاحظة: تُعامل 'المواد الخام' كتكاليف متغيرة. وتُعامل تكاليف 'العمالة' و 'الإدارية والعمومية' كتكاليف ثابتة.",
    "selectYear": "اختر سنة التحليل",
    "kpi": {
      "breakEvenRevenue": "إيرادات نقطة التعادل",
      "marginOfSafety": "هامش الأمان",
      "contributionMarginRatio": "نسبة هامش المساهمة"
    },
    "calculationBasis": "أساس الحساب (السنة {{year}})",
    "table": {
      "totalRevenue": "إجمالي الإيرادات",
      "totalVariableCosts": "إجمالي التكاليف المتغيرة",
      "totalFixedCosts": "إجمالي التكاليف الثابتة"
    },
    "noData": "لا يمكن إجراء تحليل نقطة التعادل. يرجى تقديم بيانات الإيرادات والتكاليف في وحدة 'مدخلات التشغيل'.",
    "chartTitle": "تصور نقطة التعادل (السنة {{year}})",
    "chart": {
      "quantityAxis": "الوحدات المباعة",
      "costsAxis": "التكاليف والإيرادات",
      "totalCostsLine": "إجمالي التكاليف",
      "fixedCostsLine": "التكاليف الثابتة",
      "revenueLine": "إجمالي الإيرادات",
      "cumulativeRevenue": "الإيرادات التراكمية",
      "cumulativeCosts": "التكاليف التراكمية"
    },
    "timeBasedTitle": "نقطة التعادل المستندة إلى الزمن",
    "timeBasedDescription": "تصور الإيرادات التراكمية مقابل التكاليف التراكمية مع مرور الوقت.",
    "aiAnalysis": {
      "title": "تفسير نقطة التعادل بالذكاء الاصطناعي",
      "generateButton": "تفسير النتائج",
      "generating": "جاري التفسير...",
      "placeholder": "انقر على 'تفسير النتائج' للحصول على تحليل مدعوم بالذكاء الاصطناعي للمخاطر التشغيلية والاستثمارية للمشروع.",
      "error": "فشل توليد التحليل. يرجى المحاولة مرة أخرى."
    },
    "quantityAnalysisTitle": "تحليل نقطة التعادل حسب الكمية",
    "quantityTable": {
      "quantity": "الكمية",
      "fixedCosts": "التكاليف الثابتة",
      "variableCosts": "التكاليف المتغيرة",
      "totalCosts": "إجمالي التكاليف",
      "totalRevenues": "إجمالي الإيرادات",
      "profitLoss": "الربح/الخسارة"
    },
    "productAnalysisTitle": "تحليل نقطة التعادل حسب المنتج/الخدمة",
    "productTable": {
      "product": "المنتج",
      "contributionMarginPerUnit": "هامش المساهمة للوحدة",
      "breakEvenUnits": "وحدات نقطة التعادل"
    }
  },
  "m11_financialRatios": {
    "title": "النسب المالية",
    "description": "يوضح هذا الجدول نسب الربحية الرئيسية على مدى عمر المشروع، مما يعطي نظرة ثاقبة على أدائه المالي وكفاءته.",
    "table": {
      "metric": "المؤشر",
      "grossProfitMargin": "هامش الربح الإجمالي",
      "operatingProfitMargin": "هامش الربح التشغيلي",
      "netProfitMargin": "هامش صافي الربح"
    },
    "noData": "لا يمكن حساب النسب المالية. يرجى التأكد من ملء مدخلات التشغيل.",
    "chartTitle": "نسب الربحية بمرور الوقت",
    "chart": {
      "yAxis": "الهامش (%)",
      "xAxis": "السنة"
    },
    "aiAnalysis": {
      "title": "تحليل النسب بالذكاء الاصطناعي",
      "generateButton": "تحليل النسب",
      "generating": "جاري التحليل...",
      "placeholder": "انقر على 'تحليل النسب' للحصول على تفسير مدعوم بالذكاء الاصطناعي لاتجاهات الربحية.",
      "error": "فشل توليد التحليل. يرجى المحاولة مرة أخرى."
    }
  },
  "m12_sensitivityAnalysis": {
    "title": "تحليل الحساسية",
    "description": "حلل كيفية تأثير التغييرات في الافتراضات المالية الرئيسية على نتائج المشروع. أنشئ سيناريوهات مختلفة لمقارنة النتائج مع الحالة الأساسية.",
    "manageScenariosTitle": "إدارة السيناريوهات",
    "addScenario": "إضافة سيناريو",
    "scenarioNamePlaceholder": "اسم السيناريو (مثل، متفائل)",
    "editScenarioTitle": "تعديل معلمات السيناريو",
    "selectScenarioPrompt": "حدد سيناريو من القائمة لبدء تعديل معلماته.",
    "resultsComparisonTitle": "مقارنة النتائج",
    "baseCase": "الحالة الأساسية",
    "kpi": "مؤشر الأداء",
    "aiSummary": {
      "title": "تفسير الحساسية بالذكاء الاصطناعي",
      "generateButton": "تحليل السيناريوهات",
      "generating": "جاري التحليل...",
      "placeholder": "أنشئ سيناريو واحدًا على الأقل، ثم انقر على 'تحليل السيناريوهات' للحصول على تفسير مدعوم بالذكاء الاصطناعي للنتائج.",
      "error": "فشل توليد تحليل الذكاء الاصطناعي. يرجى المحاولة مرة أخرى."
    },
    "tornadoTitle": "تحليل الحساسية المحلي",
    "tornadoSubtitle": "التغير المئوي في المخرجات مقابل تغير ±10% في متغيرات المدخلات",
    "selectKpi": "اختر مؤشر الأداء للتحليل",
    "inputVariablesAxis": "متغيرات المدخلات",
    "outputChangeAxis": "التغير في المخرجات (%)",
    "variables": {
      "investmentCost": "تكلفة الاستثمار",
      "revenue": "الإيرادات",
      "variableCosts": "التكاليف المتغيرة",
      "fixedCosts": "التكاليف الثابتة",
      "discountRate": "معدل الخصم"
    }
  },
  "m13_monteCarloSimulation": {
    "title": "محاكاة مونت كارلو",
    "description": "قم بإجراء محاكاة لفهم تأثير عدم اليقين على نتائج المشروع. قم بتكوين المتغيرات ذات التوزيعات الإحصائية لتوليد مجموعة من النتائج المحتملة.",
    "setupTitle": "إعداد المحاكاة",
    "iterationsLabel": "عدد التكرارات",
    "runButton": "تشغيل المحاكاة",
    "runningButton": "جاري تشغيل المحاكاة...",
    "variablesTitle": "تحديد المتغيرات غير المؤكدة",
    "table": {
      "variable": "المتغير",
      "distribution": "التوزيع",
      "parameters": "المعلمات"
    },
    "distributions": {
      "None": "ثابت (بدون توزيع)",
      "Normal": "طبيعي",
      "Uniform": "منتظم",
      "Triangular": "مثلثي",
      "Lognormal": "لوغاريتمي طبيعي",
      "Beta": "بيتا",
      "PERT": "بيرت",
      "paramLabels": {
        "Normal": { "p1": "المتوسط", "p2": "الانحراف المعياري" },
        "Uniform": { "p1": "الحد الأدنى", "p2": "الحد الأقصى" },
        "Triangular": { "p1": "الحد الأدنى", "p2": "الأكثر ترجيحًا", "p3": "الحد الأقصى" },
        "Lognormal": { "p1": "متوسط اللوغاريتم", "p2": "انحراف اللوغاريتم" },
        "Beta": { "p1": "ألفا", "p2": "بيتا" },
        "PERT": { "p1": "الحد الأدنى", "p2": "الأكثر ترجيحًا", "p3": "الحد الأقصى" }
      }
    },
    "resultsTitle": "نتائج المحاكاة",
    "resultsTable": {
      "kpi": "مؤشر الأداء",
      "mean": "المتوسط",
      "median": "الوسيط",
      "stdDev": "الانحراف المعياري",
      "p10": "P10",
      "p25": "P25",
      "p75": "P75",
      "p90": "P90"
    },
    "probabilitiesTitle": "الاحتمالات",
    "probNPVPositive": "احتمالية NPV > 0",
    "probIRRgtDiscount": "احتمالية IRR > معدل الخصم",
    "noResults": "لا توجد نتائج محاكاة بعد. قم بتكوين وتشغيل محاكاة لرؤية النتيجة.",
    "simulationInProgress": "المحاكاة قيد التقدم...",
    "visualizationTitle": "تصور النتائج",
    "visualizeKpi": "تصور المؤشر",
    "chartType": "نوع المخطط",
    "histogram": "مدرج تكراري (PDF)",
    "cdf": "تراكمي (CDF)",
    "frequency": "التكرار",
    "normalCurve": "المنحنى الطبيعي",
    "cumulativeProbability": "الاحتمالية التراكمية",
    "distributionTitle": "توزيع {{kpi}}",
    "cdfTitle": "توزيع {{kpi}} التراكمي (CDF)",
    "aiSummary": {
      "title": "تحليل المخاطر بالذكاء الاصطناعي",
      "generateButton": "توليد التحليل",
      "generating": "جاري تحليل النتائج...",
      "placeholder": "بعد اكتمال المحاكاة، انقر على 'توليد التحليل' للحصول على تفسير مدعوم بالذكاء الاصطناعي لملف المخاطر.",
      "error": "فشل توليد تحليل الذكاء الاصطناعي. يرجى المحاولة مرة أخرى."
    }
  },
  "m14_dashboard": {
      "title": "لوحة المعلومات",
      "welcomeTitle": "أهلاً بك في FinFeasibility!",
      "welcomeMessage": "ابدأ بتوليد فكرة مشروع جديد، أو تحميل مشروع نموذجي، أو تحميل ملف دراسة خاص بك باستخدام الأزرار في الرأس. يمكنك أيضًا البدء في إدخال البيانات يدويًا في الوحدات على اليسار.",
      "kpiTitle": "مؤشرات الأداء الرئيسية",
      "trendsTitle": "الاتجاهات المالية",
      "capexTitle": "تفصيل النفقات الرأسمالية",
      "trendsChart": {
        "revenue": "الإيرادات",
        "costs": "تكاليف التشغيل",
        "profit": "صافي الربح (NOPAT)"
      },
      "aiSummary": {
        "title": "الملخص التنفيذي بالذكاء الاصطناعي",
        "generateButton": "توليد الملخص",
        "generating": "جاري التحليل...",
        "placeholder": "انقر على 'توليد الملخص' للحصول على نظرة عامة عالية المستوى على الصحة المالية للمشروع والاتجاهات الرئيسية.",
        "error": "فشل توليد ملخص الذكاء الاصطناعي. يرجى المحاولة مرة أخرى."
      }
    },
  "m15_customReport": {
    "title": "منشئ التقارير المخصصة",
    "description": "حدد الوحدات التي تريد تضمينها في تقريرك النهائي. سيتم إنشاء التقرير بأحدث البيانات والرؤى المدعومة بالذكاء الاصطناعي.",
    "previewReportButton": "معاينة التقرير",
    "generatingPreviewButton": "جاري إنشاء المعاينة...",
    "exportPdfButton": "تصدير إلى PDF",
    "exportingPdfButton": "جاري تصدير PDF...",
    "exportDocxButton": "تصدير إلى DOCX",
    "exportingDocxButton": "جاري تصدير DOCX...",
    "status": {
      "starting": "بدء إنشاء التقرير...",
      "generatingAI": "جاري إنشاء ملخص الذكاء الاصطناعي لـ: {{section}}",
      "capturingCharts": "التقاط المخططات البيانية...",
      "assembling": "تجميع المستند...",
      "done": "تم إنشاء المستند بنجاح!"
    },
    "sectionsTitle": "حدد أقسام التقرير",
    "selectAll": "تحديد الكل",
    "deselectAll": "إلغاء تحديد الكل"
  },
  "m16_dataManagement": {
    "title": "دليل إدارة البيانات",
    "description": "يوفر هذا التطبيق عدة طرق لإدارة بيانات مشروعك. جميع الوظائف موجودة في رأس التطبيق في أعلى الصفحة.",
    "functions": {
      "newStudy": "دراسة جديدة",
      "newStudyDesc": "يمسح جميع البيانات الحالية ويبدأ مشروعًا جديدًا فارغًا.",
      "loadSample": "تحميل بيانات العينة",
      "loadSampleDesc": "يقوم بتحميل مشروع نموذجي واقعي ومُعد مسبقًا لعرض ميزات التطبيق.",
      "loadStudy": "تحميل دراسة",
      "loadStudyDesc": "يفتح مربع حوار ملف لتحميل ملف مشروع تم حفظه مسبقًا (.hosp).",
      "saveStudy": "حفظ الدراسة",
      "saveStudyDesc": "يقوم بتنزيل جميع بيانات مشروعك الحالية في ملف واحد بامتداد '.hosp'."
    }
  },
   "aiTransform": {
    "toolbarTitle": "تحويل:",
    "rewrite": "إعادة صياغة",
    "formal": "جعله رسميًا",
    "summarize": "تلخيص",
    "longer": "جعله أطول",
    "translate": "ترجمة",
    "error": "فشل تحويل النص."
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      order: ['queryString', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['cookie', 'localStorage'],
    },
  });

export default i18n;
