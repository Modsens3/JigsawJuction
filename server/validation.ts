import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

// Email validation
export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email) && email.length <= 254;
};

// Password strength validation
export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Login validation middleware
export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  
  // Email validation
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ 
      error: 'Valid email required',
      field: 'email'
    });
  }
  
  // Password validation
  if (!password || password.length < 8) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters',
      field: 'password'
    });
  }
  
  // XSS prevention
  req.body.email = validator.escape(email);
  req.body.password = password; // Don't escape password as it needs to be hashed
  
  next();
};

// Registration validation middleware
export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, confirmPassword, name } = req.body;
  
  // Email validation
  if (!email || !validateEmail(email)) {
    return res.status(400).json({ 
      error: 'Valid email required',
      field: 'email'
    });
  }
  
  // Name validation
  if (!name || name.trim().length < 2 || name.trim().length > 50) {
    return res.status(400).json({ 
      error: 'Name must be between 2 and 50 characters',
      field: 'name'
    });
  }
  
  // Password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({ 
      error: 'Password requirements not met',
      details: passwordValidation.errors,
      field: 'password'
    });
  }
  
  // Confirm password
  if (password !== confirmPassword) {
    return res.status(400).json({ 
      error: 'Passwords do not match',
      field: 'confirmPassword'
    });
  }
  
  // XSS prevention
  req.body.email = validator.escape(email);
  req.body.name = validator.escape(name.trim());
  req.body.password = password; // Don't escape password as it needs to be hashed
  
  next();
};

// File upload validation middleware
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  const { filename, mimeType, size } = req.body;
  
  // File size validation (10MB max)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (size && size > maxSize) {
    return res.status(400).json({ 
      error: 'File size exceeds maximum limit of 10MB',
      field: 'file'
    });
  }
  
  // MIME type validation
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (mimeType && !allowedTypes.includes(mimeType)) {
    return res.status(400).json({ 
      error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed',
      field: 'file'
    });
  }
  
  // Filename validation
  if (filename && !validator.isLength(filename, { min: 1, max: 255 })) {
    return res.status(400).json({ 
      error: 'Invalid filename',
      field: 'filename'
    });
  }
  
  // XSS prevention
  if (filename) {
    req.body.filename = validator.escape(filename);
  }
  
  next();
};

// Puzzle generation validation middleware
export const validatePuzzleGeneration = (req: Request, res: Response, next: NextFunction) => {
  const { seed, ncols, nrows, arcShape } = req.body;
  
  // Seed validation
  if (seed && (typeof seed !== 'number' || seed < 0 || seed > 999999)) {
    return res.status(400).json({ 
      error: 'Seed must be a number between 0 and 999999',
      field: 'seed'
    });
  }
  
  // Grid size validation
  if (ncols && (typeof ncols !== 'number' || ncols < 1 || ncols > 50)) {
    return res.status(400).json({ 
      error: 'Number of columns must be between 1 and 50',
      field: 'ncols'
    });
  }
  
  if (nrows && (typeof nrows !== 'number' || nrows < 1 || nrows > 50)) {
    return res.status(400).json({ 
      error: 'Number of rows must be between 1 and 50',
      field: 'nrows'
    });
  }
  
  // Arc shape validation
  if (arcShape && (typeof arcShape !== 'number' || arcShape < 0 || arcShape > 10)) {
    return res.status(400).json({ 
      error: 'Arc shape must be a number between 0 and 10',
      field: 'arcShape'
    });
  }
  
  next();
};

// Order validation middleware
export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  const { customerEmail, customerName, items } = req.body;
  
  // Customer email validation
  if (!customerEmail || !validateEmail(customerEmail)) {
    return res.status(400).json({ 
      error: 'Valid customer email required',
      field: 'customerEmail'
    });
  }
  
  // Customer name validation
  if (!customerName || customerName.trim().length < 2 || customerName.trim().length > 100) {
    return res.status(400).json({ 
      error: 'Customer name must be between 2 and 100 characters',
      field: 'customerName'
    });
  }
  
  // Items validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      error: 'At least one item is required',
      field: 'items'
    });
  }
  
  // Validate each item
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.templateId || !item.quantity || item.quantity < 1) {
      return res.status(400).json({ 
        error: `Invalid item at index ${i}`,
        field: `items[${i}]`
      });
    }
  }
  
  // XSS prevention
  req.body.customerEmail = validator.escape(customerEmail);
  req.body.customerName = validator.escape(customerName.trim());
  
  next();
};

// Generic sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize string fields
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key]);
      }
    });
  }
  
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = validator.escape(req.query[key] as string);
      }
    });
  }
  
  next();
};
