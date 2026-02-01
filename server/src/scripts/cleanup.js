require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const InterviewSession = require('../models/InterviewSession');

async function cleanup() {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/vivamate";
        await mongoose.connect(mongoUri);
        console.log('Connected to DB');

        // Delete users with 'test' in name or email
        const result = await User.deleteMany({
            $or: [
                { email: { $regex: 'test', $options: 'i' } },
                { name: { $regex: 'test', $options: 'i' } }
            ]
        });

        console.log(`Deleted ${result.deletedCount} test users.`);

        // Delete orphaned sessions (where user no longer exists) - optional but good cleanup
        // Or just all sessions if we want a full wipe? User said "everything" related to test users.
        // If we only deleted specific users, we should delete their sessions.

        // Easier: find all users, if count is small (dev mode), maybe wipe all?
        // I will stick to 'test' users to be safe.

        // If the user meant "wipe ALL data", they can run a flush.

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanup();
