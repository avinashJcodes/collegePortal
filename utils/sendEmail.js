const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, name, otp) => {
  try {
 const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

    const mailOptions = {
      from: `"NIT Portal" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: `
        <h2>Hello ${name},</h2>
        <p>Your OTP is:</p>
        <h1 style="color:blue;">${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.log("🔥 Email Error:", error);
    throw error;
  }
};

// ✅ IMPORTANT (for your current import)
exports.sendEmail = sendEmail;