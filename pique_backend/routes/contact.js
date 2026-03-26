const express = require("express");
const nodemailer = require("nodemailer");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimString(value) {
	return typeof value === "string" ? value.trim() : "";
}

function getSmtpConfig() {
	const host = process.env.SMTP_HOST;
	const port = Number(process.env.SMTP_PORT || 587);
	const user = process.env.SMTP_USER;
	const pass = process.env.SMTP_PASS;
	const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

	if (!host || !user || !pass) {
		return null;
	}

	return { host, port, secure, auth: { user, pass } };
}

router.post("/", async (req, res) => {
	try {
		const name = trimString(req.body?.name);
		const email = trimString(req.body?.email);
		const subject = trimString(req.body?.subject);
		const message = trimString(req.body?.message);

		if (!name) return res.status(400).json({ error: "Name is required" });
		if (!email || !EMAIL_RE.test(email)) {
			return res.status(400).json({ error: "A valid email is required" });
		}
		if (!subject) return res.status(400).json({ error: "Subject is required" });
		if (!message || message.length < 10) {
			return res.status(400).json({ error: "Message must be at least 10 characters" });
		}

		const smtpConfig = getSmtpConfig();
		const to = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
		const from = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER;

		if (!smtpConfig || !to || !from) {
			return res.status(500).json({
				error: "Contact email service is not configured",
			});
		}

		const transporter = nodemailer.createTransport(smtpConfig);

		await transporter.sendMail({
			from,
			to,
			replyTo: email,
			subject: `[Contact] ${subject}`,
			text: [
				`Name: ${name}`,
				`Email: ${email}`,
				"",
				"Message:",
				message,
			].join("\n"),
			html: `
				<h2>New Contact Form Submission</h2>
				<p><strong>Name:</strong> ${name}</p>
				<p><strong>Email:</strong> ${email}</p>
				<p><strong>Subject:</strong> ${subject}</p>
				<p><strong>Message:</strong></p>
				<p>${message.replace(/\n/g, "<br />")}</p>
			`,
		});

		return res.status(200).json({ success: true, message: "Contact message sent" });
	} catch (err) {
		console.error("POST /api/contact error:", err);
		return res.status(500).json({ error: "Failed to send contact message" });
	}
});

module.exports = router;
