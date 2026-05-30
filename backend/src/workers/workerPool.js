/**
 * workerPool.js — Manages a pool of worker_threads for load testing.
 *
 * Divides the total requests across N workers, spawns them,
 * collects metrics, and supports cancellation.
 */

import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import path from 'path';
import { EventEmitter } from 'events';
import { computeMetrics, computeHistogram } from '../helpers/metrics.helper.js';
import logger from '../utils/logger.js';
import env from '../config/env.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKER_SCRIPT = path.join(__dirname, 'loadTestWorker.js');

export class WorkerPool extends EventEmitter {
    constructor(testConfig) {
        super();
        this.testConfig = testConfig;
        this.workers = [];
        this.aborted = false;
        this.allResults = [];
        this.completedWorkers = 0;
        this.totalCompleted = 0;
        this.startTime = null;
        this.snapshotInterval = null;
        this.timeSeries = [];
        this.lastSnapshot = { completed: 0, errors: 0 };
    }

    /**
     * Build per-request list from the test config.
     * Each "request" is a plain object describing what to fetch.
     */
    _buildRequestList() {
        const { url, method, headers, queryParams, body, bodyType, auth, config } = this.testConfig;
        const total = config.totalRequests;
        const req = { url, method, headers, queryParams, body, bodyType, auth };
        return Array.from({ length: total }, (_, i) => ({ ...req, _id: i }));
    }

    /**
     * Divide an array into N roughly-equal chunks.
     */
    _chunkArray(arr, n) {
        const chunks = [];
        const size = Math.ceil(arr.length / n);
        for (let i = 0; i < n; i++) {
            chunks.push(arr.slice(i * size, (i + 1) * size));
        }
        return chunks.filter((c) => c.length > 0);
    }

    /**
     * Start a time-series snapshot every second.
     */
    _startSnapshotTimer() {
        this.snapshotInterval = setInterval(() => {
            if (this.aborted) return;
            const now = Date.now();
            const elapsed = now - this.lastSnapshotTime;
            const newCompleted = this.totalCompleted - this.lastSnapshot.completed;
            const rps = elapsed > 0 ? parseFloat(((newCompleted / elapsed) * 1000).toFixed(2)) : 0;

            const recentResults = this.allResults.slice(this.lastSnapshot.completed);
            const errors = recentResults.filter((r) => !r.success).length;
            const latencies = recentResults.map((r) => r.latency).filter(Boolean);
            const avgLatency = latencies.length
                ? parseFloat((latencies.reduce((s, v) => s + v, 0) / latencies.length).toFixed(2))
                : 0;

            const snapshot = {
                timestamp: now - this.startTime,
                rps,
                avgLatency,
                errors,
                completed: this.totalCompleted,
            };

            this.timeSeries.push(snapshot);
            this.lastSnapshot = { completed: this.totalCompleted };
            this.lastSnapshotTime = now;

            this.emit('snapshot', snapshot);
        }, 1000);
    }

    /**
     * Start all workers and return a promise that resolves with final metrics.
     */
    async run() {
        const requests = this._buildRequestList();
        const numWorkers = Math.min(env.MAX_WORKERS, requests.length);
        const chunks = this._chunkArray(requests, numWorkers);

        this.startTime = Date.now();
        this.lastSnapshotTime = this.startTime;
        this._startSnapshotTimer();

        logger.info(`WorkerPool: spawning ${chunks.length} workers for ${requests.length} total requests`);

        const workerConfig = {
            concurrency: Math.ceil(this.testConfig.config.concurrency / chunks.length),
            timeout: this.testConfig.config.timeout,
            delay: this.testConfig.config.delay,
            retries: this.testConfig.config.retries,
        };

        return new Promise((resolve, reject) => {
            chunks.forEach((chunk, idx) => {
                const worker = new Worker(WORKER_SCRIPT, {
                    workerData: { requests: chunk, config: workerConfig, workerId: idx },
                });

                let workerFinished = false;
                this.workers.push(worker);

                const markWorkerFinished = () => {
                    if (workerFinished) return;
                    workerFinished = true;
                    this.completedWorkers++;
                    if (this.completedWorkers === this.workers.length) {
                        this._finish(resolve);
                    }
                };

                worker.on('message', (msg) => {
                    if (msg.type === 'progress') {
                        this.totalCompleted++;
                        this.allResults.push(msg.result);
                        this.emit('progress', {
                            completed: this.totalCompleted,
                            total: requests.length,
                            result: msg.result,
                        });
                    } else if (msg.type === 'done') {
                        markWorkerFinished();
                    } else if (msg.type === 'error') {
                        logger.error(`Worker ${idx} error: ${msg.error}`);
                        markWorkerFinished();
                    }
                });

                worker.on('error', (err) => {
                    logger.error(`Worker ${idx} threw: ${err.message}`);
                    markWorkerFinished();
                });

                worker.on('exit', (code) => {
                    if (code !== 0 && !workerFinished) {
                        logger.error(`Worker ${idx} exited unexpectedly with code ${code}`);
                    }
                    markWorkerFinished();
                });
            });
        });
    }

    _finish(resolve) {
        clearInterval(this.snapshotInterval);
        const durationMs = Date.now() - this.startTime;
        const metrics = computeMetrics(this.allResults, durationMs);
        const latencies = this.allResults.map((r) => r.latency).filter(Boolean);
        metrics.histogram = computeHistogram(latencies);
        metrics.timeSeries = this.timeSeries;
        this.emit('complete', metrics);
        resolve(metrics);
    }

    /**
     * Abort all running workers.
     */
    cancel() {
        this.aborted = true;
        clearInterval(this.snapshotInterval);
        this.workers.forEach((w) => {
            try {
                w.postMessage({ type: 'abort' });
                setTimeout(() => w.terminate(), 500);
            } catch { }
        });
        this.emit('cancelled');
    }
}
