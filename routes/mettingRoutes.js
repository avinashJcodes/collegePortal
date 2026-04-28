const router = require("express").Router();
const meetingController = require("../controllers/meetingController");
const {isStudent } = require("../middlewares/studentAuth");



router.get("/joinmeeting", isStudent, (req, res) => {
  res.render("students/joinMeeting", {
    student: req.student,
    currentPath: req.path,
    showHeader: true
  });
});


router.post("/join", isStudent,  meetingController .joinMeeting);
router.get("/:roomId", isStudent, meetingController.renderMeeting);

module.exports = router;