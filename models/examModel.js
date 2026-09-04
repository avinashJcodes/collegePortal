const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    // 🔗 Student Reference
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    },

    // 📝 Exam Info
    examName: {
      type: String,
      default: "Final Semester Exam"
    },

    semester: {
      type: Number,           // 👈 FIXED (was String)
      required: true
    },

    examType: {
      type: String,           // 👈 NEW
      enum: ["Regular", "Backlog", "Improvement"],
      required: true
    },

    // 🎓 Course Info (from student profile)
    course: {
      type: String,
      required: true
    },

    subjects: {
      type: [String],
      required: true
    },

    examFee: {
      type: Number,
      required: true
    },

    // 💳 Payment (Cashfree)
    cashfreeOrderId: String,

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },

    transactionId: String,
    paidAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamForm", examSchema);
