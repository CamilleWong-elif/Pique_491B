const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    throw new Error("SMTP_USER and SMTP_PASS are required");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email || !String(email).trim() || !isValidEmail(email)) {
      return res.status(400).json({ error: "A valid email is required" });
    }
    if (!subject || !String(subject).trim()) {
      return res.status(400).json({ error: "Subject is required" });
    }
    if (!message || !String(message).trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const cleanName = String(name).trim().slice(0, 120);
    const cleanEmail = String(email).trim().slice(0, 320);
    const cleanSubject = String(subject).trim().slice(0, 180);
    const cleanMessage = String(message).trim().slice(0, 5000);
    const htmlName = escapeHtml(cleanName);
    const htmlEmail = escapeHtml(cleanEmail);
    const htmlSubject = escapeHtml(cleanSubject);
    const htmlMessage = escapeHtml(cleanMessage);

    const to = process.env.CONTACT_TO || process.env.SMTP_USER;
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const transporter = getTransporter();

    await transporter.sendMail({
      from,
      to,
      replyTo: cleanEmail,
      subject: `[Pique Contact] ${cleanSubject}`,
      text: [
        `From: ${cleanName} <${cleanEmail}>`,
        "",
        "Message:",
        cleanMessage,
      ].join("\n"),
      html: `
        <p><strong>From:</strong> ${htmlName} &lt;${htmlEmail}&gt;</p>
        <p><strong>Subject:</strong> ${htmlSubject}</p>
        <hr />
        <p style="white-space: pre-wrap;">${htmlMessage}</p>
      `,
    });

    return res.status(202).json({ success: true });
  } catch (err) {
    console.error("POST /api/contact error:", err);
    return res.status(500).json({ error: "Failed to send contact email" });
  }
});

module.exports = router;