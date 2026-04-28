const express = require("express");
const router = express.Router(); // 🔥 ye missing tha

const GatePass = require("../models/gatePassModel");

router.get("/verify-pass/:passId", async (req, res) => {
  const pass = await GatePass.findOne({ passId: req.params.passId })
    .populate("studentId", "fullname rollNumber");

  if (!pass) {
    return res.render("verify", { status: "invalid" });
  }

  if (pass.status !== "approved") {
    return res.render("verify", { status: "not-approved" });
  }

  if (new Date() > new Date(pass.to)) {
    return res.render("verify", { status: "expired" });
  }

  res.render("verify", {
    status: "valid",
    pass
  });
});

module.exports = router; // 🔥 ye bhi hona chahiye