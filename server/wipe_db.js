const mongoose = require('mongoose');
const mongoUri = 'mongodb+srv://chahel1817_db_user:Chahelbat18!@cluster0.dfqyk4v.mongodb.net/vivamate';

async function wipe() {
    try {
        console.log('Connecting...');
        await mongoose.connect(mongoUri);

        console.log('Wiping challengecompletions...');
        await mongoose.connection.collection('challengecompletions').deleteMany({});

        console.log('Resetting users...');
        await mongoose.connection.collection('users').updateMany(
            {},
            { $set: { completedChallenges: [], streak: 0, lastChallengeDate: null } }
        );

        console.log('Success! Database cleaned.');
        process.exit(0);
    } catch (err) {
        console.error('Wipe failed:', err);
        process.exit(1);
    }
}

wipe();
