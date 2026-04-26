const ExamForm = require("../models/examModel");
const axios = require("axios");
const Student = require("../models/studentModel");


/* =======================
   STUDENT CONTROLLERS
======================= */

// Exam form page
exports.examFormPage = async (req, res) => {
  try {
    const studentId = req.session.studentId;

    // 1️⃣ Student fetch
    const student = await Student.findById(studentId);
    if (!student) return res.redirect("/student/login");

    // 2️⃣ Profile complete check
    if (!student.isProfileComplete) {
      return res.redirect("/student/profile/edit");
    }

    // 3️⃣ 🔥 CHECK EXISTING EXAM FORM
    const existingForm = await ExamForm.findOne({
      studentId: studentId,
      paymentStatus: "Paid",
    });

    // ✅ Already submitted & paid → FORM HIDE
    if (existingForm) {
      return res.redirect("/exam/student/exam-status");
    }

    // ❌ Otherwise show exam form
    res.render("exam/examForm", { student });
  } catch (err) {
    console.error(err);
    res.send("Error loading exam form");
  }
};

// Submit exam form
// Submit exam form
exports.submitExamForm = async (req, res) => {
  try {
    const { semester, subjects, examType } = req.body;

    // 🔹 Student fetch (course ke liye)
    const student = await Student.findById(req.session.studentId);

    if (!student) {
      return res.redirect("/student/login");
    }

    // ✅ STEP 1: CHECK IF SAME EXAM ALREADY PAID
    const existing = await ExamForm.findOne({
      studentId: student._id,
      semester: Number(semester),
      examType,
      paymentStatus: "Paid",
    });

    if (existing) {
      return res.send("❌ Exam fee already paid for this semester");
    }

    // ✅ STEP 2: CREATE EXAM FORM
    const form = await ExamForm.create({
      studentId: student._id,
      examName: "Final Semester Exam",
      semester: Number(semester),
      examType,
      course: student.course,
      subjects: Array.isArray(subjects) ? subjects : [subjects],
      examFee: 1, // sandbox ₹1
    });

    // ✅ STEP 3: GO TO PAYMENT PAGE
    res.render("exam/examPayment", { student, form });
  } catch (err) {
    console.error(err);
    res.send("Exam form submit error");
  }
};

exports.createCashfreeOrder = async (req, res) => {
  try {
    // 🔹 Fetch form
    const form = await ExamForm.findById(req.params.id);
    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    // 🔹 Fetch student
    const student = await Student.findById(req.session.studentId);
    if (!student) {
      return res.status(401).json({ error: "Student not found" });
    }

    // 🔹 Phone clean
    const rawPhone = String(student.phone || "");
    const phone = rawPhone.replace(/\D/g, "").slice(-10);

    console.log("RAW PHONE:", student.phone);
    console.log("CLEAN PHONE:", phone);

    if (phone.length !== 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // 🔹 Email check
    if (!student.email) {
      return res.status(400).json({ error: "Email missing" });
    }

    // 🔴 Critical env checks
    if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
      return res.status(500).json({ error: "Cashfree keys missing in .env" });
    }

    if (!process.env.BASE_URL) {
      return res.status(500).json({ error: "BASE_URL missing in .env" });
    }

    if (!form.examFee || isNaN(form.examFee)) {
      return res.status(400).json({ error: "Invalid exam fee" });
    }

    // 🔹 Order setup
    const orderId = "order_" + Date.now();

    const isProd =
      process.env.CASHFREE_ENV === "PROD" ||
      process.env.CASHFREE_ENV === "production";

    const apiURL = isProd
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    const baseUrl = process.env.BASE_URL;

    // 🔹 Create order
    const response = await axios.post(
      apiURL,
      {
        order_id: orderId,
        order_amount: Number(form.examFee),
        order_currency: "INR",

        customer_details: {
          customer_id: String(student._id),
          customer_email: student.email,
          customer_phone: phone,
        },

   order_meta: {
  return_url: `${baseUrl}/exam/student/cashfree/return/${form._id}`,
  notify_url: `${baseUrl}/exam/student/cashfree/webhook`,
},
        order_tags: {
          formId: String(form._id),
        },
      },
      {
        headers: {
          "x-api-version": "2022-09-01",
          "x-client-id": process.env.CASHFREE_APP_ID,
          "x-client-secret": process.env.CASHFREE_SECRET_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // 🔹 Save order ID
    form.cashfreeOrderId = orderId;
    await form.save();

    // 🔹 Send session ID
    return res.json({
      payment_session_id: response.data.payment_session_id,
    });

  } catch (err) {
    console.error("❌ FULL ERROR:", err);
    console.error("❌ RESPONSE:", err.response?.data);

    return res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
};

// ✅ CASHFREE RETURN + VERIFY
exports.cashfreeReturn = async (req, res) => {
  try {
    console.log("🔁 Return hit:", req.params.formId);

    // 👉 बस redirect करो
    return res.redirect("/exam/student/exam-status");

  } catch (err) {
    console.error("Return error:", err.message);
    return res.redirect("/exam/student/exam-status");
  }
};



// Student exam status
exports.examStatusPage = async (req, res) => {
  const forms = await ExamForm.find({ studentId: req.session.studentId });
  res.render("exam/examStatus", {
    forms,
  });
};

exports.cashfreeWebhook = async (req, res) => {
  try {
    console.log("🔔 Webhook hit:", JSON.stringify(req.body, null, 2));

    const event = req.body;

    if (event?.type === "PAYMENT_SUCCESS") {
      const payment = event.data?.payment;
      const order = event.data?.order;

      const orderId = order?.order_id;

      const updated = await ExamForm.findOneAndUpdate(
        { cashfreeOrderId: orderId },
        {
          paymentStatus: "Paid",
          transactionId: payment?.cf_payment_id,
          paidAt: new Date(payment?.payment_time),
        }
      );

      console.log("✅ Updated:", updated);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    return res.status(200).json({ success: false });
  }
};

/* =======================
   ADMIN CONTROLLERS
======================= */

exports.viewExamForms = async (req, res) => {
  const forms = await ExamForm.find()
    .populate("studentId")
    .sort({ createdAt: -1 });

  res.render("exam/examforms", { forms });
};

exports.verifyPayment = async (req, res) => {
  await ExamForm.findByIdAndUpdate(req.params.id, {
    paymentStatus: "Paid",
    paidAt: new Date(),
  });

  res.redirect("/exam/admin/exam-forms");
};
