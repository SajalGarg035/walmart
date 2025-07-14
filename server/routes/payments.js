const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
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

// Create payment intent
router.post('/create-payment-intent', authenticate, async (req, res) => {
  try {
    const { amount, currency = 'usd', orderId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId,
        userId: req.userId
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create payment intent for split payment
router.post('/create-split-payment', authenticate, async (req, res) => {
  try {
    const { orderId, userAmount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(userAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId,
        userId: req.userId,
        splitPayment: 'true'
      }
    });

    // Update order with payment intent ID
    const splitIndex = order.paymentSplits.findIndex(
      split => split.user.toString() === req.userId
    );
    
    if (splitIndex > -1) {
      order.paymentSplits[splitIndex].paymentIntentId = paymentIntent.id;
      await order.save();
    }

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create split payment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Webhook to handle payment confirmations
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const { orderId, userId, splitPayment } = paymentIntent.metadata;

    try {
      const order = await Order.findById(orderId);
      if (order) {
        if (splitPayment === 'true') {
          // Update split payment status
          const splitIndex = order.paymentSplits.findIndex(
            split => split.user.toString() === userId
          );
          if (splitIndex > -1) {
            order.paymentSplits[splitIndex].status = 'paid';
          }
          
          // Check if all splits are paid
          const allPaid = order.paymentSplits.every(split => split.status === 'paid');
          if (allPaid) {
            order.status = 'confirmed';
          }
        } else {
          order.status = 'confirmed';
        }
        await order.save();
      }
    } catch (error) {
      console.error('Error updating order after payment:', error);
    }
  }

  res.json({received: true});
});

module.exports = router;