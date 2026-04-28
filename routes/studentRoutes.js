const express = require("express");
const router = express.Router();

const { isStudent } = require("../middlewares/studentAuth");
const upload = require("../middlewares/uploadStudentImage");
const uploadErrorHandler = require("../middlewares/uploadErrorHandler");
const studentController = require("../controllers/studentController");
const{ setSidebar} = require("../middlewares/setsidebar")
const {setHeader} = require("../middlewares/setHeader")



// ================= DASHBOARD =================
router.get("/dashboard",  setSidebar(false), setHeader(true),
 isStudent, studentController.dashboard);


// ================= PROFILE PAGE =================
router.get("/profile", isStudent,setHeader(true), studentController.profilePage);

// ================= SAVE / UPDATE PROFILE =================
router.post(
  "/profile",
  isStudent,
  upload.single("profileImage"), // ✅ ONLY THIS
  studentController.saveProfile, // ✅ ONE CONTROLLER
  uploadErrorHandler
);

// ================= LOGOUT =================
router.get("/logout", isStudent, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log("Logout error:", err);
      return res.redirect("/students/dashboard");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});


router.get(
  "/marksheet",
  isStudent,
  setHeader(true),
  studentController.viewMarksheet
);

router.post("/clear-warning", isStudent, async (req, res) => {
  const student = req.student;

  student.showWarning = false;
  student.warningMessage = "";

  await student.save();

  res.redirect("/student/dashboard");
});




module.exports = router;
