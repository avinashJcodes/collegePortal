const Student = require("../models/studentModel");
const Notice = require("../models/noticeModel");
const Marks = require("../models/marksModel");

/* ============================
   STUDENT DASHBOARD
============================ */
exports.dashboard = async (req, res) => {
  try {
    const student = req.student;

    let hasNewNotice = false;

    if (student.lastNoticeSeenAt) {
      const count = await Notice.countDocuments({
        createdAt: { $gt: student.lastNoticeSeenAt }
      });
      hasNewNotice = count > 0;
    } else {
      const total = await Notice.countDocuments();
      hasNewNotice = total > 0;
    }

    let showWarning = false;
    let warningMessage = "";

    if (student.showWarning) {
      showWarning = true;
      warningMessage = student.warningMessage;

      student.showWarning = false;
      await student.save();
    }

    // ✅ IMPORTANT FIX
    res.render("students/Dashboard", {
      student,
      hasNewNotice,
      showProfilePopup: !student.isProfileComplete,
      showWarning,
      warningMessage,

      // 🔥 ADD THESE
      showHeader: true,
      currentPath: req.path
    });

  } catch (err) {
    console.log("Dashboard error:", err);
    res.send("Dashboard load error");
  }
};

/* ============================
   PROFILE PAGE (VIEW / EDIT)
============================ */
exports.profilePage = (req, res) => {
  const student = req.student;

  if (!student.isProfileComplete || req.query.edit === "true") {
    return res.render("students/profileForm", { student });
  }

  return res.render("students/profileView", { student });
};

/* ============================
   SAVE / UPDATE PROFILE
============================ */
exports.saveProfile = async (req, res) => {
  try {
    const updateData = {
      // PERSONAL
      phone: req.body.phone,
      dob: req.body.dob,
      gender: req.body.gender,
      bloodGroup: req.body.bloodGroup,
      aadharNumber: req.body.aadharNumber,

      // ACADEMIC CURRENT
      course: req.body.course,
      courseCode: req.body.courseCode,
      semester: req.body.semester,
      rollNumber: req.body.rollNumber,
      abcId: req.body.abcId,

      // 10th
      tenthBoard: req.body.tenthBoard,
      tenthSchool: req.body.tenthSchool,
      tenthYear: req.body.tenthYear,
      tenthScore: req.body.tenthScore,

      // 12th / Diploma
      twelfthBoard: req.body.twelfthBoard,
      twelfthSchool: req.body.twelfthSchool,
      twelfthStream: req.body.twelfthStream,
      twelfthYear: req.body.twelfthYear,
      twelfthScore: req.body.twelfthScore,

      // PARENT
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      guardianPhone: req.body.guardianPhone,

      // ADDRESS
      address: req.body.address,

      // PROFILE STATUS
      isProfileComplete: true
    };

    // PROFILE IMAGE
    if (req.file) {
      updateData.profileImage = "/uploads/students/" + req.file.filename;
    }

    await Student.findByIdAndUpdate(req.student._id, updateData);

    res.redirect("/student/dashboard");

  } catch (err) {
    console.error("Profile update error:", err);
    res.send("Profile update failed");
  }
};


exports.viewMarksheet = async (req, res) => {
  try {
    const studentId = req.session.studentId;

    const student = await Student.findById(studentId);

    const marks = await Marks.find({ student: studentId });

    // 🔥 Subject-wise grouping
    const subjectMap = {};

    marks.forEach(m => {
      if (!subjectMap[m.subject]) {
        subjectMap[m.subject] = {
          mst1: "-",
          mst2: "-",
          put: "-",
          total: 0
        };
      }

      if (m.examType === "MST-1") subjectMap[m.subject].mst1 = m.obtainedMarks;
      if (m.examType === "MST-2") subjectMap[m.subject].mst2 = m.obtainedMarks;
      if (m.examType === "PUT") subjectMap[m.subject].put = m.obtainedMarks;
    });

    // 🔢 Calculate total
    Object.keys(subjectMap).forEach(sub => {
      const s = subjectMap[sub];
      s.total =
        (s.mst1 === "-" ? 0 : s.mst1) +
        (s.mst2 === "-" ? 0 : s.mst2) +
        (s.put === "-" ? 0 : s.put);
    });

    res.render("student/marksheet", {
      student,
      subjectMap
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading marksheet");
  }
};

