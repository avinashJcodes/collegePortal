const express = require("express");
const router = express.Router();
const Student = require("../models/studentModel");


const isAdmin  = require("../middlewares/isAdmin");
const adminMarksController = require("../controllers/adminMarksController");

// 📌 Admin add marks form
router.get("/marks/add", isAdmin, adminMarksController.addMarksPage);

// 📌 Save marks
router.post("/marks/add", isAdmin, adminMarksController.saveMarks);

router.get("/students/search", async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q) return res.json([]);

    let students = [];

    // 🔹 Agar number hai → admissionNumber se exact / partial match
    if (!isNaN(q)) {
      students = await Student.find({
        admissionNumber: Number(q)
      })
      .limit(5)
      .select("admissionNumber fullname");
    } 
    // 🔹 Agar text hai → fullname se search
    else {
      students = await Student.find({
        fullname: { $regex: q, $options: "i" }
      })
      .limit(5)
      .select("admissionNumber fullname");
    }

    res.json(students);

  } catch (err) {
    console.error("❌ Student Search Error:", err);
    res.status(500).json([]);
  }
});


module.exports = router;
