import { ZodError } from 'zod';
import { HTTP_STATUS } from '../constants/index.js';
import logger from '../utils/logger.js';

// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    // Zod validation errors
    if (err instanceof ZodError) {
        return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
            success: false,
            message: 'Validation failed',
            errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
        });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(HTTP_STATUS.CONFLICT).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Validation failed',
            errors,
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            success: false,
            message: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token',
        });
    }

    // Cast error (invalid MongoDB ObjectId)
    if (err.name === 'CastError') {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: 'Invalid resource ID',
        });
    }

    const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    const message = err.isOperational ? err.message : 'Internal server error';

    return res.status(statusCode).json({ success: false, message });
};

export default errorMiddleware;
