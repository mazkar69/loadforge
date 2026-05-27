/**
 * loadTestWorker.js — Runs inside a worker_thread.
 *
 * Receives { requests, config, workerId } via workerData.
 * Executes requests with controlled concurrency using a semaphore pattern.
 * Reports progress back to the main thread via parentPort.postMessage.
 */

import { workerData, parentPort } from 'worker_threads';

const { requests, config, workerId } = workerData;
const {
    concurrency,
    timeout: timeoutMs,
    delay: delayMs,
    retries,
} = config;

const results = [];
let completedCount = 0;
let aborted = false;

// Listen for abort signal from main thread
parentPort.on('message', (msg) => {
    if (msg.type === 'abort') aborted = true;
});

/**
 * Build the fetch options from the request config.
 */
function buildFetchOptions(request) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers = {};
    if (request.headers) {
        const rawHeaders = request.headers instanceof Map
            ? Object.fromEntries(request.headers)
            : request.headers;
        Object.assign(headers, rawHeaders);
    }

    // Apply auth
    if (request.auth && request.auth.type !== 'none') {
        const auth = request.auth;
        if (auth.type === 'bearer' && auth.token) {
            headers['Authorization'] = `Bearer ${auth.token}`;
        } else if (auth.type === 'basic' && auth.username) {
            const encoded = Buffer.from(`${auth.username}:${auth.password || ''}`).toString('base64');
            headers['Authorization'] = `Basic ${encoded}`;
        } else if (auth.type === 'api-key' && auth.key && auth.value) {
            if (auth.addTo !== 'query') headers[auth.key] = auth.value;
        }
    }

    let body = undefined;
    if (request.bodyType === 'json' && request.body != null) {
        body = JSON.stringify(request.body);
        headers['Content-Type'] = 'application/json';
    } else if (request.bodyType === 'raw' && request.body != null) {
        body = String(request.body);
    }

    // Build URL with query params
    let url = request.url;
    const qp = request.queryParams
        ? (request.queryParams instanceof Map ? Object.fromEntries(request.queryParams) : request.queryParams)
        : {};

    // api-key in query
    if (request.auth?.type === 'api-key' && request.auth.addTo === 'query') {
        qp[request.auth.key] = request.auth.value;
    }

    if (Object.keys(qp).length) {
        const params = new URLSearchParams(qp);
        url += (url.includes('?') ? '&' : '?') + params.toString();
    }

    return { url, options: { method: request.method, headers, body, signal: controller.signal }, timer };
}

/**
 * Execute a single request, returning a result object.
 */
async function executeRequest(request, attemptNum = 0) {
    if (aborted) return { success: false, error: 'aborted', latency: 0, statusCode: null, size: 0, timedOut: false };

    const start = Date.now();
    const { url, options, timer } = buildFetchOptions(request);

    try {
        const response = await fetch(url, options);
        clearTimeout(timer);
        const latency = Date.now() - start;
        const text = await response.text().catch(() => '');
        const size = Buffer.byteLength(text, 'utf8');

        return {
            success: response.ok,
            statusCode: response.status,
            latency,
            size,
            error: response.ok ? null : `HTTP ${response.status}`,
            timedOut: false,
        };
    } catch (err) {
        clearTimeout(timer);
        const latency = Date.now() - start;
        const isTimeout = err.name === 'AbortError';

        if (!isTimeout && attemptNum < retries) {
            await new Promise((r) => setTimeout(r, 200 * (attemptNum + 1)));
            return executeRequest(request, attemptNum + 1);
        }

        return {
            success: false,
            statusCode: null,
            latency,
            size: 0,
            error: isTimeout ? 'timeout' : (err.message || 'network error'),
            timedOut: isTimeout,
        };
    }
}

/**
 * Run all requests with controlled concurrency (semaphore pattern).
 */
async function run() {
    const semaphore = { count: 0 };

    const runWithSlot = async (request) => {
        while (semaphore.count >= concurrency) {
            await new Promise((r) => setTimeout(r, 5));
        }
        if (aborted) return;
        semaphore.count++;

        const result = await executeRequest(request);
        results.push(result);
        completedCount++;
        semaphore.count--;

        parentPort.postMessage({
            type: 'progress',
            workerId,
            completed: completedCount,
            total: requests.length,
            result,
        });

        if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    };

    // Launch all tasks without waiting (semaphore controls actual concurrency)
    await Promise.all(requests.map((req) => runWithSlot(req)));

    parentPort.postMessage({ type: 'done', workerId, results });
}

run().catch((err) => {
    parentPort.postMessage({ type: 'error', workerId, error: err.message });
});
