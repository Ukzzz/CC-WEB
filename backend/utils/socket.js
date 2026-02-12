const socketIo = require('socket.io');

let io;

module.exports = {
  init: (httpServer) => {
    io = socketIo(httpServer, {
      cors: {
        origin: '*', // Allow all origins for simplicity in this project, or specify frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      socket.on('disconnect', () => {
        // Client disconnected - can add cleanup logic here
      });
      
      // Allow clients to join hospital-specific rooms
      socket.on('join_hospital', (hospitalId) => {
        if (hospitalId) {
          socket.join(hospitalId);
        }
      });
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  }
};

