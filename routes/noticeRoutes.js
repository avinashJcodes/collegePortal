const express = require("express");
const router = express.Router();
const Notice = require("../models/noticeModel");
const { isStudent } = require("../middlewares/studentAuth");
const Student = require("../models/studentModel");


// ✅ URL: /student/notices
router.get("/notices", isStudent, async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 });

  // 👇 IMPORTANT: mark notices as seen
  await Student.findByIdAndUpdate(req.session.studentId, {
    lastNoticeSeenAt: new Date()
  });

  res.render("students/notices", { notices });
});


module.exports = router;
