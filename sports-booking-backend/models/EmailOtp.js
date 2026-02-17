const mongoose = require("mongoose");

// Stores a hashed OTP for a given email with TTL expiry.
// OTP itself is never stored in plain text.
const EmailOtpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    lastSentAt: { type: Date, required: true },
    // TTL index: document auto-removed after expiresAt
    expiresAt: { type: Date, required: true, index: { expires: 0 } }
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmailOtp", EmailOtpSchema);

