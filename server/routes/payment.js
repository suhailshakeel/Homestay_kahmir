import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { auth } from '../middleware/auth.js';
import Room from '../models/Room.js';

const router = express.Router();

// Directly provide Razorpay credentials
const razorpay = new Razorpay({
  key_id: 'rzp_test_ycXpmqnI1Zr8rU', // Replace with your actual key_id
  key_secret: 'oHmPZggJ3GK6bVGdTcWi12l5', // Replace with your actual key_secret
});

router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, roomId } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.status !== 'available') {
      return res.status(400).json({ message: 'Room is not available' });
    }

    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        roomId,
        userId: req.user._id,
      },
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Payment order creation error:', error);
    res.status(500).json({ message: 'Failed to create payment order' });
  }
});

router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify payment signature
    const generated_signature = crypto
      .createHmac('sha256', 'your_key_secret_here') // Replace with your actual key_secret
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    res.json({ verified: true });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
});

export default router;
