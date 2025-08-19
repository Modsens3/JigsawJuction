import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../routes';
import { db } from '../db';
import { authUsers, puzzleOrders, cartItems } from '../../shared/schema';

describe('Integration Tests', () => {
  let authToken: string;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    // Clean test database
    await db.run('DELETE FROM auth_users WHERE email LIKE ?', ['test%@test.com']);
    await db.run('DELETE FROM puzzle_orders WHERE user_id IN (SELECT id FROM auth_users WHERE email LIKE ?)', ['test%@test.com']);
    await db.run('DELETE FROM cart_items WHERE user_id IN (SELECT id FROM auth_users WHERE email LIKE ?)', ['test%@test.com']);
  });

  afterAll(async () => {
    // Cleanup
    await db.run('DELETE FROM auth_users WHERE email LIKE ?', ['test%@test.com']);
  });

  describe('User Authentication Flow', () => {
    it('should complete full user registration and login flow', async () => {
      // 1. Register new user
      const registerResponse = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'testuser@test.com',
          password: 'test123',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.success).toBe(true);
      expect(registerResponse.body.token).toBeDefined();

      authToken = registerResponse.body.token;
      userId = registerResponse.body.user.id;

      // 2. Login with same credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@test.com',
          password: 'test123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.token).toBeDefined();
    });

    it('should handle admin authentication', async () => {
      const response = await request(app)
        .post('/api/auth/admin/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      adminToken = response.body.token;
    });
  });

  describe('Puzzle System Flow', () => {
    it('should complete full puzzle selection and cart flow', async () => {
      // 1. Get predefined puzzles
      const puzzlesResponse = await request(app)
        .get('/api/predefined-puzzles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(puzzlesResponse.status).toBe(200);
      expect(Array.isArray(puzzlesResponse.body)).toBe(true);
      expect(puzzlesResponse.body.length).toBeGreaterThan(0);

      const puzzle = puzzlesResponse.body[0];

      // 2. Add to cart
      const cartResponse = await request(app)
        .post('/api/cart/add')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: puzzle.id,
          quantity: 1
        });

      expect(cartResponse.status).toBe(200);
      expect(cartResponse.body.success).toBe(true);

      // 3. Get cart
      const getCartResponse = await request(app)
        .get('/api/cart')
        .set('Authorization', `Bearer ${authToken}`);

      expect(getCartResponse.status).toBe(200);
      expect(Array.isArray(getCartResponse.body)).toBe(true);
      expect(getCartResponse.body.length).toBeGreaterThan(0);
    });

    it('should handle puzzle filtering and search', async () => {
      // Test filtering by type
      const roundPuzzles = await request(app)
        .get('/api/predefined-puzzles?type=round')
        .set('Authorization', `Bearer ${authToken}`);

      expect(roundPuzzles.status).toBe(200);
      roundPuzzles.body.forEach((puzzle: any) => {
        expect(puzzle.type).toBe('round');
      });

      // Test filtering by difficulty
      const easyPuzzles = await request(app)
        .get('/api/predefined-puzzles?difficulty=easy')
        .set('Authorization', `Bearer ${authToken}`);

      expect(easyPuzzles.status).toBe(200);
      easyPuzzles.body.forEach((puzzle: any) => {
        expect(puzzle.difficulty).toBe('easy');
      });
    });
  });

  describe('Order Management Flow', () => {
    it('should complete full order creation and tracking flow', async () => {
      // 1. Create order
      const orderResponse = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{
            name: 'Test Puzzle',
            price: 25,
            quantity: 1,
            material: 'paper',
            size: '20x30',
            image: 'test-image.jpg'
          }],
          totalPrice: 25,
          shippingAddress: {
            street: 'Test Street',
            city: 'Test City',
            postalCode: '12345',
            country: 'Greece'
          },
          paymentMethod: 'card'
        });

      expect(orderResponse.status).toBe(201);
      expect(orderResponse.body.orderId).toBeDefined();

      const orderId = orderResponse.body.orderId;

      // 2. Get order details
      const orderDetailsResponse = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(orderDetailsResponse.status).toBe(200);
      expect(orderDetailsResponse.body.id).toBe(orderId);

      // 3. Get user orders
      const userOrdersResponse = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(userOrdersResponse.status).toBe(200);
      expect(Array.isArray(userOrdersResponse.body)).toBe(true);
      expect(userOrdersResponse.body.length).toBeGreaterThan(0);
    });
  });

  describe('Admin Panel Flow', () => {
    it('should handle admin operations', async () => {
      // 1. Get all orders (admin)
      const adminOrdersResponse = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminOrdersResponse.status).toBe(200);
      expect(Array.isArray(adminOrdersResponse.body)).toBe(true);

      // 2. Get analytics
      const analyticsResponse = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(analyticsResponse.status).toBe(200);
      expect(analyticsResponse.body.totalOrders).toBeDefined();
      expect(analyticsResponse.body.totalUsers).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid authentication gracefully', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@test.com'
          // Missing password, firstName, lastName
        });

      expect(response.status).toBe(400);
    });

    it('should handle duplicate email registration', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'testuser@test.com', // Already exists
          password: 'test123',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(409);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent requests', async () => {
      const promises = Array(10).fill(null).map(() =>
        request(app)
          .get('/api/predefined-puzzles')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(promises);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('should respond within acceptable time limits', async () => {
      const start = Date.now();
      
      await request(app)
        .get('/api/health')
        .expect(200);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
