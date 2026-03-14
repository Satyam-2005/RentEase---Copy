const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text, html) => {
  if (!process.env.EMAIL_USER || !process.env.PASS2) {
    console.warn("EMAIL_USER or PASS2 not set in .env — skipping email.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.PASS2,
    },
  });

  await transporter.sendMail({
    from: `"RentEase" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html: html || text,
  });

  console.log(`Email sent to ${to} — Subject: ${subject}`);
};

module.exports = { sendEmail };