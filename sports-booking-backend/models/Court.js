const mongoose = require("mongoose");

const CourtSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model("Court", CourtSchema);
