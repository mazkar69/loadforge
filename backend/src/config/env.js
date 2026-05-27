import dotenv from 'dotenv';
dotenv.config();

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT, 10) || 5000,

    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/loadtester',

    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'fallback_access_secret_change_in_production',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_change_in_production',
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    REDIS_URL: process.env.REDIS_URL || '',

    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,

    MAX_CONCURRENT_REQUESTS: parseInt(process.env.MAX_CONCURRENT_REQUESTS, 10) || 500,
    MAX_WORKERS: parseInt(process.env.MAX_WORKERS, 10) || 4,
};

export default env;
