const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Setting = require("../models/Setting");

async function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ error: "Unauthorized" });

    req.admin = admin;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

async function getBookingEnabledSetting() {
  const key = "bookingEnabled";
  let doc = await Setting.findOne({ key });
  if (!doc) {
    doc = await Setting.create({ key, value: true });
  }
  return doc;
}

// Test route to verify adminAuth is loaded
router.get("/test", (req, res) => {
  res.json({ message: "Admin auth route is working!" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ error: "Server configuration error. Please contact administrator." });
    }

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// GET /api/admin/booking-status
router.get("/booking-status", requireAdmin, async (req, res) => {
  try {
    const doc = await getBookingEnabledSetting();
    return res.json({ bookingEnabled: Boolean(doc.value) });
  } catch (err) {
    console.error("booking-status error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST /api/admin/toggle-booking
router.post("/toggle-booking", requireAdmin, async (req, res) => {
  try {
    const doc = await getBookingEnabledSetting();
    const nextValue = !Boolean(doc.value);
    doc.value = nextValue;
    await doc.save();
    return res.json({ bookingEnabled: nextValue });
  } catch (err) {
    console.error("toggle-booking error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

