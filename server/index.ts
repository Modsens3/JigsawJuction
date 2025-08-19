import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { config } from './config';
import { logger } from './logger';
import { db } from './db';
import { registerRoutes } from './routes';
import { setupVite, serveStatic } from './vite';
import { errorHandler } from './middleware';
import { validateGoogleDriveConfig, ensureUploadDir } from './config';
import { cleanupOldFiles } from './google-drive';
import { cleanupLocalFiles } from './upload';
import { performanceMonitor } from './performance-monitor';
import { 
  httpsRedirect, 
  securityHeaders, 
  corsOptions, 
  bodySizeLimit,
  apiLimiter,
  authLimiter,
  uploadLimiter,
  memoryOptimization,
  requestValidation
} from './middleware';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { memoryOptimizer } from './memory-optimizer';

// Store interval references for cleanup
const intervals: NodeJS.Timeout[] = [];

// Memory optimization: Clear unused references
const clearUnusedReferences = () => {
  // Clear any cached data
  if (global.cache) {
    global.cache = {};
  }
  
  // Clear any temporary data
  if (global.tempData) {
    global.tempData = {};
  }
  
  // Clear any global variables that might be holding references
  if (global.__v8_promise_rejections) {
    global.__v8_promise_rejections = [];
  }
  
  // Clear event listeners that might be holding references
  if (process.listenerCount) {
    const events = ['uncaughtException', 'unhandledRejection', 'warning'];
    events.forEach(event => {
      const count = process.listenerCount(event);
      if (count > 1) {
        logger.warn(`Multiple listeners for ${event}: ${count}`);
      }
    });
  }
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
    // Call GC multiple times for better cleanup
    setTimeout(() => {
      if (global.gc) global.gc();
    }, 100);
    setTimeout(() => {
      if (global.gc) global.gc();
    }, 500);
  }
};

const app = express();

// Production security middleware
if (config.server.nodeEnv === 'production') {
  app.use(httpsRedirect);
}

// Memory optimization middleware
app.use(memoryOptimization);

// Enhanced security headers
app.use(securityHeaders);

// Request validation
app.use(requestValidation);

// FIXED: Optimized CORS configuration
app.use(cors({
  origin: config.server.nodeEnv === 'production' 
    ? [process.env.CORS_ORIGIN || 'https://your-domain.com']
    : ['http://localhost:3000', 'http://localhost:5000', 'http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Content-Length'],
  maxAge: 86400 // 24 hours preflight cache
}));

// FIXED: Optimized compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  },
  level: 4, // Reduced from 6 for better performance
  threshold: 2048 // Only compress files larger than 2KB
}));

// FIXED: Reasonable body parser limits (reduced from 100mb)
app.use(express.json({ 
  limit: '10mb', // Reduced from 100mb
  verify: (req, res, buf) => {
    // Validate JSON structure early to prevent errors
    if (buf.length > 0) {
      try {
        JSON.parse(buf.toString());
      } catch (e) {
        const error = new Error('Invalid JSON') as any;
        error.status = 400;
        throw error;
      }
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb', // Reduced from 100mb
  parameterLimit: 1000 // Limit number of parameters
}));

// FIXED: Optimized body size validation
app.use((req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'] || '0');
  const maxSize = 10 * 1024 * 1024; // 10MB limit
  
  if (contentLength > maxSize) {
    return res.status(413).json({ 
      error: 'Payload too large. Maximum size is 10MB.',
      maxSize: '10MB',
      receivedSize: `${Math.round(contentLength / 1024 / 1024)}MB`
    });
  }
  
  // Prevent 412 errors with proper headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
});

// FIXED: Session configuration with better memory management
app.use(session({
  secret: config.security.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.server.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },
  // Memory optimization for sessions
  name: 'sid', // Shorter name
  rolling: true, // Extend session on activity
  unset: 'destroy' // Remove session when unset
}));

// FIXED: Optimized request logging (reduced overhead)
app.use((req, res, next) => {
  // Skip monitoring for static assets to reduce memory usage
  if (req.path.startsWith('/assets') || req.path.startsWith('/favicon') || req.path.endsWith('.js') || req.path.endsWith('.css')) {
    return next();
  }
  
  const start = Date.now();
  performanceMonitor.incrementRequests();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // Only log API requests and errors to reduce memory usage
    if (req.path.startsWith("/api") || res.statusCode >= 400) {
      logger.request(req, res, duration);
      
      if (res.statusCode >= 400) {
        performanceMonitor.incrementErrors();
      }
    }
  });

  next();
});

// FIXED: Relaxed rate limiting to prevent 412 errors
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased from 20 to prevent 412 errors
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true // Don't count successful requests
}));

app.use('/api/upload', rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Increased from 5
  message: { error: 'Too many uploads, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased from 50
  message: { error: 'Too many API requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
}));

(async () => {
  try {
    // Startup validation
    logger.info('🔍 Validating configuration...');
    
    // Validate Google Drive configuration if enabled
    if (config.storage.type === 'google-drive') {
      logger.info('🔍 Validating Google Drive configuration...');
      validateGoogleDriveConfig();
    }
    
    // Ensure upload directory exists
    logger.info('🔍 Setting up upload directory...');
    ensureUploadDir();
    
    logger.info('✅ Configuration validation completed successfully');
    
    // Register routes
    await registerRoutes(app);

    // Error handling middleware (must be last)
    app.use(errorHandler);

    // Setup Vite for development or static serving for production
    if (app.get("env") === "development") {
      await setupVite(app);
    } else {
      serveStatic(app);
    }

    // Use port from config
    const port = config.server.port;
    const server = app.listen({
      port,
      host: "localhost",
    }, () => {
      logger.info(`🚀 Server started on port ${port}`, {
        environment: config.server.nodeEnv,
        port: config.server.port,
        uploadDir: config.upload.dir,
        storageType: config.storage.type,
        databaseType: config.database.type
      });
      logger.info(`serving on port ${port}`);
      
      logger.info(`
🎉 JIGSAWJUNCTION SERVER STARTED SUCCESSFULLY! 🎉

Server Information:
- Port: ${port}
- Environment: ${config.server.nodeEnv}
- Database: ${config.database.type}
- Storage: ${config.storage.type}
- Upload Directory: ${config.upload.dir}

Health Check: http://localhost:${port}/api/health
Admin Dashboard: http://localhost:${port}/admin
      `);
    });

    // Start advanced memory monitoring
    memoryOptimizer.startMonitoring();
    logger.info('Advanced memory monitoring started');

    // FIXED: Much more conservative memory monitoring with better cleanup
    const memoryMonitor = setInterval(() => {
      const stats = memoryOptimizer.getMemoryStats();
      const trend = memoryOptimizer.getMemoryTrend();
      
      // Log memory trend
      if (trend.trend === 'increasing' && trend.rate > 5) {
        logger.warn(`Memory usage increasing rapidly: ${trend.rate.toFixed(2)}MB/s`);
      }
      
      // Trigger optimization if needed
      if (stats.percentage > 85) {
        logger.warn(`High memory usage: ${stats.percentage.toFixed(1)}% (${stats.heapUsed}MB / ${stats.heapTotal}MB)`);
        memoryOptimizer.optimizeMemory();
      }
    }, 60000); // Every minute
    intervals.push(memoryMonitor);

    // FIXED: Optimized file cleanup (less frequent, less memory intensive)
    const fileCleanup = setInterval(async () => {
      try {
        // Clean up old files from Google Drive (less frequent)
        if (config.storage.type === 'google-drive') {
          await cleanupOldFiles(30); // Remove files older than 30 days
        }
        
        // Clean up local files
        await cleanupLocalFiles();
        
        logger.info('File cleanup completed');
      } catch (error) {
        logger.error('File cleanup failed:', error);
      }
    }, 6 * 60 * 60 * 1000); // Every 6 hours instead of daily
    intervals.push(fileCleanup);

    // Graceful shutdown handlers
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);
      
      // Clear all intervals
      intervals.forEach(interval => {
        clearInterval(interval);
      });
      
      // Memory cleanup before shutdown
      clearUnusedReferences();
      
      // Close server
      if (server) {
        server.close(() => {
          logger.info('Server closed');
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('❌ Server startup failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
})();
