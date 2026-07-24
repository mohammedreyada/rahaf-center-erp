const PDFDocument = require('pdfkit');

exports.generateInvoicePDF = (sale, res) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${sale.invoiceNumber}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text('Rahaf Center ERP', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice: ${sale.invoiceNumber}`);
  doc.text(`Customer: ${sale.customer?.name || 'Walk-in Customer'}`);
  doc.text(`Date: ${new Date(sale.createdAt).toLocaleDateString()}`);
  doc.moveDown();

  doc.text('Items:', { underline: true });
  sale.items.forEach(item => {
    doc.text(`${item.name} (${item.quantity} x ${item.price}) = ${item.total}`);
  });
  doc.moveDown();
  doc.fontSize(16).text(`Total: ${sale.totalAmount} EGP`, { align: 'right' });

  doc.end();
};