const express = require("express");
const router = express.Router();
const { registerStudent, loginStudent,verifyOTP, resendOTP,forgotPassword,verifyForgotOTP,resetPassword} = require("../controllers/authController");


router.get("/", (req, res) => {
  res.send("Auth Route Working");
});

// STUDENT REGISTER ROUTE
router.post("/register", registerStudent); 

// STUDENT LOGIN ROUTE
router.post("/login", loginStudent);

router.post("/verify-otp", verifyOTP);

// RESEND OTP
router.post("/resend-otp", resendOTP);

router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-otp", verifyForgotOTP);
router.post("/reset-password", resetPassword);


module.exports = router;
