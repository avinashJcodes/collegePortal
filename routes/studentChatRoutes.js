const express = require("express");
const router = express.Router();
const Chat = require("../models/chatModel");

const { isStudent } = require("../middlewares/studentAuth");
const chatController = require("../controllers/chatController");

// Student chat page
router.get("/chat", isStudent, chatController.studentChatPage);

// Send message
router.post("/chat", isStudent, chatController.sendMessage);

// DELETE student message
// student chat delete (POST)

router.post("/chat/delete/:id", async (req, res) => {
  try {
    const studentId = req.session.studentId;
    if (!studentId) return res.redirect("/auth/login");

    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.redirect("/student/chat");

    // 🔐 Ownership check (SAFE)
    if (
      chat.sender !== "student" ||
      String(chat.student) !== String(studentId)
    ) {
      return res.redirect("/student/chat");
    }

    chat.isDeleted = true;
    chat.message = "";
    await chat.save();

    // ✅ Always go back to chat page
    res.redirect("/student/chat");

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.redirect("/student/chat");
  }
});





module.exports = router;
