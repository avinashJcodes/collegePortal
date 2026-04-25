const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  subject: {
    type: String,
    required: true
  },

  examType: {
    type: String,
    enum: ["MST-1", "MST-2", "PUT"],
    required: true
  },

  obtainedMarks: {
    type: Number,
    required: true
  },

  maxMarks: {
    type: Number,
    required: true
  },

  semester: {
    type: Number,
    required: true
  },

  examSession: {
    type: String,
    enum: ["WINTER", "SUMMER"],
    required: true
  },

  academicYear: {
    type: String,
    required: true
  },

  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  }

}, { timestamps: true });

module.exports = mongoose.model("Marks", marksSchema);
