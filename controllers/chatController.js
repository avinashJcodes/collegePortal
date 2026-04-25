const Chat = require("../models/chatModel");

exports.studentChatPage = async (req, res) => {
  const student = req.student;

  const messages = await Chat.find({ student: student._id })
    .sort({ createdAt: 1 });

  res.render("chat/studentChat", {  

    student,
    messages
  });
};

exports.sendMessage = async (req, res) => {
  if (!req.body.message) {
    return res.redirect( "student/chat");
  }

  await Chat.create({
    student: req.student._id,
    sender: "student",
    message: req.body.message
  });

  res.redirect("/student/chat");
};
