require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes      = require('./routes/auth');
const plantRoutes     = require('./routes/plants');
const orderRoutes     = require('./routes/orders');
const whatsappRoutes  = require('./routes/whatsapp');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL || '*',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/plants',    plantRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/whatsapp',  whatsappRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '💧 Water Can Booking API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Global error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── MongoDB + Start ───────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/watercandb';

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Seed demo plants if none exist
    const Plant = require('./models/Plant');
    const count = await Plant.countDocuments();
    if (count === 0) {
      await Plant.insertMany([
        {
          name: 'Tirumala Water Plant',
          owner_name: 'Ravi Kumar',
          phone: '+91 98765 43210',
          whatsapp: '+919876543210',
          address: 'Tirumala Hills, Tirupati, Andhra Pradesh',
          location: { lat: 13.6288, lng: 79.4192 },
          cooling_price: 40,
          normal_price: 25,
          rating: 4.5,
          total_reviews: 128,
          is_active: true,
          delivery_radius_km: 10,
        },
        {
          name: 'Sri Venkateswara Waters',
          owner_name: 'Suresh Babu',
          phone: '+91 87654 32109',
          whatsapp: '+918765432109',
          address: 'Balaji Nagar, Tirupati, Andhra Pradesh',
          location: { lat: 13.6302, lng: 79.4210 },
          cooling_price: 35,
          normal_price: 20,
          rating: 4.2,
          total_reviews: 89,
          is_active: true,
          delivery_radius_km: 8,
        },
        {
          name: 'Balaji Pure Waters',
          owner_name: 'Venkatesh Reddy',
          phone: '+91 76543 21098',
          whatsapp: '+917654321098',
          address: 'Karakambadi Road, Tirupati, Andhra Pradesh',
          location: { lat: 13.6275, lng: 79.4178 },
          cooling_price: 45,
          normal_price: 30,
          rating: 4.8,
          total_reviews: 213,
          is_active: true,
          delivery_radius_km: 12,
        },
      ]);
      console.log('🌱 Demo plants seeded');
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
