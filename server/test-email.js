// Test Email Configuration
// Run this file to test if your email setup is working
// Usage: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

console.log('🔍 Testing Email Configuration...\n');

// Check if credentials exist
console.log('📧 Email User:', EMAIL_USER ? '✅ Set' : '❌ Not set');
console.log('🔑 Email Pass:', EMAIL_PASS ? '✅ Set' : '❌ Not set');
console.log('');

if (!EMAIL_USER || !EMAIL_PASS) {
    console.error('❌ Email credentials are missing in .env file!');
    console.log('\nMake sure you have:');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASS=your-app-password');
    process.exit(1);
}

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

// Test connection
console.log('🔌 Testing SMTP connection...');
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ SMTP Connection Failed!');
        console.error('Error:', error.message);
        console.log('\n💡 Common issues:');
        console.log('1. App password not enabled (required for Gmail)');
        console.log('2. Wrong email/password');
        console.log('3. Less secure app access disabled');
        console.log('4. 2FA not enabled (required for app passwords)');
        console.log('\n📖 How to fix:');
        console.log('1. Go to: https://myaccount.google.com/apppasswords');
        console.log('2. Create a new app password');
        console.log('3. Update EMAIL_PASS in your .env file');
    } else {
        console.log('✅ SMTP Connection Successful!');
        console.log('\n📨 Sending test email...');

        // Send test email
        const mailOptions = {
            from: `VivaMate <${EMAIL_USER}>`,
            to: EMAIL_USER, // Send to yourself for testing
            subject: 'VivaMate Email Test',
            text: 'If you receive this, your email configuration is working!',
            html: `
        <div style="font-family: system-ui, sans-serif; padding: 16px;">
          <h2 style="color:#16a34a;">✅ Email Test Successful!</h2>
          <p>Your VivaMate email configuration is working correctly.</p>
          <p style="font-size: 12px; color:#6b7280;">Test sent at: ${new Date().toLocaleString()}</p>
        </div>
      `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Failed to send test email!');
                console.error('Error:', error.message);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('📬 Message ID:', info.messageId);
                console.log(`\n✉️  Check your inbox: ${EMAIL_USER}`);
            }
        });
    }
});
