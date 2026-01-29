const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

if (!RESEND_API_KEY) {
  console.warn("⚠ RESEND_API_KEY is not set. Emails will fail in production.");
}
if (!EMAIL_FROM) {
  console.warn("⚠ EMAIL_FROM is not set. Emails will have no valid sender.");
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

/**
 * Send OTP Email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 */
async function sendOtpEmail(to, otp) {
  if (!resend || !EMAIL_FROM) {
    throw new Error("Email credentials not configured (RESEND_API_KEY / EMAIL_FROM missing).");
  }

  const html = `
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
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `VivaMate <${EMAIL_FROM}>`,
      to: [to],
      subject: "Your VivaMate login OTP",
      html: html,
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      throw error;
    }

    console.log(`✅ OTP email sent via Resend to ${to}`, data);
    return data;
  } catch (error) {
    console.error(`❌ Error sending OTP email to ${to}:`, error.message);
    throw error;
  }
}

/**
 * Send Welcome Email
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 */
async function sendWelcomeEmail(to, name) {
  if (!resend || !EMAIL_FROM) {
    console.warn("⚠ Email credentials missing, skipping welcome email.");
    return;
  }

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px;">
      <h2 style="color:#16a34a; margin-bottom: 16px;">Welcome to VivaMate, ${name}! 🎉</h2>
      <p style="margin-bottom: 12px;">We're excited to have you on board. VivaMate is your companion for acing interviews and tracking your career progress.</p>
      
      <p style="margin-bottom: 24px;">Here is what you can do next:</p>
      
      <ul style="margin-bottom: 24px; line-height: 1.6;">
        <li>🚀 <strong>Start a Mock Interview:</strong> Practice with our AI interviewer.</li>
        <li>📊 <strong>Track Your Progress:</strong> See your analytics improve over time.</li>
        <li>📝 <strong>Review Feedback:</strong> Get detailed insights on your performance.</li>
      </ul>

      <p style="color:#6b7280; font-size: 14px;">Happy Interviewing! <br>- The VivaMate Team</p>
    </div>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: `VivaMate <${EMAIL_FROM}>`,
      to: [to],
      subject: "Welcome to VivaMate! 🚀",
      html: html,
    });

    if (error) {
      console.error('❌ Resend Welcome Email Error:', error);
      // We don't throw here to avoid blocking registration flow
    } else {
      console.log(`✅ Welcome email sent via Resend to ${to}`, data);
    }
    return data;
  } catch (error) {
    console.error(`❌ Error sending welcome email to ${to}:`, error.message);
    // Suppress error so it doesn't fail the request
  }
}

module.exports = { sendOtpEmail, sendWelcomeEmail };

