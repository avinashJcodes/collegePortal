const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true
  },

  sender: {
    type: String,
    enum: ["student", "admin"],
    required: true
  },

  message: {
    type: String,
    default: ""
  },


  

  isDeleted: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Chat", chatSchema);
