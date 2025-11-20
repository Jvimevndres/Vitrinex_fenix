// backend/tests/stores.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import User from '../src/models/user.model.js';
import Store from '../src/models/store.model.js';

describe('Store Endpoints', () => {
  let authToken;
  let userId;
  let storeId;

  beforeAll(async () => {
    const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/vitrinex_test';
    await mongoose.connect(MONGODB_TEST_URI);

    // Crear usuario de prueba y obtener token
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'storeowner',
        email: 'owner@example.com',
        password: 'password123'
      });

    userId = registerRes.body._id;
    
    // Obtener token de las cookies
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'owner@example.com',
        password: 'password123'
      });

    const cookies = loginRes.headers['set-cookie'];
    authToken = cookies[0].split(';')[0].split('=')[1];
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Store.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/stores', () => {
    it('should create a new store', async () => {
      const res = await request(app)
        .post('/api/stores')
        .set('Cookie', [`token=${authToken}`])
        .send({
          name: 'Test Store',
          description: 'A test store',
          mode: 'products',
          comuna: 'Santiago',
          tipoNegocio: 'Retail'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Test Store');
      storeId = res.body._id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/stores')
        .send({
          name: 'Unauthorized Store'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/stores', () => {
    it('should get all stores', async () => {
      const res = await request(app).get('/api/stores');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/stores/:id', () => {
    it('should get a store by id', async () => {
      const res = await request(app).get(`/api/stores/${storeId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(storeId);
      expect(res.body.name).toBe('Test Store');
    });

    it('should return 404 for non-existent store', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/stores/${fakeId}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/stores/:id', () => {
    it('should update a store', async () => {
      const res = await request(app)
        .put(`/api/stores/${storeId}`)
        .set('Cookie', [`token=${authToken}`])
        .send({
          name: 'Updated Store Name',
          description: 'Updated description'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Store Name');
    });

    it('should fail to update without authentication', async () => {
      const res = await request(app)
        .put(`/api/stores/${storeId}`)
        .send({
          name: 'Unauthorized Update'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('DELETE /api/stores/:id', () => {
    it('should delete a store', async () => {
      const res = await request(app)
        .delete(`/api/stores/${storeId}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('eliminada');
    });

    it('should return 404 when deleting non-existent store', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/stores/${fakeId}`)
        .set('Cookie', [`token=${authToken}`]);

      expect(res.statusCode).toBe(404);
    });
  });
});
