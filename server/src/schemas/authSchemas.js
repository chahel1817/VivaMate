const { z } = require('zod');

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long")
});

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required")
});

const requestOtpSchema = z.object({
    email: z.string().email("Invalid email address")
});

const verifyOtpSchema = z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().min(6, "OTP must be 6 characters").max(6, "OTP must be 6 characters")
});

const updateProfileSchema = z.object({
    name: z.string().min(2).optional(),
    careerStage: z.string().optional(),
    geoPresence: z.string().optional(),
    profilePic: z.string().url("Profile picture must be a valid URL").optional().or(z.literal('')),
    linkedin: z.string().url("LinkedIn must be a valid URL").optional().or(z.literal('')),
    github: z.string().url("GitHub must be a valid URL").optional().or(z.literal(''))
});

module.exports = {
    registerSchema,
    loginSchema,
    requestOtpSchema,
    verifyOtpSchema,
    updateProfileSchema
};
