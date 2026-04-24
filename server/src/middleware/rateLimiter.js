const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const { redis } = require("../config/redis");

/**
 * Creates storage for the rate limiter.
 * Fallback to MemoryStore if Redis is disabled.
 */
const createStore = (prefix) => {
    if (!redis) return undefined;
    return new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: prefix,
    });
};

/**
 * General API Rate Limiter
 */
exports.apiLimiter = rateLimit({
    store: createStore("rl:api:"),
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: "too many requests from this IP, please try again after 15 minutes",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * AI & Heavy Task Rate Limiter
 * Limit: 3 requests per 10 minutes.
 */
exports.aiLimiter = rateLimit({
    store: createStore("rl:ai:"),
    windowMs: 10 * 60 * 1000,
    max: 3,
    message: {
        success: false,
        message: "You've reached your AI analysis limit for now. Please wait 10 minutes before your next scan.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Authentication Rate Limiter
 */
exports.authLimiter = rateLimit({
    store: createStore("rl:auth:"),
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many login/register attempts. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
