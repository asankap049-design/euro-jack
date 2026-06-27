require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// -----------------------------------------
// MongoDB Connection
// -----------------------------------------
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("⚠️ Warning: MONGODB_URI is not defined in .env! Application will fail to connect to DB.");
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));
}

// -----------------------------------------
// Mongoose Models
// -----------------------------------------
const DrawSchema = new mongoose.Schema({
  d: { type: String, required: true }, // Date string
  n: { type: [Number], required: true }, // 5 Main Numbers
  e: { type: [Number] } // 2 Euro Numbers (Optional for backward compatibility)
}, { timestamps: true });

const Draw = mongoose.models.Draw || mongoose.model('Draw', DrawSchema);

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  status: { type: String, default: 'unused' },
  activeSession: { type: String, default: null },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

// -----------------------------------------
// Authentication Middleware
// -----------------------------------------
async function authenticateCoupon(req, res, next) {
  const couponCode = req.headers['x-coupon-code'];
  const sessionToken = req.headers['x-session-token'];

  if (!couponCode || !sessionToken) {
    return res.status(401).json({ error: 'Unauthorized: Missing credentials' });
  }

  try {
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) return res.status(401).json({ error: 'Unauthorized: Invalid coupon' });
    if (coupon.activeSession !== sessionToken) return res.status(401).json({ error: 'Unauthorized: Session taken over by another device' });
    
    next();
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
}

// -----------------------------------------
// Data Endpoints (MongoDB)
// -----------------------------------------
app.get('/api/draws', authenticateCoupon, async (req, res) => {
  try {
    // Sort descending by date or creation time. Since we imported them in order, sorting by _id desc is fine
    const draws = await Draw.find().sort({ _id: -1 }).lean();
    
    // We remove the MongoDB specific fields like _id to match old JSON format exactly
    const cleanDraws = draws.map(d => ({ d: d.d, n: d.n, e: d.e }));
    res.json(cleanDraws);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.post('/api/draws', async (req, res) => {
  const { password, draw } = req.body;
  if (password !== 'admin123') return res.status(401).json({ error: 'Unauthorized: Invalid password' });
  if (!draw || !draw.d || !draw.n || draw.n.length !== 5) return res.status(400).json({ error: 'Invalid draw format' });

  try {
    const newDraw = new Draw({ d: draw.d, n: draw.n, e: draw.e });
    await newDraw.save();
    res.json({ success: true, message: 'Draw added successfully', data: draw });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save draw' });
  }
});

// -----------------------------------------
// Coupon & Auth Endpoints (MongoDB)
// -----------------------------------------
app.post('/api/verify-coupon', async (req, res) => {
  const { couponCode } = req.body;
  if (!couponCode) return res.status(400).json({ error: 'Coupon code required' });

  try {
    const coupon = await Coupon.findOne({ code: couponCode });
    if (!coupon) return res.status(401).json({ error: 'Invalid coupon code' });

    const newSessionToken = crypto.randomUUID();
    
    coupon.activeSession = newSessionToken;
    coupon.lastLogin = new Date();
    coupon.status = 'active';
    await coupon.save();

    res.json({ success: true, sessionToken: newSessionToken });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/admin/coupons', async (req, res) => {
  const { password } = req.query;
  if (password !== 'admin123') return res.status(401).json({ error: 'Unauthorized' });

  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    res.json(coupons);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/coupons', async (req, res) => {
  const { password } = req.body;
  if (password !== 'admin123') return res.status(401).json({ error: 'Unauthorized' });

  try {
    const newCode = 'EUR-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const newCoupon = new Coupon({ code: newCode });
    await newCoupon.save();
    res.json({ success: true, coupon: newCoupon });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/admin/delete-coupon', async (req, res) => {
  const { password, code } = req.body;
  if (password !== 'admin123') return res.status(401).json({ error: 'Unauthorized' });
  if (!code) return res.status(400).json({ error: 'Coupon code required' });

  try {
    const result = await Coupon.deleteOne({ code });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Coupon not found' });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// -----------------------------------------
// Server Startup (Local vs Vercel)
// -----------------------------------------
// If this file is run directly (local development), start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running locally on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel serverless function
module.exports = app;
