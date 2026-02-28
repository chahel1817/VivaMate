const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

async function cleanup() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        // 1. Clear ChallengeCompletion collection
        console.log('Deleting all from challengecompletions...');
        const ChallengeCompletion = mongoose.connection.collection('challengecompletions');
        const del1 = await ChallengeCompletion.deleteMany({});
        console.log(`Deleted ${del1.deletedCount} records.`);

        // 2. Clear User streak data and completedChallenges array
        console.log('Resetting Users streak data...');
        const User = mongoose.connection.collection('users');
        const update = await User.updateMany(
            {},
            {
                $set: {
                    completedChallenges: [],
                    streak: 0,
                    lastChallengeDate: null
                }
            }
        );
        console.log(`Updated ${update.modifiedCount} users.`);

        console.log('Cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
