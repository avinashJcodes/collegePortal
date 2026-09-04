const axios = require("axios");
require("dotenv").config();

const sendEmail = async (to, subject, name, otp) => {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Avi Portal",
          email: process.env.EMAIL_USER, // same email
        },
        to: [{ email: to }],
        subject: subject,
     htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:linear-gradient(135deg,#667eea 0%,#764ba2 40%,#f64f59 100%);font-family:'Segoe UI',system-ui,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 16px;">

  <!-- Logo -->
  <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;border:1.5px solid rgba(255,255,255,0.4);text-align:center;vertical-align:middle;">
        <span style="color:#fff;font-size:16px;font-weight:800;">A</span>
      </td>
      <td style="padding-left:10px;vertical-align:middle;">
        <span style="color:#fff;font-size:18px;font-weight:700;">Avi Institute</span>
      </td>
    </tr>
  </table>

  <!-- Main card -->
  <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:24px;overflow:hidden;">

    <!-- Gradient top -->
    <tr><td style="background:linear-gradient(135deg,#667eea,#764ba2,#f64f59);padding:32px 36px 36px;">
      <p style="margin:0 0 18px;"><span style="display:inline-block;width:52px;height:52px;background:rgba(255,255,255,0.2);border-radius:14px;border:1.5px solid rgba(255,255,255,0.35);text-align:center;line-height:52px;font-size:22px;">🔒</span></p>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#fff;">Verify your identity</h1>
      <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.85);line-height:1.6;">
        Hi <strong style="color:#fff;">${name}</strong> — here's your one-time password to sign in securely.
      </p>
    </td></tr>

    <!-- Body -->
    <tr><td style="padding:32px 36px;">

      <!-- OTP label -->
      <p style="margin:0 0 14px;font-size:11px;font-weight:700;letter-spacing:2.5px;color:#a0aec0;text-transform:uppercase;text-align:center;">Your OTP Code</p>

      <!-- OTP digits -->
      <table cellpadding="0" cellspacing="0" style="margin:0 auto 16px;">
        <tr>
          ${String(otp).split('').map(d => `
            <td style="padding:0 4px;">
              <div style="width:52px;height:62px;border-radius:12px;background:#f5f3ff;border:2px solid #c4b5fd;text-align:center;line-height:62px;font-size:28px;font-weight:800;color:#5a4fcf;">${d}</div>
            </td>
          `).join('')}
        </tr>
      </table>

      <!-- Timer -->
      <p style="text-align:center;margin:0 0 28px;">
        <span style="display:inline-block;background:#f0fdf4;border:1.5px solid #86efac;border-radius:999px;padding:6px 18px;font-size:12px;font-weight:600;color:#16a34a;">
          ● Expires in 5:00 minutes
        </span>
      </p>

      <!-- Divider -->
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;"/>

      <!-- Warning -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border-radius:12px;border:1.5px solid #fde68a;margin-bottom:24px;">
        <tr><td style="padding:14px 16px;font-size:13px;color:#92400e;line-height:1.6;">
          ⚠️ <strong>Never share this OTP</strong> with anyone. Avi Institute will never ask for it via call, email, or message.
        </td></tr>
      </table>

      <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;line-height:1.6;">
        Didn't request this? <a href="mailto:support@aviinstitute.com" style="color:#764ba2;text-decoration:none;font-weight:600;">Contact support</a>
      </p>
    </td></tr>

    <!-- Footer -->
    <tr><td style="background:#f8fafc;padding:16px 36px;border-top:1px solid #f1f5f9;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="font-size:11px;color:#cbd5e1;">© 2025 Avi Institute</td>
          <td style="font-size:11px;color:#cbd5e1;text-align:right;">Automated · Do not reply</td>
        </tr>
      </table>
    </td></tr>

  </table>

  <p style="text-align:center;font-size:12px;color:rgba(255,255,255,0.6);margin-top:20px;">Sent securely · Avi Institute Portal</p>
</td></tr>
</table>
</body>
</html>
`
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
