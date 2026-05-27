import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';

let accessToken;
let collectionId;

const TEST_USER = {
    name: 'Collection Tester',
    email: `coll_${Date.now()}@example.com`,
    password: 'TestPass1!',
};

beforeAll(async () => {
    if (!process.env.MONGO_URI) {
        process.env.MONGO_URI = 'mongodb://localhost:27017/loadforge_test_collections';
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

describe('POST /api/v1/collections', () => {
    it('should create a collection', async () => {
        const res = await request(app)
            .post('/api/v1/collections')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'My APIs', description: 'Test collection' })
            .expect(201);

        expect(res.body.data.collection.name).toBe('My APIs');
        collectionId = res.body.data.collection._id;
    });
});

describe('GET /api/v1/collections', () => {
    it('should return list of collections', async () => {
        const res = await request(app)
            .get('/api/v1/collections')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    });
});

describe('GET /api/v1/collections/:id', () => {
    it('should return a specific collection', async () => {
        const res = await request(app)
            .get(`/api/v1/collections/${collectionId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);

        expect(res.body.data.collection._id).toBe(collectionId);
    });
});

describe('POST /api/v1/collections/:id/requests', () => {
    it('should add a request to the collection', async () => {
        const res = await request(app)
            .post(`/api/v1/collections/${collectionId}/requests`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'Health Check',
                url: 'https://api.example.com/health',
                method: 'GET',
            })
            .expect(201);

        expect(res.body.data.collection.requests.length).toBeGreaterThan(0);
    });
});

describe('PUT /api/v1/collections/:id', () => {
    it('should update a collection', async () => {
        const res = await request(app)
            .put(`/api/v1/collections/${collectionId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ name: 'Updated APIs' })
            .expect(200);

        expect(res.body.data.collection.name).toBe('Updated APIs');
    });
});

describe('DELETE /api/v1/collections/:id', () => {
    it('should delete a collection', async () => {
        await request(app)
            .delete(`/api/v1/collections/${collectionId}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
    });
});
