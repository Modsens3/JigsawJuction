import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config';
import { db } from './db';
import { authUsers, sessions } from '../shared/schema';
import { eq } from 'drizzle-orm';

// JWT token generation
export const generateToken = (userId: string, role: string = 'user') => {
  return jwt.sign(
    { userId, role },
    config.security.jwtSecret,
    { expiresIn: '24h' }
  );
};

// JWT token verification
export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, config.security.jwtSecret) as any;
  } catch (error) {
    return null;
  }
};

// Password hashing
export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

// Password verification
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// User authentication
export const authenticateUser = async (email: string, password: string) => {
  try {
    // Find user by email
    const users = await db.select().from(authUsers).where(eq(authUsers.email, email));
    const user = users[0];

    if (!user) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return { success: false, message: 'Invalid credentials' };
    }

    // Generate token
    const token = generateToken(user.id, 'user');

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified
      },
      token
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Authentication failed' };
  }
};

// User registration
export const registerUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  try {
    // Check if user already exists
    const existingUsers = await db.select().from(authUsers).where(eq(authUsers.email, userData.email));
    if (existingUsers.length > 0) {
      return { success: false, message: 'User already exists' };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const newUser = await db.insert(authUsers).values({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isVerified: false
    }).returning();

    // Generate token
    const token = generateToken(newUser[0].id, 'user');

    return {
      success: true,
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        firstName: newUser[0].firstName,
        lastName: newUser[0].lastName,
        isVerified: newUser[0].isVerified
      },
      token
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed' };
  }
};

// Admin authentication
export const authenticateAdmin = async (username: string, password: string) => {
  try {
    // In a real app, you'd have an admin users table
    // For now, we'll use a simple check
    const adminUsers = [
      { username: 'admin', password: '$2b$12$HIq3.OHr/Im2btjOmaqt5eIJKEDzJ916iKhDuQ83b7q1A0Bn6RTYO' } // admin123
    ];

    const admin = adminUsers.find(u => u.username === username);
    if (!admin) {
      return { success: false, message: 'Invalid credentials' };
    }

    const isValidPassword = await verifyPassword(password, admin.password);
    if (!isValidPassword) {
      return { success: false, message: 'Invalid credentials' };
    }

    const token = generateToken('admin', 'admin');

    return {
      success: true,
      user: {
        id: 'admin',
        username: 'admin',
        role: 'admin'
      },
      token
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return { success: false, message: 'Authentication failed' };
  }
};

// Middleware for protecting routes
export const requireAuth = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.session?.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  req.user = decoded;
  next();
};

// Middleware for admin routes
export const requireAdmin = (req: any, res: any, next: any) => {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  });
};
