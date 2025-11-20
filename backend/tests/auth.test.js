// backend/tests/auth.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/index.js';
import User from '../src/models/user.model.js';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // Conectar a base de datos de test
    const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/vitrinex_test';
    await mongoose.connect(MONGODB_TEST_URI);
  });

  afterAll(async () => {
    // Limpiar y cerrar conexión
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('username', 'testuser');
      expect(res.body).toHaveProperty('email', 'test@example.com');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should fail with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail with duplicate email', async () => {
      // Crear usuario primero
      await User.create({
        username: 'existing',
        email: 'existing@example.com',
        password: 'password123'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario de prueba
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'logintest',
          email: 'login@example.com',
          password: 'password123'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('email', 'login@example.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(400);
    });

    it('should fail with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(404);
    });
  });
});
