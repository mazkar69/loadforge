import { z } from 'zod';
import {
    REQUEST_METHODS,
    MAX_CONCURRENCY_CAP,
    MAX_TOTAL_REQUESTS,
    MAX_DURATION_SECONDS,
} from '../constants/index.js';

const headerMapSchema = z.record(z.string()).optional().default({});

const authSchema = z
    .object({
        type: z.enum(['none', 'bearer', 'basic', 'api-key']).default('none'),
        token: z.string().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
        key: z.string().optional(),
        value: z.string().optional(),
        addTo: z.enum(['header', 'query']).default('header'),
    })
    .optional()
    .default({ type: 'none' });

export const createTestSchema = z.object({
    name: z.string().max(100).optional(),
    url: z.string().url('Must be a valid URL'),
    method: z.enum(REQUEST_METHODS),
    headers: headerMapSchema,
    queryParams: headerMapSchema,
    body: z.any().optional().nullable(),
    bodyType: z.enum(['none', 'json', 'raw', 'form-data']).default('none'),
    auth: authSchema,
    config: z.object({
        totalRequests: z.number().int().min(1).max(MAX_TOTAL_REQUESTS),
        concurrency: z.number().int().min(1).max(MAX_CONCURRENCY_CAP),
        duration: z.number().min(0).max(MAX_DURATION_SECONDS).default(0),
        timeout: z.number().int().min(100).max(60000).default(10000),
        delay: z.number().int().min(0).max(10000).default(0),
        retries: z.number().int().min(0).max(5).default(0),
    }),
});
