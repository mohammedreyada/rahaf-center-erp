const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io;

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
  });

  // Middleware للتحقق من الـ JWT عند الاتصال
  io.use(async (socket, next) => {
    let token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Authentication error: User not found'));
      
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🟢 User connected: ${socket.user.name} (${socket.user.role})`);

    // الانضمام لغرفة خاصة بالمستخدم
    socket.join(`user_${socket.user._id}`);

    // الانضمام لغرفة حسب الوظيفة (Role)
    socket.join(`role_${socket.user.role}`);

    socket.on('disconnect', () => {
      console.log(`🔴 User disconnected: ${socket.user.name}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };