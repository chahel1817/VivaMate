const nodemailer = require('nodemailer');
const { Resend } = require('resend');

// --- Configuration ---
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'onboarding@resend.dev';
const SMTP_USER = process.env.EMAIL_USER;
const SMTP_PASS = process.env.EMAIL_PASS;

// --- Transports ---
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// Nodemailer SMTP Transport (Bypasses Sandbox restrictions)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Using Gmail as per EMAIL_USER domain
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

/**
 * Send OTP Email
 * @param {string} to - Recipient email
 * @param {string} otp - OTP code
 */
async function sendOtpEmail(to, otp) {
  const subject = "Your VivaMate login OTP";
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 16px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; rounded: 12px;">
      <h2 style="color:#10b981; margin-bottom: 8px;">VivaMate Login OTP</h2>
      <p style="margin: 0 0 12px 0; color: #374151;">Use the following one-time password to login to your VivaMate account:</p>
      <div style="font-size: 32px; font-weight: 800; letter-spacing: 6px; margin: 24px 0; color:#111827; text-align: center; background: #f0fdf4; padding: 16px; border-radius: 8px;">
        ${otp}
      </div>
      <p style="margin: 0 0 4px 0; font-size: 14px; color:#6b7280;">
        This code is valid for <strong>10 minutes</strong>.
      </p>
      <p style="margin: 20px 0 0 0; font-size: 12px; color:#9ca3af; border-top: 1px solid #f3f4f6; pt: 12px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;

  // Try Nodemailer first (Bypasses Resend Sandbox)
  try {
    await transporter.sendMail({
      from: `"VivaMate" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ OTP email sent via SMTP to ${to}`);
    return { success: true };
  } catch (smtpError) {
    console.warn(`⚠ SMTP failed, trying Resend fallback: ${smtpError.message}`);

    if (resend) {
      const { data, error } = await resend.emails.send({
        from: `VivaMate <${EMAIL_FROM}>`,
        to: [to],
        subject,
        html,
      });
      if (error) throw error;
      return data;
    }
    throw smtpError;
  }
}

/**
 * Send Welcome Email
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 */
async function sendWelcomeEmail(to, name) {
  const subject = "Welcome to VivaMate! 🚀";
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px;">
      <h2 style="color:#10b981; margin-bottom: 16px;">Welcome to VivaMate, ${name}! 🎉</h2>
      <p style="margin-bottom: 12px; color: #374151; line-height: 1.6;">We're excited to have you on board! VivaMate is your intelligent companion designed to help you master interviews and accelerate your career growth.</p>
      
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin-top: 0; font-weight: 700; color: #111827;">Quick Next Steps:</p>
        <ul style="margin-bottom: 0; padding-left: 20px; color: #4b5563;">
          <li style="margin-bottom: 8px;">Practice with AI mock interviews</li>
          <li style="margin-bottom: 8px;">Analyze your resume for improvements</li>
          <li style="margin-bottom: 0;">Track your daily streak and progress</li>
        </ul>
      </div>

      <p style="color:#6b7280; font-size: 14px; margin-top: 24px;">
        Happy Interviewing!<br>
        <strong>The VivaMate Team</strong>
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"VivaMate" <${SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Welcome email sent via SMTP to ${to}`);
  } catch (smtpError) {
    console.warn(`⚠ SMTP Welcome failed, trying Resend fallback: ${smtpError.message}`);
    if (resend) {
      await resend.emails.send({
        from: `VivaMate <${EMAIL_FROM}>`,
        to: [to],
        subject,
        html,
      }).catch(err => console.error("❌ All email attempts failed:", err));
    }
  }
}

module.exports = { sendOtpEmail, sendWelcomeEmail };

