import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns"; // 👈 Import date-fns
import type { WCCData } from "@/types/wccTypes"; 

// Helper to safely format dates
const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "";
    try {
        return format(new Date(dateStr), "dd MMM yyyy");
    } catch (e) {
        return dateStr; // Fallback to original string if parsing fails
    }
};

export const generateWCCPdf = (data: WCCData) => {
  const doc = new jsPDF();
  
  // --- CONSTANTS ---
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2); 

  // --- 1. TITLE ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Work Completion Certificate", pageWidth / 2, 15, { align: "center" });
  
  const textWidth = doc.getTextWidth("Work Completion Certificate");
  doc.setLineWidth(0.5);
  doc.line((pageWidth / 2) - (textWidth / 2), 17, (pageWidth / 2) + (textWidth / 2), 17);

  // --- 2. HEADER GRID ---
  const col0Width = 25; 
  const col2Width = 25; 
  const col3Width = 35; 
  const col1Width = contentWidth - col0Width - col2Width - col3Width;

  // 👇 PRE-FORMAT DATES BEFORE TABLE
  const displayCertDate = formatDate(data.certificateDate);
  const displayPoDate = formatDate(data.poDate);

  autoTable(doc, {
    startY: 20,
    theme: 'plain', 
    styles: {
      lineColor: 0, 
      lineWidth: 0.2,
      textColor: 0,
      fontSize: 9,
      font: "helvetica",
      cellPadding: 1.5,
      valign: 'middle',
    },
    tableWidth: contentWidth, 
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: col0Width }, 
      1: { cellWidth: col1Width }, 
      2: { fontStyle: 'bold', cellWidth: col2Width }, 
      3: { cellWidth: col3Width }
    },
    body: [
      [
        { content: 'Store Name:', styles: { fontStyle: 'bold' } },
        { content: data.storeName, styles: { fontStyle: 'bold' } }, 
        { content: 'REF NO:', styles: { fontStyle: 'bold' } },
        { content: data.refNo }
      ],
      [
        { content: 'PROJECT\nLOCATION:', styles: { fontStyle: 'bold' } },
        { content: data.projectLocation },
        { content: 'Date:', styles: { fontStyle: 'bold' } },
        { content: displayCertDate } // 👈 Uses Formatted Date
      ],
      [
        { content: 'P.O. NO.', styles: { fontStyle: 'bold' } },
        { content: data.poNo, colSpan: 3 } 
      ],
      [
        { content: 'DATE', styles: { fontStyle: 'bold' } },
        { content: displayPoDate, colSpan: 3 } // 👈 Uses Formatted Date
      ],
      [
        { content: 'GSTIN', styles: { fontStyle: 'bold' } },
        { content: data.gstin, colSpan: 3 }
      ]
    ],
    didParseCell: function(data: any) {
        data.cell.styles.lineWidth = 0.2;
        data.cell.styles.lineColor = 0;
    }
  });

  // --- 3. ITEMS TABLE ---
  const finalY = (doc as any).lastAutoTable.finalY;

  autoTable(doc, {
    startY: finalY, 
    tableWidth: contentWidth,
    head: [['Sr. No.', 'Activity', 'Qty- Sq.Ft/Nos.']],
    body: data.items.map(item => [
      item.srNo,
      item.activity,
      item.qty
    ]),
    theme: 'plain',
    styles: {
      lineColor: 0,
      lineWidth: 0.2,
      textColor: 0,
      fontSize: 9,
      cellPadding: 2,
      valign: 'middle',
      overflow: 'linebreak'
    },
    headStyles: {
      fontStyle: 'bold',
      halign: 'center',
      fillColor: [240, 240, 240] 
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left' }, 
      2: { halign: 'center', cellWidth: 30 } 
    },
    didParseCell: function(data: any) {
        data.cell.styles.lineWidth = 0.2;
        data.cell.styles.lineColor = 0;
    }
  });

  // --- 4. CERTIFICATE TEXT ---
  let cursorY = (doc as any).lastAutoTable.finalY + 15;

  if (cursorY > 250) {
      doc.addPage();
      cursorY = 20;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATE OF WORKS", pageWidth / 2, cursorY, { align: "center" });
  
  cursorY += 10;
  doc.setFont("helvetica", "normal");
  const certText = `I CERTIFY that the work under the above named has been satisfactorily completed under the terms of the works recommended to the vendor.`;
  
  const splitText = doc.splitTextToSize(certText, contentWidth);
  doc.text(splitText, margin, cursorY);
  
  cursorY += (splitText.length * 5) + 5;
  doc.text("Store Manager", pageWidth / 2, cursorY, { align: "center" });

  cursorY += 10;
  doc.text("Remarks: __________________________________________________________________________________", margin, cursorY);


  // --- 5. FOOTER SIGNATURES ---
  let footerY = cursorY + 30;
  
  if (footerY > 270) {
      doc.addPage();
      footerY = 40;
  }

  doc.setFont("helvetica", "bold");
  doc.text("STORE MANAGER SIGN & STAMP", margin, footerY);
  
  const rightX = pageWidth - margin;
  doc.text("VENDOR SIGN & STAMP", rightX, footerY, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  
  doc.text(data.clientName || "", margin, footerY + 30);
  doc.text(data.companyName || "", rightX, footerY + 30, { align: "right" });

  // --- 6. PAGE BORDER ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setLineWidth(0.5);
    doc.setDrawColor(0);
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
  }

  const safeRef = data.refNo ? data.refNo.replace(/[^a-zA-Z0-9]/g, "_") : "WCC";
  return doc.output("blob");
};