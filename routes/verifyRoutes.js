const express = require("express");
const router = express.Router(); // 🔥 ye missing tha

const GatePass = require("../models/gatePassModel");

router.get("/verify-pass/:passId", async (req, res) => {
  const pass = await GatePass.findOne({ passId: req.params.passId });

  if (!pass) {
    return res.render("verify", { status: "invalid" });
  }

  if (pass.status === "used") {
    return res.render("verify", { status: "used" }); // 🔥 already used
  }

  if (pass.status !== "approved") {
    return res.render("verify", { status: "not-approved" });
  }

  if (new Date() > new Date(pass.to)) {
    return res.render("verify", { status: "expired" });
  }

  // 🔥 VALID but NOT USED yet
  res.render("verify", {
    status: "valid",
    pass
  });
});

router.post("/verify-pass/use/:passId", async (req, res) => {
  const pass = await GatePass.findOne({ passId: req.params.passId });

  if (!pass) {
    return res.render("verify", { status: "invalid" });
  }

  if (pass.status === "used") {
    return res.render("verify", { status: "used" });
  }

  if (pass.status !== "approved") {
    return res.render("verify", { status: "not-approved" });
  }

  // 🔥 MAIN ACTION
  pass.status = "used";
  await pass.save();

  // 🔥 SUCCESS SHOW
  res.render("verify", {
    status: "success",
    pass
  });
});

module.exports = router; // 🔥 ye bhi hona chahiye