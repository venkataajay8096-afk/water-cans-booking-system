const express = require('express');
const twilio = require('twilio');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── POST /api/whatsapp/send ───────────────────────────────────────────────────
router.post('/send', protect, async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({ error: 'order_id is required' });
    }

    const order = await Order.findById(order_id)
      .populate('plant_id', 'name phone whatsapp address')
      .populate('user_id', 'name phone');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Build WhatsApp message
    const timeLabels = {
      morning:   '6:00 AM – 11:00 AM',
      afternoon: '11:00 AM – 4:00 PM',
      evening:   '4:00 PM – 9:00 PM',
    };

    const deliveryDateStr = new Date(order.delivery_date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const coolingLine = order.cooling_cans > 0
      ? `❄️ Cooling Cans: ${order.cooling_cans} × ₹${order.cooling_price} = ₹${order.cooling_cans * order.cooling_price}`
      : null;

    const normalLine = order.normal_cans > 0
      ? `💧 Normal Cans:  ${order.normal_cans} × ₹${order.normal_price} = ₹${order.normal_cans * order.normal_price}`
      : null;

    const canLines = [coolingLine, normalLine].filter(Boolean).join('\n');

    const message = `────────────────────
💧 *Water Can Order*
Order ID: *${order.order_id}*
────────────────────
👤 Customer: ${order.customer_name}
📞 Phone: ${order.customer_phone}
────────────────────
${canLines}
💰 Grand Total: *₹${order.total_amount}*
────────────────────
📅 Delivery: ${deliveryDateStr}
⏰ Time: ${timeLabels[order.delivery_time] || order.delivery_time}
📍 Address: ${order.delivery_address}
💳 Payment: ${order.payment_method === 'upi' ? 'UPI' : 'Cash on Delivery'}
────────────────────
🏭 From: ${order.plant_id.name}
📞 Plant Phone: ${order.plant_id.phone}
────────────────────`;

    // Check if Twilio credentials are set
    const hasCredentials =
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_ACCOUNT_SID !== 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';

    if (!hasCredentials) {
      // Return the formatted message for frontend to open wa.me link
      await Order.findByIdAndUpdate(order_id, { whatsapp_sent: true });
      const targetWhatsapp = order.plant_id.whatsapp || order.plant_id.phone || '';
      return res.json({
        success: true,
        mode: 'link',
        message,
        whatsapp_number: targetWhatsapp,
        wa_link: `https://wa.me/${targetWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
      });
    }

    // Send via Twilio WhatsApp API
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    const targetWhatsapp = order.plant_id.whatsapp || order.plant_id.phone || '';
    const toNumber = targetWhatsapp.startsWith('whatsapp:')
      ? targetWhatsapp
      : `whatsapp:${targetWhatsapp}`;

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM,
      to: toNumber,
      body: message,
    });

    await Order.findByIdAndUpdate(order_id, { whatsapp_sent: true });

    res.json({
      success: true,
      mode: 'twilio',
      message: 'WhatsApp message sent successfully',
    });
  } catch (err) {
    console.error('WhatsApp send error:', err.message);
    res.status(500).json({ error: 'Failed to send WhatsApp message: ' + err.message });
  }
});

// ── POST /api/whatsapp/preview ─────────────────────────────────────────────────
router.post('/preview', protect, async (req, res) => {
  try {
    const { order_id } = req.body;
    const order = await Order.findById(order_id)
      .populate('plant_id', 'name whatsapp phone')
      .populate('user_id', 'name phone');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const timeLabels = {
      morning:   '6:00 AM – 11:00 AM',
      afternoon: '11:00 AM – 4:00 PM',
      evening:   '4:00 PM – 9:00 PM',
    };

    const deliveryDateStr = new Date(order.delivery_date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    const coolingLine = order.cooling_cans > 0
      ? `❄️ Cooling Cans: ${order.cooling_cans} × ₹${order.cooling_price} = ₹${order.cooling_cans * order.cooling_price}`
      : null;

    const normalLine = order.normal_cans > 0
      ? `💧 Normal Cans:  ${order.normal_cans} × ₹${order.normal_price} = ₹${order.normal_cans * order.normal_price}`
      : null;

    const canLines = [coolingLine, normalLine].filter(Boolean).join('\n');

    const preview = `────────────────────
💧 *Water Can Order*
Order ID: *${order.order_id}*
────────────────────
👤 Customer: ${order.customer_name}
📞 Phone: ${order.customer_phone}
────────────────────
${canLines}
💰 Grand Total: *₹${order.total_amount}*
────────────────────
📅 Delivery: ${deliveryDateStr}
⏰ Time: ${timeLabels[order.delivery_time] || order.delivery_time}
📍 Address: ${order.delivery_address}
💳 Payment: ${order.payment_method === 'upi' ? 'UPI' : 'Cash on Delivery'}
────────────────────`;

    const targetWhatsapp = order.plant_id.whatsapp || order.plant_id.phone || '';
    res.json({
      preview,
      wa_link: `https://wa.me/${targetWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(preview)}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
