import { z } from 'zod';

export const createCollectionSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
});

export const addRequestSchema = z.object({
    name: z.string().min(1).max(100),
    url: z.string().url(),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']).default('GET'),
    headers: z.record(z.string()).optional().default({}),
    queryParams: z.record(z.string()).optional().default({}),
    body: z.any().optional().nullable(),
    bodyType: z.enum(['none', 'json', 'raw', 'form-data']).default('none'),
    auth: z
        .object({
            type: z.enum(['none', 'bearer', 'basic', 'api-key']).default('none'),
            token: z.string().optional(),
            username: z.string().optional(),
            password: z.string().optional(),
            key: z.string().optional(),
            value: z.string().optional(),
        })
        .optional()
        .default({ type: 'none' }),
    description: z.string().max(500).optional(),
    folderId: z.string().optional(), // if provided, add to folder
});

export const addFolderSchema = z.object({
    name: z.string().min(1).max(100),
});
