const router = require("express").Router();
const meetingController = require("../controllers/meetingController");
const {isStudent } = require("../middlewares/studentAuth");
const { setHeader } = require("../middlewares/setHeader");



router.get("/joinmeeting", setHeader(true), isStudent, (req, res) => {
  res.render("students/joinMeeting", {
    student: req.student,
    currentPath: req.path,
    showHeader: true
  });
});


router.post("/join", isStudent,  meetingController .joinMeeting);
router.get("/:roomId", setHeader(true),isStudent, meetingController.renderMeeting);

module.exports = router;