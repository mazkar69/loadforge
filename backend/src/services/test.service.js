import TestRun from '../models/TestRun.model.js';
import { WorkerPool } from '../workers/workerPool.js';
import { TEST_STATUS, HTTP_STATUS } from '../constants/index.js';
import { parsePaginationParams, buildPagination } from '../helpers/pagination.helper.js';
import logger from '../utils/logger.js';

// Map of testId -> WorkerPool instance (for running tests)
const runningTests = new Map();

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}

/**
 * Run an already-created TestRun document through the worker pool.
 * Called asynchronously AFTER the HTTP response is sent.
 *
 * @param {string} testId - existing TestRun _id
 * @param {object} testConfig - the full config from the TestRun document
 * @param {Function} emit - (event, data) => void
 */
export const runTestById = async (testId, testConfig, emit) => {
    const logs = [];

    const log = (level, message) => {
        const entry = { timestamp: Date.now(), level, message };
        logs.push(entry);
        if (logs.length > 500) logs.shift();
        emit('test:log', { testId, ...entry });
    };

    try {
        await TestRun.findByIdAndUpdate(testId, {
            status: TEST_STATUS.RUNNING,
            startedAt: new Date(),
        });

        const pool = new WorkerPool(testConfig);
        runningTests.set(testId, pool);

        log('info', `Test started — ${testConfig.config.totalRequests} requests @ ${testConfig.config.concurrency} concurrency → ${testConfig.url}`);

        pool.on('progress', ({ completed, total, result }) => {
            emit('test:progress', {
                testId,
                completed,
                total,
                percent: Math.round((completed / total) * 100),
                lastResult: result,
            });
        });

        pool.on('snapshot', (snapshot) => {
            emit('test:metrics', { testId, snapshot });
        });

        pool.on('cancelled', () => {
            log('warn', 'Test was cancelled by user');
        });

        const metrics = await pool.run();

        runningTests.delete(testId);

        const finalLogs = logs.slice(-200);
        await TestRun.findByIdAndUpdate(testId, {
            status: TEST_STATUS.COMPLETED,
            metrics,
            logs: finalLogs,
            completedAt: new Date(),
        });

        log('info', `Completed — ${metrics.successful}/${metrics.total} succeeded (${metrics.successRate}% success)`);
        emit('test:complete', { testId, metrics });
    } catch (err) {
        runningTests.delete(testId);
        logger.error('Test run failed', { testId, error: err.message });

        await TestRun.findByIdAndUpdate(testId, {
            status: TEST_STATUS.FAILED,
            completedAt: new Date(),
        }).catch(() => { });

        emit('test:error', { testId, error: err.message });
    }
};

export const cancelTest = async (testId, userId) => {
    const testRun = await TestRun.findOne({ _id: testId, userId });
    if (!testRun) throw new AppError('Test not found', HTTP_STATUS.NOT_FOUND);
    if (testRun.status !== TEST_STATUS.RUNNING) {
        throw new AppError('Test is not running', HTTP_STATUS.BAD_REQUEST);
    }

    const pool = runningTests.get(testId);
    if (pool) {
        pool.cancel();
        runningTests.delete(testId);
    }

    await TestRun.findByIdAndUpdate(testId, {
        status: TEST_STATUS.CANCELLED,
        completedAt: new Date(),
    });

    return { testId, status: TEST_STATUS.CANCELLED };
};

export const getTests = async (userId, query) => {
    const { page, limit, skip } = parsePaginationParams(query);
    const filter = { userId };
    if (query.status) filter.status = query.status;

    const [tests, total] = await Promise.all([
        TestRun.find(filter)
            .select('-metrics.timeSeries -metrics.histogram -logs')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        TestRun.countDocuments(filter),
    ]);

    return { tests, pagination: buildPagination(page, limit, total) };
};

export const getTestById = async (testId, userId) => {
    const test = await TestRun.findOne({ _id: testId, userId }).lean();
    if (!test) throw new AppError('Test not found', HTTP_STATUS.NOT_FOUND);
    return test;
};

export const deleteTest = async (testId, userId) => {
    const test = await TestRun.findOneAndDelete({ _id: testId, userId });
    if (!test) throw new AppError('Test not found', HTTP_STATUS.NOT_FOUND);
    return { testId };
};

export const isTestRunning = (testId) => runningTests.has(testId);
