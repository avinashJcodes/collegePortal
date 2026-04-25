const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTH
);

exports.sendAbsentWhatsApp = async (student) => {
  let phone = student.phone;

  if (!phone) {
    console.log("❌ Phone missing for", student.fullname);
    return;
  }

  if (!phone.startsWith("+")) {
    phone = "+91" + phone; // 🔥 auto-fix
  }

  await client.messages.create({
    from: process.env.TWILIO_WA_FROM,
    to: `whatsapp:${phone}`,
    body: `NIT Attendance Alert

Dear ${student.fullname},
You are marked ABSENT today.

Thank you,
NIT Team`
  });

  console.log(`📲 WhatsApp sent to ${student.fullname}`);
};
