# LoadForge

**API Load Testing & Performance Monitoring Platform**

A full-stack, production-ready platform for running HTTP load tests, visualising real-time metrics, managing API collections, and exporting detailed reports — inspired by k6, Loader.io, and Postman Load Testing.

---

## Features

| Category | Details |
|---|---|
| **Authentication** | Register / Login, JWT access + refresh tokens, bcrypt passwords |
| **Load Testing** | URL, method, headers, body, auth, concurrency, timeout, retries, delay |
| **Execution Engine** | `worker_threads`, semaphore concurrency, AbortController, exponential-backoff retries |
| **Metrics** | P50/P95/P99 latency, RPS, throughput, status-code distribution, error distribution |
| **Real-Time Monitoring** | Socket.IO live logs, live metric snapshots, progress bar |
| **Analytics Dashboard** | Historical test list, summary stats, per-test detail |
| **Charts** | Area, Line, Bar, Pie charts via Recharts |
| **API Collections** | Save, group, import, export, duplicate |
| **Export Reports** | JSON, CSV, PDF (server-side) |
| **Security** | Helmet, CORS, rate limiting, Zod validation |
| **DevOps** | Docker, docker-compose (4 services), nginx, PM2 |

---

## Tech Stack

### Backend
- **Node.js 20** + **Express 5** (ES Modules)
- **MongoDB** + **Mongoose** — data persistence
- **Socket.IO** — real-time event streaming
- **worker_threads** — parallel load test execution
- **Winston** — structured logging with file rotation
- **Zod** — request validation
- **pdfkit** + **json2csv** — report generation
- **ioredis** — optional Redis integration (BullMQ-ready)

### Frontend
- **React 19** + **Vite**
- **Tailwind CSS v4** — dark theme
- **Zustand** — state management (with persistence)
- **react-router-dom v7** — client-side routing
- **Recharts** — all charts
- **react-hook-form** + **Zod** — form validation
- **Socket.IO client** — live test streaming

---

## Prerequisites

| Tool | Version |
|---|---|
| Node.js | 20+ |
| MongoDB | 6+ (local or Atlas) |
| Redis | 7+ (optional — only needed for `REDIS_URL`) |
| Docker + Compose | any recent version (for containerised setup) |

---

## Quick Start (Local Development)

### 1. Clone and enter the project

```bash
git clone <repo-url>
cd project
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI and JWT secrets (see Environment Variables below)
npm run dev        # starts on http://localhost:5000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

Open **http://localhost:5173** — register an account and start testing.

---

## Docker (All Services)

```bash
docker compose up --build
```

This starts four containers:

| Service | Port |
|---|---|
| backend | 5000 |
| frontend (nginx) | 80 |
| MongoDB 7 | 27017 |
| Redis 7 | 6379 |

Access the app at **http://localhost**.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | HTTP server port |
| `NODE_ENV` | `development` | `development` \| `production` |
| `MONGO_URI` | *(required)* | MongoDB connection string |
| `JWT_ACCESS_SECRET` | *(required)* | Secret for access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | *(required)* | Secret for refresh tokens (min 32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `REDIS_URL` | *(optional)* | Redis connection string — enables queue features |
| `MAX_WORKERS` | `10` | Maximum worker threads per test run |
| `LOG_LEVEL` | `info` | Winston log level |

---

## API Reference

All endpoints are prefixed with `/api/v1`.

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Login, returns tokens |
| POST | `/auth/refresh` | — | Exchange refresh token |
| POST | `/auth/logout` | ✓ | Invalidate session |
| GET | `/auth/profile` | ✓ | Get current user |
| PATCH | `/auth/profile` | ✓ | Update name / email / password |

### Tests

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/tests/run` | ✓ | Start a load test |
| GET | `/tests` | ✓ | List tests (paginated) |
| GET | `/tests/:id` | ✓ | Get test details |
| DELETE | `/tests/:id/cancel` | ✓ | Cancel running test |
| DELETE | `/tests/:id` | ✓ | Delete test record |

### Collections

| Method | Path | Description |
|---|---|---|
| POST | `/collections` | Create collection |
| GET | `/collections` | List collections |
| GET | `/collections/:id` | Get collection |
| PUT | `/collections/:id` | Update collection |
| DELETE | `/collections/:id` | Delete collection |
| POST | `/collections/:id/duplicate` | Duplicate |
| GET | `/collections/:id/export` | Export as JSON |
| POST | `/collections/import` | Import from JSON |
| POST | `/collections/:id/requests` | Add request |
| DELETE | `/collections/:id/requests/:rid` | Remove request |
| POST | `/collections/:id/folders` | Add folder |

### Reports

| Method | Path | Description |
|---|---|---|
| GET | `/reports/:testId/json` | Download JSON report |
| GET | `/reports/:testId/csv` | Download CSV report |
| GET | `/reports/:testId/pdf` | Download PDF report |

### Health

```
GET /health  →  { "status": "ok", "timestamp": "..." }
```

---

## Running Tests

```bash
cd backend
npm test
```

Runs all Jest suites with `--runInBand` (sequential) against a local MongoDB test database. Requires MongoDB to be running on `localhost:27017`.

Individual suites:

```bash
# unit tests only (no DB needed)
node --experimental-vm-modules node_modules/.bin/jest tests/metrics.helper.test.js

# API integration tests (requires MongoDB)
node --experimental-vm-modules node_modules/.bin/jest tests/auth.test.js
node --experimental-vm-modules node_modules/.bin/jest tests/test.test.js
node --experimental-vm-modules node_modules/.bin/jest tests/collection.test.js
```

---

## PM2 (Production)

```bash
# install pm2 globally
npm install -g pm2

# start in cluster mode
pm2 start ecosystem.config.cjs

# monitor
pm2 monit

# save process list for system restart
pm2 save
```

---

## Project Structure

```
project/
├── backend/
│   ├── server.js                   # HTTP + Socket.IO entry point
│   ├── src/
│   │   ├── app.js                  # Express app (middleware, routes)
│   │   ├── config/                 # env, db, redis
│   │   ├── constants/              # HTTP status codes, enums
│   │   ├── controllers/            # Thin HTTP handlers
│   │   ├── helpers/                # metrics, pagination
│   │   ├── middleware/             # auth, error, rate limiter, validate
│   │   ├── models/                 # Mongoose schemas
│   │   ├── routes/                 # Express routers
│   │   ├── services/               # Business logic
│   │   ├── sockets/                # Socket.IO namespace + emitter
│   │   ├── utils/                  # logger, response helpers, token utils
│   │   ├── validators/             # Zod schemas
│   │   └── workers/                # loadTestWorker.js + workerPool.js
│   ├── tests/                      # Jest + Supertest suites
│   ├── Dockerfile
│   ├── .env.example
│   ├── babel.config.cjs
│   └── jest.config.cjs
│
├── frontend/
│   ├── src/
│   │   ├── api/                    # axios instance + per-resource API files
│   │   ├── components/
│   │   │   ├── charts/             # Recharts wrappers
│   │   │   ├── layout/             # AppLayout, AuthLayout
│   │   │   ├── test/               # TestConfigForm, LiveTerminal, LiveMetricsBar
│   │   │   └── ui/                 # Button, Input, Badge, Modal, Table, …
│   │   ├── hooks/                  # useAuth, useSocket, useTestRunner, useDebounce
│   │   ├── pages/                  # 9 pages (Dashboard, NewTest, TestResults, …)
│   │   ├── router/                 # createBrowserRouter, ProtectedRoute
│   │   ├── store/                  # Zustand stores (auth, test, collection)
│   │   └── utils/                  # formatters.js
│   ├── Dockerfile
│   └── .env.example
│
├── nginx/
│   └── nginx.conf                  # Reverse proxy + static serve
├── docker-compose.yml
└── ecosystem.config.cjs            # PM2 config
```

---

## Socket.IO Events

Connect to the `/tests` namespace and join a room by test ID to receive live events.

```js
const socket = io('/tests');
socket.emit('join-test', testId);

socket.on('test:progress',  (data) => { /* { testId, completed, total, percent } */ });
socket.on('test:metrics',   (data) => { /* { testId, snapshot: { rps, avgLatency, … } } */ });
socket.on('test:log',       (data) => { /* { testId, level, message, timestamp } */ });
socket.on('test:complete',  (data) => { /* { testId, metrics: { p50, p95, … } } */ });
socket.on('test:error',     (data) => { /* { testId, error } */ });
socket.on('test:cancelled', (data) => { /* { testId } */ });
```

---

## License

MIT
