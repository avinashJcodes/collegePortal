const axios = require("axios");
require("dotenv").config();

const sendEmail = async (to, subject, name, otp) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "NIT Portal",
          email: process.env.EMAIL_USER, // same email
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: `
          <h2>Hello ${name},</h2>
          <p>Your OTP is:</p>
          <h1 style="color:blue;">${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Email sent successfully");
  } catch (error) {
    console.log("🔥 Email Error:", error.response?.data || error.message);
    throw error;
  }
};

exports.sendEmail = sendEmail;