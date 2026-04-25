const Marks = require("../models/marksModel");
const Student = require("../models/studentModel");


// Show add marks page
exports.addMarksPage = async (req, res) => {
  const students = await Student.find({ isActive: true }).sort({ fullname: 1 });

  res.render("admins/addMarks", {
    layout: false,
    students
  });
};
exports.saveMarks = async (req, res) => {
  try {
    const {
      studentId,
      subject,
      examType,
      obtainedMarks,
      semester,
      examSession,
      academicYear
    } = req.body;

    // 🔥 Auto max marks
    let maxMarks = 20;
    if (examType === "PUT") maxMarks = 70;

    await Marks.create({
      student: studentId,
      subject,
      examType,
      obtainedMarks,
      maxMarks,
      semester,
      examSession,
      academicYear,
      addedBy: req.session.adminId
    });

    res.redirect("/admin/marks/add?success=1");
  } catch (error) {
    console.error(error);
    res.redirect("/admin/marks/add?error=1");
  }
};
