const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
    updateDashboardLayout,
    getDashboardLayout,
    updateOnboardingStatus,
    updatePreferences
} = require("../controllers/preferencesController");

// All routes require authentication
router.put("/dashboard-layout", protect, updateDashboardLayout);
router.get("/dashboard-layout", protect, getDashboardLayout);
router.put("/onboarding", protect, updateOnboardingStatus);
router.put("/settings", protect, updatePreferences);

module.exports = router;
