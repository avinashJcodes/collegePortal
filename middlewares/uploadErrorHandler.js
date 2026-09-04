const multer = require("multer");

module.exports = (err, req, res, next) => {
  // Multer file size error
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.render("students/profileForm", {
        student: req.student,
        error: "Profile image size must be less than 4 MB"
      });
    }
  }

  // Invalid file type error
  if (err.message === "Only JPG, JPEG, PNG images are allowed") {
    return res.render("students/profileForm", {
      student: req.student,
      error: err.message
    });
  }

  next(err);
};
