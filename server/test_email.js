require('dotenv').config();
const { sendOtpEmail } = require('./src/utils/mailer');

console.log("Testing email sending...");
console.log("User:", process.env.EMAIL_USER);

async function test() {
    try {
        await sendOtpEmail("chahel1817@gmail.com", "123456"); // Sending to self/test
        console.log("SUCCESS");
    } catch (e) {
        console.error("FAILED:", e);
    }
}

test();
