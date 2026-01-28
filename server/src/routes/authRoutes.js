const express = require("express");
const router = express.Router();

const { register, login, requestOtp, verifyOtp, updateProfile, logout } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", requestOtp);
router.post("/verify-otp", verifyOtp);
router.put("/profile", protect, updateProfile);

// ✅ Persist login on refresh
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load user" });
  }
});

module.exports = router;
