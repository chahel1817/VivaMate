const express = require("express");
const router = express.Router();

const { register, login, requestOtp, verifyOtp, updateProfile, logout } = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

// Validation
const validate = require("../middleware/validate");
const { registerSchema, loginSchema, requestOtpSchema, verifyOtpSchema, updateProfileSchema } = require("../schemas/authSchemas");

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.post("/forgot-password", authLimiter, validate(requestOtpSchema), requestOtp);
router.post("/verify-otp", authLimiter, validate(verifyOtpSchema), verifyOtp);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);

const { validateAndFixStreakIST } = require("../services/streakService");

// ✅ Persist login on refresh
router.get("/me", protect, async (req, res) => {
  try {
    let user = await User.findById(req.user).select("-password");
    if (user) {
      user = await validateAndFixStreakIST(user);
    }
    res.json(user);
  } catch (err) {
    console.error("Auth route /me error:", err);
    res.status(500).json({ message: "Failed to load user" });
  }
});

module.exports = router;
