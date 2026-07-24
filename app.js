const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// Utils & Middlewares
const ApiError = require('./src/utils/ApiError');
const { errorConverter, errorHandler } = require('./src/middlewares/error.middleware');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const categoryRoutes = require('./src/routes/category.routes');
const productRoutes = require('./src/routes/product.routes');
const customerRoutes = require('./src/routes/customer.routes');
const supplierRoutes = require('./src/routes/supplier.routes');
const saleRoutes = require('./src/routes/sale.routes');
const purchaseRoutes = require('./src/routes/purchase.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const expenseRoutes = require('./src/routes/expense.routes');
const settingRoutes = require('./src/routes/setting.routes');
const userRoutes = require('./src/routes/user.routes');
const reportRoutes = require('./src/routes/report.routes');
const stockRoutes = require('./src/routes/stock.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const app = express();

// Security & Parsing Middlewares
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api', limiter);

// Simple Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running perfectly' });
});

// Mount Routers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/suppliers', supplierRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/purchases', purchaseRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/stock', stockRoutes);
app.use('/api/v1/notifications', notificationRoutes);
// Send back a 404 error for any unknown API request
app.use((req, res, next) => {
  next(new ApiError(404, 'Not found'));
});

// Error Handling Middlewares
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;