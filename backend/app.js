const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');

const corsConfig = require('./config/cors');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors(corsConfig));
app.use(mongoSanitize());

// Parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());

// Logging (development only)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', apiLimiter);

// API Routes (v1)
app.use('/api/v1', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API documentation endpoint (basic)
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Healthcare Admin Portal API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      hospitals: '/api/v1/hospitals',
      staff: '/api/v1/staff',
      resources: '/api/v1/resources',
      users: '/api/v1/users', // Assuming users route exists, though not explicitly added in the change
      dashboard: '/api/v1/dashboard',
      logs: '/api/v1/logs',
      feedback: '/api/v1/feedback' // Added feedback endpoint
    }
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
