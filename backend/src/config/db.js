import mongoose from 'mongoose';
import logger from '../utils/logger.js';
import env from './env.js';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function connectDB(retries = MAX_RETRIES) {
    try {
        await mongoose.connect(env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000,
        });
        logger.info('MongoDB connected successfully');
    } catch (error) {
        if (retries > 0) {
            logger.warn(`MongoDB connection failed. Retrying in ${RETRY_DELAY_MS / 1000}s... (${retries} retries left)`);
            await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
            return connectDB(retries - 1);
        }
        logger.error('MongoDB connection failed after all retries', { error: error.message });
        process.exit(1);
    }
}

mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
});

export default connectDB;
