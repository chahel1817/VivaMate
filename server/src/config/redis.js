const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
        // Stop retrying after 3 attempts in development to fail fast
        const maxRetries = process.env.NODE_ENV === 'production' ? 10 : 3;
        if (times > maxRetries) {
            console.error('❌ Redis: Maximum reconnection attempts reached. giving up.');
            return null; // Stop retrying
        }
        const delay = Math.min(times * 200, 2000);
        return delay;
    },
    maxRetriesPerRequest: 1, // Fail fast on requests
    connectTimeout: 5000, // 5 seconds timeout for connection
    enableReadyCheck: true,
    lazyConnect: true,
    // TLS support for cloud Redis (Upstash, Redis Cloud, etc.)
    tls: process.env.REDIS_TLS === 'true' ? {
        rejectUnauthorized: false // Often needed for some cloud providers
    } : undefined
};

// Create Redis client
const redis = new Redis(redisConfig);

// Connection event handlers
redis.on('connect', () => {
    console.log('✅ Redis: Connecting...');
});

redis.on('ready', () => {
    console.log('✅ Redis: Connected and ready');
});

redis.on('error', (err) => {
    // Only log error if not in reconnecting state, to avoid terminal spam
    if (redis.status !== 'reconnecting' && redis.status !== 'wait') {
        console.error('❌ Redis error:', err.message);
    }
});

redis.on('close', () => {
    if (redis.status === 'end') {
        console.log('⚠️  Redis: Connection closed permanently');
    } else {
        console.log('⚠️  Redis: Connection closed');
    }
});

redis.on('reconnecting', (ms) => {
    console.log(`🔄 Redis: Reconnecting in ${ms}ms...`);
});

// Connect to Redis
redis.connect().catch((err) => {
    // This will error if the first connection fails, but retryStrategy will kick in
    console.debug('Redis initial connection attempt finished');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await redis.quit();
    } catch (e) { }
    process.exit(0);
});

/**
 * Fast check for Redis availability
 * Returns true only if the connection is ready to use
 */
async function isRedisAvailable() {
    return redis.status === 'ready';
}

module.exports = { redis, isRedisAvailable };


