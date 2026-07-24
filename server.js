const dotenv = require('dotenv');
const http = require('http');
const app = require('./app');
const connectDB = require('./src/config/database');
const { initSocket } = require('./src/config/socket');

// Cron Jobs
const lowStockJob = require('./src/cron/lowStock.job');
const reportJob = require('./src/cron/report.job');
const backupJob = require('./src/cron/backup.job');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

// Load env vars
dotenv.config({ path: './.env' });

// Connect to Database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start Cron Jobs
lowStockJob();
reportJob();
backupJob();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});