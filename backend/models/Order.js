const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      unique: true,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plant_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plant',
      required: true,
    },
    cooling_cans: {
      type: Number,
      default: 0,
      min: 0,
    },
    normal_cans: {
      type: Number,
      default: 0,
      min: 0,
    },
    cooling_price: {
      type: Number,
      required: true,
    },
    normal_price: {
      type: Number,
      required: true,
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    delivery_date: {
      type: Date,
      required: true,
    },
    delivery_time: {
      type: String,
      enum: ['morning', 'afternoon', 'evening'],
      required: true,
    },
    delivery_address: {
      type: String,
      required: true,
    },
    delivery_location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    payment_method: {
      type: String,
      enum: ['upi', 'cod'],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    order_status: {
      type: String,
      enum: ['placed', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'],
      default: 'placed',
    },
    whatsapp_sent: {
      type: Boolean,
      default: false,
    },
    customer_name: {
      type: String,
      required: true,
    },
    customer_phone: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Index for user order history queries
orderSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
