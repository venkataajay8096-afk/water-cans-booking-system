const express = require('express');
const Plant = require('../models/Plant');
const { protect } = require('../middleware/auth');
const { haversine } = require('../utils/haversine');

const router = express.Router();

// ── GET /api/plants/nearby?lat=&lng=&radius= ──────────────────────────────────
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 10; // km

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'lat and lng query params are required' });
    }

    const plants = await Plant.find({ is_active: true }).lean();

    let nearby = plants
      .map((plant) => ({
        ...plant,
        distance: haversine(lat, lng, plant.location.lat, plant.location.lng),
      }))
      .filter((plant) => plant.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    // Fallback: if no plants within radius, return closest ones in database
    if (nearby.length === 0 && plants.length > 0) {
      nearby = plants
        .map((plant) => ({
          ...plant,
          distance: haversine(lat, lng, plant.location.lat, plant.location.lng),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
    }

    res.json({ plants: nearby, count: nearby.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/plants/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    res.json({ plant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/plants ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const plants = await Plant.find({ is_active: true }).sort({ rating: -1 });
    res.json({ plants, count: plants.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/plants (admin) ──────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const plant = await Plant.create(req.body);
    res.status(201).json({ message: 'Plant added', plant });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/plants/:id ───────────────────────────────────────────────────────
router.put('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!plant) return res.status(404).json({ error: 'Plant not found' });
    res.json({ message: 'Plant updated', plant });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
