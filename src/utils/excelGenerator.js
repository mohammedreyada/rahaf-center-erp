const ExcelJS = require('exceljs');

exports.exportSalesToExcel = async (sales, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sales');

  worksheet.columns = [
    { header: 'Invoice', key: 'invoiceNumber', width: 20 },
    { header: 'Customer', key: 'customerName', width: 25 },
    { header: 'Total', key: 'totalAmount', width: 15 },
    { header: 'Status', key: 'paymentStatus', width: 15 },
    { header: 'Date', key: 'createdAt', width: 20 },
  ];

  sales.forEach(sale => {
    worksheet.addRow({
      invoiceNumber: sale.invoiceNumber,
      customerName: sale.customer?.name || 'N/A',
      totalAmount: sale.totalAmount,
      paymentStatus: sale.paymentStatus,
      createdAt: new Date(sale.createdAt).toLocaleDateString(),
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};