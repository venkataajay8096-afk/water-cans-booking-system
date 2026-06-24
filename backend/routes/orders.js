const express = require('express');
const Order = require('../models/Order');
const Plant = require('../models/Plant');
const { protect } = require('../middleware/auth');
const { generateOrderId } = require('../utils/generateOrderId');

const router = express.Router();

// ── POST /api/orders ──────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    const {
      plant_id,
      cooling_cans,
      normal_cans,
      delivery_date,
      delivery_time,
      delivery_address,
      delivery_location,
      payment_method,
    } = req.body;

    if (!plant_id || (!cooling_cans && !normal_cans)) {
      return res.status(400).json({ error: 'Plant and at least one can type is required' });
    }
    if (!delivery_date || !delivery_time || !delivery_address) {
      return res.status(400).json({ error: 'Delivery details are required' });
    }
    if (!payment_method) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    let plant;
    try {
      plant = await Plant.findById(plant_id);
    } catch (err) {
      if (err.name === 'CastError') {
        return res.status(404).json({ error: 'Plant not found' });
      }
      throw err;
    }
    if (!plant) return res.status(404).json({ error: 'Plant not found' });

    const coolingAmt = (cooling_cans || 0) * plant.cooling_price;
    const normalAmt  = (normal_cans  || 0) * plant.normal_price;
    const totalAmount = coolingAmt + normalAmt;

    const order = await Order.create({
      order_id: generateOrderId(),
      user_id: req.user._id,
      plant_id,
      cooling_cans: cooling_cans || 0,
      normal_cans: normal_cans || 0,
      cooling_price: plant.cooling_price,
      normal_price: plant.normal_price,
      total_amount: totalAmount,
      delivery_date: new Date(delivery_date),
      delivery_time,
      delivery_address,
      delivery_location: delivery_location || {},
      payment_method,
      customer_name: req.user.name,
      customer_phone: req.user.phone,
    });

    await order.populate(['user_id', 'plant_id']);

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/orders/my-orders ─────────────────────────────────────────────────
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user_id: req.user._id })
      .populate('plant_id', 'name phone address location')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ orders, count: orders.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('plant_id', 'name phone address whatsapp cooling_price normal_price')
      .populate('user_id', 'name phone');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Users can only see their own orders
    if (
      req.user.role !== 'admin' &&
      order.user_id._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/orders/:id/status ─────────────────────────────────────────────────
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { order_status, payment_status } = req.body;
    const validOrderStatuses = ['placed', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed'];

    const updates = {};
    if (order_status) {
      if (!validOrderStatuses.includes(order_status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }
      updates.order_status = order_status;
    }
    if (payment_status) {
      if (!validPaymentStatuses.includes(payment_status)) {
        return res.status(400).json({ error: 'Invalid payment status' });
      }
      updates.payment_status = payment_status;
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
