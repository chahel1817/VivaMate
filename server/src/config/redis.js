const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: true,
    // TLS support for cloud Redis (Upstash, Redis Cloud, etc.)
    tls: process.env.REDIS_TLS === 'true' ? {} : undefined
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
    console.error('❌ Redis error:', err.message);
    // Don't crash the app if Redis is unavailable
    // We'll fallback to MongoDB for leaderboards
});

redis.on('close', () => {
    console.log('⚠️  Redis: Connection closed');
});

redis.on('reconnecting', () => {
    console.log('🔄 Redis: Reconnecting...');
});

// Connect to Redis
redis.connect().catch((err) => {
    console.error('❌ Redis: Failed to connect:', err.message);
    console.log('⚠️  Leaderboards will use MongoDB fallback (slower)');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await redis.quit();
    process.exit(0);
});

// Helper function to check if Redis is available
async function isRedisAvailable() {
    try {
        await redis.ping();
        return true;
    } catch (err) {
        return false;
    }
}

module.exports = { redis, isRedisAvailable };
