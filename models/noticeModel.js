const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  message: {
    type: String,
    required: true
  },

  category: {
    type: String,
    enum: ["General", "Academic", "Placements", "Events", "Archives", "Payment"],
    default: "General"
  },

  // 🔥 NEW: PDF FIELD
  pdf: {
    type: String,
    default: null
  },

  createdBy: {
    type: String,
    default: "Admin"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notice", noticeSchema);