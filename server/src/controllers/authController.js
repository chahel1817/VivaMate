const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail, sendWelcomeEmail } = require("../utils/mailer");

// Helper to set cookie
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // true in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  res.cookie('token', token, cookieOptions);
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: "Invalid email: Must contain '@'" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      hasCompletedOnboarding: false // Explicitly set to false for NEW users
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Send Welcome Email (Non-blocking)
    sendWelcomeEmail(user.email, user.name).catch(console.error);

    // Set Cookie
    setTokenCookie(res, token);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        keyboardShortcutsEnabled: user.keyboardShortcutsEnabled
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: "Invalid email: Must contain '@'" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // MIGRATION: Auto-complete onboarding for existing users created before today
    // This allows us to grandfather in users who registered before the feature launched
    const onboardingCutoff = new Date(); // Use current deploy time as simplistic cutoff
    // Note: In real prod, this date should be fixed constant string
    // But since this code deploys now, "now" works for anyone logging in AFTER this deploy who was created BEFORE.
    // Actually, checking createdAt < Date.now() is basically "everyone already in DB".
    // We want to avoid running this on brand new users we just created above (in register flow, but this is login flow).
    // So logic: If user was created > 5 minutes ago (safety) AND hasCompletedOnboarding is false...
    // Actually, simpler: If we assume Schema default is now true.
    // Existing users in DB still have false (if they existed).
    // We want to flip them to true.
    if (!user.hasCompletedOnboarding) {
      // Double check creation time to be safe? Or just do it.
      // Let's rely on the fact that NEW users we create from now on (via register) will have false.
      // Wait, if I flip everyone to true here, then NEW users (created 1 min ago) who log in again (e.g. session refresh) might get flipped?
      // Ah. `register` sets it false. User logs in.
      // If they haven't completed it, they see it.
      // User wants: "if existing user logins then dont show them".
      // "Existing user" = User created BEFORE feature launch.
      // So I need a hardcoded Timestamp of Feature Launch.
      const FEATURE_LAUNCH_DATE = new Date('2026-01-30T00:00:00.000Z'); // Adjust as needed
      if (user.createdAt < FEATURE_LAUNCH_DATE) {
        user.hasCompletedOnboarding = true;
        await user.save();
      }
    }

    setTokenCookie(res, token);

    // Sync user to Redis leaderboards (async, non-blocking)
    const leaderboardService = require('../services/leaderboardService');
    const { validateAndFixStreak } = require('../services/streakService');

    // Validate streak before syncing and returning data
    await validateAndFixStreak(user);

    leaderboardService.syncUserToRedis(user._id).catch(err => {
      console.error('Redis sync error on login:', err);
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak, // Include streak in response
        xp: user.xp, // Include XP too for convenience
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        keyboardShortcutsEnabled: user.keyboardShortcutsEnabled
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
};

// Request OTP for login / passwordless access
const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!email.includes('@')) {
      return res.status(400).json({ message: "Invalid email: Must contain '@'" });
    }

    const user = await User.findOne({ email });

    // For security: respond with success even if user not found
    if (!user) {
      console.log(`⚠️  OTP requested for non-existent email: ${email}`);
      return res.status(200).json({ message: "If this email is registered, an OTP has been sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpires = new Date(expires);
    await user.save();

    console.log(`📧 Attempting to send OTP to: ${user.email}`);
    await sendOtpEmail(user.email, otp);
    console.log(`✅ OTP email sent successfully to: ${user.email}`);

    return res.status(200).json({ message: "OTP sent to your email. It is valid for 10 minutes." });
  } catch (err) {
    console.error("❌ requestOtp error:", err.message);
    console.error("Full error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP and log the user in (issue JWT)
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOtpExpires.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Clear OTP fields
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    // Issue JWT token (same as login)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setTokenCookie(res, token);

    // Sync user to Redis leaderboards (async, non-blocking)
    const leaderboardService = require('../services/leaderboardService');
    const { validateAndFixStreak } = require('../services/streakService');

    // Validate streak before syncing and returning data
    await validateAndFixStreak(user);

    leaderboardService.syncUserToRedis(user._id).catch(err => {
      console.error('Redis sync error on OTP login:', err);
    });

    return res.json({
      message: "OTP verified",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        streak: user.streak,
        xp: user.xp,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        keyboardShortcutsEnabled: user.keyboardShortcutsEnabled
      },
    });
  } catch (err) {
    console.error("verifyOtp error", err);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, careerStage, geoPresence, profilePic, linkedin, github } = req.body;
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (careerStage !== undefined) user.careerStage = careerStage;
    if (geoPresence !== undefined) user.geoPresence = geoPresence;
    if (profilePic !== undefined) user.profilePic = profilePic;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (github !== undefined) user.github = github;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        careerStage: user.careerStage,
        geoPresence: user.geoPresence,
        profilePic: user.profilePic,
        linkedin: user.linkedin,
        github: user.github,
      },
    });
  } catch (err) {
    console.error("updateProfile error", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0)
  });
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = { register, login, requestOtp, verifyOtp, updateProfile, logout };
