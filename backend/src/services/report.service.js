import TestRun from '../models/TestRun.model.js';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';
import { HTTP_STATUS } from '../constants/index.js';

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

const getTestOrThrow = async (testId, userId) => {
    const test = await TestRun.findOne({ _id: testId, userId }).lean();
    if (!test) throw new AppError('Test not found', HTTP_STATUS.NOT_FOUND);
    if (!test.metrics) throw new AppError('Test has no metrics yet', HTTP_STATUS.BAD_REQUEST);
    return test;
};

export const generateJSON = async (testId, userId) => {
    return getTestOrThrow(testId, userId);
};

export const generateCSV = async (testId, userId) => {
    const test = await getTestOrThrow(testId, userId);
    const { metrics } = test;

    const summary = [
        {
            testId: test._id,
            url: test.url,
            method: test.method,
            status: test.status,
            createdAt: test.createdAt,
            totalRequests: metrics.total,
            successful: metrics.successful,
            failed: metrics.failed,
            timedOut: metrics.timedOut,
            successRate: metrics.successRate,
            failureRate: metrics.failureRate,
            avgLatency: metrics.avgLatency,
            minLatency: metrics.minLatency,
            maxLatency: metrics.maxLatency,
            p50: metrics.p50,
            p95: metrics.p95,
            p99: metrics.p99,
            requestsPerSecond: metrics.requestsPerSecond,
            throughputKBps: metrics.throughputKBps,
            durationMs: metrics.durationMs,
        },
    ];

    const parser = new Parser();
    return parser.parse(summary);
};

export const generatePDF = async (testId, userId, res) => {
    const test = await getTestOrThrow(testId, userId);
    const { metrics } = test;

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text('API Load Test Report', { align: 'center' });
    doc.moveDown();

    // Test info
    doc.fontSize(12).font('Helvetica-Bold').text('Test Configuration');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Test ID: ${test._id}`);
    doc.text(`URL: ${test.url}`);
    doc.text(`Method: ${test.method}`);
    doc.text(`Status: ${test.status}`);
    doc.text(`Date: ${new Date(test.createdAt).toLocaleString()}`);
    doc.text(`Concurrency: ${test.config?.concurrency}`);
    doc.text(`Total Requests: ${test.config?.totalRequests}`);
    doc.moveDown();

    // Metrics summary
    doc.fontSize(12).font('Helvetica-Bold').text('Performance Metrics');
    doc.font('Helvetica').fontSize(10);

    const rows = [
        ['Total Requests', metrics.total],
        ['Successful', `${metrics.successful} (${metrics.successRate}%)`],
        ['Failed', `${metrics.failed + metrics.timedOut} (${metrics.failureRate}%)`],
        ['Avg Latency', `${metrics.avgLatency} ms`],
        ['Min Latency', `${metrics.minLatency} ms`],
        ['Max Latency', `${metrics.maxLatency} ms`],
        ['P50 Latency', `${metrics.p50} ms`],
        ['P95 Latency', `${metrics.p95} ms`],
        ['P99 Latency', `${metrics.p99} ms`],
        ['Requests/sec', metrics.requestsPerSecond],
        ['Throughput', `${metrics.throughputKBps} KB/s`],
        ['Duration', `${(metrics.durationMs / 1000).toFixed(2)} s`],
    ];

    rows.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`);
    });

    doc.moveDown();

    // Status distribution
    if (metrics.statusDistribution && Object.keys(metrics.statusDistribution).length) {
        doc.fontSize(12).font('Helvetica-Bold').text('Status Code Distribution');
        doc.font('Helvetica').fontSize(10);
        const statusDist = metrics.statusDistribution instanceof Map
            ? Object.fromEntries(metrics.statusDistribution)
            : metrics.statusDistribution;
        Object.entries(statusDist).forEach(([code, count]) => {
            doc.text(`  ${code}: ${count} requests`);
        });
        doc.moveDown();
    }

    // Error distribution
    if (metrics.errorDistribution && Object.keys(metrics.errorDistribution).length) {
        doc.fontSize(12).font('Helvetica-Bold').text('Error Distribution');
        doc.font('Helvetica').fontSize(10);
        const errDist = metrics.errorDistribution instanceof Map
            ? Object.fromEntries(metrics.errorDistribution)
            : metrics.errorDistribution;
        Object.entries(errDist).forEach(([err, count]) => {
            doc.text(`  ${err}: ${count}`);
        });
    }

    doc.end();
};
