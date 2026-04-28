const express = require("express");
const router = express.Router();

const { isStudent } = require("../middlewares/studentAuth");
const upload = require("../middlewares/uploadStudentImage");
const uploadErrorHandler = require("../middlewares/uploadErrorHandler");
const studentController = require("../controllers/studentController");
const{ setSidebar} = require("../middlewares/setsidebar")
const {setHeader} = require("../middlewares/setHeader")
const GatePass = require("../models/gatePassModel");



// ================= DASHBOARD =================
router.get("/dashboard",  setSidebar(false), setHeader(true),
 isStudent, studentController.dashboard);


// ================= PROFILE PAGE =================
router.get("/profile", isStudent,setHeader(true), studentController.profilePage);

// ================= SAVE / UPDATE PROFILE =================
router.post(
  "/profile",
  isStudent,
  upload.single("profileImage"), // ✅ ONLY THIS
  studentController.saveProfile, // ✅ ONE CONTROLLER
  uploadErrorHandler
);

// ================= LOGOUT =================
router.get("/logout", isStudent, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log("Logout error:", err);
      return res.redirect("/students/dashboard");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});


router.get(
  "/marksheet",
  isStudent,
  setHeader(true),
  studentController.viewMarksheet
);

router.post("/clear-warning", isStudent, async (req, res) => {
  const student = req.student;

  student.showWarning = false;
  student.warningMessage = "";

  await student.save();

  res.redirect("/student/dashboard");
});

router.post("/gatepass/approve/:id", async (req, res) => {
  const pass = await GatePass.findById(req.params.id);

  if (!pass || pass.status !== "pending") {
    return res.send("Invalid request");
  }

  pass.status = "approved";
  pass.passId = "GP" + Date.now();

  // ✅ YAHAN USE KARO
  const baseUrl = req.protocol + "://" + req.get("host");
  const qrData = `${baseUrl}/verify-pass/${pass.passId}`;

  const QRCode = require("qrcode");
  pass.qrCode = await QRCode.toDataURL(qrData);

  await pass.save();

  res.redirect("/admin/gatepass");
});


router.get("/gatepass", async (req, res) => {
  const studentId = req.session.studentId;

  const passes = await GatePass.find({ studentId })
    .sort({ createdAt: -1 });

  const tab = req.query.tab || "apply"; // 🔥 control

  res.render("getpass/getpass", {
    passes,
    tab,
    success: req.session.success,
    error: req.session.error
  });

  req.session.success = null;
  req.session.error = null;
});

router.post("/gatepass/apply", async (req, res) => {
  try {
    const { reason, from, to } = req.body;
    const studentId = req.session.studentId;

    if (!studentId) return res.redirect("/login");

    if (!reason || !from || !to) {
      req.session.error = "All fields required";
      return res.redirect("/student/gatepass?tab=apply");
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (fromDate >= toDate) {
      req.session.error = "Invalid date range";
      return res.redirect("/student/gatepass?tab=apply");
    }

    // 🔴 pending check
    const pending = await GatePass.findOne({
      studentId,
      status: "pending"
    });

    if (pending) {
      req.session.error = "You already have a pending request";
      return res.redirect("/student/gatepass?tab=history");
    }

    // 🔴 active approved
    const active = await GatePass.findOne({
      studentId,
      status: "approved",
      to: { $gte: new Date() }
    });

    if (active) {
      req.session.error = "You already have an active pass";
      return res.redirect("/student/gatepass?tab=history");
    }

    // 🔴 1 per day rule
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayRequest = await GatePass.findOne({
      studentId,
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    if (todayRequest) {
      req.session.error = "You can apply only once per day";
      return res.redirect("/student/gatepass?tab=history");
    }

    // ✅ create
    await GatePass.create({
      studentId,
      reason,
      from: fromDate,
      to: toDate,
      status: "pending"
    });

    req.session.success = "Request submitted successfully";

    return res.redirect("/student/gatepass?tab=history");

  } catch (err) {
    console.error(err);
    req.session.error = "Server error";
    res.redirect("/student/gatepass?tab=apply");
  }
});




module.exports = router;
