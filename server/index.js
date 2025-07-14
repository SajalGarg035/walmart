const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const roomRoutes = require('./routes/rooms');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://CodeTrack:qlvonOtyy8pnqK6n@codetrack.jiuaqby.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB')
  }
    ).catch(err => {
      console.error('MongoDB connection error:', err)
      }
      );

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);

// Socket.io connection handling
const activeRooms = new Map();
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (data) => {
    const { roomId, userId, username } = data;
    
    socket.join(roomId);
    userSockets.set(userId, socket.id);
    
    if (!activeRooms.has(roomId)) {
      activeRooms.set(roomId, new Set());
    }
    
    activeRooms.get(roomId).add({ userId, username, socketId: socket.id });
    
    // Notify room about new participant
    socket.to(roomId).emit('user-joined', { userId, username });
    
    // Send current participants to new user
    io.to(socket.id).emit('room-participants', Array.from(activeRooms.get(roomId)));
  });

  socket.on('leave-room', (data) => {
    const { roomId, userId } = data;
    
    socket.leave(roomId);
    
    if (activeRooms.has(roomId)) {
      const participants = activeRooms.get(roomId);
      participants.forEach(p => {
        if (p.userId === userId) {
          participants.delete(p);
        }
      });
      
      if (participants.size === 0) {
        activeRooms.delete(roomId);
      }
    }
    
    socket.to(roomId).emit('user-left', { userId });
  });

  socket.on('cart-update', (data) => {
    const { roomId, cart, userId } = data;
    socket.to(roomId).emit('cart-updated', { cart, updatedBy: userId });
  });

  socket.on('chat-message', (data) => {
    const { roomId, message, userId, username, timestamp } = data;
    io.to(roomId).emit('new-message', { message, userId, username, timestamp });
  });

  socket.on('typing', (data) => {
    const { roomId, userId, username, isTyping } = data;
    socket.to(roomId).emit('user-typing', { userId, username, isTyping });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all rooms
    activeRooms.forEach((participants, roomId) => {
      participants.forEach(p => {
        if (p.socketId === socket.id) {
          participants.delete(p);
          socket.to(roomId).emit('user-left', { userId: p.userId });
        }
      });
      
      if (participants.size === 0) {
        activeRooms.delete(roomId);
      }
    });
    
    // Remove from user sockets map
    userSockets.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        userSockets.delete(userId);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});