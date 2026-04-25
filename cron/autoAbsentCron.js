const cron = require("node-cron");
const Student = require("../models/studentModel");
const Attendance = require("../models/attendanceModel");
const { sendAbsentWhatsApp } = require("../utils/sendAbsentWhatsApp");

cron.schedule(
  "30 10 * * *", // ⏰ 10:30 AM IST
  async () => {
    try {
      console.log("⏰ Auto Absent Job Started (10:30 AM)");

      const today = new Date().toISOString().slice(0, 10);
      const students = await Student.find({ isActive: true });

      for (const student of students) {
        const exists = await Attendance.findOne({
          studentId: student._id,
          date: today
        });

        if (!exists) {
          await Attendance.create({
            studentId: student._id,
            date: today,
            status: "Absent",
            method: "Auto System"
          });

          await sendAbsentWhatsApp(student); // 📲 WhatsApp
        }
      }

      console.log("✅ Auto Absent Job Completed");
    } catch (err) {
      console.error("❌ Auto Absent Cron Error:", err.message);
    }
  },
  {
    timezone: "Asia/Kolkata"
  }
);
