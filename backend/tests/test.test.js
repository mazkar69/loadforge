import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

let accessToken;
let testRunId;

const TEST_USER = {
    name: 'Test Runner',
    email: `runner_${Date.now()}@example.com`,
    password: 'TestPass1!',
};

const TEST_CONFIG = {
    url: 'https://httpbin.org/get',
    method: 'GET',
    config: {
        totalRequests: 5,
        concurrency: 2,
        timeout: 10000,
    },
};

beforeAll(async () => {
    if (!process.env.MONGO_URI) {
        process.env.MONGO_URI = 'mongodb://localhost:27017/loadforge_test_runs';
    }
    const { connectDB } = await import('../src/config/db.js');
    await connectDB();

    const res = await request(app).post('/api/v1/auth/register').send(TEST_USER);
    accessToken = res.body.data?.accessToken;
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe('POST /api/v1/tests/run', () => {
    it('should create a test run and return testId', async () => {
        const res = await request(app)
            .post('/api/v1/tests/run')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(TEST_CONFIG)
            .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data.testId).toBeDefined();
        testRunId = res.body.data.testId;
    });

    it('should reject unauthenticated request', async () => {
        await request(app).post('/api/v1/tests/run').send(TEST_CONFIG).expect(401);
    });

    it('should validate required url field', async () => {
        await request(app)
            .post('/api/v1/tests/run')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ method: 'GET' })
            .expect(400);
    });
});

describe('GET /api/v1/tests', () => {
    it('should return paginated test list', async () => {
        const res = await request(app)
            .get('/api/v1/tests')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});

describe('GET /api/v1/tests/:id', () => {
    it('should return a specific test run', async () => {
        if (!testRunId) return;
        const res = await request(app)
            .get(`/api/v1/tests/${testRunId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.data.test._id).toBe(testRunId);
    });

    it('should return 404 for unknown id', async () => {
        await request(app)
            .get(`/api/v1/tests/${new mongoose.Types.ObjectId()}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(404);
    });
});

describe('DELETE /api/v1/tests/:id', () => {
    it('should delete a test run', async () => {
        if (!testRunId) return;
        await request(app)
            .delete(`/api/v1/tests/${testRunId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
    });
});
