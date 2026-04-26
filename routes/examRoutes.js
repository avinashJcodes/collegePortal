const express = require("express");
const router = express.Router();

const { isStudent } = require("../middlewares/studentAuth");
const isAdmin = require("../middlewares/isAdmin");
const examController = require("../controllers/examController");

/* STUDENT */
router.get("/student/exam-form", isStudent, examController.examFormPage);
router.post("/student/exam-form", isStudent, examController.submitExamForm);

router.post(
  "/student/cashfree/create-order/:id",
  
  examController.createCashfreeOrder
);

router.get(
  "/student/cashfree/return/:formId",
  examController.cashfreeReturn
);

router.get(
  "/student/exam-status",
  isStudent,
  examController.examStatusPage)

  // 🔔 CASHFREE WEBHOOK (NO auth middleware)
router.post(
  "/cashfree/webhook",
  examController.cashfreeWebhook
);


/* ADMIN */
router.get("/admin/exam-forms", isAdmin, examController.viewExamForms);
router.post("/admin/exam-forms/verify/:id", isAdmin, examController.verifyPayment);

module.exports = router;
