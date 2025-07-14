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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/walmart', {
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

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

  socket.on('cart-update', async (data) => {
    const { roomId, action, productId, quantity, userId, productData } = data;
    try {
      const Room = require('./models/Room');
      const room = await Room.findById(roomId);
      
      if (room) {
        const existingItemIndex = room.sharedCart.findIndex(item => 
          item.externalProductId === productId
        );

        if (action === 'add') {
          if (existingItemIndex > -1) {
            room.sharedCart[existingItemIndex].quantity += quantity || 1;
          } else {
            room.sharedCart.push({
              externalProductId: productId,
              productData: productData || {
                name: `Product ${productId}`,
                price: 0,
                images: []
              },
              quantity: quantity || 1,
              addedBy: userId
            });
          }
        } else if (action === 'remove') {
          if (existingItemIndex > -1) {
            room.sharedCart.splice(existingItemIndex, 1);
          }
        } else if (action === 'update') {
          if (existingItemIndex > -1) {
            if (quantity <= 0) {
              room.sharedCart.splice(existingItemIndex, 1);
            } else {
              room.sharedCart[existingItemIndex].quantity = quantity;
            }
          }
        }

        await room.save();
        await room.populate('sharedCart.addedBy', 'username firstName lastName');
        
        // Transform cart for frontend
        const transformedCart = room.sharedCart.map(item => ({
          _id: item._id,
          product: {
            _id: item.externalProductId,
            name: item.productData.name,
            price: item.productData.price,
            images: item.productData.images,
            imageUrl: item.productData.images?.[0]
          },
          quantity: item.quantity,
          addedBy: item.addedBy
        }));
        
        // Broadcast updated cart to all room participants
        io.to(roomId).emit('cart-updated', { 
          cart: transformedCart, 
          updatedBy: userId,
          action,
          productId 
        });
      }
    } catch (error) {
      console.error('Error updating shared cart:', error);
      socket.emit('cart-update-error', { error: 'Failed to update cart' });
    }
  });

  socket.on('chat-message', (data) => {
    const { roomId, message, userId, username, timestamp } = data;
    
    // Save message to database
    const Room = require('./models/Room');
    Room.findById(roomId).then(room => {
      if (room) {
        room.chatHistory.push({
          user: userId,
          message,
          timestamp: new Date(timestamp)
        });
        room.save();
      }
    }).catch(err => console.error('Error saving message:', err));
    
    // Broadcast message to all room participants
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