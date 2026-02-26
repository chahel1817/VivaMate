require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

async function clearFriends() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected');

        const result = await User.updateMany(
            {},
            { $set: { friends: [] } }
        );

        console.log(`✅ Cleared friends array from ${result.modifiedCount} users.`);
        console.log('All friend request data has been wiped. You can now send fresh requests.');
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await mongoose.disconnect();
        console.log('MongoDB disconnected');
        process.exit(0);
    }
}

clearFriends();
