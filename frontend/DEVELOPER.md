# Frontend Developer Guide

> Everything you need to understand how the LoadForge frontend works — app structure, routing, state management, API layer, Socket.IO integration, components, and how to add new features.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [How the App Bootstraps](#how-the-app-bootstraps)
4. [Routing & Layouts](#routing--layouts)
5. [State Management (Zustand Stores)](#state-management-zustand-stores)
6. [API Layer (Axios)](#api-layer-axios)
7. [Socket.IO Integration](#socketio-integration)
8. [How a Load Test Runs (Full Flow)](#how-a-load-test-runs-full-flow)
9. [Pages](#pages)
10. [Hooks](#hooks)
11. [Components](#components)
12. [Charts (Recharts)](#charts-recharts)
13. [Styling (Tailwind v4)](#styling-tailwind-v4)
14. [Formatters Utility](#formatters-utility)
15. [Build & Vite Config](#build--vite-config)
16. [How to Add a New Feature](#how-to-add-a-new-feature)

---

## Tech Stack

| Technology | Version | Role |
|-----------|---------|------|
| React | 19 | UI framework |
| Vite | 6 | Build tool + dev server |
| React Router DOM | 6 | Client-side routing |
| Zustand | 5 | Global state management |
| Axios | 1 | HTTP client |
| Socket.IO Client | 4 | Real-time WebSocket |
| Recharts | 2 | Charts & data visualization |
| Tailwind CSS | v4 | Utility-first styling |
| React Hook Form | 7 | Form handling |
| React Hot Toast | 2 | Toast notifications |
| date-fns | 3 | Date formatting |
| @heroicons/react | 2 | SVG icons |

---

## Project Structure

```
frontend/src/
├── main.jsx                     # Entry point — mounts <App />
├── App.jsx                      # RouterProvider + Toaster
├── index.css                    # Tailwind v4 import + custom theme
│
├── router/
│   ├── index.jsx                # All routes defined here
│   └── ProtectedRoute.jsx       # Auth guard component
│
├── store/
│   ├── authStore.js             # User, tokens, auth actions (persisted)
│   ├── testStore.js             # Tests list, live metrics, current test
│   └── collectionStore.js       # Collections list + CRUD
│
├── api/
│   ├── axiosInstance.js         # Axios with interceptors (auto token refresh)
│   ├── auth.api.js              # /auth endpoints
│   ├── test.api.js              # /tests endpoints
│   ├── collection.api.js        # /collections endpoints
│   └── report.api.js            # /reports endpoints (file downloads)
│
├── hooks/
│   ├── useAuth.js               # Selector for authStore
│   ├── useDebounce.js           # Debounce a value
│   ├── useSocket.js             # Singleton Socket.IO connection
│   └── useTestRunner.js         # Full test start/monitor orchestration
│
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx            # Recent tests + summary stats
│   ├── NewTest.jsx              # Test config form + live monitor
│   ├── TestResults.jsx          # Final charts + export buttons
│   ├── Analytics.jsx            # All tests history table
│   ├── Collections.jsx          # Collection manager
│   ├── Profile.jsx              # Edit name/email/password
│   └── Settings.jsx             # Logout + stubs
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.jsx        # Sidebar + main area (authenticated)
│   │   └── AuthLayout.jsx       # Centered card (login/register)
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Badge.jsx
│   │   ├── Table.jsx
│   │   ├── StatsCard.jsx
│   │   ├── Modal.jsx
│   │   └── Spinner.jsx
│   ├── test/
│   │   ├── TestConfigForm.jsx   # Main test form (URL, method, config)
│   │   ├── LiveMetricsBar.jsx   # Real-time progress + live stats
│   │   └── LiveTerminal.jsx     # Real-time request log terminal
│   ├── request/
│   │   ├── AuthSelector.jsx     # Bearer/Basic/API-Key selector
│   │   ├── BodyEditor.jsx       # JSON/raw/form-data editor
│   │   └── HeadersParamsTables.jsx  # Key-value tables
│   └── charts/
│       ├── LatencyChart.jsx     # P50/P95/P99 over time (area)
│       ├── RpsChart.jsx         # Requests/sec over time (line)
│       ├── StatusPieChart.jsx   # HTTP status distribution (pie)
│       ├── ResponseDistChart.jsx # Latency histogram (bar)
│       └── ErrorChart.jsx       # Error types breakdown (bar)
│
└── utils/
    └── formatters.js            # Date, bytes, latency, color helpers
```

---

## How the App Bootstraps

```
index.html
  └─ <script src="/src/main.jsx">
       │
       └─ main.jsx
            └─ createRoot(document.getElementById('root'))
                 .render(<App />)
                        │
                        └─ App.jsx
                             ├─ <RouterProvider router={router} />  ← all routing
                             └─ <Toaster />                         ← toast notifications
```

The `router` object is created in `src/router/index.jsx` using `createBrowserRouter`. There's no global context provider — state is handled entirely by Zustand stores.

---

## Routing & Layouts

### Route Map

```
/login                    → Login             (AuthLayout, public)
/register                 → Register          (AuthLayout, public)

/dashboard                → Dashboard         (AppLayout, protected)
/tests/new                → NewTest           (AppLayout, protected)
/tests/:id                → TestResults       (AppLayout, protected)
/analytics                → Analytics         (AppLayout, protected)
/collections              → Collections       (AppLayout, protected)
/profile                  → Profile           (AppLayout, protected)
/settings                 → Settings          (AppLayout, protected)
```

### ProtectedRoute

```jsx
// src/router/ProtectedRoute.jsx
const { isAuthenticated } = useAuth();
if (!isAuthenticated) return <Navigate to="/login" replace />;
return <Outlet />;
```

Wraps all protected routes. If `isAuthenticated` is false (store value), redirects to `/login`.

### Layout hierarchy

```
AuthLayout
  ├─ Centered card on dark background
  ├─ Logo + brand name
  └─ Outlet → Login or Register
         └─ If already logged in: redirects to /dashboard

ProtectedRoute
  └─ AppLayout
       ├─ Sidebar (logo, 6 nav links, user info, sign out)
       └─ Main content area → Outlet → any protected page
```

---

## State Management (Zustand Stores)

Zustand stores are plain JS modules — import them anywhere and call actions directly. No Provider needed.

### authStore — `src/store/authStore.js`

```js
// State shape
{
  user: { _id, name, email, role } | null,
  accessToken: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
}

// Actions
login(credentials)     // POST /auth/login — sets all state
register(userData)     // POST /auth/register
logout()               // POST /auth/logout — clears all state
fetchProfile()         // GET /auth/me — refreshes user data
updateProfile(data)    // PUT /auth/me
```

**Persisted to localStorage** under the key `auth-storage` (access/refresh tokens + user survive page reload).

### testStore — `src/store/testStore.js`

```js
// State shape
{
  tests: [],             // paginated list from GET /tests
  currentTest: null,     // full single test from GET /tests/:id
  pagination: {},
  liveMetrics: null,     // updated every 1s via socket
  liveLog: [],           // last 500 request log entries
  isRunning: false,
  progress: 0,           // 0-100
}

// Actions
fetchTests(params)          // GET /tests
fetchTestById(id)           // GET /tests/:id (sets currentTest)
deleteTest(id)              // DELETE /tests/:id
cancelTest(id)              // DELETE /tests/:id/cancel
setLiveMetrics(metrics)     // called by socket listener
appendLog(entry)            // called by socket listener
setProgress(n)              // 0-100
setIsRunning(bool)
resetLive()                 // clears liveMetrics, liveLog, progress
```

### collectionStore — `src/store/collectionStore.js`

```js
{
  collections: [],
  currentCollection: null,
  pagination: {},
}

// Actions
fetchCollections()
fetchCollectionById(id)
createCollection(data)
updateCollection(id, data)
deleteCollection(id)
importCollection(data)
```

---

## API Layer (Axios)

### axiosInstance

```js
// src/api/axiosInstance.js
const api = axios.create({
  baseURL: '/api/v1',   // Vite proxy forwards to http://localhost:5000
  timeout: 30000,
});

// Request interceptor — attach token
api.interceptors.request.use(config => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Response interceptor — auto refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && !err.config._retry) {
      // Pause all in-flight requests
      // Call POST /auth/refresh with stored refreshToken
      // Retry the original request with new token
    }
  }
);
```

All API files import this `api` instance:

```js
// src/api/test.api.js
export const startTest = (data) => api.post('/tests/run', data);
export const getTests = (params) => api.get('/tests', { params });
export const getTestById = (id) => api.get(`/tests/${id}`);
```

### API response structure

The backend always wraps data:
```js
{ success: true, message: '...', data: { test: { ... } } }
//                                      ↑ always nested under data.*
```

So in components:
```js
const res = await api.get(`/tests/${id}`);
const test = res.data.data.test;  // res.data = axios response body
```

Stores handle this internally — components just call store actions.

---

## Socket.IO Integration

### useSocket hook — `src/hooks/useSocket.js`

Creates a **single shared Socket.IO connection** to the `/tests` namespace:

```js
const { socket, joinTest, leaveTest, on, off } = useSocket();

joinTest(testId)   // emit 'join-test' → backend adds socket to room
leaveTest(testId)  // emit 'leave-test' → backend removes from room
on('test:metrics', handler)  // listen for events
off('test:metrics', handler) // remove listener (cleanup)
```

- Auto-reconnects up to 5 times
- Supports both WebSocket and long-polling fallback
- The socket connects once and is reused across all hook calls (singleton)

### Events from backend

| Event | Data | Description |
|-------|------|-------------|
| `test:progress` | `{ testId, completed, total, percent, lastResult }` | After each batch |
| `test:metrics` | `{ testId, snapshot: { timestamp, rps, avgLatency, errors, completed } }` | Every 1 second |
| `test:complete` | `{ testId, metrics: { ...all final metrics } }` | Test done |
| `test:error` | `{ testId, error: string }` | Something crashed |

---

## How a Load Test Runs (Full Flow)

```
User fills TestConfigForm and clicks "Run Test"
  │
  ▼
useTestRunner.run(payload)
  │
  ├─ 1. POST /tests/run  ────────────────→ Backend creates TestRun doc
  │         ← { testId }                  Returns testId immediately (201)
  │
  ├─ 2. testStore.setIsRunning(true)
  │     testStore.resetLive()
  │
  ├─ 3. joinTest(testId)  ──────────────→ Backend: socket.join(testId)
  │
  ├─ 4. Register socket listeners:
  │      on('test:progress', (d) => {
  │        testStore.appendLog(d.lastResult)
  │        testStore.setProgress(d.percent)
  │      })
  │      on('test:metrics', (d) => {
  │        testStore.setLiveMetrics(d.snapshot)
  │      })
  │      on('test:complete', (d) => {
  │        testStore.setLiveMetrics(d.metrics)
  │        navigate(`/tests/${testId}`)     ← goes to results page
  │        cleanup()
  │      })
  │      on('test:error', cleanup)
  │
  ▼
While test runs:
  LiveMetricsBar reads testStore.liveMetrics → shows live P50, P95, RPS
  LiveTerminal reads testStore.liveLog → shows colored ✓/✗ rows
  Progress bar reads testStore.progress

  ▼
On test:complete → navigate to /tests/:id

  ▼
TestResults page mounts:
  testStore.fetchTestById(id) ──→ GET /tests/:id ──→ sets currentTest
  Renders 5 charts from currentTest.metrics
```

---

## Pages

### Dashboard (`/dashboard`)

- Calls `testStore.fetchTests({ limit: 10 })` on mount
- Shows 4 `StatsCard`s: Total Tests, Completed, Failed, Avg P95
- Shows last 10 tests in a `Table` with status `Badge`s

### NewTest (`/tests/new`)

- Renders `TestConfigForm` (no other logic in the page itself)
- `TestConfigForm` internally uses `useTestRunner` to start the test
- While test runs: shows `LiveMetricsBar` + `LiveTerminal`

### TestResults (`/tests/:id`)

- Calls `testStore.fetchTestById(id)` on mount
- Reads `testStore.currentTest` for all data
- Shows metric grid: Total, Successful, Failed, P50/P95/P99, RPS, Throughput
- Renders all 5 charts from `currentTest.metrics`
- Export buttons call `report.api.js` which fetch blobs and trigger download

### Analytics (`/analytics`)

- Fetches 50 tests with `fetchTests({ limit: 50 })`
- Full table with delete buttons
- Click a test row → navigate to `/tests/:id`

### Collections (`/collections`)

- Lists all collections as cards
- Modals for: create, view requests, add request
- Import JSON via file picker

---

## Hooks

### `useAuth`
```js
const { user, isAuthenticated, login, logout } = useAuth();
```
Just a selector that returns the right slice of `authStore`.

### `useDebounce(value, delay = 300)`
```js
const debouncedSearch = useDebounce(searchInput, 500);
// Use debouncedSearch in useEffect to avoid calling API on every keystroke
```

### `useSocket`
```js
const { joinTest, leaveTest, on, off } = useSocket();
```
Provides access to the singleton socket. See [Socket.IO Integration](#socketio-integration).

### `useTestRunner`
```js
const { run, testId, cleanup } = useTestRunner();

// Start a test
await run({
  name: 'My Test',
  url: 'https://api.example.com/users',
  method: 'GET',
  headers: {},
  config: { totalRequests: 100, concurrency: 10, timeout: 5000, delay: 0, retries: 0 }
});
```
Handles the entire test lifecycle — API call, socket join, event wiring, store updates, navigation.

---

## Components

### UI Components

| Component | Key Props | Notes |
|-----------|-----------|-------|
| `Button` | `variant` (primary/secondary/danger/ghost), `size`, `loading`, `disabled` | Shows spinner when `loading={true}` |
| `Input` | `label`, `error`, `type`, `placeholder` | Red border on `error`, blue focus ring |
| `Badge` | `color` (green/red/yellow/blue/gray/indigo/orange) | Colored pill |
| `Table` | `columns[]`, `data[]`, `loading`, `emptyMessage` | Handles loading + empty states |
| `StatsCard` | `title`, `value`, `subtitle`, `icon`, `color`, `trend` | Shows % arrow if `trend` provided |
| `Modal` | `isOpen`, `onClose`, `title`, `size`, `footer` | Escape key closes; backdrop click closes |
| `Spinner` | `size` (sm/md/lg) | CSS spinning border |

### TestConfigForm Tabs

The form has 5 tabs:

| Tab | Contents |
|-----|----------|
| **Params** | Query parameter key-value table |
| **Headers** | HTTP header key-value table |
| **Body** | Body type selector + editor (JSON/raw/form-data/none) |
| **Auth** | Auth type selector (Bearer/Basic/API-Key/None) |
| **Config** | totalRequests, concurrency, timeout, delay, retries |

Submitted payload shape:
```js
{
  name: string,
  url: string,
  method: 'GET'|'POST'|'PUT'|'PATCH'|'DELETE',
  headers: { 'Content-Type': 'application/json', ... },
  queryParams: { page: '1', ... },
  body: string | null,
  bodyType: 'none'|'json'|'raw'|'form-data',
  auth: { type: 'bearer', token: '...' },
  config: {
    totalRequests: 100,
    concurrency: 10,
    timeout: 5000,      // ms
    delay: 0,           // ms between batches
    retries: 0
  }
}
```

### LiveMetricsBar

Reads from `testStore.liveMetrics` (set by socket `test:metrics` events):
```js
liveMetrics = { rps, avgLatency, errors, completed, timestamp }
```
Shows: progress bar, P50, P95, RPS, Errors count.

### LiveTerminal

Reads from `testStore.liveLog` (appended by socket `test:progress` events):
```js
// Each entry
{ success: boolean, statusCode: number, latency: number, url: string, error: string }
// Rendered as:
// [42] ✓ 200 — 123ms — https://api.example.com
// [43] ✗ 500 — 2340ms — Error: Internal Server Error
```
Auto-scrolls to bottom. Keeps last 500 entries.

---

## Charts (Recharts)

All charts are in `src/components/charts/`. They receive data from `currentTest.metrics` (fetched from backend).

### LatencyChart

```jsx
<LatencyChart timeSeries={metrics.timeSeries} />
// timeSeries = [{ timestamp, rps, avgLatency, errors, completed }, ...]
// Plots: p50, p95, p99 as 3 gradient-filled areas over time
```

### RpsChart

```jsx
<RpsChart timeSeries={metrics.timeSeries} />
// Plots: rps over time as a green line chart
```

### StatusPieChart

```jsx
<StatusPieChart statusDistribution={metrics.statusDistribution} />
// statusDistribution = { "200": 90, "404": 5, "500": 5 }
// Shows colored slices with % labels
```

### ResponseDistChart

```jsx
<ResponseDistChart histogram={metrics.histogram} />
// histogram = [{ range: '0-200ms', count: 45 }, { range: '200-400ms', count: 30 }, ...]
// Bar chart — shows distribution of response times
```

### ErrorChart

```jsx
<ErrorChart errorDistribution={metrics.errorDistribution} />
// errorDistribution = { "timeout": 3, "ECONNREFUSED": 2 }
// Horizontal bar chart — error types + counts
```

---

## Styling (Tailwind v4)

### No tailwind.config.js

Tailwind v4 works through a single CSS file. The entire theme is defined in `src/index.css`:

```css
@import "tailwindcss";

@theme {
  /* Brand colors */
  --color-primary: #6366f1;
  --color-primary-hover: #4f46e5;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Dark background layers */
  --color-bg-base: #0f1117;        /* page background */
  --color-bg-surface: #1a1d27;    /* sidebar, panels */
  --color-bg-card: #1e2130;       /* cards */
  --color-bg-elevated: #252836;   /* dropdowns, hover */
  --color-bg-input: #2a2d3e;      /* input backgrounds */

  /* Borders */
  --color-border: #2e3148;
  --color-border-focus: #6366f1;

  /* Text */
  --color-text-primary: #e2e8f0;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
}
```

**Usage in components:**
```jsx
<div className="bg-bg-card border border-border text-text-primary">
  <button className="bg-primary hover:bg-primary-hover text-white">
    Submit
  </button>
</div>
```

These map to the CSS variables automatically. No separate config needed.

---

## Formatters Utility

`src/utils/formatters.js` — import and use anywhere:

```js
import {
  formatDate, formatRelative, formatDuration,
  formatBytes, formatLatency, formatPercent, formatRps,
  methodColor, statusColor, testStatusColor
} from '../utils/formatters.js';

formatDate(new Date())              // "May 27, 2026 14:30"
formatRelative(new Date())          // "2 hours ago"
formatDuration(1500)                // "1.50s"
formatDuration(800)                 // "800ms"
formatBytes(1536)                   // "1.50 KB"
formatLatency(234)                  // "234ms"
formatPercent(0.955)                // "95.5%"
formatRps(12.456)                   // "12.46 req/s"

methodColor('GET')    // 'text-green-400'
methodColor('POST')   // 'text-blue-400'
methodColor('DELETE') // 'text-red-400'

statusColor(200)      // 'text-green-400'
statusColor(404)      // 'text-yellow-400'
statusColor(500)      // 'text-red-400'

testStatusColor('completed')  // 'text-success bg-success/10'
testStatusColor('failed')     // 'text-danger bg-danger/10'
testStatusColor('running')    // 'text-primary bg-primary/10'
```

---

## Build & Vite Config

```js
// vite.config.js
export default defineConfig({
  plugins: [
    react(),              // React Fast Refresh + JSX
    tailwindcss(),        // Tailwind v4
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',             // API requests
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,                                  // WebSocket upgrade
      },
    },
  },
});
```

**Why the proxy?** In development, Vite serves on `localhost:5173` and the backend is on `localhost:5000`. The proxy forwards `/api/*` and socket connections to the backend, avoiding CORS issues during dev.

**Build command:** `npm run build` → outputs to `dist/`. This is what Nginx serves in production.

---

## How to Add a New Feature

### New page

1. **Create the page** in `src/pages/MyPage.jsx`
2. **Add to router** in `src/router/index.jsx`:
   ```jsx
   { path: '/my-page', element: <ProtectedRoute><AppLayout /></ProtectedRoute>,
     children: [{ index: true, element: <MyPage /> }] }
   ```
3. **Add to sidebar** in `src/components/layout/AppLayout.jsx` (nav items array)

### New API endpoint call

1. **Add to API file** (e.g., `src/api/test.api.js`):
   ```js
   export const getTestStats = (id) => api.get(`/tests/${id}/stats`);
   ```
2. **Add to store** (e.g., `testStore.js`):
   ```js
   fetchTestStats: async (id) => {
     const res = await getTestStats(id);
     set({ stats: res.data.data.stats });
   }
   ```
3. **Use in component:**
   ```js
   const { stats, fetchTestStats } = useTestStore();
   useEffect(() => { fetchTestStats(id); }, [id]);
   ```

### New chart

1. **Create** `src/components/charts/MyChart.jsx`
2. Import a Recharts chart (LineChart, BarChart, etc.) and wrap it:
   ```jsx
   import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
   export default function MyChart({ data }) {
     return (
       <ResponsiveContainer width="100%" height={300}>
         <BarChart data={data}>
           <XAxis dataKey="name" stroke="#64748b" />
           <YAxis stroke="#64748b" />
           <Tooltip contentStyle={{ background: '#1e2130', border: '1px solid #2e3148' }} />
           <Bar dataKey="value" fill="#6366f1" />
         </BarChart>
       </ResponsiveContainer>
     );
   }
   ```

### Handling a new Socket.IO event

In `useTestRunner.js`:
```js
on('test:my-event', (data) => {
  testStore.getState().setMyData(data);
});
```

Remember to clean up in the `cleanup()` function:
```js
off('test:my-event', handler);
```

### Dev commands

```bash
# Start dev server (proxies to backend on :5000)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```
