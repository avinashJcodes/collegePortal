const mongoose = require("mongoose");


const gatePassSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true
  },

  reason: {
    type: String,
    required: true,
    trim: true
  },

  qrCode: String,

  from: {
    type: Date,
    required: true
  },

  to: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return this.from < value;
      },
      message: "Invalid date range"
    }
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "used"],
    default: "pending",
    index: true
  },

 passId: {
  type: String,
  unique: true,
  sparse: true // 🔥 important
},

  usedAt: Date,
  approvedAt: Date,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

gatePassSchema.index({ studentId: 1, status: 1 });

module.exports = mongoose.model("GatePass", gatePassSchema);