import mongoose from 'mongoose';
import { TEST_STATUS, REQUEST_METHODS } from '../constants/index.js';

const metricsSchema = new mongoose.Schema(
    {
        total: { type: Number, default: 0 },
        successful: { type: Number, default: 0 },
        failed: { type: Number, default: 0 },
        timedOut: { type: Number, default: 0 },
        successRate: { type: Number, default: 0 },
        failureRate: { type: Number, default: 0 },
        requestsPerSecond: { type: Number, default: 0 },
        avgLatency: { type: Number, default: 0 },
        minLatency: { type: Number, default: 0 },
        maxLatency: { type: Number, default: 0 },
        medianLatency: { type: Number, default: 0 },
        p50: { type: Number, default: 0 },
        p95: { type: Number, default: 0 },
        p99: { type: Number, default: 0 },
        throughputKBps: { type: Number, default: 0 },
        totalBytes: { type: Number, default: 0 },
        statusDistribution: { type: Map, of: Number, default: {} },
        errorDistribution: { type: Map, of: Number, default: {} },
        durationMs: { type: Number, default: 0 },
        // Time-series snapshots for charts (sampled every second during the test)
        timeSeries: [
            {
                timestamp: Number,
                rps: Number,
                avgLatency: Number,
                errors: Number,
                completed: Number,
            },
        ],
        histogram: [
            {
                range: String,
                count: Number,
            },
        ],
    },
    { _id: false }
);

const testRunSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        name: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        url: {
            type: String,
            required: true,
            trim: true,
        },
        method: {
            type: String,
            enum: REQUEST_METHODS,
            required: true,
            uppercase: true,
        },
        headers: {
            type: Map,
            of: String,
            default: {},
        },
        queryParams: {
            type: Map,
            of: String,
            default: {},
        },
        body: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        bodyType: {
            type: String,
            enum: ['none', 'json', 'raw', 'form-data'],
            default: 'none',
        },
        auth: {
            type: { type: String, enum: ['none', 'bearer', 'basic', 'api-key'], default: 'none' },
            token: String,
            username: String,
            password: String,
            key: String,
            value: String,
            addTo: { type: String, enum: ['header', 'query'], default: 'header' },
        },
        // Load test config
        config: {
            totalRequests: { type: Number, required: true },
            concurrency: { type: Number, required: true },
            duration: { type: Number, default: 0 }, // seconds; 0 = use totalRequests
            timeout: { type: Number, default: 10000 },
            delay: { type: Number, default: 0 },
            retries: { type: Number, default: 0 },
        },
        status: {
            type: String,
            enum: Object.values(TEST_STATUS),
            default: TEST_STATUS.PENDING,
            index: true,
        },
        metrics: {
            type: metricsSchema,
            default: null,
        },
        logs: [
            {
                timestamp: { type: Number },
                level: { type: String, enum: ['info', 'warn', 'error'] },
                message: { type: String },
            },
        ],
        startedAt: Date,
        completedAt: Date,
    },
    { timestamps: true }
);

testRunSchema.index({ userId: 1, createdAt: -1 });

const TestRun = mongoose.model('TestRun', testRunSchema);
export default TestRun;
