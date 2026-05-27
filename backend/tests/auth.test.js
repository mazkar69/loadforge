import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

const TEST_USER = {
    name: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'TestPass1!',
};

let accessToken;
let refreshToken;

beforeAll(async () => {
    if (!process.env.MONGO_URI) {
        process.env.MONGO_URI = 'mongodb://localhost:27017/loadforge_test';
    }
    const { connectDB } = await import('../src/config/db.js');
    await connectDB();
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.disconnect();
});

describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send(TEST_USER)
            .expect(201);

        expect(res.body.success).toBe(true);
        expect(res.body.data.user.email).toBe(TEST_USER.email);
        expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject duplicate email', async () => {
        await request(app).post('/api/v1/auth/register').send(TEST_USER).expect(409);
    });

    it('should reject weak password', async () => {
        await request(app)
            .post('/api/v1/auth/register')
            .send({ ...TEST_USER, email: 'other@x.com', password: '123' })
            .expect(400);
    });
});

describe('POST /api/v1/auth/login', () => {
    it('should login with correct credentials', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: TEST_USER.email, password: TEST_USER.password })
            .expect(200);

        expect(res.body.data.accessToken).toBeDefined();
        accessToken = res.body.data.accessToken;
        refreshToken = res.body.data.refreshToken;
    });

    it('should reject wrong password', async () => {
        await request(app)
            .post('/api/v1/auth/login')
            .send({ email: TEST_USER.email, password: 'WrongPass1!' })
            .expect(401);
    });
});

describe('GET /api/v1/auth/profile', () => {
    it('should return current user profile', async () => {
        const res = await request(app)
            .get('/api/v1/auth/profile')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.data.user.email).toBe(TEST_USER.email);
    });

    it('should reject unauthenticated request', async () => {
        await request(app).get('/api/v1/auth/profile').expect(401);
    });
});

describe('POST /api/v1/auth/refresh', () => {
    it('should issue a new access token', async () => {
        const res = await request(app)
            .post('/api/v1/auth/refresh')
            .send({ refreshToken })
            .expect(200);

        expect(res.body.data.accessToken).toBeDefined();
    });
});

describe('POST /api/v1/auth/logout', () => {
    it('should logout successfully', async () => {
        const res = await request(app)
            .post('/api/v1/auth/logout')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.success).toBe(true);
    });
});
