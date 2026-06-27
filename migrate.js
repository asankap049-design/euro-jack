require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI is not defined in your .env file!");
  process.exit(1);
}

// -----------------------------------------
// Mongoose Models
// -----------------------------------------
const DrawSchema = new mongoose.Schema({
  d: { type: String, required: true },
  n: { type: [Number], required: true },
  e: { type: [Number] }
}, { timestamps: true });

const Draw = mongoose.models.Draw || mongoose.model('Draw', DrawSchema);

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  status: { type: String, default: 'unused' },
  activeSession: { type: String, default: null },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

async function migrateData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!");

    // 1. Migrate Draws
    const dataFile = path.join(__dirname, 'data.json');
    if (fs.existsSync(dataFile)) {
      const draws = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
      console.log(`Found ${draws.length} draws in data.json. Removing old database entries...`);
      await Draw.deleteMany({});
      
      // Mongoose insertMany is fast but ignores ordering hooks. For basic docs it's fine.
      // But we want them in reverse order (newest first). Mongoose defaults to inserting array order.
      // We will reverse it so the oldest _id is first, to match the original sorting logic.
      const reversedDraws = [...draws].reverse(); 
      await Draw.insertMany(reversedDraws);
      console.log("✅ Migrated Draws!");
    } else {
      console.log("⚠️ data.json not found, skipping.");
    }

    // 2. Migrate Coupons
    const couponsFile = path.join(__dirname, 'coupons.json');
    if (fs.existsSync(couponsFile)) {
      const coupons = JSON.parse(fs.readFileSync(couponsFile, 'utf8'));
      console.log(`Found ${coupons.length} coupons in coupons.json. Removing old database entries...`);
      await Coupon.deleteMany({});
      
      const reversedCoupons = [...coupons].reverse();
      await Coupon.insertMany(reversedCoupons);
      console.log("✅ Migrated Coupons!");
    } else {
      console.log("⚠️ coupons.json not found, skipping.");
    }

    console.log("🎉 All data migrated successfully!");
    process.exit(0);

  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrateData();
