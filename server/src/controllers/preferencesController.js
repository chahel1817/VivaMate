const User = require("../models/User");

// Update dashboard layout
const updateDashboardLayout = async (req, res) => {
    try {
        const { layout } = req.body;

        if (!layout) {
            return res.status(400).json({ message: "Layout data is required" });
        }

        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.dashboardLayout = layout;
        await user.save();

        res.json({
            message: "Dashboard layout saved successfully",
            layout: user.dashboardLayout
        });
    } catch (err) {
        console.error("updateDashboardLayout error", err);
        res.status(500).json({ message: "Failed to save dashboard layout" });
    }
};

// Get dashboard layout
const getDashboardLayout = async (req, res) => {
    try {
        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            layout: user.dashboardLayout
        });
    } catch (err) {
        console.error("getDashboardLayout error", err);
        res.status(500).json({ message: "Failed to retrieve dashboard layout" });
    }
};

// Update onboarding status
const updateOnboardingStatus = async (req, res) => {
    try {
        const { completed } = req.body;

        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.hasCompletedOnboarding = completed;
        await user.save();

        res.json({
            message: "Onboarding status updated",
            hasCompletedOnboarding: user.hasCompletedOnboarding
        });
    } catch (err) {
        console.error("updateOnboardingStatus error", err);
        res.status(500).json({ message: "Failed to update onboarding status" });
    }
};

// Update general preferences
const updatePreferences = async (req, res) => {
    try {
        const { theme, notifications, emailUpdates, keyboardShortcutsEnabled } = req.body;

        const user = await User.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update preferences object
        if (theme !== undefined) user.preferences.theme = theme;
        if (notifications !== undefined) user.preferences.notifications = notifications;
        if (emailUpdates !== undefined) user.preferences.emailUpdates = emailUpdates;

        // Update keyboard shortcuts preference
        if (keyboardShortcutsEnabled !== undefined) {
            user.keyboardShortcutsEnabled = keyboardShortcutsEnabled;
        }

        await user.save();

        res.json({
            message: "Preferences updated successfully",
            preferences: user.preferences,
            keyboardShortcutsEnabled: user.keyboardShortcutsEnabled
        });
    } catch (err) {
        console.error("updatePreferences error", err);
        res.status(500).json({ message: "Failed to update preferences" });
    }
};

module.exports = {
    updateDashboardLayout,
    getDashboardLayout,
    updateOnboardingStatus,
    updatePreferences
};
