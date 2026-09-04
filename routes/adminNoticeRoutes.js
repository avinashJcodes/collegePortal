
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Notice = require("../models/noticeModel");

// 🔥 MULTER CONFIG
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // folder hona chahiye
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage: storage });

// 🔥 CREATE NOTICE
router.post(
  "/notice/create",
  upload.single("pdf"),
  async (req, res) => {
    try {
      console.log("BODY:", req.body);
      console.log("FILE:", req.file);

      const { title, message, category } = req.body || {};

      await Notice.create({
        title,
        message,
        category,
        pdf: req.file ? "/uploads/" + req.file.filename : null
      });

      res.redirect("/admin/notices");
    } catch (err) {
      console.error(err);
      res.send("Error creating notice");
    }
  }
);

// 🔥 GET NOTICES
router.get("/notices", async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 });

  res.render("admins/notices", {
    notices,
    layout: false,
    layout: "admins/layout/admin"
  });
});

module.exports = router;

router.get("/notices", async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 });
  res.render("admins/notices", {
     notices,
     layout: false
   });
});


router.post("/notice/delete/:id", async (req, res) => {
  try {
    await Notice.findByIdAndDelete(req.params.id);
    res.redirect("/admin/notices");
  } catch (err) {
    console.log(err);
    res.send("Error deleting notice");
  }
});

module.exports = router;
