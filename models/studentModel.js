const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({

  /* ================= BASIC ================= */
  fullname: String,

  email: { 
    type: String, 
    unique: true 
  },

  password: String,
  admissionNumber: Number,
  otp: Number,

  isVerified: { 
    type: Boolean, 
    default: false 
  },

  approvalStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },

  isActive: {
    type: Boolean,
    default: false
  },

  role: {
    type: String,
    default: "student"
  },

  /* ================= PROFILE STATUS ================= */
  isProfileComplete: {
    type: Boolean,
    default: false
  },

  lastNoticeSeenAt: {
    type: Date,
    default: null
  },

  /* ================= PROFILE IMAGE ================= */
  profileImage: {
    type: String,
    default: ""
  },

  /* ================= PERSONAL INFO ================= */
  phone: {
  type: String,
  required: true,
  validate: {
    validator: function (v) {
      return /^[0-9]{10}$/.test(v);
    },
    message: "Invalid phone number (must be 10 digits)"
  }
},
  dob: Date,
  gender: String,
  bloodGroup: String,
  aadharNumber: String,

  /* ================= ACADEMIC CURRENT ================= */
  course: String,
  courseCode: String,
  semester: Number,
  rollNumber: String,
  abcId: String,
  admissionYear: Number,

  /* ================= 10th ================= */
  tenthBoard: String,
  tenthSchool: String,
  tenthYear: Number,
  tenthScore: String,

  /* ================= 12th / Diploma ================= */
  twelfthBoard: String,
  twelfthSchool: String,
  twelfthStream: String,
  twelfthYear: Number,
  twelfthScore: String,

  /* ================= PARENT ================= */
  fatherName: String,
  motherName: String,
  guardianPhone: String,

  /* ================= ADDRESS ================= */
  address: String,

  /* ================= SYSTEM ================= */
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },

  createdAt: { 
    type: Date, 
    default: Date.now 
  },

  /* ================= WARNING SYSTEM ================= */
  warningMessage: {
    type: String,
    default: ""
  },

  showWarning: {
    type: Boolean,
    default: false
  }

});

module.exports = mongoose.model("Student", studentSchema);