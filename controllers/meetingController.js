const Meeting = require("../models/meetingModel");

const bcrypt = require("bcrypt");

exports.createMeeting = async (req, res) => {
  try {
    const { semester, password } = req.body;

    if (!semester || !password) {
      return res.status(400).send("All fields required");
    }

    // 🔥 Better random roomId
    const roomId = "meet-" + Math.random().toString(36).substring(2, 8);

    // 🔥 Hash password (recommended)
    const hashedPassword = await bcrypt.hash(password, 10);

    const meeting = await Meeting.create({
      roomId,
      password: hashedPassword,
      allowedSemester: Number(semester),
      createdBy: req.user?._id || null,
      isActive: true
    });

    // 🔥 FLOW: auto join admin
    return res.redirect(`/admin/meeting/${roomId}`);

  } catch (err) {
    console.log("Create Meeting Error:", err);
    return res.status(500).send("Error creating meeting");
  }
};




exports.joinMeeting = async (req, res) => {
  try {
    let { roomId, password } = req.body;

    // 🔹 sanitize input
    roomId = roomId?.trim();
    password = password?.trim();

    if (!roomId || !password) {
      return res.status(400).send("Enter Meeting ID & Password");
    }

    // 🔹 find meeting
    const meeting = await Meeting.findOne({ roomId });

    if (!meeting) {
      return res.status(404).send("Meeting not found");
    }

    if (!meeting.isActive) {
      return res.status(403).send("Meeting is closed");
    }

    // 🔥 PASSWORD CHECK
    // 👉 agar tu plain password use kar raha hai:
    // if (meeting.password !== password)

    // 👉 agar hash use karega (recommended):
    const isMatch = await bcrypt.compare(password, meeting.password);

    if (!isMatch) {
      return res.status(401).send("Wrong password");
    }

    // 🔥 SEMESTER CHECK
    if (req.student.semester !== meeting.allowedSemester) {
      return res.status(403).send("Not allowed for your semester");
    }

    // 🔥 OPTIONAL: session store (future security)
    req.session.meetingAccess = roomId;

    // ✅ PASS → redirect
    return res.redirect(`/meeting/${roomId}`);

  } catch (err) {
    console.error("Join Meeting Error:", err);
    return res.status(500).send("Error joining meeting");
  }
};


/* =========================
   🔹 RENDER MEETING PAGE
========================= */
exports.renderMeeting = async (req, res) => {
  try {
    const { roomId } = req.params;

    const meeting = await Meeting.findOne({ roomId });

    if (!meeting) return res.status(404).send("Invalid meeting");
    if (!meeting.isActive) return res.status(403).send("Meeting ended");

    // 🔹 STUDENT
    if (req.student && !req.user) {

      if (req.session.meetingAccess !== roomId) {
        return res.status(403).send("Unauthorized access");
      }

      if (req.student.semester !== meeting.allowedSemester) {
        return res.status(403).send("Unauthorized access");
      }

      return res.render("students/meetingPage", {
        meeting,
        student: req.student,
        showHeader: false
      });
    }

    // 🔹 ADMIN
    if (req.user) {
      return res.render("admins/meetingPage", {
        meeting,
        admin: req.user,
        showHeader: false
      });
    }

    return res.status(401).send("Unauthorized");

  } catch (err) {
    console.log("Render Meeting Error:", err);
    res.status(500).send("Error loading meeting");
  }
};