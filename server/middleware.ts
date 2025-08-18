import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config';
import { logger } from './logger';
import crypto from 'crypto';

// HTTPS redirect middleware for production
export const httpsRedirect = (req: any, res: any, next: any) => {
  if (config.server.nodeEnv === 'production' && !req.secure) {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  next();
};

// Rate limiting for API endpoints
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.API_RATE_LIMIT || '50'), // limit each IP to 50 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT || '20'), // limit each IP to 20 requests per windowMs (increased from 3)
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.UPLOAD_RATE_LIMIT || '5'), // limit each IP to 5 uploads per hour
  message: {
    error: 'Too many file uploads, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
export const corsOptions = {
  origin: config.server.nodeEnv === 'production' 
    ? [process.env.CORS_ORIGIN || 'https://your-actual-domain.com']
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: config.server.nodeEnv === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  } : false, // Disable CSP in development for Vite HMR
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  strictTransportSecurity: config.server.nodeEnv === 'production' ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
  noSniff: true,
  xssFilter: true,
  frameguard: { action: 'deny' }
});

// Body size limit middleware
export const bodySizeLimit = (req: any, res: any, next: any) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '104857600'); // 100MB default for very large payloads

  if (contentLength > maxSize) {
    return res.status(413).json({ error: 'Request entity too large' });
  }
  next();
};

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`[${logLevel}] ${req.method} ${req.path} ${res.statusCode} ${duration}ms - ${req.ip}`);
  });
  
  next();
};

// Error handling middleware
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  console.error('Error:', err);
  
  // Don't leak error details in production
  const message = config.server.nodeEnv === 'production' 
    ? 'Internal server error' 
    : err.message;
  
  res.status(err.status || 500).json({
    error: message,
    ...(config.server.nodeEnv === 'development' && { stack: err.stack })
  });
};

// Input validation middleware
export const validateInput = (schema: any) => {
  return (req: any, res: any, next: any) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
  };
};

// File upload validation middleware
export const validateFileUpload = (req: any, res: any, next: any) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  // Check file type
  const allowedTypes = config.upload.allowedTypes;
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ 
      error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    });
  }
  
  // Check file size
  if (req.file.size > config.upload.maxFileSize) {
    return res.status(400).json({ 
      error: `File too large. Maximum size: ${config.upload.maxFileSize / (1024 * 1024)}MB` 
    });
  }
  
  next();
};

// Cache middleware for static responses
export const cacheMiddleware = (duration: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${duration}`);
    }
    next();
  };
};

// ETag generation for better caching
export const etagMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  res.send = function(data: any) {
    if (req.method === 'GET' && res.statusCode === 200) {
      const etag = `"${crypto.createHash('md5').update(data).digest('hex')}"`;
      res.set('ETag', etag);
      
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return res;
      }
    }
    return originalSend.call(this, data);
  };
  next();
};
