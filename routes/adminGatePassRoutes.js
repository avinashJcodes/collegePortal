const express = require("express");
const router = express.Router();
const GatePass = require("../models/gatePassModel");
const QRCode = require("qrcode");

// 🔥 LIST
router.get("/gatepass", async (req, res) => {
  const passes = await GatePass.find()
    .populate("studentId", "fullname rollNumber")
    .sort({ createdAt: -1 });

  res.render("admins/gatepassList", { passes });
});

// 🔥 APPROVE (ONLY ONE)
router.post("/gatepass/approve/:id", async (req, res) => {
  const pass = await GatePass.findById(req.params.id);

  if (!pass || pass.status !== "pending") {
    return res.redirect("/admin/gatepass");
  }

  pass.status = "approved";
  pass.passId = "GP" + Date.now();

  // ✅ CORRECT PLACE
  const baseUrl = req.protocol + "://" + req.get("host");
  const qrData = `${baseUrl}/verify-pass/${pass.passId}`;

  pass.qrCode = await QRCode.toDataURL(qrData);

  await pass.save();

  res.redirect("/admin/gatepass");
});

// 🔥 REJECT
router.post("/gatepass/reject/:id", async (req, res) => {
  const pass = await GatePass.findById(req.params.id);

  if (!pass || pass.status !== "pending") {
    return res.redirect("/admin/gatepass");
  }

  pass.status = "rejected";

  await pass.save();

  res.redirect("/admin/gatepass");
});

module.exports = router;