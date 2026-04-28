const router = require("express").Router();
const meetingController = require("../controllers/meetingController");
const isAdmin = require("../middlewares/isAdmin");
const Meeting = require("../models/meetingModel");


router.get("/create-meeting", isAdmin, (req, res) => {
  res.render("admins/createMeeting", {
    currentPath: req.path,
    showHeader: true
  });
});

router.get("/meeting/:roomId", isAdmin, async (req, res) => {
  const meeting = await Meeting.findOne({ roomId: req.params.roomId });

  if (!meeting) return res.send("Invalid meeting");

  res.render("admins/meetingPage", {
    meeting,
    admin: req.user,
    layout: false
  });
});
router.post("/create", isAdmin, meetingController.createMeeting);

module.exports = router;