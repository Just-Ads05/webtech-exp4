const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: "Technical" },
  fee: { type: Number, required: true },
  seats: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Event", eventSchema);
