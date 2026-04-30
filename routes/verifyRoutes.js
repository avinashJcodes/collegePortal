const express = require("express");
const router = express.Router(); // 🔥 ye missing tha
const jwt = require("jsonwebtoken");

const GatePass = require("../models/gatePassModel");

router.get("/verify-pass", async (req, res) => {
  try {
    const token = req.query.token;

    if (!token) {
      return res.render("verify", { status: "invalid" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const pass = await GatePass.findOne({ passId: decoded.passId })
      .populate("studentId");

    if (!pass) return res.render("verify", { status: "invalid" });

    if (pass.status === "used") {
      return res.render("verify", { status: "used" });
    }

    if (pass.status !== "approved") {
      return res.render("verify", { status: "not-approved" });
    }

    if (new Date() > new Date(pass.to)) {
      return res.render("verify", { status: "expired" });
    }

    res.render("verify", {
      status: "valid",
      pass,
      token // 🔥 send token to form
    });

  } catch {
    return res.render("verify", { status: "invalid" });
  }
});

router.post("/verify-pass/use", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.render("verify", { status: "invalid" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const pass = await GatePass.findOne({ passId: decoded.passId })
      .populate("studentId");

    if (!pass) return res.render("verify", { status: "invalid" });

    if (pass.status === "used") {
      return res.render("verify", { status: "used" });
    }

    if (pass.status !== "approved") {
      return res.render("verify", { status: "not-approved" });
    }

    pass.status = "used";
    pass.usedAt = new Date();

    await pass.save();

    res.render("verify", {
      status: "success",
      pass
    });

  } catch {
    return res.render("verify", { status: "invalid" });
  }
});

module.exports = router; // 🔥 ye bhi hona chahiye