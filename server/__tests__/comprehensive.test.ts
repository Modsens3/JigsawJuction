import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import { db } from '../db';
import { authUsers, puzzleOrders, cartItems } from '../../shared/schema';

describe('Comprehensive System Tests', () => {
  let app: express.Express;
  let authToken: string;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
    
    // Clean test database
    await db.run('DELETE FROM auth_users WHERE email LIKE ?', ['test%@test.com']);
    await db.run('DELETE FROM puzzle_orders WHERE user_id IN (SELECT id FROM auth_users WHERE email LIKE ?)', ['test%@test.com']);
    await db.run('DELETE FROM cart_items WHERE user_id IN (SELECT id FROM auth_users WHERE email LIKE ?)', ['test%@test.com']);
  });

  afterAll(async () => {
    // Cleanup
    await db.run('DELETE FROM auth_users WHERE email LIKE ?', ['test%@test.com']);
  });

  describe('Authentication System', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'testuser@test.com',
          password: 'test123',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      authToken = response.body.token;
    });

    it('should login user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@test.com',
          password: 'test123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it('should login admin successfully', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      adminToken = response.body.token;
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Predefined Puzzles System', () => {
    it('should return all predefined puzzles', async () => {
      const response = await request(app)
        .get('/api/predefined-puzzles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('type');
      expect(response.body[0]).toHaveProperty('difficulty');
    });

    it('should filter puzzles by type and difficulty', async () => {
      const response = await request(app)
        .get('/api/predefined-puzzles?type=round&difficulty=easy');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((puzzle: any) => {
        expect(puzzle.type).toBe('round');
        expect(puzzle.difficulty).toBe('easy');
      });
    });

    it('should return puzzle types and difficulties', async () => {
      const response = await request(app)
        .get('/api/predefined-puzzles/types');

      expect(response.status).toBe(200);
      expect(response.body.types).toBeDefined();
      expect(response.body.difficulties).toBeDefined();
      expect(Object.keys(response.body.types).length).toBeGreaterThan(0);
      expect(Object.keys(response.body.difficulties).length).toBeGreaterThan(0);
    });
  });

  describe('Shopping Cart System', () => {
    it('should add item to cart', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'round-easy-1',
          quantity: 2
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should get cart items', async () => {
      const response = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should update cart item quantity', async () => {
      const response = await request(app)
        .put('/api/cart/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'round-easy-1',
          quantity: 3
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should remove item from cart', async () => {
      const response = await request(app)
        .delete('/api/cart/remove')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'round-easy-1'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Order System', () => {
    it('should create order successfully', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{
            productId: 'round-easy-1',
            quantity: 1,
            price: 25
          }],
          totalPrice: 25,
          shippingAddress: {
            street: 'Test Street',
            city: 'Test City',
            postalCode: '12345',
            country: 'Greece'
          }
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBeDefined();
      expect(response.body.orderId).toBeDefined();
    });

    it('should get user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Admin System', () => {
    it('should get all orders (admin only)', async () => {
      const response = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should get analytics overview (admin only)', async () => {
      const response = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalOrders');
      expect(response.body).toHaveProperty('totalRevenue');
      expect(response.body).toHaveProperty('totalUsers');
    });
  });

  describe('Health and Performance', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.checks).toBeDefined();
      expect(response.body.checks.database.status).toBe('healthy');
      expect(response.body.checks.memory.status).toBe('healthy');
    });

    it('should handle memory cleanup', async () => {
      const response = await request(app)
        .post('/api/memory-cleanup')
        .set('Content-Type', 'application/json')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.freed).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });

    it('should handle unauthorized access', async () => {
      const response = await request(app)
        .get('/api/admin/orders');

      expect(response.status).toBe(401);
    });

    it('should handle invalid input', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
    });
  });
});
