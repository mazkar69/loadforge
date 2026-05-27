import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { globalRateLimiter } from './middleware/rateLimiter.middleware.js';
import errorMiddleware from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import testRoutes from './routes/test.routes.js';
import collectionRoutes from './routes/collection.routes.js';
import reportRoutes from './routes/report.routes.js';
import env from './config/env.js';
import logger from './utils/logger.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiter
app.use(globalRateLimiter);

// Request logging (dev only)
if (env.NODE_ENV === 'development') {
    app.use((req, _res, next) => {
        logger.debug(`${req.method} ${req.path}`);
        next();
    });
}

// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/tests`, testRoutes);
app.use(`${API_PREFIX}/collections`, collectionRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);

// Advanced feature stubs (scaffold only)
app.use(`${API_PREFIX}/schedule`, (_req, res) => {
    res.status(501).json({ success: false, message: 'Scheduled tests: not yet implemented' });
});
app.use(`${API_PREFIX}/notifications`, (_req, res) => {
    res.status(501).json({ success: false, message: 'Notifications: not yet implemented' });
});
app.use(`${API_PREFIX}/teams`, (_req, res) => {
    res.status(501).json({ success: false, message: 'Team collaboration: not yet implemented' });
});

// 404
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
