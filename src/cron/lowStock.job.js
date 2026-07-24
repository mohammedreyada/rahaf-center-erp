const cron = require('node-cron');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const Setting = require('../models/Setting');
const { sendNotification } = require('../sockets/notification.socket');

module.exports = () => {
  // هتشتغل كل يوم الساعة 9 الصبح
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running Daily Alerts Job...');
    try {
      const settings = await Setting.findOne();
      const threshold = settings ? settings.lowStockThreshold : 5;
      
      // 1. فحص المنتجات اللي قربت تخلص
      const lowStockProducts = await Product.find({ stockQuantity: { $lte: threshold } }).select('name stockQuantity');
      if (lowStockProducts.length > 0) {
        await sendNotification(
          null, 
          'admin', 
          'Daily Low Stock Report', 
          `There are ${lowStockProducts.length} products running low.`, 
          'warning', 
          '/products'
        );
      }

      // 2. فحص العملاء اللي عليهم فلوس (مديونيات)
      const debtors = await Customer.find({ balance: { $lt: 0 } }).select('name balance');
      if (debtors.length > 0) {
        const totalDebt = Math.abs(debtors.reduce((acc, c) => acc + c.balance, 0));
        await sendNotification(
          null, 
          'admin', 
          'Outstanding Debts Alert', 
          `There are ${debtors.length} customers with total debt of ${totalDebt} EGP.`, 
          'danger', 
          '/customers'
        );
      }

      console.log('✅ Daily alerts checked.');
    } catch (error) {
      console.error('❌ Daily Alerts Error:', error);
    }
  });
};
