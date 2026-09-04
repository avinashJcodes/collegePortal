const Student = require("../models/studentModel");
const bcrypt = require("bcrypt");
const { generateOTP } = require("../utils/otpGenerator");
const { sendEmail } = require("../utils/sendEmail");
const { studentRegisterSchema } = require("../validators/studentValidator");



// ==========================
// REGISTER STUDENT
// ==========================
exports.registerStudent = async (req, res) => {
  const { error } = studentRegisterSchema.validate(req.body);
  if (error) return res.send(error.details[0].message);

  const { fullname, admissionNumber, email, password } = req.body;

  // 🔧 CHANGE: admission number duplicate check
  const existAdmission = await Student.findOne({ admissionNumber });
  if (existAdmission) return res.send("Admission number already registered");

  // existing email check
  const exist = await Student.findOne({ email });
  if (exist) return res.send("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  const otp = generateOTP();

  await sendEmail(
    email,
    "Your Verification OTP",
    fullname,
    otp
  );

  // 🔧 CHANGE: OTP expiry added
  req.session.tempStudent = {
    fullname,
    email,
    admissionNumber,
    password: hashedPassword,
    otp,
    expire: Date.now() + 5 * 60 * 1000 // 5 min
  };

  res.send("OTP sent to your email!");
};


// ==========================
// LOGIN STUDENT
// ==========================
exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  const student = await Student.findOne({ email });
  if (!student) {
    return res.send("Invalid email or password"); // 🔧 CHANGE (generic)
  }

  // 🔧 CHANGE: password check FIRST
  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) {
    return res.send("Invalid email or password");
  }

  if (!student.isVerified) {
    return res.send("Please verify your email first");
  }

  if (student.approvalStatus === "pending") {
    return res.send("Your account is pending admin approval");
  }

  if (student.approvalStatus === "rejected") {
    return res.send("Your registration was rejected by admin");
  }

  if (!student.isActive) {
    return res.send("Your account is disabled");
  }

  req.session.studentId = student._id;

  return res.redirect("/student/dashboard");
};


// ==========================
// VERIFY OTP
// ==========================
exports.verifyOTP = async (req, res) => {
  const { otp } = req.body;

  if (!req.session.tempStudent) {
    return res.send("Session expired or no OTP generated!");
  }

  // 🔧 CHANGE: OTP expiry check
  if (Date.now() > req.session.tempStudent.expire) {
    req.session.tempStudent = null;
    return res.send("OTP expired");
  }

  if (req.session.tempStudent.otp != otp) {
    return res.send("Invalid OTP");
  }

  const { fullname, email, admissionNumber, password } =
    req.session.tempStudent;

  await Student.create({
    fullname,
    email,
    admissionNumber,
    password,
    isVerified: true,
    approvalStatus: "pending",
    isActive: false
  });

  req.session.tempStudent = null;

  res.send("OTP Verified! Account created successfully.");
};


// ==========================
// RESEND OTP
// ==========================
exports.resendOTP = async (req, res) => {
  if (!req.session.tempStudent) {
    return res.send("Session expired or no OTP generated!");
  }

  const { fullname, email } = req.session.tempStudent;

  const newOtp = generateOTP();

  // 🔧 CHANGE: reset expiry
  req.session.tempStudent.otp = newOtp;
  req.session.tempStudent.expire = Date.now() + 5 * 60 * 1000;

  await sendEmail(
    email,
    "Your New Verification OTP",
    fullname,
    newOtp
  );

  res.send("OTP Resent");
};


// ==========================
// FORGOT PASSWORD
// ==========================
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const student = await Student.findOne({ email });

  if (student) {
    const otp = generateOTP();

    req.session.resetPassword = {
      email,
      otp: otp.toString(),
      expire: Date.now() + 5 * 60 * 1000,
      verified: false
    };

    await sendEmail(
      email,
      "Password Reset OTP",
      student.fullname,
      otp
    );
  } else {
    req.session.resetPassword = null;
  }

  res.send("If this email is registered, a reset OTP has been sent");
};


// ==========================
// VERIFY FORGOT OTP
// ==========================
exports.verifyForgotOTP = async (req, res) => {
  const { otp } = req.body;
  const data = req.session.resetPassword;

  if (!data) return res.send("Session expired");
  if (Date.now() > data.expire) return res.send("OTP expired");

  if (data.otp !== otp.toString().trim()) {
    return res.send("Invalid OTP");
  }

  data.verified = true;
  data.otp = null;

  res.send("OTP Verified. You can now reset your password.");
};


// ==========================
// RESET PASSWORD
// ==========================
exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;

  if (!req.session.resetPassword?.verified) {
    return res.send("OTP not verified");
  }

  const hashed = await bcrypt.hash(newPassword, 10);

  await Student.findOneAndUpdate(
    { email: req.session.resetPassword.email },
    { password: hashed }
  );

  req.session.resetPassword = null;

  res.send("Password updated successfully");
};
