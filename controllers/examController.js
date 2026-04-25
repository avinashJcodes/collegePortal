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
    const form = await ExamForm.findById(req.params.id);
    if (!form) return res.status(404).json({ error: "Form not found" });

    const student = await Student.findById(req.session.studentId);
    if (!student) {
      return res.status(401).json({ error: "Student not found" });
    }

    // ✅ PHONE CLEAN + VALIDATE (यहीं डालना है)
    const rawPhone = String(student.phone || "");
    const phone = rawPhone.replace(/\D/g, "").slice(-10);
    console.log("RAW PHONE:", student.phone);
console.log("CLEAN PHONE:", phone);
console.log("HITTING CASHFREE...");

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    // ✅ EMAIL CHECK (optional but safe)
    if (!student.email) {
      return res.status(400).json({ error: "Email missing" });
    }

    const orderId = "order_" + Date.now();

    const isProd =
      process.env.CASHFREE_ENV === "PROD" ||
      process.env.CASHFREE_ENV === "production";

    const baseURL = isProd
      ? "https://api.cashfree.com/pg/orders"
      : "https://sandbox.cashfree.com/pg/orders";

    const response = await axios.post(
      baseURL,
      {
        order_id: orderId,
        order_amount: Number(form.examFee),
        order_currency: "INR",

        customer_details: {
          customer_id: String(student._id),
          customer_email: student.email,
          customer_phone: phone, // ✅ FIXED
        },

        order_meta: {
          return_url:
            "https://collegeportal-production.up.railway.app/exam/student/cashfree/return/" +
            form._id,
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

    form.cashfreeOrderId = orderId;
    await form.save();

    res.json({
      payment_session_id: response.data.payment_session_id,
    });
  } catch (err) {
    console.error("❌ Cashfree error:", err.response?.data || err.message);
    res.status(500).json({ error: "Cashfree order failed" });
  }
};

// ✅ CASHFREE RETURN + VERIFY
exports.cashfreeReturn = async (req, res) => {
  try {
    const formId = req.params.formId;
    const form = await ExamForm.findById(formId);

    if (!form || !form.cashfreeOrderId) {
      return res.redirect("/exam/student/exam-status");
    }

    // ✅ ENV check
    const isProd =
      process.env.CASHFREE_ENV === "PROD" ||
      process.env.CASHFREE_ENV === "production";

    // ✅ सही URL बनाओ
    const verifyURL = isProd
      ? `https://api.cashfree.com/pg/orders/${form.cashfreeOrderId}`
      : `https://sandbox.cashfree.com/pg/orders/${form.cashfreeOrderId}`;

    console.log("VERIFY URL:", verifyURL);

    // ✅ सही API call
    const verify = await axios.get(verifyURL, {
      headers: {
        "x-api-version": "2022-09-01",
        "x-client-id": process.env.CASHFREE_APP_ID,
        "x-client-secret": process.env.CASHFREE_SECRET_KEY,
      },
    });

if (verify.data.order_status === "PAID") {
  console.log("✅ Payment verified (return)");
  // ❌ DB update मत करो
}
    res.redirect("/exam/student/exam-status");
  } catch (err) {
    console.error(
      "❌ Return verify error:",
      err.response?.data || err.message
    );
    res.redirect("/exam/student/exam-status");
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
    console.log("🔔 Webhook hit:", req.body);

    const event = req.body;

    // Handle real payment event
    if (event?.type === "PAYMENT_SUCCESS") {
      const payment = event.data?.payment;
      const order = event.data?.order;

      const formId = order?.order_tags?.formId;

      if (formId) {
        await ExamForm.findByIdAndUpdate(formId, {
          paymentStatus: "Paid",
          transactionId: payment?.cf_payment_id,
          paidAt: new Date(payment?.payment_time),
        });

        console.log("✅ Payment success:", formId);
      }
    }

    // 🔥 Always respond JSON
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook error:", err.message);

    // 🔥 Even on error return 200 (Cashfree retry spam avoid)
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
