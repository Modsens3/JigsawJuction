import { test, describe } from 'node:test';
import assert from 'node:assert';
import { hashPassword, verifyPassword, generateToken, verifyToken } from './auth';

describe('Authentication Tests', () => {
  test('should hash and verify password correctly', async () => {
    const password = 'testPassword123';
    const hashedPassword = await hashPassword(password);
    
    assert(hashedPassword !== password, 'Password should be hashed');
    assert(hashedPassword.length > 50, 'Hashed password should be long');
    
    const isValid = await verifyPassword(password, hashedPassword);
    assert(isValid === true, 'Password verification should succeed');
    
    const isInvalid = await verifyPassword('wrongPassword', hashedPassword);
    assert(isInvalid === false, 'Wrong password should fail verification');
  });

  test('should generate and verify JWT token', () => {
    const user = { id: '123', email: 'test@example.com', isAdmin: false };
    const token = generateToken(user);
    
    assert(typeof token === 'string', 'Token should be a string');
    assert(token.length > 50, 'Token should be long enough');
    
    const decoded = verifyToken(token);
    assert(decoded.id === user.id, 'Token should contain correct user ID');
    assert(decoded.email === user.email, 'Token should contain correct email');
  });

  test('should reject invalid token', () => {
    const invalidToken = 'invalid.token.here';
    
    try {
      verifyToken(invalidToken);
      assert.fail('Should have thrown an error for invalid token');
    } catch (error) {
      assert(error.message.includes('invalid'), 'Should throw invalid token error');
    }
  });
});
