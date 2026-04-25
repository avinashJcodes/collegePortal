const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,

  tenthSchool: String,
  tenthMarks: Number,

  twelfthCollege: String,
  twelfthMarks: Number,

  examType: String,
  examScore: Number,

  email: String,
  mobile: String,
  address: String,

  course: String,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Student", studentSchema);