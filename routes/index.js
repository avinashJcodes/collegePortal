const express = require("express");
const router = express.Router();



router.get("/", (req, res) => {
res.render("students/2dashbord", { layout: false });// ✅ home page
});



router.get("/register", (req, res) => {
  res.render("students/login", {
     layout: false,
    email: req.session.tempStudent ? req.session.tempStudent.email : ""
  });
});

router.get("/admission", (req, res) => {
  res.render("admssionform",
    {layout: false} ); // admission.ejs open hoga
});

router.post("/apply", async (req, res) => {
  try {
    const newStudent = new Student({
      firstName: req.body.firstName,
      middleName: req.body.middleName,
      lastName: req.body.lastName,

      tenthSchool: req.body.tenthSchool,
      tenthMarks: req.body.tenthMarks,

      twelfthCollege: req.body.twelfthCollege,
      twelfthMarks: req.body.twelfthMarks,

      examType: req.body.examType,
      examScore: req.body.examScore,

      email: req.body.email,
      mobile: req.body.mobile,
      address: req.body.address,

      course: req.body.course
    });

    await newStudent.save();

    res.send("✅ Admission Form Submitted Successfully");
  } catch (err) {
    console.log(err);
    res.send("❌ Error submitting form");
  }
});






module.exports = router;
