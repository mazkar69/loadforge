import { createServer } from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import './src/config/redis.js'; // Initialize Redis connection
import { initTestSocket } from './src/sockets/testSocket.js';
import logger from './src/utils/logger.js';
import env from './src/config/env.js';

const httpServer = createServer(app);

// Socket.IO
const io = new Server(httpServer, {
    cors: {
        origin: env.CLIENT_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

initTestSocket(io);

// Start server
const start = async () => {
    await connectDB();

    httpServer.listen(env.PORT, () => {
        logger.info(`Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
        logger.info(`Socket.IO listening on /tests namespace`);
    });
};

// Graceful shutdown
const shutdown = (signal) => {
    logger.info(`${signal} received — shutting down gracefully`);
    httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
});

start();
