import posthog from "posthog-js";

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || import.meta.env.VITE_POSTHOG_KEY;

/**
 * Identify the user in PostHog once they log in.
 */
export const identifyUser = (userId, userData = {}) => {
    if (POSTHOG_KEY) {
        posthog.identify(userId, userData);
    }
};

/**
 * Track a custom event with optional properties.
 */
export const trackEvent = (eventName, properties = {}) => {
    if (POSTHOG_KEY) {
        posthog.capture(eventName, properties);
    }
};

/**
 * Reset PostHog data on logout.
 */
export const resetPostHog = () => {
    if (POSTHOG_KEY) {
        posthog.reset();
    }
};

export default {
    identifyUser,
    trackEvent,
    resetPostHog
};
