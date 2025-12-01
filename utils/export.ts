import { LensRecord } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { MOCK_COMPANIES } from '../services/authService';

export const exportToTXT = (data: LensRecord[], startDate: string, endDate: string) => {
    if (!data.length) return;

    // 1. Group by Company
    const companiesMap = new Map<string, LensRecord[]>();
    data.forEach(record => {
        if (!companiesMap.has(record.company_id)) {
            companiesMap.set(record.company_id, []);
        }
        companiesMap.get(record.company_id)?.push(record);
    });

    let reportContent = '';
    const dateStr = format(new Date(), 'dd/MM/yyyy HH:mm');

    // Format period string
    let periodString = "Todo o histórico";
    if (startDate && endDate) {
        const d1 = startDate.split('-').reverse().join('/');
        const d2 = endDate.split('-').reverse().join('/');
        periodString = `de ${d1} até ${d2}`;
    } else if (startDate) {
        const d1 = startDate.split('-').reverse().join('/');
        periodString = `a partir de ${d1}`;
    } else if (endDate) {
        const d2 = endDate.split('-').reverse().join('/');
        periodString = `até ${d2}`;
    }

    reportContent += `RELATÓRIO DE FALTAS - VISULAB\n`;
    reportContent += `Gerado em: ${dateStr}\n`;
    reportContent += `=================================================\n\n`;

    // 2. Iterate Companies
    companiesMap.forEach((records, companyId) => {
        const company = MOCK_COMPANIES.find(c => c.id === companyId);
        const companyName = company ? company.name : 'Empresa Desconhecida';

        reportContent += `EMPRESA: ${companyName}\n`;
        reportContent += `PERÍODO: ${periodString}\n`;
        reportContent += `-------------------------------------------------\n`;

        // --- TOP 3 STATISTICS SECTION ---
        const countStats = (items: LensRecord[], key: keyof LensRecord) => {
            const counts: Record<string, number> = {};
            items.forEach(item => {
                const val = String(item[key]);
                counts[val] = (counts[val] || 0) + (item.quantidade || 1);
            });
            return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
        };

        const topIndices = countStats(records, 'indice');
        const topTratamentos = countStats(records, 'tratamento');

        reportContent += `\nESTATÍSTICAS RÁPIDAS:\n`;
        reportContent += `Top Índice           Top Tratamento\n`; // Header

        // Determine the max rows needed (usually 3)
        const maxRows = Math.max(topIndices.length, topTratamentos.length, 3);

        for (let i = 0; i < 3; i++) {
            const ind = topIndices[i];
            const trat = topTratamentos[i];

            // Format: "1- 1.56"
            const col1 = ind ? `${i + 1}- ${ind[0]}` : '-';
            // Format: "AR"
            const col2 = trat ? `${trat[0]}` : '-';

            // Pad Start to align columns. Approx 17 chars for first col.
            const paddedCol1 = col1 + ' '.repeat(Math.max(0, 17 - col1.length));

            reportContent += `${paddedCol1}${col2}\n`;
        }
        reportContent += `\n-------------------------------------------------\n`;
        // --------------------------------

        // 3. Prepare data for detailed listing
        // We create an intermediate structure to hold the Key Display and the Sorting Weights
        interface GroupData {
            keyDisplay: string;
            records: LensRecord[];
            sortIndex: number;
            sortType: number;
            sortTreatment: number;
        }

        const groupsMap = new Map<string, GroupData>();

        records.forEach(r => {
            const typeStr = r.tipo === 'Photo' ? 'Photo ' : '';
            // Note: r.tipo 'Incolor' returns empty string based on requirements

            const keyDisplay = `${r.indice} ${typeStr}${r.tratamento}`;

            if (!groupsMap.has(keyDisplay)) {
                // Determine Weights

                // 1. Index Weight (Float value)
                const sortIndex = parseFloat(r.indice) || 0;

                // 2. Type Weight (Incolor < Photo)
                const sortType = r.tipo === 'Incolor' ? 1 : 2;

                // 3. Treatment Weight (Incolor < AR < Filtro Azul < BlueCut)
                let sortTreatment = 99;
                if (r.tratamento.includes('Incolor')) sortTreatment = 0;
                else if (r.tratamento.includes('AR')) sortTreatment = 1;
                else if (r.tratamento.includes('Filtro Azul')) sortTreatment = 2;
                else if (r.tratamento.includes('BlueCut')) sortTreatment = 3;

                groupsMap.set(keyDisplay, {
                    keyDisplay,
                    records: [],
                    sortIndex,
                    sortType,
                    sortTreatment
                });
            }
            groupsMap.get(keyDisplay)?.records.push(r);
        });

        // 4. Sort Groups with Specific Logic
        const sortedGroups = Array.from(groupsMap.values()).sort((a, b) => {
            // First Level: Index (Ascending)
            if (a.sortIndex !== b.sortIndex) {
                return a.sortIndex - b.sortIndex;
            }
            // Second Level: Type (Incolor then Photo)
            if (a.sortType !== b.sortType) {
                return a.sortType - b.sortType;
            }
            // Third Level: Treatment (Incolor -> AR -> Filtro -> BlueCut)
            return a.sortTreatment - b.sortTreatment;
        });

        sortedGroups.forEach(group => {
            reportContent += `\n${group.keyDisplay}\n\n`; // Add extra newline between header and list

            // 5. Aggregate Diopters within group ACROSS ALL DATES
            const diopterMap = new Map<string, number>();

            group.records.forEach(r => {
                // New Formatting Rule: {SignedESF}{SignedCIL}
                // Logic: 0 always gets '+', so >= 0
                const formatNum = (n: number) => {
                    const sign = n >= 0 ? '+' : '';
                    return `${sign}${n.toFixed(2)}`;
                };

                const esfStr = formatNum(r.esf);
                const cilStr = formatNum(r.cil);

                // Key for Map
                const diopterKey = `${esfStr}|${cilStr}`;

                // This logic ensures if we have same ESF/CIL on different days, they are summed up here
                const currentQty = diopterMap.get(diopterKey) || 0;
                const recordQty = r.quantidade || 1;
                diopterMap.set(diopterKey, currentQty + recordQty);
            });

            // 6. Get Top 10 by Quantity (Aggregated)
            const sortedDiopters = Array.from(diopterMap.entries())
                .sort((a, b) => b[1] - a[1]) // Sort by quantity desc
                .slice(0, 10); // Take top 10

            // 7. Print Diopters
            sortedDiopters.forEach(([diopterKey, qty]) => {
                const [esf, cil] = diopterKey.split('|');
                // Add extra spaces between ESF and CIL
                reportContent += `${esf} ${cil}   (Qtd: ${qty})\n`;
            });
        });

        reportContent += `\n\n`;
    });

    // Download logic
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_lentes_${format(new Date(), 'yyyy-MM-dd')}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPDF = async (elementId: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        const canvas = await html2canvas(element, {
            scale: 2, // Higher resolution
            useCORS: true,
            logging: false,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10; // Top margin

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`relatorio_lentes_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
        console.error('Failed to export PDF', error);
    }
};