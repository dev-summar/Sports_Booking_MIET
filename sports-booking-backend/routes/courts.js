const express = require("express");
const router = express.Router();
const Court = require("../models/Court");

// Add a court
router.post("/add", async (req, res) => {
  try {
    const court = await Court.create(req.body);
    res.json(court);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all courts
router.get("/", async (req, res) => {
  const courts = await Court.find();
  res.json(courts);
});

module.exports = router;
