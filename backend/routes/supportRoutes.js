const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: "satyammahakul2122@gmail.com",
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"${name} (${email})" <satyammahakul2122@gmail.com>`,
      to: "satyammahakul2122@gmail.com",
      replyTo: email,
      subject: `New Support Inquiry: ${subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
          <div style="background-color: #560BAD; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
            <h2 style="margin: 0;">Support Request Received</h2>
          </div>
          <div style="padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px;">
            <p><strong>Sender Name:</strong> ${name}</p>
            <p><strong>Sender Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p><strong>Message:</strong></p>
            <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #560BAD; font-style: italic;">
              ${message}
            </div>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
              Tip: You can click "Reply" in your email client to respond directly to ${email}.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;