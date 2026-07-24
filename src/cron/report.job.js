const cron = require('node-cron');
const Sale = require('../models/Sale');
const { sendNotification } = require('../sockets/notification.socket');

module.exports = () => {
  // هتشتغل كل يوم الساعة 11 بالليل (ملخص المبيعات اليومية)
  cron.schedule('0 23 * * *', async () => {
    console.log('⏰ Running Daily Report Cron Job...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const sales = await Sale.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, totalSales: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
      ]);
      
      const totalSales = sales.length > 0 ? sales[0].totalSales : 0;
      const count = sales.length > 0 ? sales[0].count : 0;
      
      const message = `Today's Sales: ${count} invoices with a total of ${totalSales} EGP.`;
      await sendNotification(null, 'admin', 'Daily Sales Report', message, 'success', '/reports');
      
      console.log('✅ Daily report notification sent.');
    } catch (error) {
      console.error('❌ Report Cron Error:', error);
    }
  });
};