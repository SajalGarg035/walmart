const express = require('express');
const Order = require('../models/Order');
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

// Create new order
router.post('/', authenticate, async (req, res) => {
  try {
    const { 
      items, 
      shippingAddress, 
      paymentMethod, 
      subtotal, 
      tax, 
      shipping, 
      total,
      roomId,
      paymentSplits
    } = req.body;

    const order = new Order({
      orderNumber: 'WM' + nanoid(8).toUpperCase(),
      user: req.userId,
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      total,
      isRoomOrder: !!roomId,
      roomId,
      paymentSplits
    });

    await order.save();
    await order.populate('items.product', 'name images');

    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's orders
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('user', 'username firstName lastName');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order or is part of room order
    if (order.user._id.toString() !== req.userId && !order.isRoomOrder) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;