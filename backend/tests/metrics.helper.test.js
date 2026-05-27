import { percentile, computeMetrics, computeHistogram } from '../src/helpers/metrics.helper.js';

describe('percentile()', () => {
    // 100-element array ensures p50/p95/p99 map to exact values
    const sorted = Array.from({ length: 100 }, (_, i) => i + 1); // [1..100]

    it('should return p50 (median)', () => {
        expect(percentile(sorted, 50)).toBe(50);
    });

    it('should return p95', () => {
        expect(percentile(sorted, 95)).toBe(95);
    });

    it('should return p99', () => {
        expect(percentile(sorted, 99)).toBe(99);
    });

    it('should return 0 for empty array', () => {
        expect(percentile([], 50)).toBe(0);
    });

    it('should return single value for single-element array', () => {
        expect(percentile([42], 50)).toBe(42);
    });
});

describe('computeMetrics()', () => {
    const samples = [
        { latency: 100, statusCode: 200, size: 1024, success: true, timedOut: false, error: null },
        { latency: 200, statusCode: 200, size: 2048, success: true, timedOut: false, error: null },
        { latency: 150, statusCode: 201, size: 512, success: true, timedOut: false, error: null },
        { latency: 50, statusCode: 404, size: 128, success: false, timedOut: false, error: 'HTTP 404' },
        { latency: 500, statusCode: 500, size: 256, success: false, timedOut: false, error: 'HTTP 500' },
    ];

    let metrics;
    beforeAll(() => {
        metrics = computeMetrics(samples, 10000); // 10 000 ms = 10 s
    });

    it('should count total requests', () => {
        expect(metrics.total).toBe(5);
    });

    it('should count successful requests (2xx)', () => {
        expect(metrics.successful).toBe(3);
    });

    it('should count failed requests', () => {
        expect(metrics.failed).toBe(2);
    });

    it('should compute avgLatency', () => {
        expect(metrics.avgLatency).toBe(200);
    });

    it('should compute minLatency', () => {
        expect(metrics.minLatency).toBe(50);
    });

    it('should compute maxLatency', () => {
        expect(metrics.maxLatency).toBe(500);
    });

    it('should compute p50', () => {
        expect(metrics.p50).toBeDefined();
    });

    it('should compute p95', () => {
        expect(metrics.p95).toBeDefined();
    });

    it('should compute p99', () => {
        expect(metrics.p99).toBeDefined();
    });

    it('should compute requestsPerSecond', () => {
        expect(metrics.requestsPerSecond).toBe(0.5); // 5 / 10s
    });

    it('should record status codes in statusDistribution', () => {
        expect(metrics.statusDistribution['200']).toBe(2);
        expect(metrics.statusDistribution['201']).toBe(1);
        expect(metrics.statusDistribution['404']).toBe(1);
    });
});

describe('computeHistogram()', () => {
    it('should produce histogram buckets', () => {
        const latencies = [5, 15, 60, 120, 350, 750, 1200];
        const hist = computeHistogram(latencies);
        expect(Array.isArray(hist)).toBe(true);
        expect(hist.length).toBeGreaterThan(0);
        hist.forEach((b) => {
            expect(b).toHaveProperty('range');
            expect(b).toHaveProperty('count');
        });
    });

    it('should return empty array for no latencies', () => {
        expect(computeHistogram([])).toEqual([]);
    });
});
