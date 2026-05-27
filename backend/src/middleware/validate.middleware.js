import { ZodError } from 'zod';
import { HTTP_STATUS } from '../constants/index.js';

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
export const validateBody = (schema) => (req, res, next) => {
    try {
        req.body = schema.parse(req.body);
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
                success: false,
                message: 'Validation failed',
                errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
            });
        }
        // next(err);
    }
};

/**
 * Creates an Express middleware that validates req.query against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
export const validateQuery = (schema) => (req, res, next) => {
    try {
        req.query = schema.parse(req.query);
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
                success: false,
                message: 'Invalid query parameters',
                errors: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
            });
        }
        next(err);
    }
};
