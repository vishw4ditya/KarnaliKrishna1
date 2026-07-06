import PDFDocument from 'pdfkit';

/**
 * Generate a PDF Invoice for an Order
 * @param {Object} order 
 * @param {Object} res - Express Response object to pipe the PDF to
 */
export const generateInvoice = (order, res) => {
  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Invoice-${order.orderNumber}.pdf`);

  doc.pipe(res);

  // Header - Title & Meta Info
  doc.fontSize(20).text('NEPAL BAZAAR E-COMMERCE', { align: 'center' });
  doc.fontSize(10).text('Kathmandu, Nepal | Phone: +977-1-4444444', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text('ORDER INVOICE', { underline: true });
  doc.moveDown(0.5);

  // Invoice Details
  doc.fontSize(10);
  doc.text(`Order Number: ${order.orderNumber}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
  doc.text(`Payment Method: ${order.paymentMethod.toUpperCase()}`);
  doc.text(`Payment Status: ${order.paymentStatus.toUpperCase()}`);
  doc.text(`Order Status: ${order.status}`);
  doc.moveDown();

  // Customer / Shipping Info
  doc.fontSize(11).text('Shipping Details:', { underline: true });
  doc.fontSize(10);
  doc.text(`Recipient Name: ${order.shippingAddress.name}`);
  doc.text(`Phone: ${order.shippingAddress.phone}`);
  doc.text(`Address: ${order.shippingAddress.addressLine}, ${order.shippingAddress.city}, ${order.shippingAddress.state}`);
  doc.text(`GPS Coordinates: Lat ${order.shippingAddress.latitude.toFixed(6)}, Lng ${order.shippingAddress.longitude.toFixed(6)}`);
  doc.moveDown();

  // Draw Table Header
  doc.fontSize(11).text('Order Items:', { underline: true });
  doc.moveDown(0.5);
  
  const tableTop = doc.y;
  doc.fontSize(10).text('Item Description', 50, tableTop, { bold: true });
  doc.text('Variant', 250, tableTop, { bold: true });
  doc.text('Price (Rs.)', 350, tableTop, { align: 'right', bold: true });
  doc.text('Qty', 420, tableTop, { align: 'right', bold: true });
  doc.text('Total (Rs.)', 480, tableTop, { align: 'right', bold: true });
  
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
  
  let currentY = tableTop + 20;

  // Print Order Items
  order.items.forEach((item) => {
    doc.text(item.name, 50, currentY);
    doc.text(item.variant || '-', 250, currentY);
    doc.text(item.price.toFixed(2), 350, currentY, { align: 'right' });
    doc.text(item.quantity.toString(), 420, currentY, { align: 'right' });
    doc.text((item.price * item.quantity).toFixed(2), 480, currentY, { align: 'right' });
    currentY += 20;
  });

  doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
  currentY += 10;

  // Billing Totals
  doc.text('Subtotal:', 350, currentY, { align: 'right' });
  doc.text(`Rs. ${order.subTotal.toFixed(2)}`, 480, currentY, { align: 'right' });
  currentY += 15;

  if (order.discountAmount > 0) {
    doc.text(`Discount (${order.coupon?.code || 'Coupon'}):`, 350, currentY, { align: 'right' });
    doc.text(`- Rs. ${order.discountAmount.toFixed(2)}`, 480, currentY, { align: 'right' });
    currentY += 15;
  }

  if (order.shippingCharge > 0) {
    doc.text('Shipping Charge:', 350, currentY, { align: 'right' });
    doc.text(`Rs. ${order.shippingCharge.toFixed(2)}`, 480, currentY, { align: 'right' });
    currentY += 15;
  }

  if (order.vatAmount > 0) {
    doc.text('VAT (13%):', 350, currentY, { align: 'right' });
    doc.text(`Rs. ${order.vatAmount.toFixed(2)}`, 480, currentY, { align: 'right' });
    currentY += 15;
  }

  doc.fontSize(12).text('Grand Total:', 350, currentY, { align: 'right', bold: true });
  doc.fontSize(12).text(`Rs. ${order.totalAmount.toFixed(2)}`, 480, currentY, { align: 'right', bold: true });

  // Thank You Message
  doc.moveDown(3);
  doc.fontSize(12).text('Thank you for shopping with Nepal Bazaar!', { align: 'center', italic: true });

  doc.end();
};

/**
 * Generate PDF Report (Sales, Branch Performance, or Support Issues)
 * @param {String} title - Report Title
 * @param {Array} headers - Column headers for table
 * @param {Array} rows - Multi-dimensional array of cells matching headers
 * @param {Object} res - Express Response object
 */
export const generatePdfReport = (title, headers, rows, res) => {
  const doc = new PDFDocument({ margin: 40 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Report-${title.replace(/\s+/g, '_')}-${Date.now()}.pdf`);

  doc.pipe(res);

  // Logo & Title
  doc.fontSize(18).text('NEPAL BAZAAR - MANAGEMENT SYSTEM', { align: 'center' });
  doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text(title.toUpperCase(), { underline: true });
  doc.moveDown();

  // Create table
  const startX = 40;
  let startY = doc.y;
  
  // Calculate column widths based on page width
  const pageWidth = 530; // 612 - 80
  const colWidth = Math.floor(pageWidth / headers.length);

  // Table Header
  doc.fontSize(10);
  headers.forEach((header, index) => {
    doc.text(header, startX + index * colWidth, startY, { bold: true });
  });

  doc.moveTo(startX, startY + 15).lineTo(startX + pageWidth, startY + 15).stroke();
  startY += 20;

  // Print Rows
  rows.forEach((row) => {
    // If row goes out of page height, create a new page
    if (startY > doc.page.height - 60) {
      doc.addPage();
      startY = 40;
    }

    row.forEach((cell, cellIndex) => {
      const cellVal = cell !== undefined && cell !== null ? String(cell) : '-';
      doc.text(cellVal, startX + cellIndex * colWidth, startY, {
        width: colWidth - 5,
        ellipsis: true
      });
    });
    startY += 18;
  });

  doc.end();
};
