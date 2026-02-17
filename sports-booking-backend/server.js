const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// OTP routes (mounted both with and without /api prefix)
app.use("/", require("./routes/otp"));
app.use("/api", require("./routes/otp"));

// Prevent API caching at CDN (Cloudflare) and browser level
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Connect DB
connectDB();

// Test Route
app.get("/", (req, res) => {
  res.send("Sports Booking Backend Running...");
});
app.use("/api/courts", require("./routes/courts"));
app.use("/api/bookings", require("./routes/bookings"));
app.use("/api/admin", require("./routes/adminAuth"));







app.listen(5000, () => console.log("Server running on port 5000"));
