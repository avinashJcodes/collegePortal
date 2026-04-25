const Admin = require("../models/adminModel");
const Student = require("../models/studentModel");
const bcrypt = require("bcrypt");


// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.send("Invalid admin credentials");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.send("Invalid admin credentials");

    // ✅ ADMIN SESSION
    req.session.adminId = admin._id;
      req.session.adminName = admin.username; 
    req.session.role = "admin";

   return res.redirect("/admins/Dashboard");
};

exports.getStudentDetails = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).send("Student Not Found");
    }

    res.render("admins/studentDetails", {
      layout:false,
       student });

  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.sendWarning = async (req, res) => {
  try {
    const studentId = req.params.id;
    const message = req.body.message;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).send("Student not found");
    }

    // ⚠ Save warning
    student.warningMessage = message;
    student.showWarning = true;

    await student.save();

    res.redirect("/admin/students?success=1");

  } catch (err) {
    console.log(err);
    res.status(500).send("Warning error");
  }
};

// ADMIN LOGOUT
exports.adminLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect("/admin/login");
    });
};
