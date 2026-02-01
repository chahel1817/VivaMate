const { z } = require('zod');

const submitChallengeSchema = z.object({
    challengeId: z.string().min(1, "Challenge ID is required"),
    answers: z.union([
        z.array(z.string().nullable().or(z.optional())), // Array of strings or nulls
        z.record(z.string()) // Object map: { "questionId": "answer" }
    ])
});

module.exports = {
    submitChallengeSchema
};
