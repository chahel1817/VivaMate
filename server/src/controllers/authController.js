const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/mailer");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
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

    const user = await User.findOne({ email });

    // For security: respond with success even if user not found
    if (!user) {
      return res.status(200).json({ message: "If this email is registered, an OTP has been sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpires = new Date(expires);
    await user.save();

    await sendOtpEmail(user.email, otp);

    return res.status(200).json({ message: "OTP sent to your email. It is valid for 10 minutes." });
  } catch (err) {
    console.error("requestOtp error", err);
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

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
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

module.exports = { register, login, requestOtp, verifyOtp, updateProfile };
