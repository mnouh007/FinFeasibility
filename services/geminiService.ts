
import { GoogleGenAI, Type } from "@google/genai";
import { CalculatedOutputs, ProjectData, ProjectDefinition, initialProjectData, MonteCarloResults, EstimationBasis, RevenueItem, OperatingCostItem, CapitalInvestmentItem, Loan, LoanAmortizationScheduleItem, CashFlowItem, BreakEvenAnalysis, FinancialRatios, WorkingCapitalScheduleItem, Task, Scenario, TimeBasedBreakEvenData } from "../types";

// --- API Key Configuration ---
// This is the standard method for accessing the API key per the project guidelines.
// It relies on the execution environment to provide `process.env.API_KEY`.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;

// Initialize the AI client. A check is performed inside getAiInstance to ensure this was successful.
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
}

const getAiInstance = () => {
    // This check provides a clear error to the user if the API key was not set
    // in the deployment environment.
    if (!ai) {
        console.error("Gemini AI client failed to initialize. Ensure API_KEY is set as an environment variable.");
        // This specific error message is caught by the UI to display a user-friendly message.
        throw new Error("API_KEY_NOT_CONFIGURED");
    }
    return ai;
};

const handleApiError = (error: unknown, context: string): never => {
    console.error(`Error calling Gemini API for ${context}:`, error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Gemini API Error: ${errorMessage}`);
};


export const summarizeProjectDefinition = async (definition: ProjectDefinition, language: string): Promise<string> => {
    const ai = getAiInstance();
    if (!definition.projectName && !definition.projectDescription) {
        return "Please provide a project name and description to generate a summary.";
    }
    const prompt = `
        As a business analyst, create a concise summary for the following project.
        The summary should be a single paragraph (3-5 sentences).
        First, introduce the project using its name and core description.
        Then, briefly mention its key objectives.
        Finally, describe the ownership structure based on the partners' share. For example, if shares are 50/50, mention an "equal partnership". If one partner has a majority, mention a "majority stake".
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
        Project Data:
        - Name: ${definition.projectName}
        - Description: ${definition.projectDescription}
        - Objectives: ${definition.objectives}
        - Partners: ${JSON.stringify(definition.partners.map(p => ({ name: p.name, share: p.share })), null, 2)}
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "project summary");
    }
};

export const analyzeEstimationBasis = async (estimationBasis: EstimationBasis, projectName: string, language: string): Promise<string> => {
    const ai = getAiInstance();
    const prompt = `
        As a senior financial analyst reviewing the baseline assumptions for a project named "${projectName}", please analyze the following financial parameters.
        Your task is to provide a concise, bulleted list of feedback points. Focus on:
        1.  **Internal Consistency:** Check for potential contradictions. For example, is the discount rate significantly lower than the revenue growth rate? Is the inflation rate much higher than cost growth rates?
        2.  **General Reasonableness:** Comment on whether the rates seem overly optimistic or pessimistic. For instance, are growth rates exceptionally high? Is the discount rate very low for a new venture?
        3.  **Benchmark Comparison:** Where possible, compare the depreciation rates to general industry norms (e.g., buildings typically depreciate slowly, equipment faster).
        If the assumptions seem generally reasonable and well-balanced, state that. Your feedback should be constructive and help the user build a more robust financial model.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
        Financial Assumptions:
        ${JSON.stringify(estimationBasis, null, 2)}
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "estimation basis analysis");
    }
};

export const analyzeCapex = async (items: CapitalInvestmentItem[], language: string): Promise<string> => {
    const ai = getAiInstance();
    if (items.length === 0) return "No capital investment items to analyze.";
    const prompt = `
        You are a financial analyst reviewing the capital expenditure (CAPEX) plan for a new project.
        Based on the following list of capital investment items, provide a concise, bulleted list of your key findings.
        Your analysis must include:
        1.  **Top Expenditures:** Identify the top 3-5 most expensive individual items and list their costs.
        2.  **Category Focus:** Calculate the total investment for each category (Buildings, Machinery, Furniture, Equipment) and explicitly state which category represents the largest portion of the total CAPEX.
        Provide a clear and direct summary.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
        **Capital Investment Items:**
        ${JSON.stringify(items.map(i => ({ item: i.item, cost: i.cost, category: i.category })), null, 2)}
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "CAPEX analysis");
    }
};

export const analyzeOperatingInputs = async (revenues: RevenueItem[], costs: OperatingCostItem[], language: string): Promise<string> => {
    const ai = getAiInstance();
    if (revenues.length === 0 && costs.length === 0) return "No operating inputs to analyze.";
    const prompt = `
        As a business analyst, review the project's operating inputs.
        1.  **Revenue Analysis:** Comment on the revenue streams. Is there one dominant source, or is it diversified?
        2.  **Cost Structure:** Analyze the cost breakdown. What are the major cost drivers (Raw Materials, Labor, or Admin)?
        3.  **Profitability Preview:** Briefly assess the relationship between total revenue and total costs for the first year.
        Provide a concise, bullet-point summary of your findings.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
        **Revenues:**
        ${JSON.stringify(revenues.map(r => ({ item: r.item, total: r.unitPrice * r.quantity })), null, 2)}
        **Costs:**
        ${JSON.stringify(costs.map(c => {
            let total = 0;
            if (c.category === 'Raw Materials') total = c.unitCost * c.quantity;
            else if (c.category === 'Labor') total = c.count * c.monthlySalary * 12;
            else if (c.category === 'General & Admin') total = c.cost;
            return { item: c.item, category: c.category, total };
        }), null, 2)}
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "operating inputs analysis");
    }
};

export const generateFullProject = async (prompt: string, language: string): Promise<ProjectData> => {
    const ai = getAiInstance();
    
    const projectDataSchema = {
        type: Type.OBJECT,
        properties: {
            definition: {
                type: Type.OBJECT,
                properties: {
                    projectName: { type: Type.STRING },
                    projectDescription: { type: Type.STRING },
                    objectives: { type: Type.STRING },
                    partners: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                name: { type: Type.STRING },
                                share: { type: Type.NUMBER }
                            },
                            required: ["id", "name", "share"]
                        }
                    }
                },
                required: ["projectName", "projectDescription", "objectives", "partners"]
            },
            estimationBasis: {
                type: Type.OBJECT,
                properties: {
                    currency: { type: Type.STRING },
                    projectLife: { type: Type.NUMBER },
                    discountRate: { type: Type.NUMBER },
                    taxRate: { type: Type.NUMBER },
                    inflationRate: { type: Type.NUMBER },
                    revenueGrowthRate: { type: Type.NUMBER },
                    variableCostGrowthRate: { type: Type.NUMBER },
                    fixedCostGrowthRate: { type: Type.NUMBER }
                },
                required: ["currency", "projectLife", "discountRate", "taxRate", "inflationRate", "revenueGrowthRate", "variableCostGrowthRate", "fixedCostGrowthRate"]
            },
            capitalInvestment: {
                type: Type.OBJECT,
                properties: {
                    items: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                category: { type: Type.STRING, enum: ['Buildings', 'Machinery', 'Furniture', 'Equipment'] },
                                item: { type: Type.STRING },
                                cost: { type: Type.NUMBER }
                            },
                            required: ["id", "category", "item", "cost"]
                        }
                    }
                },
                required: ["items"]
            },
            timeline: {
                type: Type.OBJECT,
                properties: {
                    tasks: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                name: { type: Type.STRING },
                                startDate: { type: Type.STRING },
                                endDate: { type: Type.STRING },
                                progress: { type: Type.NUMBER }
                            },
                            required: ["id", "name", "startDate", "endDate", "progress"]
                        }
                    }
                },
                required: ["tasks"]
            },
            operatingInputs: {
                type: Type.OBJECT,
                properties: {
                    revenues: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                item: { type: Type.STRING },
                                unitPrice: { type: Type.NUMBER },
                                quantity: { type: Type.NUMBER }
                            },
                            required: ["id", "item", "unitPrice", "quantity"]
                        }
                    },
                    costs: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                category: { type: Type.STRING, enum: ['Raw Materials', 'Labor', 'General & Admin'] },
                                item: { type: Type.STRING },
                                unitCost: { type: Type.NUMBER },
                                quantity: { type: Type.NUMBER },
                                count: { type: Type.NUMBER },
                                monthlySalary: { type: Type.NUMBER },
                                cost: { type: Type.NUMBER }
                            },
                            required: ["id", "category", "item"]
                        }
                    }
                },
                required: ["revenues", "costs"]
            },
            financing: {
                type: Type.OBJECT,
                properties: {
                    loans: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                id: { type: Type.STRING },
                                source: { type: Type.STRING },
                                principal: { type: Type.NUMBER },
                                interestRate: { type: Type.NUMBER },
                                term: { type: Type.NUMBER },
                                startYear: { type: Type.NUMBER }
                            },
                            required: ["id", "source", "principal", "interestRate", "term", "startYear"]
                        }
                    }
                },
                required: ["loans"]
            }
        },
        required: ["definition", "estimationBasis", "capitalInvestment", "timeline", "operatingInputs", "financing"]
    };

    const fullPrompt = `Based on the following project idea, generate a comprehensive and realistic financial feasibility study. The user wants a complete project structure filled out. Ensure all financial figures are plausible for the described project. Create unique IDs for all items.
    
    **IMPORTANT: All generated text fields (like projectName, projectDescription, partner names, item names, task names, etc.) MUST be in ${language === 'ar' ? 'Arabic' : 'English'}.**

    Project Idea: "${prompt}"

    Fill out the JSON object according to the provided schema. For cost items, only fill the relevant fields for that category (e.g., 'unitCost' and 'quantity' for Raw Materials, not 'monthlySalary').
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: projectDataSchema,
            }
        });
        const jsonText = response.text.trim();
        const generatedData = JSON.parse(jsonText);

        const finalProjectData: ProjectData = {
            ...initialProjectData,
            ...generatedData,
            definition: { ...initialProjectData.definition, ...generatedData.definition },
            estimationBasis: { ...initialProjectData.estimationBasis, ...generatedData.estimationBasis },
            capitalInvestment: { ...initialProjectData.capitalInvestment, ...generatedData.capitalInvestment },
            timeline: { ...initialProjectData.timeline, ...generatedData.timeline },
            operatingInputs: { ...initialProjectData.operatingInputs, ...generatedData.operatingInputs },
            financing: { ...initialProjectData.financing, ...generatedData.financing },
        };
        return finalProjectData;
    } catch (error) {
        handleApiError(error, "full project generation");
    }
};

export const validateSchedule = async (tasks: Task[], language: string): Promise<string> => {
    const ai = getAiInstance();
    if (tasks.length < 2) return "Add at least two tasks to validate the schedule.";
    
    const prompt = `
        As a project manager, analyze the following project schedule for potential issues.
        - Check for logical sequencing.
        - Identify any tasks with overlapping dates that might be problematic.
        - Comment on the overall duration and feasibility.
        Provide a concise, bulleted list of your findings.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
        Tasks:
        ${JSON.stringify(tasks.map(t => ({ name: t.name, start: t.startDate, end: t.endDate })), null, 2)}
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "schedule validation");
    }
};

export const analyzeFinancing = async (loans: Loan[], schedule: LoanAmortizationScheduleItem[], cashFlow: CashFlowItem[], language: string): Promise<string> => {
    const ai = getAiInstance();
    if (loans.length === 0) return "No loans to analyze.";

    const prompt = `
        As a financial analyst, review the project's financing structure.
        - Comment on the total debt burden relative to project cash flows.
        - Analyze the repayment schedule. Does it seem manageable?
        - Identify any years with particularly high debt service (principal + interest).
        - Point out potential risks associated with the current financing plan.
        Provide a concise, bulleted list of your findings.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
        Loans: ${JSON.stringify(loans, null, 2)}
        Amortization Schedule: ${JSON.stringify(schedule, null, 2)}
        Unlevered Free Cash Flow per year: ${JSON.stringify(cashFlow.map(cf => ({ year: cf.year, UFCF: cf.unleveredFreeCashFlow })), null, 2)}
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch(error) {
        handleApiError(error, "financing analysis");
    }
};

export const analyzeWorkingCapital = async (schedule: WorkingCapitalScheduleItem[], projectName: string, language: string): Promise<string> => {
    const ai = getAiInstance();
    const prompt = `
        For a project named "${projectName}", analyze the following working capital schedule.
        - Describe the trend of the 'Change in Working Capital'.
        - Explain what a positive or negative change implies for the project's cash flow in a given year.
        - Summarize the overall impact of working capital management on this project's finances.
        Provide a concise, paragraph-style summary.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
        Working Capital Schedule:
        ${JSON.stringify(schedule, null, 2)}
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch(error) {
        handleApiError(error, "working capital analysis");
    }
};

export const analyzeCashFlow = async (cashFlowStatement: CashFlowItem[], projectName: string, language: string): Promise<string> => {
    const ai = getAiInstance();
    const prompt = `
        Analyze the cash flow statement for "${projectName}".
        - Summarize the trend of the Unlevered Free Cash Flow (UFCF) over the project life.
        - Identify the primary drivers of cash flow (e.g., strong NOPAT, high depreciation add-back, large CapEx).
        - Conclude with an overall assessment of the project's financial self-sustainability.
        Provide a concise, bulleted list of findings.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
        Cash Flow Statement:
        ${JSON.stringify(cashFlowStatement, null, 2)}
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "cash flow analysis");
    }
};

export const analyzeFinancialKpis = async (kpis: CalculatedOutputs, language: string): Promise<string> => {
    const ai = getAiInstance();
    const { npv, irr, roi, paybackPeriod, discountedPaybackPeriod } = kpis;
    const prompt = `
        Provide an executive verdict on a project with the following financial KPIs.
        - **NPV:** ${npv.toFixed(2)}. Is it positive or negative? What does this imply?
        - **IRR:** ${irr.toFixed(2)}%. How does this compare to a typical hurdle rate (e.g., the discount rate)?
        - **ROI:** ${roi.toFixed(2)}%. Is this a strong return?
        - **Payback Periods:** Simple (${paybackPeriod.toFixed(2)} years) and Discounted (${discountedPaybackPeriod.toFixed(2)} years). What do these tell you about risk and liquidity?
        Conclude with a single sentence stating whether the project appears financially viable based on these metrics.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "financial KPI analysis");
    }
};

export const analyzeBreakEven = async (analysis: BreakEvenAnalysis | null, timeBasedData: TimeBasedBreakEvenData[], projectName: string, language: string): Promise<string> => {
    const ai = getAiInstance();
    if (!analysis) return "No break-even data to analyze.";
    
    const timeBasedCrossoverYear = timeBasedData.find(d => d.cumulativeRevenue > d.cumulativeCosts)?.year;

    const prompt = `
        You are a financial analyst providing a two-part interpretation of the break-even analysis for the project "${projectName}".
        **Part 1: Annual Operational Analysis (Year ${analysis.year})**
        - Interpret the operational break-even point for year ${analysis.year}. The project needs to make ${analysis.breakEvenRevenue.toFixed(2)} to cover its costs in this specific year, against a projected revenue of ${analysis.totalRevenue.toFixed(2)}.
        - The Margin of Safety is ${analysis.marginOfSafety.toFixed(2)}%. Explain what this margin indicates about the project's operational risk for that year.
        **Part 2: Total Investment Break-even Analysis**
        - Based on the cumulative data, the project's total cumulative revenues are projected to surpass its total cumulative costs in **Year ${timeBasedCrossoverYear || 'N/A'}**.
        - Explain the significance of this. This is the point where the project has paid back its entire initial investment and all subsequent costs, becoming profitable overall.
        - Conclude with a summary of the project's risk profile, considering both the annual operational buffer and the overall investment payback timeline.
        Provide a concise, two-paragraph summary.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "break-even analysis");
    }
};

export const analyzeRatios = async (ratios: FinancialRatios, projectName: string, language: string): Promise<string> => {
    const ai = getAiInstance();
    const prompt = `
        Analyze the profitability ratio trends for project "${projectName}".
        - **Gross Profit Margin:** Describe its trend over time. What does this suggest about production efficiency or pricing power?
        - **Operating Profit Margin:** Describe its trend. What does this indicate about the core business profitability?
        - **Net Profit Margin:** Describe its trend. This is the bottom line; what is the overall story of profitability?
        Provide a concise, bulleted list of your findings.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
        Ratios:
        ${JSON.stringify(ratios, null, 2)}
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "ratio analysis");
    }
};

export const analyzeSensitivityResults = async (baseCase: CalculatedOutputs, scenarios: Scenario[], results: {name: string, outputs: CalculatedOutputs}[], language: string): Promise<string> => {
    const ai = getAiInstance();
    const prompt = `
        As a financial analyst, interpret the following sensitivity analysis results.
        - Identify which variable (e.g., discount rate, revenue growth) has the most significant impact on the project's NPV.
        - Compare the 'Optimistic' and 'Pessimistic' (or similarly named) scenarios to the Base Case. How wide is the range of outcomes?
        - Conclude with a summary of the key risks highlighted by this analysis.
        Provide a concise, bulleted list of findings.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
        Base Case NPV: ${baseCase.npv.toFixed(2)}
        Scenarios & Results:
        ${JSON.stringify(results.map(r => ({ name: r.name, npv: r.outputs.npv, irr: r.outputs.irr })), null, 2)}
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "sensitivity analysis");
    }
};

export const summarizeSimulationResults = async (results: MonteCarloResults, projectName: string, language: string): Promise<string> => {
    const ai = getAiInstance();
    const prompt = `
        You are a senior risk analyst. Provide a comprehensive summary of the Monte Carlo simulation results for the project named "${projectName}". Structure your response with the following sections: Executive Summary, Key Findings, and Risk Profile.
        **1. Executive Summary:**
        Start with a one-paragraph summary of the overall findings. Mention the likelihood of success and the general level of risk.
        **2. Key Findings:**
        Provide a bulleted list analyzing the key metrics:
        - **Net Present Value (NPV):** The mean NPV is ${results.npv.mean.toFixed(2)}. Discuss the significance of this value. The range of likely outcomes (P10 to P90) is between ${results.npv.p10.toFixed(2)} and ${results.npv.p90.toFixed(2)}. Explain what this range and the standard deviation of ${results.npv.stdDev.toFixed(2)} imply about the project's volatility and uncertainty.
        - **Internal Rate of Return (IRR):** The mean IRR is ${(results.irr.mean).toFixed(2)}%. Comment on how this compares to a typical investment hurdle rate.
        - **Payback Period:** The average payback period is ${results.paybackPeriod.mean.toFixed(2)} years. Discuss if this is a reasonable timeframe for this type of project.
        - **Probability Analysis:** The project has a **${(results.probabilityNPVPositive * 100).toFixed(1)}% chance of being profitable (NPV > 0)** and a **${(results.probabilityIRRgtDiscountRate * 100).toFixed(1)}% chance of its IRR exceeding the discount rate**. Explain the confidence this gives in the project's viability.
        **3. Risk Profile:**
        - Conclude with a final assessment of the project's risk profile (e.g., Low Risk, Moderately Low Risk, Moderately High Risk, High Risk).
        - Based on the standard deviations of the KPIs, briefly state which metric (NPV or IRR) appears more volatile, suggesting what the project is most sensitive to.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "simulation results summary");
    }
};

export const generateDashboardSummary = async (outputs: CalculatedOutputs, projectName: string, language: string): Promise<string> => {
    const ai = getAiInstance();
    const prompt = `
        Provide a high-level executive summary for project "${projectName}" based on its dashboard KPIs.
        - Start with the key financial outcomes: NPV (${outputs.npv.toFixed(2)}), IRR (${outputs.irr.toFixed(2)}%), and ROI (${outputs.roi.toFixed(2)}%).
        - Briefly describe the financial trend shown in the charts (e.g., "revenues show steady growth while profits increase after initial investment years").
        - Conclude with a one-sentence overall assessment of the project's financial health.
        Keep the summary to a single, concise paragraph.
        **IMPORTANT: Respond in ${language === 'ar' ? 'Arabic' : 'English'}.**
    `;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, "dashboard summary");
    }
};

export const transformText = async (text: string, transformation: 'rewrite' | 'formal' | 'summarize' | 'longer' | 'translate', targetLanguage?: string): Promise<string> => {
    const ai = getAiInstance();

    let instruction = '';
    switch (transformation) {
        case 'rewrite': instruction = 'Rewrite the following text to improve its clarity and flow.'; break;
        case 'formal': instruction = 'Rewrite the following text in a more formal and professional tone.'; break;
        case 'summarize': instruction = 'Summarize the following text into one or two key sentences.'; break;
        case 'longer': instruction = 'Expand on the following text, adding more detail and explanation, making it about twice as long.'; break;
        case 'translate': instruction = `Translate the following text to ${targetLanguage || 'the opposite language'}.`; break;
    }

    const prompt = `${instruction}\n\nText: "${text}"`;
    try {
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        return response.text;
    } catch (error) {
        handleApiError(error, `text transformation (${transformation})`);
    }
};