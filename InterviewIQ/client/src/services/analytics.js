import posthog from "posthog-js";

/**
 * Identify the user in PostHog once they log in.
 */
export const identifyUser = (userId, userData = {}) => {
    if (import.meta.env.VITE_POSTHOG_KEY) {
        posthog.identify(userId, userData);
    }
};

/**
 * Track a custom event with optional properties.
 */
export const trackEvent = (eventName, properties = {}) => {
    if (import.meta.env.VITE_POSTHOG_KEY) {
        posthog.capture(eventName, properties);
    }
};

/**
 * Reset PostHog data on logout.
 */
export const resetPostHog = () => {
    if (import.meta.env.VITE_POSTHOG_KEY) {
        posthog.reset();
    }
};

export default {
    identifyUser,
    trackEvent,
    resetPostHog
};
