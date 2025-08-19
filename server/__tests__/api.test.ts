import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import { db } from '../db';

describe('API Endpoints', () => {
  let app: express.Express;
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    await registerRoutes(app);
    
    // Setup test database
    await db.run('DELETE FROM auth_users WHERE email = ?', ['test@test.com']);
  });

  afterAll(async () => {
    // Cleanup
    await db.run('DELETE FROM auth_users WHERE email = ?', ['test@test.com']);
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@test.com',
          password: 'test123',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should login admin', async () => {
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

  describe('Predefined Puzzles', () => {
    it('should return all predefined puzzles', async () => {
      const response = await request(app)
        .get('/api/predefined-puzzles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
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

    it('should return puzzle types', async () => {
      const response = await request(app)
        .get('/api/predefined-puzzles/types');

      expect(response.status).toBe(200);
      expect(response.body.types).toBeDefined();
      expect(response.body.difficulties).toBeDefined();
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('healthy');
      expect(response.body.checks).toBeDefined();
    });
  });

  describe('Memory Management', () => {
    it('should handle memory cleanup', async () => {
      const response = await request(app)
        .post('/api/memory-cleanup');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.freed).toBeDefined();
    });
  });
});
