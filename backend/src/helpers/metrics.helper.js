/**
 * Compute percentile value from a sorted array of numbers.
 * @param {number[]} sortedArr - sorted numeric array
 * @param {number} p - percentile 0-100
 */
export const percentile = (sortedArr, p) => {
    if (!sortedArr.length) return 0;
    const idx = Math.ceil((p / 100) * sortedArr.length) - 1;
    return sortedArr[Math.max(0, idx)];
};

/**
 * Aggregate raw per-request results into a metrics summary.
 * @param {Array<{latency: number, statusCode: number, error: string|null, size: number, success: boolean}>} results
 * @param {number} durationMs - total test duration in milliseconds
 */
export const computeMetrics = (results, durationMs) => {
    const total = results.length;
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success && !r.timedOut).length;
    const timedOut = results.filter((r) => r.timedOut).length;

    const latencies = results
        .filter((r) => r.latency != null)
        .map((r) => r.latency)
        .sort((a, b) => a - b);

    const avgLatency = latencies.length ? latencies.reduce((s, v) => s + v, 0) / latencies.length : 0;
    const minLatency = latencies.length ? latencies[0] : 0;
    const maxLatency = latencies.length ? latencies[latencies.length - 1] : 0;
    const medianLatency = percentile(latencies, 50);
    const p50 = percentile(latencies, 50);
    const p95 = percentile(latencies, 95);
    const p99 = percentile(latencies, 99);

    const durationSec = durationMs / 1000 || 1;
    const requestsPerSecond = parseFloat((total / durationSec).toFixed(2));

    const totalBytes = results.reduce((s, r) => s + (r.size || 0), 0);
    const throughputKBps = parseFloat((totalBytes / 1024 / durationSec).toFixed(2));

    // Status code distribution
    const statusDistribution = {};
    results.forEach((r) => {
        if (r.statusCode) {
            const key = String(r.statusCode);
            statusDistribution[key] = (statusDistribution[key] || 0) + 1;
        }
    });

    // Error distribution
    const errorDistribution = {};
    results.filter((r) => r.error).forEach((r) => {
        const key = r.error;
        errorDistribution[key] = (errorDistribution[key] || 0) + 1;
    });

    return {
        total,
        successful,
        failed,
        timedOut,
        successRate: total ? parseFloat(((successful / total) * 100).toFixed(2)) : 0,
        failureRate: total ? parseFloat((((failed + timedOut) / total) * 100).toFixed(2)) : 0,
        requestsPerSecond,
        avgLatency: parseFloat(avgLatency.toFixed(2)),
        minLatency: parseFloat(minLatency.toFixed(2)),
        maxLatency: parseFloat(maxLatency.toFixed(2)),
        medianLatency: parseFloat(medianLatency.toFixed(2)),
        p50: parseFloat(p50.toFixed(2)),
        p95: parseFloat(p95.toFixed(2)),
        p99: parseFloat(p99.toFixed(2)),
        throughputKBps,
        totalBytes,
        statusDistribution,
        errorDistribution,
        durationMs,
    };
};

/**
 * Compute latency histogram buckets for response time distribution chart.
 * @param {number[]} latencies
 * @param {number} buckets
 */
export const computeHistogram = (latencies, buckets = 10) => {
    if (!latencies.length) return [];
    const min = Math.min(...latencies);
    const max = Math.max(...latencies);
    const range = max - min || 1;
    const bucketSize = range / buckets;

    const histogram = Array.from({ length: buckets }, (_, i) => ({
        range: `${Math.round(min + i * bucketSize)}-${Math.round(min + (i + 1) * bucketSize)}ms`,
        count: 0,
    }));

    latencies.forEach((l) => {
        const idx = Math.min(Math.floor((l - min) / bucketSize), buckets - 1);
        histogram[idx].count++;
    });

    return histogram;
};
