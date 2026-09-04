const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const isAdmin = require("../middlewares/isAdmin");
const { isStudent } = require("../middlewares/studentAuth");
const { setHeader } = require("../middlewares/setHeader");

// 🔥 Python → Node
router.post("/mark-face", attendanceController.markAttendanceByFace);

// 🔥 ADMIN
router.get("/view",  isAdmin, attendanceController.viewAttendance);

// 🔥 STUDENT
router.get("/student", isStudent,setHeader(true), attendanceController.studentAttendancePage);

module.exports = router;
