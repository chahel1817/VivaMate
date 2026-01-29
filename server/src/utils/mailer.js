const nodemailer = require("nodemailer");

const EMAIL_USER = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.MAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS || process.env.MAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("⚠ Email credentials (EMAIL_USER/EMAIL_PASS) are not fully configured. Forgot password emails will fail.");
}

// Basic Gmail-compatible transport; can be customized via env later
// Explicit Gmail configuration - Enforcing IPv4 + Port 587
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  family: 4, // Force IPv4 (fixes timeouts on some IPv6 networks)
  connectionTimeout: 30000, // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 30000
});

async function sendOtpEmail(to, otp) {
  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error("Email credentials not configured on server (.env).");
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
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${to}:`, error.message);
    throw error;
  }
}

module.exports = { sendOtpEmail };
