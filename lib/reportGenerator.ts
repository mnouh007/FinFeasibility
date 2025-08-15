import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import {
    Document,
    Packer,
    Paragraph,
    HeadingLevel,
    ImageRun,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    WidthType,
} from 'docx';
import { ProjectData, CalculatedOutputs, MonteCarloResults } from '../types';
import { calculateFinancialOutputs } from './financial';


interface ReportOptions {
    projectData: ProjectData;
    calculatedOutputs: CalculatedOutputs;
    simulationResults: MonteCarloResults | null;
    selectedSections: string[];
    aiSummaries: Record<string, string>;
    t: (key: string, options?: any) => string;
    i18n: { language: string };
    updateStatus: (status: string) => void;
}

const captureChart = async (elementId: string): Promise<string | null> => {
    const element = document.getElementById(elementId);
    if (!element) {
        console.warn(`Element with id ${elementId} not found for chart capture.`);
        return null;
    };
    try {
        const canvas = await html2canvas(element, { 
            backgroundColor: null,
            scale: 2 
        });
        return canvas.toDataURL('image/png');
    } catch(e) {
        console.error(`Error capturing chart ${elementId}:`, e);
        return null;
    }
};

export const generateReport = async (options: ReportOptions): Promise<void> => {
    const { projectData, calculatedOutputs, selectedSections, aiSummaries, t, i18n, updateStatus, simulationResults } = options;
    const { definition } = projectData;

    updateStatus(t('m15_customReport.status.starting'));

    const doc = new jsPDF();
    
    const lang = i18n.language;
    const isArabic = lang === 'ar';
    
    const rtlText = (text: string, x: number, y: number, options?: any) => {
        if (isArabic) {
            doc.text(text, x, y, { ...options, align: 'right' });
        } else {
            doc.text(text, x, y, options);
        }
    };
    
    let yPos = 0;
    const toc: { title: string, page: number }[] = [];

    // --- Cover Page ---
    doc.setFontSize(22);
    rtlText(definition.projectName || "Feasibility Study Report", 105, 100, { align: 'center' });
    doc.setFontSize(14);
    rtlText(`Generated on: ${new Date().toLocaleDateString()}`, 105, 120, { align: 'center' });
    doc.setFontSize(10);
    rtlText("Powered by FinFeasibility AI", 105, 130, { align: 'center' });
    
    const addSection = async (id: string, title: string, content: () => Promise<void> | void) => {
        if (!selectedSections.includes(id)) return;
        
        doc.addPage();
        toc.push({ title, page: doc.getNumberOfPages() });
        yPos = 45;

        doc.setFontSize(18);
        rtlText(title, isArabic ? 190 : 20, 30);
        
        if (aiSummaries[id]) {
            doc.setFontSize(11);
            doc.setTextColor(0, 102, 204);
            rtlText(t('m14_dashboard.aiSummary.title'), isArabic ? 190 : 20, yPos);
            yPos += 7;
            doc.setTextColor(0);
            doc.setFontSize(10);
            const splitText = doc.splitTextToSize(aiSummaries[id], 170);
            rtlText(splitText, isArabic ? 190 : 20, yPos);
            yPos += splitText.length * 5 + 10;
        }
        
        await content();
    };

    const addChart = async (chartId: string, width: number, height: number) => {
        updateStatus(t('m15_customReport.status.capturingCharts'));
        const chartImg = await captureChart(`report-chart-${chartId}`);
        if(chartImg) {
            if (yPos + height > 280) {
                doc.addPage();
                yPos = 30;
            }
            doc.addImage(chartImg, 'PNG', (210 - width) / 2, yPos, width, height);
            yPos += height + 10;
        }
    };
    
    const formatCurrency = (val: number) => {
        if (!isFinite(val)) return 'N/A';
        return new Intl.NumberFormat(isArabic ? 'ar' : 'en', {style: 'decimal', minimumFractionDigits: 0}).format(val);
    };
    const formatPercent = (val: number) => {
        if (!isFinite(val)) return 'N/A';
        return `${val.toFixed(2)}%`;
    };

    updateStatus(t('m15_customReport.status.assembling'));
    
    await addSection('m14', t('sidebar.m14'), async () => { await addChart('m14', 160, 100); });
    await addSection('m1', t('sidebar.m1'), async () => { if (projectData.definition.partners.length > 0) await addChart('m1', 100, 75); });
    await addSection('m2', t('sidebar.m2'), async () => {});
    await addSection('m3', t('sidebar.m3'), async () => { await addChart('m3', 160, 100); });
    await addSection('m4', t('sidebar.m4'), async () => { doc.addPage('l'); await addChart('m4', 260, 170); });
    await addSection('m5', t('sidebar.m5'), async () => { await addChart('m5', 160, 100); });
    await addSection('m6', t('sidebar.m6'), async () => { if(projectData.financing.loans.length > 0) await addChart('m6', 170, 110); });
    await addSection('m7', t('sidebar.m7'), async () => {});
    await addSection('m8', t('sidebar.m8'), async () => { if (calculatedOutputs.cashFlowStatement.length > 0) { await addChart('m8-1', 170, 110); await addChart('m8-2', 170, 110); } });
    await addSection('m9', t('sidebar.m9'), async () => { await addChart('m9', 170, 110); });
    await addSection('m10', t('sidebar.m10'), async () => { if (calculatedOutputs.breakEvenAnalysis) await addChart('m10', 170, 110); });
    await addSection('m11', t('sidebar.m11'), async () => { if (calculatedOutputs.financialRatios.grossMargin.length > 0) await addChart('m11', 170, 110); });
    await addSection('m12', t('sidebar.m12'), async () => {
        const scenarioResults = [ { name: t('m12_sensitivityAnalysis.baseCase'), outputs: calculatedOutputs }, ...projectData.sensitivityAnalysis.scenarios.map(s => ({ name: s.name, outputs: calculateFinancialOutputs({...projectData, estimationBasis: {...projectData.estimationBasis, ...s.modifications}}) }))];
        const head = [['KPI', ...scenarioResults.map(r => r.name)]];
        const body = ['npv', 'irr', 'roi'].map(kpi => [ t(`m9_financialEvaluation.${kpi}Title`), ...scenarioResults.map(r => kpi === 'npv' ? formatCurrency(r.outputs[kpi as keyof CalculatedOutputs] as number) : formatPercent(r.outputs[kpi as keyof CalculatedOutputs] as number)) ]);
        autoTable(doc, { startY: yPos, head, body, styles: { halign: isArabic ? 'right' : 'left' }, headStyles: { halign: 'center' }});
        yPos = (doc as any).lastAutoTable.finalY + 10;
        await addChart('m12', 170, 110);
    });
    await addSection('m13', t('sidebar.m13'), async () => {
        if (simulationResults) {
            const stats = simulationResults;
            const head = [[t('m13_monteCarloSimulation.resultsTable.kpi'), t('m13_monteCarloSimulation.resultsTable.mean'), t('m13_monteCarloSimulation.resultsTable.median'), t('m13_monteCarloSimulation.resultsTable.stdDev'), t('m13_monteCarloSimulation.resultsTable.p10'), t('m13_monteCarloSimulation.resultsTable.p90')]];
            
            const kpiKeysForReport: ('npv' | 'irr' | 'roi' | 'paybackPeriod')[] = ['npv', 'irr', 'roi', 'paybackPeriod'];
            const body = kpiKeysForReport.map(k => {
                const statData = stats[k];
                const isCurrency = k === 'npv';
                const isPercent = k === 'irr' || k === 'roi';

                const formatter = (val: number) => {
                    if (!isFinite(val)) return 'N/A';
                    if (isCurrency) return formatCurrency(val);
                    if (isPercent) return formatPercent(val);
                    return val.toFixed(2);
                };

                if (!statData || typeof statData.mean === 'undefined') {
                    return [ t(`m9_financialEvaluation.${k}Title`), 'N/A', 'N/A', 'N/A', 'N/A', 'N/A' ];
                }

                return [
                    t(`m9_financialEvaluation.${k}Title`),
                    formatter(statData.mean),
                    formatter(statData.median),
                    formatter(statData.stdDev),
                    formatter(statData.p10),
                    formatter(statData.p90)
                ];
            });

            autoTable(doc, { startY: yPos, head, body, styles: { halign: isArabic ? 'right' : 'left' }, headStyles: { halign: 'center' }});
            yPos = (doc as any).lastAutoTable.finalY + 10;
            await addChart('m13', 170, 110);
        }
    });

    // --- TOC & Page Numbers ---
    doc.insertPage(2);
    doc.setFontSize(20);
    rtlText("Table of Contents", isArabic ? 190 : 20, 30);
    doc.setFontSize(12);
    let tocY = 50;
    toc.forEach(entry => { rtlText(`${entry.title} .................... ${entry.page}`, isArabic ? 190 : 20, tocY); tocY += 10; });
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) { doc.setPage(i); doc.setFontSize(10); doc.setTextColor(150); rtlText(definition.projectName, isArabic ? 195 : 15, 15); const pageStr = `Page ${i} of ${pageCount}`; rtlText(pageStr, isArabic ? 195 : 15, 285); }

    updateStatus(t('m15_customReport.status.done'));
    doc.save(`${projectData.definition.projectName || 'report'}.pdf`);
};

const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

export const generateDocxReport = async (options: ReportOptions): Promise<void> => {
    const { projectData, calculatedOutputs, selectedSections, aiSummaries, t, i18n, updateStatus, simulationResults } = options;
    const { definition } = projectData;
    const lang = i18n.language;
    const isArabic = lang === 'ar';

    updateStatus(t('m15_customReport.status.starting'));

    const children: (Paragraph | Table)[] = [];

    // --- Cover Page ---
    children.push(new Paragraph({ text: definition.projectName || "Feasibility Study Report", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
    children.push(new Paragraph({ text: `Generated on: ${new Date().toLocaleDateString()}`, alignment: AlignmentType.CENTER }));
    children.push(new Paragraph({ text: "Powered by FinFeasibility AI", alignment: AlignmentType.CENTER }));
    children.push(new Paragraph({ text: "", pageBreakBefore: true }));

    const formatCurrency = (val: number) => { if (!isFinite(val)) return 'N/A'; return new Intl.NumberFormat(isArabic ? 'ar' : 'en', {style: 'decimal', minimumFractionDigits: 0}).format(val); };
    const formatPercent = (val: number) => { if (!isFinite(val)) return 'N/A'; return `${val.toFixed(2)}%`; };

    const addChartToDoc = async (chartId: string, widthInches: number) => {
        updateStatus(t('m15_customReport.status.capturingCharts'));
        const imageDataUrl = await captureChart(`report-chart-${chartId}`);
        if (imageDataUrl) {
            const base64String = imageDataUrl.replace(/^data:image\/png;base64,/, "");
            return new ImageRun({
                type: "png",
                data: base64ToUint8Array(base64String),
                transformation: { width: widthInches * 96, height: (widthInches * 96) * (5/8) },
            });
        }
        return null;
    };

    updateStatus(t('m15_customReport.status.assembling'));

    for (const sectionId of selectedSections) {
        const title = t(`sidebar.${sectionId}`);
        children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1, pageBreakBefore: children.length > 4, bidirectional: isArabic }));
        if (aiSummaries[sectionId]) {
            children.push(new Paragraph({ text: t('m14_dashboard.aiSummary.title'), heading: HeadingLevel.HEADING_3, bidirectional: isArabic }));
            aiSummaries[sectionId].split('\n').forEach(line => { children.push(new Paragraph({ text: line, bidirectional: isArabic })); });
        }
        
        let chartImageRun: ImageRun | null = null;
        switch (sectionId) {
            case 'm1': if (projectData.definition.partners.length > 0) chartImageRun = await addChartToDoc('m1', 4); break;
            case 'm3': chartImageRun = await addChartToDoc('m3', 6); break;
            case 'm4': chartImageRun = await addChartToDoc('m4', 6); break;
            case 'm5': chartImageRun = await addChartToDoc('m5', 6); break;
            case 'm6': if (projectData.financing.loans.length > 0) chartImageRun = await addChartToDoc('m6', 6); break;
            case 'm8': if (calculatedOutputs.cashFlowStatement.length > 0) { const img1 = await addChartToDoc('m8-1', 6); if(img1) children.push(new Paragraph({ children: [img1], alignment: AlignmentType.CENTER })); const img2 = await addChartToDoc('m8-2', 6); if(img2) children.push(new Paragraph({ children: [img2], alignment: AlignmentType.CENTER })); } break;
            case 'm9': chartImageRun = await addChartToDoc('m9', 6); break;
            case 'm10': if(calculatedOutputs.breakEvenAnalysis) chartImageRun = await addChartToDoc('m10', 6); break;
            case 'm11': if (calculatedOutputs.financialRatios.grossMargin.length > 0) chartImageRun = await addChartToDoc('m11', 6); break;
            case 'm12':
                const scenarioResults = [ { name: t('m12_sensitivityAnalysis.baseCase'), outputs: calculatedOutputs }, ...projectData.sensitivityAnalysis.scenarios.map(s => ({ name: s.name, outputs: calculateFinancialOutputs({...projectData, estimationBasis: {...projectData.estimationBasis, ...s.modifications}}) }))];
                const head = ['KPI', ...scenarioResults.map(r => r.name)];
                const body = ['npv', 'irr', 'roi'].map(kpi => [ t(`m9_financialEvaluation.${kpi}Title`), ...scenarioResults.map(r => kpi === 'npv' ? formatCurrency(r.outputs[kpi as keyof CalculatedOutputs] as number) : formatPercent(r.outputs[kpi as keyof CalculatedOutputs] as number)) ]);
                children.push(new Table({ rows: [ new TableRow({ children: head.map(h => new TableCell({ children: [new Paragraph(h)] })) }), ...body.map(row => new TableRow({ children: row.map(cell => new TableCell({ children: [new Paragraph(cell)] })) })) ], width: { size: 100, type: WidthType.PERCENTAGE } }));
                chartImageRun = await addChartToDoc('m12', 6);
                break;
            case 'm13':
                if (simulationResults) {
                    const stats = simulationResults;
                    const head = [t('m13_monteCarloSimulation.resultsTable.kpi'), t('m13_monteCarloSimulation.resultsTable.mean'), t('m13_monteCarloSimulation.resultsTable.median'), t('m13_monteCarloSimulation.resultsTable.stdDev'), t('m13_monteCarloSimulation.resultsTable.p10'), t('m13_monteCarloSimulation.resultsTable.p90')];

                    const kpiKeysForReport: ('npv' | 'irr' | 'roi' | 'paybackPeriod')[] = ['npv', 'irr', 'roi', 'paybackPeriod'];
                    const body = kpiKeysForReport.map(k => {
                        const statData = stats[k];
                        const isCurrency = k === 'npv';
                        const isPercent = k === 'irr' || k === 'roi';

                        const formatter = (val: number) => {
                            if (!isFinite(val)) return 'N/A';
                            if (isCurrency) return formatCurrency(val);
                            if (isPercent) return formatPercent(val);
                            return val.toFixed(2);
                        };
                        
                        if (!statData || typeof statData.mean === 'undefined') {
                           return [t(`m9_financialEvaluation.${k}Title`), 'N/A', 'N/A', 'N/A', 'N/A', 'N/A'];
                        }

                        return [
                            t(`m9_financialEvaluation.${k}Title`),
                            formatter(statData.mean),
                            formatter(statData.median),
                            formatter(statData.stdDev),
                            formatter(statData.p10),
                            formatter(statData.p90)
                        ];
                    });

                     children.push(new Table({ rows: [ new TableRow({ children: head.map(h => new TableCell({ children: [new Paragraph(h)] })) }), ...body.map(row => new TableRow({ children: row.map(cell => new TableCell({ children: [new Paragraph(cell)] })) })) ], width: { size: 100, type: WidthType.PERCENTAGE } }));
                }
                chartImageRun = await addChartToDoc('m13', 6);
                break;
            case 'm14': chartImageRun = await addChartToDoc('m14', 6); break;
        }
        if (chartImageRun) {
            children.push(new Paragraph({ children: [chartImageRun], alignment: AlignmentType.CENTER }));
        }
    }

    const doc = new Document({
        sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 }, } }, children }],
    });
    
    updateStatus(t('m15_customReport.status.done'));

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${definition.projectName || 'report'}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};