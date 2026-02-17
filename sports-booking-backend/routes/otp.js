const express = require("express");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const EmailOtp = require("../models/EmailOtp");
const sendMail = require("../utils/mail");

const router = express.Router();

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateCollegeEmail(email) {
  // Basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { ok: false, error: "Invalid email format" };
  }
  // Strict domain restriction
  if (!email.endsWith("@mietjammu.in")) {
    return { ok: false, error: "Only official college email IDs are allowed for booking." };
  }
  return { ok: true };
}

function hashOtp(otp) {
  const secret = process.env.OTP_SECRET || process.env.JWT_SECRET || "otp_secret";
  return crypto.createHash("sha256").update(`${otp}:${secret}`).digest("hex");
}

function makeOtp() {
  // 6-digit numeric OTP
  return String(Math.floor(100000 + Math.random() * 900000));
}

function makeVerificationToken(email) {
  const secret = process.env.JWT_SECRET || "jwt_secret";
  // Short-lived token to gate booking submission
  return jwt.sign(
    { email, purpose: "email_verification" },
    secret,
    { expiresIn: "15m" }
  );
}

// POST /send-otp  (also mounted under /api/send-otp)
router.post("/send-otp", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: "Email required" });

    const validation = validateCollegeEmail(email);
    if (!validation.ok) return res.status(400).json({ error: validation.error });

    const now = new Date();
    const existing = await EmailOtp.findOne({ email }).sort({ createdAt: -1 });
    if (existing?.lastSentAt) {
      const secondsSince = Math.floor((now - existing.lastSentAt) / 1000);
      const remaining = 60 - secondsSince;
      if (remaining > 0) {
        return res.status(429).json({
          error: "Please wait before requesting another OTP",
          retryAfterSeconds: remaining
        });
      }
    }

    const otp = makeOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    await EmailOtp.findOneAndUpdate(
      { email },
      { email, otpHash, expiresAt, lastSentAt: now },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">MIET Sports Booking – Email Verification</h2>
        <p style="margin: 0 0 10px;">Your OTP is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 8px 0 16px;">
          ${otp}
        </div>
        <p style="margin: 0 0 6px;">This OTP expires in <b>5 minutes</b>.</p>
        <p style="margin: 0; color: #555;">If you did not request this, you can ignore this email.</p>
      </div>
    `;

    await sendMail(email, "Your OTP for Sports Booking", html);
    return res.json({ success: true, cooldownSeconds: 60, expiresInSeconds: 300 });
  } catch (err) {
    console.error("ERROR /send-otp:", err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

// POST /verify-otp  (also mounted under /api/verify-otp)
router.post("/verify-otp", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || "").trim();

    if (!email || !otp) return res.status(400).json({ error: "Email and OTP required" });
    const validation = validateCollegeEmail(email);
    if (!validation.ok) return res.status(400).json({ error: validation.error });

    const record = await EmailOtp.findOne({ email });
    if (!record) return res.status(400).json({ error: "OTP not found or expired" });

    if (record.expiresAt && record.expiresAt.getTime() < Date.now()) {
      await EmailOtp.deleteOne({ _id: record._id });
      return res.status(400).json({ error: "OTP expired" });
    }

    const providedHash = hashOtp(otp);
    if (providedHash !== record.otpHash) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // One-time use
    await EmailOtp.deleteOne({ _id: record._id });

    const token = makeVerificationToken(email);
    return res.json({ verified: true, token });
  } catch (err) {
    console.error("ERROR /verify-otp:", err);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

module.exports = router;

