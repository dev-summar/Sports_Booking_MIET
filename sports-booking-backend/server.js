const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

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
