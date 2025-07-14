const express = require('express');
const Room = require('../models/Room');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const router = express.Router();

// Middleware to authenticate user
const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create new room
router.post('/', authenticate, async (req, res) => {
  try {
    const { name } = req.body;
    
    const room = new Room({
      name,
      code: nanoid(8).toUpperCase(),
      creator: req.userId,
      participants: [{
        user: req.userId,
        joinedAt: new Date()
      }]
    });

    await room.save();
    await room.populate('creator participants.user', 'username firstName lastName avatar');

    res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Join room by code
router.post('/join', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    
    const room = await Room.findOne({ code, isActive: true })
      .populate('creator participants.user', 'username firstName lastName avatar');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user already in room
    const alreadyJoined = room.participants.some(p => 
      p.user._id.toString() === req.userId
    );

    if (!alreadyJoined) {
      room.participants.push({
        user: req.userId,
        joinedAt: new Date()
      });
      await room.save();
      await room.populate('participants.user', 'username firstName lastName avatar');
    }

    res.json(room);
  } catch (error) {
    console.error('Join room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get room details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator participants.user', 'username firstName lastName avatar')
      .populate('sharedCart.product sharedCart.addedBy', 'name price images username');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is participant
    const isParticipant = room.participants.some(p => 
      p.user._id.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(room);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update shared cart
router.put('/:id/cart', authenticate, async (req, res) => {
  try {
    const { productId, quantity, action } = req.body;
    
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isParticipant = room.participants.some(p => 
      p.user.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const existingItemIndex = room.sharedCart.findIndex(item => 
      item.product.toString() === productId
    );

    if (action === 'add') {
      if (existingItemIndex > -1) {
        room.sharedCart[existingItemIndex].quantity += quantity;
      } else {
        room.sharedCart.push({
          product: productId,
          quantity,
          addedBy: req.userId
        });
      }
    } else if (action === 'remove') {
      if (existingItemIndex > -1) {
        room.sharedCart.splice(existingItemIndex, 1);
      }
    } else if (action === 'update') {
      if (existingItemIndex > -1) {
        room.sharedCart[existingItemIndex].quantity = quantity;
      }
    }

    await room.save();
    await room.populate('sharedCart.product sharedCart.addedBy', 'name price images username');

    res.json(room.sharedCart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's rooms
router.get('/user/my-rooms', authenticate, async (req, res) => {
  try {
    const rooms = await Room.find({
      'participants.user': req.userId,
      isActive: true
    })
    .populate('creator', 'username firstName lastName')
    .sort({ updatedAt: -1 });

    res.json(rooms);
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;