const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

const hasRedisConfig = Boolean(REDIS_URL || REDIS_HOST);
const redisEnabledByEnv = process.env.REDIS_ENABLED !== 'false';
const redisEnabled = redisEnabledByEnv && hasRedisConfig;

const RECONNECT_COOLDOWN_MS = 30000;
const ERROR_LOG_THROTTLE_MS = 30000;

let redis = null;
let lastConnectAttemptAt = 0;
let lastErrorLogAt = 0;
let lastLoggedStatus = '';

function shouldUseTLS() {
    if (process.env.REDIS_TLS === 'true') return true;
    return typeof REDIS_URL === 'string' && REDIS_URL.startsWith('rediss://');
}

function maybeLogStatus(status, message) {
    if (lastLoggedStatus === status) return;
    lastLoggedStatus = status;
    console.log(message);
}

function logErrorThrottled(message) {
    const now = Date.now();
    if (now - lastErrorLogAt < ERROR_LOG_THROTTLE_MS) return;
    lastErrorLogAt = now;
    console.error(message);
}

function createRedisClient() {
    const common = {
        lazyConnect: true,
        enableReadyCheck: true,
        connectTimeout: 4000,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 250, 1000);
        }
    };

    if (REDIS_URL) {
        return new Redis(REDIS_URL, {
            ...common,
            tls: shouldUseTLS() ? { rejectUnauthorized: false } : undefined
        });
    }

    return new Redis({
        ...common,
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD || undefined,
        tls: shouldUseTLS() ? { rejectUnauthorized: false } : undefined
    });
}

if (redisEnabled) {
    redis = createRedisClient();

    redis.on('connect', () => {
        maybeLogStatus('connect', 'Redis socket connected');
    });

    redis.on('ready', () => {
        maybeLogStatus('ready', 'Redis ready');
    });

    redis.on('close', () => {
        maybeLogStatus('close', 'Redis connection closed');
    });

    redis.on('end', () => {
        maybeLogStatus('end', 'Redis disconnected permanently');
    });

    redis.on('error', (err) => {
        logErrorThrottled(`Redis error: ${err.message}`);
    });
} else {
    console.log('Redis disabled (no REDIS_URL/REDIS_HOST or REDIS_ENABLED=false). Using MongoDB fallback.');
}

async function ensureRedisConnection() {
    if (!redisEnabled || !redis) return;

    const now = Date.now();
    const status = redis.status;
    if (status === 'ready' || status === 'connecting' || status === 'connect' || status === 'reconnecting') {
        return;
    }
    if (now - lastConnectAttemptAt < RECONNECT_COOLDOWN_MS) {
        return;
    }

    lastConnectAttemptAt = now;
    try {
        await redis.connect();
    } catch (err) {
        logErrorThrottled(`Redis connect attempt failed: ${err.message}`);
    }
}

// Non-blocking startup attempt. If it fails, app still runs on MongoDB fallback.
void ensureRedisConnection();

process.on('SIGINT', async () => {
    if (redis) {
        try {
            await redis.quit();
        } catch (err) {
            // no-op
        }
    }
    process.exit(0);
});

async function isRedisAvailable() {
    if (!redisEnabled || !redis) {
        return false;
    }

    if (redis.status === 'ready') {
        return true;
    }

    // Try reconnecting in the background, but do not block request paths.
    void ensureRedisConnection();
    return false;
}

function getRedisHealth() {
    return {
        enabled: redisEnabled,
        configured: hasRedisConfig,
        status: redis ? redis.status : 'disabled'
    };
}

module.exports = { redis, isRedisAvailable, getRedisHealth };
