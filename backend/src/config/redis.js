import Redis from 'ioredis';
import logger from '../utils/logger.js';
import env from './env.js';

let redisClient = null;

if (env.REDIS_URL) {
    redisClient = new Redis(env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.warn('Redis error (non-fatal)', { error: err.message }));

    redisClient.connect().catch((err) => {
        logger.warn('Redis connection failed — continuing without Redis', { error: err.message });
        redisClient = null;
    });
}

export default redisClient;
