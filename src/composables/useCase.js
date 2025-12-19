import { get, set, update } from 'idb-keyval';
import { ref } from 'vue';
import { store } from '../store/state.js';

// State
const caseItems = ref([]);
const isExporting = ref(false);

export function useCase() {

    // Load initial data
    const loadCases = async () => {
        const items = await get('prism_cases');
        if (items) caseItems.value = items;
    };

    // Add item to case
    const addCaseItem = async (item) => {
        // Prevent duplicates
        const exists = caseItems.value.some(
            existing => existing.content === item.content && existing.type === item.type
        );
        if (exists) {
            console.log("Duplicate item ignored");
            return null;
        }

        // item = { type, content, metadata, image?, timestamp }
        // Sanitize to remove Vue Proxies and non-cloneable types
        const cleanItem = JSON.parse(JSON.stringify(item));
        
        const newItem = {
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            ...cleanItem
        };
        
        await update('prism_cases', (val) => {
            const list = val || [];
            list.unshift(newItem); // Newest first
            return list;
        });
        
        // Update local state
        await loadCases();
        
        // Notify
        // (Assume we have a toast system, using store or just console for now)
        console.log("Item added to case", newItem);
        return newItem;
    };

    // Delete item
    const deleteCaseItem = async (id) => {
        await update('prism_cases', (val) => {
            return (val || []).filter(i => i.id !== id);
        });
        await loadCases();
    };

    // Clear all
    const clearCase = async () => {
        await set('prism_cases', []);
        caseItems.value = [];
    };

    // Generate Professional PDF Report
    const exportReport = async () => {
        if (caseItems.value.length === 0) return;
        isExporting.value = true;
        
        try {
            const { jsPDF } = await import('jspdf');
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let y = margin;

            // Helper: Check Page Break
            const checkPageBreak = (heightNeeded) => {
                if (y + heightNeeded > pageHeight - margin) {
                    doc.addPage();
                    y = margin;
                    return true;
                }
                return false;
            };

            // Helper: Draw Header
            const drawHeader = () => {
                doc.setFillColor(30, 41, 59); // Dark Slate
                doc.rect(0, 0, pageWidth, 25, 'F');
                doc.setFontSize(18);
                doc.setTextColor(255, 255, 255);
                doc.setFont("helvetica", "bold");
                doc.text("PRISM TACTICAL REPORT", margin, 17);
                
                doc.setFontSize(10);
                doc.setFont("helvetica", "normal");
                doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 17, { align: 'right' });
                y = 40;
            };

            drawHeader();

            // Stats Block
            doc.setFillColor(241, 245, 249); // Gray 100
            doc.setDrawColor(203, 213, 225); // Gray 300
            doc.roundedRect(margin, y, pageWidth - (margin * 2), 25, 3, 3, 'FD');
            
            doc.setFontSize(10);
            doc.setTextColor(71, 85, 105);
            doc.text("CASE SUMMARY", margin + 5, y + 8);
            
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42); // Darker
            doc.setFont("helvetica", "bold");
            doc.text(`${caseItems.value.length} EVIDENCE ITEMS`, margin + 5, y + 18);
            y += 35;

            // Evidence Loop
            for (const [index, item] of caseItems.value.entries()) {
                const itemHeight = 60; // Estimate
                checkPageBreak(itemHeight);

                // Evidence Box Header
                doc.setFillColor(248, 250, 252);
                doc.setDrawColor(226, 232, 240);
                doc.rect(margin, y, pageWidth - (margin * 2), 8, 'FD');
                
                // Item Title (Type + Date)
                doc.setFontSize(10);
                doc.setTextColor(51, 65, 85);
                doc.setFont("helvetica", "bold");
                doc.text(`EVIDENCE #${caseItems.value.length - index} · ${item.type.toUpperCase()}`, margin + 3, y + 5.5);
                
                doc.setFont("helvetica", "normal");
                doc.text(`${new Date(item.timestamp).toLocaleString()}`, pageWidth - margin - 3, y + 5.5, { align: 'right' });
                
                y += 12;

                // Main Content
                doc.setFontSize(11);
                doc.setTextColor(15, 23, 42);
                
                const splitText = doc.splitTextToSize(item.content || "No Content", pageWidth - (margin * 2) - 10);
                doc.text(splitText, margin + 5, y);
                y += (splitText.length * 5) + 5;

                // PDF Helper: Print Key-Value Line
                const printLine = (label, value, indent = 0) => {
                    if (!value || value === 'null' || value === 'undefined') return;
                    let valStr = String(value);
                    if (typeof value === 'object') {
                        valStr = JSON.stringify(value);
                    }
                    
                    const line = `${" ".repeat(indent)}${label}: ${valStr}`;
                    const splitLine = doc.splitTextToSize(line, pageWidth - (margin * 2) - 15);
                    checkPageBreak(splitLine.length * 4);
                    doc.text(splitLine, margin + 5 + (indent * 2), y);
                    y += (splitLine.length * 4);
                };

                // Metadata & Analysis Section
                if (item.metadata) {
                     // FIX: Destructure here to define 'others'
                     const { heuristics, qris, url, imageMeta, protocol, ...others } = item.metadata;

                     doc.setFontSize(9);
                     doc.setTextColor(100, 116, 139); // Slate 500
                     doc.setFont("helvetica", "bold");
                     doc.text("ANALYSIS DETAILS:", margin + 5, y);
                     y += 6;
                     
                     doc.setFont("helvetica", "normal");
                     doc.setFontSize(8);
                     doc.setTextColor(30, 41, 59); // Slate 800
                     // 6. Generic/Other Metadata (Flattened)
                     doc.setFont("helvetica", "italic");
                     doc.setTextColor(100, 116, 139);
                     
                     for (const [key, val] of Object.entries(others)) {
                         if (['timestamp', 'addedFrom', 'result', 'gps', 'originalMetadata', 'image'].includes(key)) continue; 
                         if (typeof val === 'object' && val !== null) continue;
                         
                         printLine(key, val);
                     }
                }

                // Image Handling (if present in metadata or content is dataURL)
                let imageUrl = null;
                // Check if content is Data URI image
                if (typeof item.content === 'string' && item.content.startsWith('data:image/')) {
                    imageUrl = item.content;
                }
                
                if (imageUrl) {
                    try {
                        const imgProps = doc.getImageProperties(imageUrl);
                        const imgWidth = 80;
                        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
                        
                        checkPageBreak(imgHeight + 10);
                        doc.addImage(imageUrl, 'PNG', margin + 5, y, imgWidth, imgHeight);
                        y += imgHeight + 10;
                    } catch (err) {
                        console.warn("Could not add image to PDF", err);
                    }
                }

                // Divider
                doc.setDrawColor(226, 232, 240);
                doc.line(margin, y, pageWidth - margin, y);
                y += 10;
            }
            
            // Footer (Page Numbers)
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            }

            doc.save(`PRISM_Report_${new Date().toISOString().slice(0,10)}.pdf`);
            
        } catch (e) {
            console.error("Export failed", e);
            alert("Export Failed: " + e.message);
        } finally {
            isExporting.value = false;
        }
    };

    return {
        caseItems,
        loadCases,
        addCaseItem,
        deleteCaseItem,
        clearCase,
        exportReport,
        isExporting
    };
}
