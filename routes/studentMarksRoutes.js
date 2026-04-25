const express = require("express");
const router = express.Router();


const { isStudent } = require("../middlewares/studentAuth");
const studentMarksController = require("../controllers/studentMarksController");

// 📌 Student marks page
// URL: /student/marks
router.get("/marks", isStudent, studentMarksController.viewMarks);


router.get("/marksheet/download",isStudent, studentMarksController.downloadMarksheet
);



module.exports = router;
