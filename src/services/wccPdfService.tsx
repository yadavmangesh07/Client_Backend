import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { WCCData } from "@/types/wccTypes"; 

export const generateWCCPdf = (data: WCCData) => {
  const doc = new jsPDF();
  
  // --- CONSTANTS ---
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // --- 1. TITLE ---
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Work Completion Certificate", pageWidth / 2, 15, { align: "center" });
  
  // Underline the title
  const textWidth = doc.getTextWidth("Work Completion Certificate");
  doc.setLineWidth(0.5);
  doc.line((pageWidth / 2) - (textWidth / 2), 17, (pageWidth / 2) + (textWidth / 2), 17);

  // --- 2. HEADER GRID ---
  autoTable(doc, {
    startY: 20,
    theme: 'plain', 
    styles: {
      lineColor: 0, // Black
      lineWidth: 0.2,
      textColor: 0, // Black
      fontSize: 9,
      font: "helvetica",
      cellPadding: 1.5,
      valign: 'middle',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 25 }, 
      1: { cellWidth: 100 }, 
      2: { fontStyle: 'bold', cellWidth: 20 }, 
      3: { cellWidth: 30 }
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
        { content: data.certificateDate }
      ],
      [
        { content: 'P.O. NO.', styles: { fontStyle: 'bold' } },
        { content: data.poNo, colSpan: 3 } 
      ],
      [
        { content: 'DATE', styles: { fontStyle: 'bold' } },
        { content: data.poDate, colSpan: 3 }
      ],
      [
        { content: 'GSTIN', styles: { fontStyle: 'bold' } },
        { content: data.gstin, colSpan: 3 }
      ]
    ],
    // 👇 FIXED: Added type 'any' to data parameter
    didParseCell: function(data: any) {
        data.cell.styles.lineWidth = 0.2;
        data.cell.styles.lineColor = 0;
    }
  });

  // --- 3. ITEMS TABLE ---
  const finalY = (doc as any).lastAutoTable.finalY;

  autoTable(doc, {
    startY: finalY, 
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
    // 👇 FIXED: Added type 'any' to data parameter
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

  doc.setFont("times", "italic");
  doc.setFontSize(20);
  doc.text("Jmd Decor", rightX - 20, footerY + 15, { align: "center" }); 

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  
  doc.text(data.clientName, margin, footerY + 30);
  doc.text(data.companyName, rightX, footerY + 30, { align: "right" });

  // --- SAVE ---
  // Using a sanitized filename
  const safeRef = data.refNo ? data.refNo.replace(/[^a-zA-Z0-9]/g, "_") : "WCC";
  return doc.output("blob");
};