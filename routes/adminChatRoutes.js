const express = require("express");
const router = express.Router();
const Chat = require("../models/chatModel");
const Student = require("../models/studentModel");
const isAdmin = require("../middlewares/isAdmin");

// Student list
router.get("/chat", isAdmin, async (req, res) => {
  const students = await Student.find({ approvalStatus: "approved" });
  res.render("admins/chatList", { 
    layout: false,
    students });
});

// Open student chat
router.get("/chat/:id", isAdmin, async (req, res) => {
  const student = await Student.findById(req.params.id);
  const chats = await Chat.find({ student: student._id }).sort("createdAt");

  res.render("admins/chatRoom", { 
    layout: false,
    student, chats });
});

// Reply
router.post("/chat/:id", isAdmin, async (req, res) => {
  await Chat.create({
    student: req.params.id,
    sender: "admin",
    message: req.body.message
  });

  res.redirect(`/admin/chat/${req.params.id}`);
});

module.exports = router;
