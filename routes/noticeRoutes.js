const express = require("express");
const router = express.Router();
const Notice = require("../models/noticeModel");
const { isStudent } = require("../middlewares/studentAuth");
const Student = require("../models/studentModel");
const { setHeader } = require("../middlewares/setHeader");

// ✅ URL: /student/notices
router.get("/notices", setHeader(true), isStudent, async (req, res) => {

  const notices = await Notice.find().sort({ createdAt: -1 });

  // Mark notices as seen
  await Student.findByIdAndUpdate(req.session.studentId, {
    lastNoticeSeenAt: new Date()
  });

  res.render("students/notices", {
    notices,
    student: req.student,
    currentPath: req.path
  });

});

module.exports = router;
