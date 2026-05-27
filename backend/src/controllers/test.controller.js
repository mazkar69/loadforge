import TestRun from '../models/TestRun.model.js';
import * as testService from '../services/test.service.js';
import { getEmitter } from '../sockets/testSocket.js';
import { sendSuccess, sendPaginated } from '../utils/responseHandler.js';
import { HTTP_STATUS, TEST_STATUS } from '../constants/index.js';

export const startTest = async (req, res, next) => {
    try {
        const testConfig = req.body;
        const userId = req.user._id;

        // 1. Create the DB document synchronously to get a testId immediately
        const testRun = await TestRun.create({
            ...testConfig,
            userId,
            status: TEST_STATUS.PENDING,
        });
        const testId = testRun._id.toString();

        // 2. Respond immediately with the testId so the client can subscribe via Socket.IO
        sendSuccess(res, 'Test started', { testId }, HTTP_STATUS.CREATED);

        // 3. Run the worker pool asynchronously (fire-and-forget)
        const emit = getEmitter(testId);
        testService.runTestById(testId, testConfig, emit);
    } catch (err) {
        next(err);
    }
};

export const cancelTest = async (req, res, next) => {
    try {
        const result = await testService.cancelTest(req.params.id, req.user._id);
        sendSuccess(res, 'Test cancelled', result);
    } catch (err) {
        next(err);
    }
};

export const getTests = async (req, res, next) => {
    try {
        const { tests, pagination } = await testService.getTests(req.user._id, req.query);
        sendPaginated(res, 'Tests fetched', tests, pagination);
    } catch (err) {
        next(err);
    }
};

export const getTestById = async (req, res, next) => {
    try {
        const test = await testService.getTestById(req.params.id, req.user._id);
        sendSuccess(res, 'Test fetched', { test });
    } catch (err) {
        next(err);
    }
};

export const deleteTest = async (req, res, next) => {
    try {
        await testService.deleteTest(req.params.id, req.user._id);
        sendSuccess(res, 'Test deleted');
    } catch (err) {
        next(err);
    }
};
