const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
});

module.exports = mongoose.models.Admin || mongoose.model("Admin", adminSchema);