import { calculateFinancialOutputs } from './lib/financial';
import { normal, triangular, uniform, lognormal, beta, pert } from './lib/distributions';
import { ProjectData, RevenueItem, EstimationBasis } from './types';

self.onmessage = (event) => {
    try {
        const { projectData }: { projectData: ProjectData } = event.data;
        const { iterations, variables } = projectData.monteCarlo;
        
        // --- Pre-check for project viability ---
        const baseCaseOutput = calculateFinancialOutputs(projectData);
        const firstOperationalYearIndex = baseCaseOutput.revenueSchedule.findIndex(rev => rev > 0);

        if (firstOperationalYearIndex === -1) {
            // This project never makes any money, simulation is pointless and will produce NaNs.
            // Return a zero-result gracefully.
            const zeroStats = { mean: 0, median: 0, stdDev: 0, p10: 0, p25: 0, p75: 0, p90: 0 };
            self.postMessage({ 
                type: 'result', 
                payload: { 
                    results: {
                        npv: zeroStats,
                        irr: zeroStats,
                        roi: zeroStats,
                        paybackPeriod: zeroStats,
                        probabilityNPVPositive: 0,
                        probabilityIRRgtDiscountRate: 0
                    },
                    rawData: { npv: [], irr: [], roi: [], paybackPeriod: [] }
                } 
            });
            return; // Stop the worker
        }
        // --- End Pre-check ---

        const results = {
            npv: [] as number[],
            irr: [] as number[],
            roi: [] as number[],
            paybackPeriod: [] as number[],
        };

        const activeVariables = Object.entries(variables).filter(([, v]) => v.distribution !== 'None');
        
        for (let i = 0; i < iterations; i++) {
            const modifiedProjectData = JSON.parse(JSON.stringify(projectData));
            
            activeVariables.forEach(([id, settings]) => {
                let value;
                switch (settings.distribution) {
                    case 'Normal':
                        value = normal(settings.param1, settings.param2);
                        break;
                    case 'Uniform':
                        value = uniform(settings.param1, settings.param2);
                        break;
                    case 'Triangular':
                        value = triangular(settings.param1, settings.param2, settings.param3!);
                        break;
                    case 'Lognormal':
                        value = lognormal(settings.param1, settings.param2);
                        break;
                    case 'Beta':
                        value = beta(settings.param1, settings.param2);
                        break;
                    case 'PERT':
                        value = pert(settings.param1, settings.param2, settings.param3!);
                        break;
                    default:
                        return;
                }

                // Apply the generated value to the correct part of the project data
                const [type, ...rest] = id.split('-');
                if (type === 'eb') {
                    const key = rest[0] as keyof EstimationBasis;
                    (modifiedProjectData.estimationBasis[key] as any) = value;
                } else if (type === 'rev') {
                    const itemId = rest[0];
                    const field = rest[1] as keyof RevenueItem;
                    const revenueItem = modifiedProjectData.operatingInputs.revenues.find((r: RevenueItem) => r.id === itemId);
                    if (revenueItem) {
                        (revenueItem[field] as any) = value;
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

        const getStats = (data: number[]) => {
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
    } catch (e: any) {
        console.error('Simulation Worker Error:', e);
        self.postMessage({ type: 'error', payload: { error: e.message }});
    }
};