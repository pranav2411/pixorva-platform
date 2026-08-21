import PDFDocument from 'pdfkit';

export interface InvoiceDetails {
  itemName: string;
  amount: number;
  razorpayId: string;
  subscriptionId: string;
  userEmail: string;
  date: string;
}

export function generateInvoicePdfBuffer(details: InvoiceDetails): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- PREMIUM THEME COLORS & FONTS ---
      const primaryColor = '#000000';
      const accentColor = '#facc15'; // Pixorva Yellow
      const grayText = '#4b5563';
      const lightBg = '#f3f4f6';

      // --- 1. HEADER BANNER (NEOBRUTALIST THEME) ---
      // Outer border box for the header
      doc.lineWidth(3);
      doc.rect(40, 40, 515, 80).fillAndStroke(accentColor, primaryColor);

      // Header Text
      doc.fillColor(primaryColor);
      doc.font('Helvetica-Bold').fontSize(24).text('PIXORVA AI WORKFORCE', 50, 58, { align: 'center', width: 495 });
      doc.font('Helvetica-Bold').fontSize(10).text('TAX INVOICE / RECEIPT', 50, 92, { align: 'center', width: 495 });

      // --- 2. INVOICE METADATA & PARTIES ---
      doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor).text('INVOICE TO:', 40, 150);
      doc.font('Helvetica').fontSize(10).fillColor(grayText).text(`Customer: ${details.userEmail}`, 40, 170);
      doc.text(`Date of Issue: ${details.date}`, 40, 185);

      doc.font('Helvetica-Bold').fontSize(12).fillColor(primaryColor).text('PROVIDER:', 360, 150);
      doc.font('Helvetica').fontSize(10).fillColor(grayText).text('Pixorva Workforce Platform', 360, 170);
      doc.text('Grievance Desk: grievance@pixorva.com', 360, 185);
      doc.text('Status: Paid & Verified', 360, 200);

      // Divider Line
      doc.lineWidth(1).moveTo(40, 230).lineTo(555, 230).stroke(primaryColor);

      // --- 3. PAYMENT REFERENCE SECTION ---
      doc.rect(40, 245, 515, 60).fillAndStroke(lightBg, primaryColor);
      doc.fillColor(primaryColor);
      doc.font('Helvetica-Bold').fontSize(10).text('BILLING REFERENCE METADATA', 55, 255);
      
      doc.font('Helvetica').fontSize(9).fillColor(grayText);
      doc.text(`Razorpay Payment Reference ID: ${details.razorpayId}`, 55, 275);
      doc.text(`Subscription / Order Reference ID: ${details.subscriptionId}`, 55, 290);

      // --- 4. LINE ITEMS TABLE ---
      doc.lineWidth(2);
      
      // Table Header Row
      doc.rect(40, 335, 515, 25).fillAndStroke(accentColor, primaryColor);
      doc.fillColor(primaryColor);
      doc.font('Helvetica-Bold').fontSize(10).text('ITEM DESCRIPTION', 50, 343);
      doc.text('BILLING CYCLE', 340, 343);
      doc.text('TOTAL AMOUNT', 460, 343, { align: 'right', width: 85 });

      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
      }).format(details.amount);

      // Table Data Row
      doc.rect(40, 360, 515, 40).stroke(primaryColor);
      doc.font('Helvetica').fontSize(10).text(`${details.itemName} (Monthly Plan)`, 50, 375);
      doc.text('Monthly Subscription', 340, 375);
      doc.font('Helvetica-Bold').fontSize(10).text(formattedAmount, 460, 375, { align: 'right', width: 85 });

      // Total Summaries
      doc.rect(340, 415, 215, 30).fillAndStroke(accentColor, primaryColor);
      doc.fillColor(primaryColor);
      doc.font('Helvetica-Bold').fontSize(11).text('NET PAID AMOUNT:', 350, 425);
      doc.text(formattedAmount, 455, 425, { align: 'right', width: 90 });

      // --- 5. COMPLIANCE & LEGAL NOTICE ---
      doc.lineWidth(1).moveTo(40, 480).lineTo(555, 480).stroke(primaryColor);
      
      doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor).text('TERMS & REGULATORY DISCLOSURE', 40, 495);
      doc.font('Helvetica').fontSize(8.5).fillColor(grayText);
      
      const disclosureText = 
        'This is a computer-generated tax invoice issued by the Pixorva Billing Desk. All services, including AI workspace allocations, API quotas, and hired developer agents, are provided subject to the Pixorva Terms of Service and Content Policies. Payments are securely processed through authorized Razorpay payment gateways.';
      doc.text(disclosureText, 40, 510, { align: 'justify', lineGap: 3, width: 515 });

      // Support contact info
      doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryColor);
      doc.text('Support & Grievances Desk: billing@pixorva.com', 40, 565, { align: 'center', width: 515 });
      
      doc.font('Helvetica').fontSize(8).fillColor(grayText);
      doc.text('Pixorva Systems © 2026. All rights reserved.', 40, 580, { align: 'center', width: 515 });

      // End Document Stream
      doc.end();

    } catch (err) {
      reject(err);
    }
  });
}
