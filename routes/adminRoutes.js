const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const adminAuth = require("../middlewares/isAdmin");
const Student = require("../models/studentModel");


// 🔓 Login page
router.get("/login", (req, res) => {
    res.render("admins/login" ,{ layout: false });
});


// 🔓 Login POST  ✅ FIXED
router.post("/login", adminController.adminLogin);

// 🔐 Dashboard
router.get("/dashboard", adminAuth, async (req, res) => {

    const totalStudents = await Student.countDocuments();

    const pendingStudents = await Student.countDocuments({
        approvalStatus: "pending"
    });

    const approvedStudents = await Student.countDocuments({
        approvalStatus: "approved"
    });

    res.render("admins/Dashboard", {
        layout: false,
        adminName: req.session.adminName,
        totalStudents,
        pendingStudents,
        approvedStudents
    });
});




// 🔐 Pending students list
router.get("/students/pending", adminAuth, async (req, res) => {
    const students = await Student.find({ approvalStatus: "pending" });
res.render("admins/pendingStudents", {
    layout: false,
    students
});

})

// 🔐 Approve student

router.post("/students/:id/approve", adminAuth, async (req, res) => {
    await Student.findByIdAndUpdate(req.params.id, {
        approvalStatus: "approved",
        isActive: true
    });
    res.redirect("/admin/students/pending");
});

// 🔐 Reject student
router.post("/students/:id/reject", adminAuth, async (req, res) => {
    await Student.findByIdAndUpdate(req.params.id, {
        approvalStatus: "rejected",
        isActive: false
    });
    res.redirect("/admin/students/pending");
});


router.get("/students", adminAuth, async (req, res) => {
    const search = req.query.search || "";

    let query = {};

    if (search) {
        query = {
            $or: [
                { fullname: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { admissionNumber: isNaN(search) ? -1 : Number(search) }
            ]
        };
    }

    const students = await Student.find(query)
        .sort({ createdAt: -1 })
        .limit(100); // 🔥 only 100 load

    res.render("admins/allStudents", {
        layout: false,
         students,
        search });
});

router.get("/students/search", adminAuth, async (req, res) => {
    const search = req.query.search || "";

    let query = {};

    if (search) {
        query = {
            $or: [
                { fullname: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { admissionNumber: isNaN(search) ? -1 : Number(search) }
            ]
        };
    }

    const students = await Student.find(query).limit(50);

    res.json(students); // 🔥 JSON bhej
});

router.get("/student/search", adminAuth, async (req, res) => {
  const query = req.query.q;

  const student = await Student.findOne({
    $or: [
      { admissionNumber: Number(query) || -1 },
      { fullname: { $regex: query, $options: "i" } }
    ]
  });

  res.json(student);
});

router.get("/students/approved", adminAuth, async (req, res) => {
    const students = await Student.find({ approvalStatus: "approved" });
    res.render("admins/approvedStudents", { 
               layout: false,
        students });
});

router.get("/student/:id", adminController.getStudentDetails);

router.post("/student/:id/warning", adminAuth, async (req, res) => {
  const { message } = req.body;

  await Student.findByIdAndUpdate(req.params.id, {
    warningMessage: message,
    showWarning: true
  });

  res.redirect(`/admin/student/${req.params.id}`);
});


// 🔐 Logout
router.get("/logout", adminAuth, adminController.adminLogout);





module.exports = router;
