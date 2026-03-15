const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// --- Configuration ---
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const SMTP_USER = process.env.EMAIL_USER;
const SMTP_PASS = process.env.EMAIL_PASS;

// --- Transports ---
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Nodemailer SMTP Transport 
// Using Port 587 (TLS) which is often more compatible with cloud firewalls than 465
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

/**
 * Send OTP Email
 */
async function sendOtpEmail(to, otp) {
  const subject = "Your VivaMate login OTP";
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px; margin: auto;">
      <h2 style="color: #10b981;">VivaMate Verification Code</h2>
      <p>Use the code below to access your account. It expires in 10 minutes.</p>
      <div style="background: #f4f4f5; padding: 16px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827; margin: 20px 0;">
        ${otp}
      </div>
      <p style="font-size: 12px; color: #71717a;">If you didn't request this, ignore this email.</p>
    </div>
  `;

  try {
    // Attempt SMTP (Gmail)
    console.log(`📡 Attempting SMTP send to ${to}...`);
    await transporter.sendMail({
      from: `"VivaMate" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ OTP email sent via SMTP to ${to}`);
    return { success: true };
  } catch (smtpError) {
    if (smtpError.code === 'ETIMEDOUT' || smtpError.command === 'CONN') {
      console.error(`❌ SMTP Connection Timeout. This usually happens because your hosting provider (like Render/Heroku) blocks SMTP ports (25, 465, 587).`);
    } else {
      console.error(`❌ SMTP Error: ${smtpError.message}`);
    }

    // Fallback to Resend API (HTTP-based, not blocked by firewalls)
    if (resend) {
      console.log(`🔄 Falling back to Resend API...`);
      const { data, error } = await resend.emails.send({
        from: `VivaMate <${EMAIL_FROM}>`,
        to: [to],
        subject,
        html,
      });

      if (error) {
        if (error.statusCode === 403) {
          console.error(`❌ Resend Sandbox Error: You are trying to send to ${to}, but Resend only allows sending to your own email in sandbox mode.`);
          console.error(`💡 SOLUTION: Either verify a domain at resend.com/domains, or use a service like Brevo which allows 'Sender Verification' without a domain.`);
        }
        throw error;
      }
      return data;
    }
    throw smtpError;
  }
}

/**
 * Send Welcome Email
 */
async function sendWelcomeEmail(to, name) {
  const subject = "Welcome to VivaMate! 🚀";
  const html = `<div style="font-family: sans-serif; padding: 20px;"><h2>Welcome to VivaMate, ${name}!</h2><p>We're glad to have you here.</p></div>`;

  try {
    await transporter.sendMail({
      from: `"VivaMate" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Welcome email sent via SMTP to ${to}`);
  } catch (smtpError) {
    console.warn(`⚠ SMTP Welcome failed, trying Resend: ${smtpError.message}`);
    if (resend) {
      await resend.emails.send({
        from: `VivaMate <${EMAIL_FROM}>`,
        to: [to],
        subject,
        html,
      }).catch(err => console.error("❌ Welcome email failed on Resend too (likely Sandbox restriction)."));
    }
  }
}

module.exports = { sendOtpEmail, sendWelcomeEmail };

