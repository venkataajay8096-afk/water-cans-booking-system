const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plant name is required'],
      trim: true,
    },
    owner_name: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    whatsapp: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    location: {
      lat: { type: Number, required: [true, 'Latitude is required'] },
      lng: { type: Number, required: [true, 'Longitude is required'] },
    },
    cooling_price: {
      type: Number,
      required: [true, 'Cooling price is required'],
      min: [0, 'Price cannot be negative'],
    },
    normal_price: {
      type: Number,
      required: [true, 'Normal price is required'],
      min: [0, 'Price cannot be negative'],
    },
    rating: {
      type: Number,
      default: 4.0,
      min: 0,
      max: 5,
    },
    total_reviews: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    delivery_radius_km: {
      type: Number,
      default: 5,
    },
    image_url: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Index for geospatial queries
plantSchema.index({ 'location.lat': 1, 'location.lng': 1 });

module.exports = mongoose.model('Plant', plantSchema);
