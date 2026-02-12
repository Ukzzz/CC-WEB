require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');
const http = require('http');
const socket = require('./utils/socket');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
socket.init(server);

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   Healthcare Admin Portal API Server                       ║
║                                                            ║
║   Environment: ${process.env.NODE_ENV?.padEnd(42)}║
║   Port: ${String(PORT).padEnd(50)}║
║   API Base: http://localhost:${PORT}/api/v1${' '.repeat(24)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated.');
    process.exit(0);
  });
});
