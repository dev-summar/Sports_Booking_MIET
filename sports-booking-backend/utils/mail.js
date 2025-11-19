const nodemailer = require("nodemailer");

// TRANSPORTER FOR SENDING MAILS FROM notifications@mietjammu.in
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",     // Gmail Workspace (app password required)
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER || "notifications@mietjammu.in",
    pass: process.env.EMAIL_PASS || "INFO_MAIL_PASSWORD" // Use environment variable for app password
  }
});

// Reusable function for sending emails
async function sendMail(to, subject, html) {
  try {
    return await transporter.sendMail({
      from: `"MIET Sports Team" <${process.env.EMAIL_USER || "notifications@mietjammu.in"}>`,
      to,
      subject,
      html
    });
  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
    throw err; // Re-throw to allow caller to handle
  }
}

module.exports = sendMail;
