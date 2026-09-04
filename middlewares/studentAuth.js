const Student = require("../models/studentModel");

const isStudent = async (req, res, next) => {
  try {
    if (!req.session.studentId) {
      console.log("❌ No student session");
      return res.redirect("/");
    }

    // ✅ SESSION ID is ObjectId
    const student = await Student.findById(req.session.studentId);
    console.log("SESSION:", req.session);

    if (!student) {
      console.log("❌ Student not found");
      req.session.destroy();
      return res.redirect("/");
    }

    if (student.approvalStatus !== "approved" || !student.isActive) {
      console.log("❌ Student not approved / inactive");
      req.session.destroy();
      return res.redirect("/");
    }

    // ✅ attach student
    req.student = student;

    next();
  } catch (err) {
    console.error("❌ studentAuth error:", err);
    res.redirect("/");
  }
};

module.exports = { isStudent };
