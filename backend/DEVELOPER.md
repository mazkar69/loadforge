# Backend Developer Guide

> Everything you need to understand how the LoadForge backend works — architecture, request lifecycle, data flow, socket events, and where to add new features.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [How the Server Starts](#how-the-server-starts)
4. [Express App & Middleware Stack](#express-app--middleware-stack)
5. [Authentication System](#authentication-system)
6. [Request Lifecycle (HTTP)](#request-lifecycle-http)
7. [Load Test Engine](#load-test-engine)
8. [Socket.IO Real-Time Events](#socketio-real-time-events)
9. [Database Models](#database-models)
10. [API Routes Reference](#api-routes-reference)
11. [Response Shape](#response-shape)
12. [Error Handling](#error-handling)
13. [Metrics & Calculations](#metrics--calculations)
14. [Configuration & Environment](#configuration--environment)
15. [Utilities](#utilities)
16. [How to Add a New Feature](#how-to-add-a-new-feature)

---

## Tech Stack

| Technology | Version | Role |
|-----------|---------|------|
| Node.js | 20+ | Runtime (ES Modules — `"type": "module"`) |
| Express | 5 | HTTP framework |
| Socket.IO | 4 | Real-time WebSocket layer |
| MongoDB + Mongoose | 8 | Database & ORM |
| worker_threads | built-in | Concurrent load test execution |
| JWT | jsonwebtoken | Auth tokens (access + refresh) |
| Zod | 3 | Request body validation |
| bcrypt | 5 | Password hashing |
| Winston | 3 | Logging |
| Jest + Supertest | 30 | Testing |

> **ES Modules:** The entire backend uses `import/export` (not `require`). All files are `.js` but treated as ESM because `package.json` has `"type": "module"`.

---

## Project Structure

```
backend/
├── server.js                    # Entry point — HTTP + Socket.IO
├── src/
│   ├── app.js                   # Express app (middleware + routes)
│   ├── config/
│   │   ├── db.js                # MongoDB connection (5 retries)
│   │   ├── env.js               # All env vars with defaults
│   │   └── redis.js             # Optional Redis (ioredis, nullable)
│   ├── constants/
│   │   └── index.js             # HTTP methods, test statuses, etc.
│   ├── controllers/
│   │   ├── auth.controller.js   # register, login, logout, profile
│   │   ├── test.controller.js   # startTest, getTests, cancelTest, deleteTest
│   │   ├── collection.controller.js
│   │   └── report.controller.js # JSON/CSV/PDF download
│   ├── helpers/
│   │   ├── metrics.helper.js    # computeMetrics(), computeHistogram()
│   │   └── pagination.helper.js # parsePaginationParams(), buildPagination()
│   ├── middleware/
│   │   ├── auth.middleware.js   # requireAuth, requireAdmin
│   │   ├── error.middleware.js  # Global error handler
│   │   ├── rateLimiter.middleware.js
│   │   └── validate.middleware.js # validateBody(zodSchema)
│   ├── models/
│   │   ├── User.model.js
│   │   ├── TestRun.model.js
│   │   └── Collection.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── test.routes.js
│   │   ├── collection.routes.js
│   │   └── report.routes.js
│   ├── services/
│   │   ├── auth.service.js      # Business logic for auth
│   │   ├── test.service.js      # Runs load tests, manages sockets
│   │   ├── collection.service.js
│   │   └── report.service.js    # Generates JSON/CSV/PDF
│   ├── sockets/
│   │   └── testSocket.js        # Socket.IO namespace /tests
│   ├── utils/
│   │   ├── asyncWrapper.js      # Wraps async handlers for express
│   │   ├── logger.js            # Winston instance
│   │   ├── responseHandler.js   # sendSuccess(), sendError(), sendPaginated()
│   │   └── tokenUtils.js        # signAccessToken(), verifyAccessToken()
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── test.validator.js
│   │   └── collection.validator.js
│   └── workers/
│       ├── loadTestWorker.js    # Worker thread — executes HTTP requests
│       └── workerPool.js        # Spawns workers, aggregates results
└── tests/
    ├── auth.test.js
    ├── collection.test.js
    ├── test.test.js
    └── metrics.helper.test.js
```

---

## How the Server Starts

```
server.js
  │
  ├─ Creates Node HTTP server: http.createServer(app)
  ├─ Attaches Socket.IO to HTTP server (not to Express directly)
  ├─ Calls initTestSocket(io)  ──→  registers /tests namespace
  ├─ Calls connectDB()         ──→  waits for MongoDB (5 retries)
  └─ httpServer.listen(PORT)   ──→  starts accepting connections
```

**Why separate HTTP server?**
Socket.IO needs the raw `http.Server` instance to upgrade HTTP → WebSocket connections. Express alone doesn't expose that.

```js
// server.js (simplified)
import { createServer } from 'http';
import app from './src/app.js';
import { Server } from 'socket.io';

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: env.CLIENT_URL } });

initTestSocket(io);   // attaches /tests namespace
await connectDB();
httpServer.listen(env.PORT);
```

---

## Express App & Middleware Stack

Every request passes through these layers **in order** (`src/app.js`):

```
Request
  │
  ├─ 1. helmet()              — Sets security HTTP headers
  ├─ 2. cors()                — Allows CLIENT_URL origin, credentials
  ├─ 3. express.json()        — Parses JSON body (max 10mb)
  ├─ 4. express.urlencoded()  — Parses form body (max 10mb)
  ├─ 5. globalRateLimiter     — 100 req/min per IP (configurable)
  ├─ 6. Dev request logger    — Logs "GET /api/v1/tests" in dev mode
  │
  ├─ Routes:
  │   ├─ GET  /health         — { status: 'ok', timestamp }
  │   ├─ /api/v1/auth/*       — authRoutes
  │   ├─ /api/v1/tests/*      — testRoutes
  │   ├─ /api/v1/collections/* — collectionRoutes
  │   ├─ /api/v1/reports/*    — reportRoutes
  │   └─ /api/v1/schedule|notifications|teams  → 501 stubs
  │
  ├─ 404 handler              — { success: false, message: 'Route not found' }
  └─ Global error handler     — Converts all errors to JSON responses
```

---

## Authentication System

### Flow

```
Register / Login
  │
  ├─ Service validates credentials
  ├─ Signs accessToken  (JWT, 15m expiry, JWT_ACCESS_SECRET)
  ├─ Signs refreshToken (JWT, 7d expiry, JWT_REFRESH_SECRET)
  ├─ Stores refreshToken hash in User document
  └─ Returns { user, accessToken, refreshToken }

Protected Request
  │
  ├─ Client sends: Authorization: Bearer <accessToken>
  ├─ requireAuth middleware extracts + verifies JWT
  ├─ Looks up User by decoded.userId
  └─ Attaches req.user = user object

Token Refresh
  │
  ├─ Client sends: POST /auth/refresh { refreshToken }
  ├─ Verifies token signature + compares with stored value
  └─ Returns new { accessToken, refreshToken } pair
```

### `requireAuth` middleware

```js
// src/middleware/auth.middleware.js
export const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>
  const decoded = verifyAccessToken(token);               // throws on invalid
  const user = await User.findById(decoded.userId);       // DB lookup
  req.user = user;
  next();
};
```

### Rate limiting on auth routes

Auth routes (`/register`, `/login`) have a **separate, stricter limiter**:
- Window: 15 minutes
- Max: 20 requests per IP

---

## Request Lifecycle (HTTP)

A typical protected API call goes through:

```
Client → POST /api/v1/tests/run
  │
  ├─ globalRateLimiter    (checks rate limit)
  ├─ requireAuth          (validates JWT, sets req.user)
  ├─ validateBody(schema) (Zod validation, 422 on fail)
  └─ startTest controller
       │
       ├─ Creates TestRun document (status: PENDING)
       ├─ Sends 201 response: { testId }   ← responds immediately
       └─ Fires async (no await): testService.runTestById(testId, config, emit)
              │
              └─ Load test runs in background ──→ emits socket events
```

**Key pattern:** The controller responds `201` with just the `testId` immediately. The actual load test happens asynchronously — progress is delivered via Socket.IO, not HTTP.

---

## Load Test Engine

This is the most complex part of the system. Here's how it works end to end.

### Overview

```
testService.runTestById(testId, config, emit)
  │
  ├─ Updates TestRun: status = RUNNING, startedAt = now
  ├─ Creates WorkerPool(config)
  ├─ Stores in runningTests Map (for cancellation)
  │
  ├─ pool.run() ──────────────────────────────────────────────────────┐
  │    │                                                               │
  │    ├─ Builds request list (config.totalRequests items)            │
  │    ├─ Divides into N chunks (N = min(MAX_WORKERS, requestCount))  │
  │    │                                                               │
  │    ├─ Spawns N worker threads (loadTestWorker.js)                 │
  │    │    Each worker runs its chunk concurrently using semaphore   │
  │    │                                                               │
  │    ├─ Every 1 second: _startSnapshotTimer()                       │
  │    │    Calculates live RPS, avgLatency, errors                   │
  │    │    Emits: pool event 'snapshot'                               │
  │    │                                                               │
  │    └─ When all workers done: _finish()                            │
  │         Calls computeMetrics() + computeHistogram()               │
  │         Resolves promise with final metrics                        │
  │                                                                    │
  ├─ On pool event 'progress' → emit('test:progress', ...)            │
  ├─ On pool event 'snapshot' → emit('test:metrics', ...)             │
  ├─ On pool event 'cancelled' → update DB, emit('test:cancelled')    │
  │                                                                    │
  └─ After pool.run() resolves:                                       │
       Updates TestRun: status = COMPLETED, metrics = {...}           │
       Emits: test:complete                                            │
```

### Worker Thread (loadTestWorker.js)

Each worker receives its own **slice of requests** and runs them with controlled concurrency:

```js
// Semaphore pattern for concurrency control
const runWithSlot = (req) => new Promise(resolve => {
  semaphore.acquire(() => {
    executeRequest(req).then(result => {
      semaphore.release();
      resolve(result);
    });
  });
});

// All requests run via Promise.all (concurrent, limited by semaphore)
const results = await Promise.all(requests.map(runWithSlot));
```

**executeRequest** handles:
- AbortController timeout
- Auth header injection (Bearer, Basic, API-Key)
- Query param building
- Retry logic with exponential backoff: `200ms * attemptNumber`

**Result shape per request:**
```js
{ success: boolean, statusCode: number, latency: number, size: number, error: string|null, timedOut: boolean }
```

### Cancellation

```js
// WorkerPool.cancel()
this.aborted = true;
this.workers.forEach(w => w.postMessage({ type: 'abort' }));
setTimeout(() => this.workers.forEach(w => w.terminate()), 500);
```

The worker checks `aborted` flag between requests and exits the loop early.

---

## Socket.IO Real-Time Events

### Setup

```js
// src/sockets/testSocket.js
export function initTestSocket(io) {
  const testNS = io.of('/tests');   // namespace: /tests

  testNS.on('connection', (socket) => {
    socket.on('join-test', (testId) => socket.join(testId));   // join room
    socket.on('leave-test', (testId) => socket.leave(testId)); // leave room
  });
}

export function getEmitter(testId) {
  return (event, data) => testNS.to(testId).emit(event, data);
}
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join-test` | `testId: string` | Subscribe to a test's room (call this after `POST /tests/run`) |
| `leave-test` | `testId: string` | Unsubscribe |

### Server → Client Events

| Event | Payload | When |
|-------|---------|------|
| `test:log` | `{ testId, timestamp, level, message }` | First log (test started) |
| `test:progress` | `{ testId, completed, total, percent, lastResult }` | After each request batch |
| `test:metrics` | `{ testId, snapshot: { timestamp, rps, avgLatency, errors, completed } }` | Every 1 second during test |
| `test:complete` | `{ testId, metrics: { ...full metrics } }` | Test finished |
| `test:error` | `{ testId, error: string }` | Unhandled error |

### How to listen (frontend pattern)

```js
socket.emit('join-test', testId);
socket.on('test:metrics', ({ snapshot }) => updateLiveUI(snapshot));
socket.on('test:complete', ({ metrics }) => showResults(metrics));
```

---

## Database Models

### User

```
name         String  (2-50 chars)
email        String  (unique, lowercase)
password     String  (bcrypt, select: false)
role         String  ('user' | 'admin')
refreshToken String  (select: false)
timestamps
```

**Password hashing** happens automatically via Mongoose `pre('save')` hook — you never bcrypt manually. The `toJSON()` method strips `password` and `refreshToken` before serializing.

### TestRun

```
userId       ObjectId → User     (indexed)
name         String
url          String
method       String  ('GET'|'POST'|'PUT'|'PATCH'|'DELETE')
headers      Map<String, String>
queryParams  Map<String, String>
body         Mixed
bodyType     'none'|'json'|'raw'|'form-data'
auth         { type, token, username, password, key, value, addTo }
config       { totalRequests, concurrency, duration, timeout, delay, retries }
status       'pending'|'running'|'completed'|'failed'|'cancelled'  (indexed)
metrics      {
               total, successful, failed, timedOut,
               successRate, failureRate,
               requestsPerSecond, avgLatency, minLatency, maxLatency,
               medianLatency, p50, p95, p99,
               throughputKBps, totalBytes, durationMs,
               statusDistribution: Map,
               errorDistribution: Map,
               timeSeries: [{ timestamp, rps, avgLatency, errors, completed }],
               histogram:  [{ range: '0-100ms', count: N }]
             }
logs         [{ timestamp, level, message }]
startedAt    Date
completedAt  Date
timestamps
```

**Indexes:** `{ userId, createdAt: -1 }` and `{ status }`

### Collection

```
userId       ObjectId → User     (indexed)
name         String  (max 100)
description  String  (max 500)
folders      [{ name, requests[] }]
requests     [{ name, url, method, headers, queryParams, body, bodyType, auth, description }]
timestamps
```

---

## API Routes Reference

### Auth (`/api/v1/auth`)

```
POST  /register    → { user, accessToken, refreshToken }   201
POST  /login       → { user, accessToken, refreshToken }   200
POST  /refresh     → { accessToken, refreshToken }         200
POST  /logout      → { message }                           200  [auth]
GET   /profile     → { user }                              200  [auth]
PATCH /profile     → { user }                              200  [auth]
```

### Tests (`/api/v1/tests`) — all require auth

```
POST   /run          → { testId }                   201  (test runs async)
GET    /             → { tests[], pagination }      200
GET    /:id          → { test }                     200
DELETE /:id          → { message }                  200
DELETE /:id/cancel   → { message }                  200
```

### Collections (`/api/v1/collections`) — all require auth

```
POST   /                     → { collection }          201
GET    /                     → { collections[], pagination }  200
GET    /:id                  → { collection }          200
PUT    /:id                  → { collection }          200
DELETE /:id                  → { message }             200
POST   /:id/duplicate        → { collection }          201
GET    /:id/export           → JSON file download
POST   /import               → { collection }          201
POST   /:id/requests         → { collection }          201
DELETE /:id/requests/:reqId  → { collection }          200
POST   /:id/folders          → { collection }          201
```

### Reports (`/api/v1/reports`) — all require auth

```
GET /:testId/json  → JSON file download
GET /:testId/csv   → CSV file download
GET /:testId/pdf   → PDF file download
```

---

## Response Shape

All responses use `src/utils/responseHandler.js`:

```js
// Success
sendSuccess(res, 'message', data, 200)
// → { success: true, message: '...', data: { ... } }

// Paginated
sendPaginated(res, 'message', items, pagination)
// → { success: true, message: '...', data: [...], pagination: { page, limit, total, totalPages, hasNextPage, hasPrevPage } }

// Error
sendError(res, 'message', 404, errors)
// → { success: false, message: '...', errors?: [...] }
```

**Important for frontend:** Data is always nested under `data`. So `res.body.data.user`, `res.body.data.test`, `res.body.data.collection`, etc.

---

## Error Handling

The global error middleware (`src/middleware/error.middleware.js`) handles:

| Error Type | Status | Details |
|-----------|--------|---------|
| `ZodError` | 422 | Validation failed — returns field-level errors |
| Mongoose duplicate key (11000) | 409 | e.g., "email already exists" |
| Mongoose `ValidationError` | 400 | Schema validation |
| `JsonWebTokenError` | 401 | Invalid token |
| `TokenExpiredError` | 401 | Expired token |
| Mongoose `CastError` | 400 | Invalid ObjectId |
| Custom `AppError` | varies | Uses `err.statusCode` |
| Everything else | 500 | Generic server error |

**AppError pattern:**
```js
import AppError from '../utils/AppError.js';
throw new AppError('User not found', 404);
```

**Async routes** — wrap with `asyncWrapper` to forward errors to the global handler:
```js
export const getTests = asyncWrapper(async (req, res) => {
  const tests = await testService.getTests(req.user._id, req.query);
  sendSuccess(res, 'Tests fetched', tests);
});
```

---

## Metrics & Calculations

`src/helpers/metrics.helper.js` contains the core math:

### `computeMetrics(results, durationMs)`

Takes the raw array of per-request results and computes everything:

```js
// Input
results = [
  { success: true, statusCode: 200, latency: 123, size: 1024, error: null, timedOut: false },
  { success: false, statusCode: 0, latency: 10000, size: 0, error: 'timeout', timedOut: true },
  ...
]

// Output
{
  total: 100,
  successful: 95,
  failed: 5,
  timedOut: 2,
  successRate: 95.0,        // %
  failureRate: 5.0,         // %
  requestsPerSecond: 12.5,  // total / (durationMs / 1000)
  avgLatency: 234,          // ms
  minLatency: 45,
  maxLatency: 3200,
  medianLatency: 201,
  p50: 201,
  p95: 850,                 // 95% of requests were faster than this
  p99: 2100,
  throughputKBps: 125.4,
  totalBytes: 1254000,
  statusDistribution: Map { '200' => 90, '404' => 5, '500' => 5 },
  errorDistribution: Map { 'timeout' => 3, 'ECONNREFUSED' => 2 },
  durationMs: 8000
}
```

### `percentile(sortedArr, p)`

```js
// p = 0.95 for P95
percentile([1,2,3,...100], 0.95)  // → 95
```

### `computeHistogram(latencies, buckets=10)`

Divides the latency range into equal buckets:
```js
// Returns
[
  { range: '0-200ms', count: 45 },
  { range: '200-400ms', count: 30 },
  { range: '400-600ms', count: 15 },
  ...
]
```

---

## Configuration & Environment

All env vars are read and defaulted in `src/config/env.js`:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment |
| `PORT` | `5000` | HTTP port |
| `MONGO_URI` | `mongodb://localhost:27017/loadtester` | MongoDB connection |
| `JWT_ACCESS_SECRET` | fallback string | **Change in production!** |
| `JWT_REFRESH_SECRET` | fallback string | **Change in production!** |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | CORS allowed origin |
| `REDIS_URL` | `` (empty) | Optional — leave empty to disable |
| `RATE_LIMIT_WINDOW_MS` | `60000` | 1 minute |
| `RATE_LIMIT_MAX` | `100` | Requests per window |
| `MAX_CONCURRENT_REQUESTS` | `500` | Max concurrent HTTP connections per worker |
| `MAX_WORKERS` | `4` | Max worker threads for load testing |

Copy `.env.example` to `.env` and fill in values.

---

## Utilities

### `asyncWrapper(fn)`
```js
// Wraps async route handlers so errors go to next()
export const getTests = asyncWrapper(async (req, res) => { ... });
```

### `responseHandler`
```js
import { sendSuccess, sendError, sendPaginated } from '../utils/responseHandler.js';
sendSuccess(res, 'Done', { id: '...' }, 201);
sendPaginated(res, 'Tests', tests, pagination);
sendError(res, 'Not found', 404);
```

### `tokenUtils`
```js
const accessToken = signAccessToken({ userId: user._id });
const decoded = verifyAccessToken(token); // throws on invalid
```

### `logger`
```js
import logger from '../utils/logger.js';
logger.info('Server started');
logger.error('DB connection failed', { error });
```

---

## How to Add a New Feature

### Adding a new API endpoint

1. **Create the route** in `src/routes/` (or add to existing):
   ```js
   router.get('/:id/stats', requireAuth, asyncWrapper(getStats));
   ```

2. **Create the validator** in `src/validators/` (Zod schema):
   ```js
   export const statsQuerySchema = z.object({ from: z.string().optional() });
   ```

3. **Create the controller** in `src/controllers/`:
   ```js
   export const getStats = asyncWrapper(async (req, res) => {
     const data = await statsService.compute(req.params.id, req.user._id);
     sendSuccess(res, 'Stats fetched', data);
   });
   ```

4. **Create the service** in `src/services/`:
   ```js
   export async function compute(testId, userId) {
     const test = await TestRun.findOne({ _id: testId, userId });
     if (!test) throw new AppError('Not found', 404);
     return { ... };
   }
   ```

5. **Mount the router** in `src/app.js` if it's a new router file.

### Adding a new Socket.IO event

In `src/services/test.service.js`, use the `emit` function already passed in:
```js
emit('test:custom-event', { testId, data: '...' });
```

On the frontend, listen in `useTestRunner.js`.

### Running tests

```bash
# Unit tests only (no MongoDB needed)
node --experimental-vm-modules node_modules/jest-cli/bin/jest.js tests/metrics.helper.test.js --runInBand

# Integration tests (requires MongoDB running)
node --experimental-vm-modules node_modules/jest-cli/bin/jest.js tests/auth.test.js --runInBand
```
