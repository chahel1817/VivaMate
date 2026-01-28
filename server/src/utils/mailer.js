const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.MAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.MAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠ Email credentials (EMAIL_USER/EMAIL_PASS) are not fully configured. Forgot password emails will fail.");
}

// Basic Gmail-compatible transport; can be customized via env later
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

async function sendOtpEmail(to, otp) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error("❌ Email credentials not configured. Cannot send OTP.");
    throw new Error("Email service not configured on server. Please contact support.");
  }

  const fromAddress = process.env.EMAIL_FROM || EMAIL_USER;

  const mailOptions = {
    from: `VivaMate <${fromAddress}>`,
    to,
    subject: "Your VivaMate login OTP",
    text: `Your one-time password (OTP) for VivaMate is: ${otp}\n\nThis code will expire in 10 minutes.\nIf you did not request this, you can ignore this email.`,
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px;">
        <h2 style="color:#16a34a; margin-bottom: 8px;">VivaMate Login OTP</h2>
        <p style="margin: 0 0 12px 0;">Use the following one-time password to login to your VivaMate account:</p>
        <div style="font-size: 24px; font-weight: 600; letter-spacing: 4px; margin: 12px 0; color:#111827;">
          ${otp}
        </div>
        <p style="margin: 0 0 4px 0; font-size: 14px; color:#6b7280;">
          This code is valid for <strong>10 minutes</strong>.
        </p>
        <p style="margin: 0; font-size: 12px; color:#9ca3af;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
    `,
  };

  try {
    console.log(`📧 Attempting to send OTP to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send OTP email to ${to}:`, error.message);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

module.exports = { sendOtpEmail };

