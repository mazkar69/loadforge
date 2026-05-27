# 📖 LoadForge — User Guide

> Everything you need to know to run your first load test, read the results, and understand every metric on the dashboard.

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Running Your First Load Test](#2-running-your-first-load-test)
3. [Understanding the Test Configuration](#3-understanding-the-test-configuration)
4. [Reading the Live Monitor](#4-reading-the-live-monitor)
5. [Decoding Your Results](#5-decoding-your-results)
6. [Metrics Glossary](#6-metrics-glossary)
   - [Latency Percentiles — P50, P75, P95, P99](#latency-percentiles--p50-p75-p95-p99)
   - [RPS — Requests Per Second](#rps--requests-per-second)
   - [Throughput](#throughput)
   - [Success Rate & Failure Rate](#success-rate--failure-rate)
   - [Status Distribution](#status-distribution)
   - [Error Distribution](#error-distribution)
7. [Charts Explained](#7-charts-explained)
8. [Collections](#8-collections)
9. [Exporting Reports](#9-exporting-reports)
10. [Analytics](#10-analytics)
11. [Quick Reference Card](#11-quick-reference-card)

---

## 1. Getting Started

### Register & Log In

1. Open the app at **http://localhost:5173** (local dev) or **http://localhost** (Docker).
2. Click **Register** and create your account.
3. Log in — you'll land on the **Dashboard**.

### Dashboard Overview

```
┌─────────────────────────────────────────────────────┐
│  📊 Total Tests   ⚡ Running   ✅ Completed   ❌ Failed  │
├─────────────────────────────────────────────────────┤
│                   Recent Tests                      │
│  Name  │  URL  │  Status  │  RPS  │  P95  │  Date   │
└─────────────────────────────────────────────────────┘
```

The four stat cards at the top give you an instant health check of your testing activity.

---

## 2. Running Your First Load Test

Navigate to **New Test** in the sidebar.

### Step-by-step

**Step 1 — Enter the target URL**

```
https://api.example.com/users
```

**Step 2 — Choose the HTTP Method**

`GET` `POST` `PUT` `PATCH` `DELETE` — select from the dropdown.

**Step 3 — Set load parameters** (the *Config* tab)

| Field | What it does |
|---|---|
| Total Requests | How many HTTP requests to fire in total |
| Concurrency | How many requests run *simultaneously* |
| Timeout (ms) | Abort a single request after this many milliseconds |
| Delay (ms) | Wait this long between each request per worker |
| Retries | How many times to retry a failed request |

**Step 4 — Click "Run Test"**

The test starts immediately. You'll see the live monitor appear with a real-time progress bar, metrics, and log stream.

> 💡 **Tip:** Start with low concurrency (5–10) on unknown APIs to avoid overwhelming them.

---

## 3. Understanding the Test Configuration

### Concurrency vs. Total Requests

Think of **Total Requests** as the total workload and **Concurrency** as how many workers are doing that work at the same time.

```
Total Requests = 100
Concurrency    = 10
──────────────────────
→ 10 requests in-flight at any moment
→ When one finishes, the next starts
→ Test ends when all 100 are done
```

### Auth Tab

| Auth Type | When to use |
|---|---|
| **None** | Public endpoints |
| **Bearer Token** | JWT / OAuth APIs — paste your token |
| **Basic** | Username + Password (HTTP Basic Auth) |
| **API Key** | Custom header or query-string key |

### Body Tab

| Type | Use case |
|---|---|
| `none` | GET / DELETE with no body |
| `json` | REST APIs expecting `application/json` |
| `raw` | Custom text body |
| `form-data` | File uploads, HTML forms |

---

## 4. Reading the Live Monitor

While a test runs you'll see:

```
Progress ████████████░░░░░░░░  62%

  P50          P95          RPS          Errors
  45 ms       210 ms       38.4 /s       3 / 620
```

### Live Log (Terminal)

The scrolling terminal below shows every request outcome in real time:

```
[INFO]  Test started — 500 requests @ 20 concurrency → https://api.example.com
[INFO]  → 200  45ms
[INFO]  → 200  51ms
[WARN]  → 429  12ms  (rate limited)
[ERROR] → timeout after 5000ms
```

Color coding:
- 🟢 **Green** — `INFO` — successful requests
- 🟡 **Yellow** — `WARN` — client errors (4xx) or retries
- 🔴 **Red** — `ERROR` — server errors (5xx) or timeouts

---

## 5. Decoding Your Results

After the test completes you are taken to the **Test Results** page automatically.

### Metrics Grid

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│  Total   │Completed │  Failed  │  P50 ms  │  P95 ms  │  P99 ms  │
│   500    │   487    │   13     │   48 ms  │  212 ms  │  490 ms  │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│  Avg ms  │  Min ms  │  Max ms  │   RPS    │Throughput│ Success% │
│   72 ms  │   12 ms  │ 1200 ms  │  38.4/s  │ 4.1 KB/s │  97.4%   │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## 6. Metrics Glossary

### Latency Percentiles — P50, P75, P95, P99

Percentiles are the most important metric for understanding *real-world* API performance. They answer the question:

> *"What response time did X% of my users experience?"*

#### How percentiles work

Imagine you send 100 requests and sort all the response times from fastest to slowest:

```
Sorted response times (ms):
[12, 15, 18, 22, 25, 28, ... 95, 110, 145, 210, 480, 1200]
 └── fastest                                    slowest ──┘
```

| Percentile | Definition | Example above |
|---|---|---|
| **P50** | Half of requests were *faster* than this | 48 ms |
| **P75** | 75% of requests were faster than this | 95 ms |
| **P95** | 95% of requests were faster than this | 210 ms |
| **P99** | 99% of requests were faster than this | 480 ms |

#### Why not just use the average?

```
Average: 72 ms  ← looks fine!
P99:    480 ms  ← 1 in 100 users waited nearly half a second

Averages hide the pain of slow outliers.
Percentiles expose them.
```

#### Rules of thumb

| P50 | P95 | Health |
|---|---|---|
| < 100 ms | < 300 ms | ✅ Excellent |
| < 200 ms | < 800 ms | 🟡 Acceptable |
| < 500 ms | < 2000 ms | 🟠 Needs work |
| > 500 ms | > 2000 ms | 🔴 Critical |

> 💡 **P95 is the industry standard SLA metric.** Most SLAs are written as "95% of requests must respond within X ms."

---

### RPS — Requests Per Second

**RPS** (also written as **req/s**) measures how many HTTP requests your API handled per second during the test.

```
Total Requests = 500
Test Duration  = 13 seconds
────────────────────────────
RPS = 500 ÷ 13 = 38.4 req/s
```

#### What's a good RPS?

It depends entirely on your API, but here's a general guide:

| RPS | Scenario |
|---|---|
| 1–10 | Internal tools, admin panels |
| 10–100 | Small production APIs |
| 100–1 000 | Medium-scale web services |
| 1 000+ | High-traffic platforms |

> 💡 **High RPS with high P99 latency** = your API is processing requests but struggling under load. Time to optimise or scale.

---

### Throughput

**Throughput** measures the amount of *data* transferred per second (KB/s or MB/s).

```
Total data received = 4 200 KB
Test duration       = 13 s
──────────────────────────────
Throughput = 4 200 ÷ 13 = 323 KB/s
```

Low throughput with a high request count often means your responses are very small (typical for APIs returning JSON IDs or status codes). A sudden drop in throughput under load can indicate your server is starting to drop or truncate responses.

---

### Success Rate & Failure Rate

```
Success Rate = (Successful Requests ÷ Total Requests) × 100
Failure Rate = 100 − Success Rate
```

**Successful** = HTTP status `2xx`  
**Failed** = HTTP status `4xx` / `5xx`, network errors, or timeouts

#### What counts as a failure?

| Failure type | Example |
|---|---|
| Server error | `500 Internal Server Error` |
| Client error | `404 Not Found`, `429 Too Many Requests` |
| Network error | Connection refused, DNS failure |
| Timeout | Request exceeded your configured timeout |

> ⚠️ A `404` is counted as a failure. Make sure your test URL is correct before judging the success rate.

---

### Status Distribution

The **pie chart** and status distribution table break down every HTTP status code returned during the test.

```
200 OK         ████████████████████ 87%
201 Created    ████                  6%
429 Too Many   ██                    4%
500 Error      █                     3%
```

Common status codes to watch:

| Code | Meaning | Action |
|---|---|---|
| `200` | OK — everything worked | ✅ |
| `201` | Created — POST succeeded | ✅ |
| `400` | Bad Request — check your body/headers | 🔧 Fix config |
| `401` | Unauthorised — check your auth settings | 🔧 Fix auth |
| `404` | Not Found — check your URL | 🔧 Fix URL |
| `429` | Rate Limited — reduce concurrency | ⬇️ Lower concurrency |
| `500` | Server Error — the API is broken under load | 🔴 Investigate |
| `503` | Service Unavailable — server overwhelmed | 🔴 Scale up |

---

### Error Distribution

The **error bar chart** shows *why* requests failed, grouped by error message.

```
HTTP 500           ████████  8
timeout            ████      4
Connection refused ██        2
```

If you see **many timeouts**, your timeout setting may be too short *or* the server is genuinely slow.  
If you see **Connection refused**, the server is likely down or the URL is wrong.

---

## 7. Charts Explained

### Latency Over Time (Area Chart)

```
ms
400 │         ╭──╮
300 │    ╭────╯  ╰───╮        P99
200 │╭───╯            ╰────── P95
100 │─────────────────────── P50
    └────────────────────────→ time (s)
```

Shows how P50, P95, and P99 latency evolved *during* the test. A rising curve means the server is slowing down as load accumulates (a common sign of resource exhaustion).

### Requests Per Second (Line Chart)

Shows the actual RPS measured every second. Look for:
- **Flat line** → stable throughput ✅
- **Dropping line** → server struggling under load ⚠️
- **Spiky line** → inconsistent processing (GC pauses, lock contention) 🔧

### Status Distribution (Pie Chart)

Instantly shows the ratio of success vs. error responses. A healthy API should be almost entirely green (2xx).

### Response Time Distribution (Bar / Histogram)

```
Count
 80 │  ████
 60 │  ████ ████
 40 │  ████ ████ ████
 20 │  ████ ████ ████ ████       ██
    └──────────────────────────────→
    0  50  100  200  300  500  1200 ms
```

Groups all response times into buckets. A narrow, left-skewed histogram means consistent fast responses. A long tail to the right means some requests are much slower than others.

### Error Distribution (Horizontal Bar Chart)

Ranks error types by frequency — quickly see which error is causing the most failures.

---

## 8. Collections

Collections let you save and organise your API requests for reuse.

### Creating a Collection

1. Go to **Collections** in the sidebar.
2. Click **New Collection**, give it a name and optional description.
3. Click **Add Request** to save an API endpoint into it.

### Using a Collection

- Click any request in a collection to load its URL, method, headers, and body into the test form.
- Requests are grouped by **folders** — use folders to organise by service or domain.

### Import / Export

| Action | Format | Use case |
|---|---|---|
| **Export** | JSON | Share collections with teammates |
| **Import** | JSON | Load a shared collection |

---

## 9. Exporting Reports

On any completed **Test Results** page, click the export buttons:

| Format | Best for |
|---|---|
| **JSON** | Programmatic processing, CI/CD pipelines, storing raw data |
| **CSV** | Importing into Excel, Google Sheets, or BI tools |
| **PDF** | Sharing with stakeholders, archiving, presentations |

The PDF report includes all metrics, percentiles, and a summary table.

---

## 10. Analytics

The **Analytics** page gives you a bird's-eye view of all your tests.

- **Summary cards** — total tests run, average P95, overall success rate
- **Test history table** — sortable list with key metrics per test
- **Delete** — remove old test records you no longer need
- **Re-run** — click any test to open its config in the new test form

> 💡 Use the analytics page to compare tests over time. Run a test before and after a code deployment to see if performance improved.

---

## 11. Quick Reference Card

```
┌──────────────────────────────────────────────────────────────────┐
│                    METRIC QUICK REFERENCE                        │
├────────────┬─────────────────────────────────────────────────────┤
│  P50       │  Median response time — "typical" user experience   │
│  P95       │  95th percentile — SLA standard, catches slow reqs  │
│  P99       │  99th percentile — worst-case user experience       │
│  RPS       │  Requests per second — throughput of the API        │
│  Throughput│  Data transferred per second (KB/s)                 │
│  Success % │  % of requests that returned 2xx                    │
│  Failure % │  % of timeouts + errors + non-2xx responses         │
├────────────┴─────────────────────────────────────────────────────┤
│                    LATENCY TARGET GUIDE                          │
├──────────────────────────────┬───────────────────────────────────┤
│  P50 < 100 ms                │  ✅ Fast API                       │
│  P95 < 300 ms                │  ✅ Good for most production APIs   │
│  P99 < 1 000 ms              │  🟡 Acceptable tail latency         │
│  P99 > 1 000 ms              │  🔴 Investigate slow outliers       │
├──────────────────────────────┴───────────────────────────────────┤
│                    COMMON ISSUES & FIXES                         │
├──────────────────────────────┬───────────────────────────────────┤
│  429 Too Many Requests       │  Lower concurrency                 │
│  Many timeouts               │  Increase timeout or scale server  │
│  Rising P99 over time        │  Memory leak or resource exhaustion│
│  Low RPS despite high concur │  Server is bottlenecked            │
│  Success rate drops at scale │  API doesn't handle load — optimise│
└──────────────────────────────┴───────────────────────────────────┘
```

---

> **Need help?** Check the [README](./README.md) for setup instructions, API reference, and Docker/PM2 configuration.
