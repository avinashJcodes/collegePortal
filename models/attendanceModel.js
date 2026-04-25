const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    time: String,
    status: {
      type: String,
      default: "Present"
    },
    method: {
      type: String,
      default: "Face Recognition"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);
