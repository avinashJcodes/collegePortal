const Attendance = require("../models/attendanceModel");

// ================= FACE ATTENDANCE =================
exports.markAttendanceByFace = async (req, res) => {
  try {
    // 🔥 PYTHON se aayega
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ success: false, message: "StudentId missing" });
    }

    const today = new Date().toISOString().slice(0, 10);

    // 🔒 duplicate protection
    const exists = await Attendance.findOne({ studentId, date: today });
    if (exists) {
      return res.json({ success: true, message: "Already marked" });
    }

    await Attendance.create({
      studentId,
      date: today,
      time: new Date().toLocaleTimeString(),
      status: "Present",
      method: "Face Recognition"
    });

    return res.json({ success: true, message: "Attendance marked" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};


// ================= ADMIN =================
exports.viewAttendance = async (req, res) => {
  try {
    const { date, student, status } = req.query;

    let query = {};

    // 📅 Date filter
    if (date) {
      query.date = date; // because tum table me record.date use kar rahe ho
    }

    // ✅ Status filter
    if (status) {
      query.status = status;
    }

    let records = await Attendance.find(query)
      .populate("studentId")
      .sort({ createdAt: -1 });

    // 🧑‍🎓 Student name filter
    if (student) {
      records = records.filter(r =>
        r.studentId &&
        r.studentId.fullname
          .toLowerCase()
          .includes(student.toLowerCase())
      );
    }

    res.render("admins/attendance", {
      layout: false,
      records,
      filters: { date, student, status }
    });

  } catch (err) {
    console.error(err);
    res.send("Error loading attendance");
  }
};


// ================= STUDENT =================
exports.studentAttendancePage = async (req, res) => {
  try {
    const studentId = req.student._id;
    const now = new Date();

    const today = now.toISOString().slice(0, 10);
    const currentHour = now.getHours();

    // 🔍 Check today's attendance
    let record = await Attendance.findOne({
      studentId,
      date: today
    });

    // ⚠️ FALLBACK AUTO-ABSENT
    // Agar:
    // 1️⃣ Attendance nahi mili
    // 2️⃣ Time 3 PM (15) ke baad hai
    if (!record && currentHour >= 15) {
      record = await Attendance.create({
        studentId,
        date: today,
        status: "Absent",
        method: "Auto Fallback"
      });

      console.log("⚠️ Fallback Absent marked");
    }

    // 📜 Attendance history
    const records = await Attendance.find({ studentId })
      .populate("studentId")
      .sort({ date: -1 })
      .lean();

    // 🎯 Render page
    res.render("students/attendance", {
    
      today,
      status: record ? record.status : "Absent",
      records
    });

  } catch (error) {
    console.error("❌ Attendance fallback error:", error);
    res.send("Attendance page error");
  }
};