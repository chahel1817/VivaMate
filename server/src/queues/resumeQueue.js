const { Queue } = require('bullmq');
const { connection } = require('../config/bullmq');

// Create the 'resume-analysis' queue
const resumeQueue = new Queue('resume-analysis', { connection });

module.exports = resumeQueue;
