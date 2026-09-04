const mongoose = require("mongoose");

const hallTicketSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    hallTicketNumber: {
      type: String,
      required: true,
      unique: true,
    },

    examCenter: {
      type: String,
      required: true,
    },

    academicYear: {
      type: String,
      trim: true,
    },

    examCenterAddress: {
      type: String,
    },

    seatNumber: {
      type: String,
      required: true,
    },

    reportingTime: {
      type: String,
      default: "09:00 AM",
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    published: {
      type: Boolean,
      default: false,
    },

    allowDownload: {
      type: Boolean,
      default: false,
    },

    allowPrint: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("hallticket", hallTicketSchema);
