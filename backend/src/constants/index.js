export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    SERVICE_UNAVAILABLE: 503,
};

export const TEST_STATUS = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
};

export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
};

export const REQUEST_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export const BODY_TYPES = ['none', 'json', 'raw', 'form-data'];

export const AUTH_TYPES = ['none', 'bearer', 'basic', 'api-key'];

export const MAX_CONCURRENCY_CAP = 500;
export const MAX_DURATION_SECONDS = 300; // 5 minutes
export const MAX_TOTAL_REQUESTS = 100000;
export const DEFAULT_TIMEOUT_MS = 10000;
export const DEFAULT_RETRIES = 0;
export const DEFAULT_DELAY_MS = 0;
