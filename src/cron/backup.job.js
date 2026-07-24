const cron = require('node-cron');

module.exports = () => {
  // هتشتغل كل يوم حد الساعة 2 بالليل
  cron.schedule('0 2 * * 0', () => {
    console.log('⏰ Running Weekly Database Backup Job...');
    console.log('✅ Database backup completed (Mock).');
  });
};