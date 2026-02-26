const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Admin = require("../models/Admin");
const Booking = require("../models/Booking");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Setting = require("../models/Setting");

async function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(403).json({ error: "Forbidden: admin access required" });

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

// Normalize date to YYYY-MM-DD for consistent DB comparison
function normalizeDate(str) {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split("-");
    return `${y}-${m}-${d}`;
  }
  return trimmed;
}

// Allowed 30-min slot values (must match frontend)
const ALLOWED_SLOTS = ["12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"];

// POST /api/admin/block-slot — admin-only; creates a blocked booking so slot is unavailable to users
router.post("/block-slot", requireAdmin, async (req, res) => {
  try {
    const { courtId, date, startTime } = req.body || {};

    if (!courtId || !date || !startTime) {
      return res.status(400).json({
        error: "Court, date and slot are required",
        code: "MISSING_FIELDS"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courtId)) {
      return res.status(400).json({
        error: "Invalid court ID",
        code: "INVALID_COURT"
      });
    }

    const dateNormalized = normalizeDate(date);
    if (!dateNormalized || !/^\d{4}-\d{2}-\d{2}$/.test(dateNormalized)) {
      return res.status(400).json({
        error: "Invalid date format. Use YYYY-MM-DD.",
        code: "INVALID_DATE"
      });
    }

    const slot = String(startTime).trim();
    if (!ALLOWED_SLOTS.includes(slot)) {
      return res.status(400).json({
        error: "Invalid slot time",
        code: "INVALID_SLOT"
      });
    }

    const existing = await Booking.findOne({
      courtId,
      date: dateNormalized,
      startTime: slot,
      status: { $in: ["approved", "pending", "blocked"] }
    });

    if (existing) {
      const msg = existing.status === "blocked"
        ? "This slot is already blocked."
        : "This slot is already booked. Cannot block.";
      console.warn("[block-slot] Slot not free:", { courtId, date: dateNormalized, startTime: slot, existingStatus: existing.status });
      return res.status(400).json({
        error: msg,
        code: "SLOT_TAKEN"
      });
    }

    const booking = await Booking.create({
      studentName: "ADMIN BLOCKED",
      studentEmail: "sports@mietjammu.in",
      courtId,
      date: dateNormalized,
      startTime: slot,
      status: "blocked"
    });

    await booking.populate("courtId");
    console.log("[block-slot] Slot blocked successfully:", { id: booking._id, courtId, date: dateNormalized, startTime: slot });

    return res.status(201).json(booking);
  } catch (err) {
    console.error("[block-slot] Error:", err);
    return res.status(500).json({
      error: err.message || "Failed to block slot",
      code: "SERVER_ERROR"
    });
  }
});

module.exports = router;

