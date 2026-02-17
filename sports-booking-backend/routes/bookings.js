const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const jwt = require("jsonwebtoken");
const Setting = require("../models/Setting");
const sendMail = require("../utils/mail"); // ⭐ EMAIL FUNCTION
const {
  getAdminBookingNotificationTemplate,
  getStudentApprovalTemplate,
  getStudentRejectionTemplate
} = require("../utils/emailTemplates"); // ⭐ EMAIL TEMPLATES

// ===============================
//  1) CREATE BOOKING (student → admin email)
// ===============================
router.post("/add", async (req, res) => {
  try {
    // Booking enable/disable gate (admin controlled, persisted in DB)
    const s = await Setting.findOne({ key: "bookingEnabled" });
    if (s && s.value === false) {
      return res
        .status(403)
        .json({ error: "Bookings are temporarily disabled by admin. Please try later." });
    }

    // Email domain validation (required)
    const studentEmail = String(req.body?.studentEmail || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(studentEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (!studentEmail.endsWith("@mietjammu.in")) {
      return res.status(400).json({ error: "Only official college email IDs are allowed for booking." });
    }

    // Email verification gate (OTP → short-lived token)
    // Booking logic below remains unchanged; this is a pre-check only.
    const verificationToken =
      req.headers["x-email-verification-token"] ||
      (req.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!verificationToken) {
      return res.status(401).json({ error: "Email not verified" });
    }

    let decoded;
    try {
      decoded = jwt.verify(verificationToken, process.env.JWT_SECRET || "jwt_secret");
    } catch (e) {
      return res.status(401).json({ error: "Email verification expired or invalid" });
    }

    const bodyEmail = String(req.body?.studentEmail || "").trim().toLowerCase();
    if (!bodyEmail || decoded?.purpose !== "email_verification" || decoded?.email !== bodyEmail) {
      return res.status(401).json({ error: "Email not verified" });
    }

    // Validate 6-hour same-day booking restriction
    const { date, startTime } = req.body;
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format
    
    if (date === todayStr) {
      // Parse slot time (format: "HH:MM")
      const [slotHours, slotMinutes] = startTime.split(":").map(Number);
      
      // Create date object for the slot time today
      const slotDateTime = new Date();
      slotDateTime.setHours(slotHours, slotMinutes, 0, 0);
      
      // Current time
      const currentTime = new Date();
      
      // Calculate difference in milliseconds
      const diffMs = slotDateTime - currentTime;
      const diffHours = diffMs / (1000 * 60 * 60);
      
      // Slot must be at least 6 hours ahead
      if (diffHours < 6) {
        return res.status(400).json({ 
          error: "Same-day bookings must be made at least 6 hours in advance" 
        });
      }
    }

    const booking = await Booking.create(req.body);
    console.log("NEW BOOKING CREATED:", booking);

    // Populate court details for email
    await booking.populate("courtId");

    // ---- EMAIL TO ADMIN ----
    try {
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const emailHtml = getAdminBookingNotificationTemplate(booking, baseUrl);
      await sendMail(
        process.env.ADMIN_EMAIL || "summar.adm@mietjammu.in",
        "New Booking Request – MIET Sports",
        emailHtml
      );
      console.log("✅ Admin notification email sent successfully");
      console.log("📧 Booking ID in email:", booking._id);
    } catch (mailErr) {
      console.log("MAIL ERROR (create booking):", mailErr);
    }

    res.json(booking);

  } catch (err) {
    console.error("ERROR /add:", err);
    res.status(500).json({ error: err.message });
  }
});
// DELETE booking
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Booking deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ===============================
//  2) GET ALL BOOKINGS
// ===============================
router.get("/", async (req, res) => {
  const bookings = await Booking.find().populate("courtId");
  res.json(bookings);
});

// ===============================
//  3) CHECK 30 MINUTE SLOTS
// ===============================
router.get("/check-slots", async (req, res) => {
  try {
    const { court, date } = req.query;

    if (!court || !date) {
      return res.status(400).json({ error: "Court and date required" });
    }

    const bookings = await Booking.find({
      courtId: court,
      date: date,
      status: { $ne: "rejected" }
    });

    const bookedSlots = bookings.map(b => b.startTime);
    res.json(bookedSlots);

  } catch (err) {
    console.error("ERROR /check-slots:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===============================
//  4) APPROVE BOOKING (email → student)
// ===============================
router.put("/:id/approve", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).populate("courtId");

    // ---- EMAIL TO STUDENT ----
    try {
      const emailHtml = getStudentApprovalTemplate(booking);
      await sendMail(
        booking.studentEmail,
        "Your Booking Approved – MIET Sports",
        emailHtml
      );
      console.log("✅ Student confirmation email sent successfully");
    } catch (mailErr) {
      console.log("MAIL ERROR (approve):", mailErr);
    }

    res.json(booking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 5) REJECT BOOKING (email → student)
// ===============================
router.put("/:id/reject", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).populate("courtId");

    // ---- EMAIL TO STUDENT ----
    try {
      const emailHtml = getStudentRejectionTemplate(booking);
      await sendMail(
        booking.studentEmail,
        "Your Booking Request Was Rejected – MIET Sports",
        emailHtml
      );
      console.log("✅ Student rejection email sent successfully");
    } catch (mailErr) {
      console.log("MAIL ERROR (reject):", mailErr);
    }

    res.json(booking);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 6) EMAIL-BASED APPROVE (GET route for email links)
// ===============================
router.get("/:id/approve-email", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).populate("courtId");

    if (!booking) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Booking Not Found</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;">❌ Booking Not Found</h1>
          <p>The booking you're trying to approve doesn't exist.</p>
        </body>
        </html>
      `);
    }

    // ---- EMAIL TO STUDENT ----
    try {
      const emailHtml = getStudentApprovalTemplate(booking);
      await sendMail(
        booking.studentEmail,
        "Your Booking Approved – MIET Sports",
        emailHtml
      );
      console.log("✅ Student confirmation email sent successfully");
    } catch (mailErr) {
      console.log("MAIL ERROR (approve):", mailErr);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Approved</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 500px;
          }
          .success-icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          h1 {
            color: #11998e;
            margin-bottom: 20px;
          }
          p {
            color: #495057;
            line-height: 1.6;
            margin: 10px 0;
          }
          .info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h1>Booking Approved Successfully!</h1>
          <p>The booking has been approved and the student has been notified via email.</p>
          <div class="info">
            <p><strong>Student:</strong> ${booking.studentName}</p>
            <p><strong>Court:</strong> ${booking.courtId?.name || "N/A"}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.startTime}</p>
          </div>
          <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            You can close this window.
          </p>
        </div>
      </body>
      </html>
    `);

  } catch (err) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Error</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: #dc3545;">❌ Error</h1>
        <p>${err.message}</p>
      </body>
      </html>
    `);
  }
});

// ===============================
// 7) EMAIL-BASED REJECT (GET route for email links)
// ===============================
router.get("/:id/reject-email", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).populate("courtId");

    if (!booking) {
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Booking Not Found</title></head>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;">❌ Booking Not Found</h1>
          <p>The booking you're trying to reject doesn't exist.</p>
        </body>
        </html>
      `);
    }

    // ---- EMAIL TO STUDENT ----
    try {
      const emailHtml = getStudentRejectionTemplate(booking);
      await sendMail(
        booking.studentEmail,
        "Your Booking Request Was Rejected – MIET Sports",
        emailHtml
      );
      console.log("✅ Student rejection email sent successfully");
    } catch (mailErr) {
      console.log("MAIL ERROR (reject):", mailErr);
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Rejected</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%);
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            max-width: 500px;
          }
          .icon {
            font-size: 80px;
            margin-bottom: 20px;
          }
          h1 {
            color: #eb3349;
            margin-bottom: 20px;
          }
          p {
            color: #495057;
            line-height: 1.6;
            margin: 10px 0;
          }
          .info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">❌</div>
          <h1>Booking Rejected</h1>
          <p>The booking has been rejected and the student has been notified via email.</p>
          <div class="info">
            <p><strong>Student:</strong> ${booking.studentName}</p>
            <p><strong>Court:</strong> ${booking.courtId?.name || "N/A"}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.startTime}</p>
          </div>
          <p style="margin-top: 30px; color: #6c757d; font-size: 14px;">
            You can close this window.
          </p>
        </div>
      </body>
      </html>
    `);

  } catch (err) {
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Error</title></head>
      <body style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: #dc3545;">❌ Error</h1>
        <p>${err.message}</p>
      </body>
      </html>
    `);
  }
});

module.exports = router;
