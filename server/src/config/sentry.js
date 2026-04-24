const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

/**
 * Initialize Sentry for Error Tracking & Performance Monitoring
 */
const initSentry = (app) => {
    const dsn = process.env.SENTRY_DSN;

    if (!dsn) {
        console.warn("⚠️ SENTRY_DSN not found in .env. Error tracking is disabled.");
        return;
    }

    Sentry.init({
        dsn: dsn,
        integrations: [
            nodeProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: 1.0, // Capture 100% of the transactions (adjust for high traffic)
        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: 1.0,
        environment: process.env.NODE_ENV || "development",
    });

    console.log("🚀 Sentry initialized for error tracking.");
};

module.exports = { Sentry, initSentry };
