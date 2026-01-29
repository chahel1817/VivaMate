// Test Resend Configuration
// Run this file to test if your Resend setup is working
// Usage: node test-resend.js

require('dotenv').config();
const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM;

console.log('🔍 Testing Resend Configuration...\n');

// Check if credentials exist
console.log('🔑 Resend API Key:', RESEND_API_KEY ? '✅ Set' : '❌ Not set');
console.log('📧 Email From:', EMAIL_FROM ? '✅ Set' : '❌ Not set');
console.log('');

if (!RESEND_API_KEY || !EMAIL_FROM) {
    console.error('❌ Credentials are missing in .env file!');
    console.log('\nMake sure you have:');
    console.log('RESEND_API_KEY=re_123...');
    console.log('EMAIL_FROM=onboarding@resend.dev (or your verified domain)');
    process.exit(1);
}

// Create Resend client
const resend = new Resend(RESEND_API_KEY);

async function sendTestEmail() {
    console.log('📨 Sending test email...');

    try {
        const { data, error } = await resend.emails.send({
            from: `VivaMate Test <${EMAIL_FROM}>`,
            to: ['delivered@resend.dev'], // Use Resend's test address or your own
            subject: 'VivaMate Resend Integration Test',
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: #16a34a;">✅ Resend Integration Working!</h2>
                    <p>This is a test email sent from the VivaMate server using the Resend SDK.</p>
                    <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                </div>
            `
        });

        if (error) {
            console.error('❌ Failed to send test email!');
            console.error('Error:', error);
        } else {
            console.log('✅ Test email sent successfully!');
            console.log('🆔 Email ID:', data.id);
            console.log('\n🎉 You are ready to go!');
        }
    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

sendTestEmail();
