const express = require('express');
const Room = require('../models/Room');
const Product = require('../models/Product');
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
      .populate('creator participants.user', 'username firstName lastName avatar')
      .populate('sharedCart.product sharedCart.addedBy', 'name price images username');

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
      .populate('sharedCart.addedBy', 'username firstName lastName')
      .populate('chatHistory.user', 'username firstName lastName');

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

    // Transform shared cart to ensure consistent structure
    const transformedRoom = {
      ...room.toObject(),
      sharedCart: room.sharedCart.map(item => ({
        _id: item._id,
        product: {
          _id: item.externalProductId,
          name: item.productData?.name || 'Unknown Product',
          price: item.productData?.price || 0,
          images: item.productData?.images || [],
          imageUrl: item.productData?.images?.[0] || ''
        },
        productData: item.productData,
        externalProductId: item.externalProductId,
        quantity: item.quantity,
        addedBy: item.addedBy,
        addedAt: item.addedAt
      }))
    };

    res.json(transformedRoom);
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update shared cart
router.put('/:id/cart', authenticate, async (req, res) => {
  try {
    const { productId, quantity, action, productData } = req.body;
    
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
          addedBy: req.userId
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

    res.json(transformedCart);
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create shared order with split payment
router.post('/:id/checkout', authenticate, async (req, res) => {
  try {
    const { shippingAddress, paymentSplits } = req.body;
    
    const room = await Room.findById(req.params.id)
      .populate('sharedCart.addedBy', 'username')
      .populate('participants.user', 'username email');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const isParticipant = room.participants.some(p => 
      p.user._id.toString() === req.userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Calculate totals
    const subtotal = room.sharedCart.reduce((total, item) => 
      total + (item.productData.price * item.quantity), 0
    );
    const tax = subtotal * 0.08;
    const shipping = subtotal > 35 ? 0 : 5.99;
    const total = subtotal + tax + shipping;

    // Create order
    const Order = require('../models/Order');
    const { nanoid } = require('nanoid');

    const order = new Order({
      orderNumber: 'WM' + nanoid(8).toUpperCase(),
      user: req.userId,
      items: room.sharedCart.map(item => ({
        productData: item.productData,
        externalProductId: item.externalProductId,
        quantity: item.quantity,
        price: item.productData.price,
        total: item.productData.price * item.quantity
      })),
      shippingAddress,
      subtotal,
      tax,
      shipping,
      total,
      isRoomOrder: true,
      roomId: room._id,
      paymentSplits: paymentSplits || [{
        user: req.userId,
        amount: total,
        status: 'pending'
      }]
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    console.error('Create shared order error:', error);
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
    .populate('participants.user', 'username firstName lastName')
    .populate('sharedCart.addedBy', 'username firstName lastName')
    .sort({ updatedAt: -1 });

    // Transform rooms to ensure consistent cart structure
    const transformedRooms = rooms.map(room => ({
      ...room.toObject(),
      sharedCart: room.sharedCart.map(item => ({
        _id: item._id,
        product: {
          _id: item.externalProductId,
          name: item.productData?.name || 'Unknown Product',
          price: item.productData?.price || 0,
          images: item.productData?.images || [],
          imageUrl: item.productData?.images?.[0] || ''
        },
        productData: item.productData,
        quantity: item.quantity,
        addedBy: item.addedBy
      }))
    }));

    res.json(transformedRooms);
  } catch (error) {
    console.error('Get user rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete room (only creator can delete)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.creator.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only room creator can delete the room' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;