import express from "express";
import { db } from "./db";
import { puzzleOrders, cartItems, fileStorage, authUsers } from "../shared/schema";
import { eq, desc, sql } from "drizzle-orm";
import { 
  upload, 
  saveBase64ImageUniversal, 
  getFilePath, 
  fileExists, 
  deleteFileUniversal, 
  getFileInfoUniversal,
  downloadFileUniversal,
  listFilesUniversal,
  getStorageStatus
} from './upload';
import { config } from './config';
import { 
  authenticateUser, 
  registerUser, 
  authenticateAdmin, 
  requireAuth, 
  requireAdmin,
  generateToken,
  verifyToken
} from './auth';
import { logger } from './logger';
import { getHealthStatus, getSystemMetrics, performanceMonitor } from './health';
import { validateFileUpload } from './middleware';
import fs from 'fs';

// Import new systems
import { fileSynchronizer } from './sync';
import { bulkOperationsManager } from './bulk-operations';
import { fileVersioningSystem } from './versioning';
import { analyticsSystem } from './analytics';
import { backupSystem } from './backup';
import { advancedAnalyticsSystem } from './advanced-analytics';
import { orderTrackingSystem } from './order-tracking';
import { emailNotificationSystem } from './email-notifications';
import { performanceOptimizationSystem } from './performance-optimization';
import { generateDesignSVG, generateLaserSVG } from './puzzle-generator';
import { exportUserData, deleteUserData } from './gdpr';
import { checkDiskSpace, checkDatabaseConnections } from './monitoring';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function registerRoutes(app: express.Express) {
  // Don't call listen here, just return the app

  // Health check endpoints
  app.get('/api/health', async (req, res) => {
    try {
      const health = await getHealthStatus();
      res.json(health);
    } catch (error) {
      logger.error('Health check failed', error, req);
      res.status(500).json({ error: 'Health check failed' });
    }
  });

  app.get('/api/metrics', requireAdmin, async (req, res) => {
    try {
      const metrics = await getSystemMetrics();
      const performance = performanceMonitor.getStats();
      const storageStatus = await getStorageStatus();
      res.json({ metrics, performance, storage: storageStatus });
  } catch (error) {
      logger.error('Metrics retrieval failed', error, req);
      res.status(500).json({ error: 'Metrics retrieval failed' });
    }
  });

  // Memory cleanup endpoint for admin
  app.post('/api/admin/memory-cleanup', requireAdmin, async (req, res) => {
    try {
      const beforeGC = process.memoryUsage();
      const beforeHeapUsedMB = Math.round(beforeGC.heapUsed / 1024 / 1024);
      const beforeHeapTotalMB = Math.round(beforeGC.heapTotal / 1024 / 1024);
      const beforeMemoryPercent = (beforeHeapUsedMB / beforeHeapTotalMB) * 100;

      // Force garbage collection
      if (global.gc) {
        global.gc();
        logger.info('Manual garbage collection triggered by admin');
      }

      const afterGC = process.memoryUsage();
      const afterHeapUsedMB = Math.round(afterGC.heapUsed / 1024 / 1024);
      const afterMemoryPercent = (afterHeapUsedMB / beforeHeapTotalMB) * 100;

      const memoryFreed = beforeHeapUsedMB - afterHeapUsedMB;

      res.json({
        success: true,
        message: 'Memory cleanup completed',
        before: {
          heapUsedMB: beforeHeapUsedMB,
          heapTotalMB: beforeHeapTotalMB,
          percentage: beforeMemoryPercent.toFixed(1)
        },
        after: {
          heapUsedMB: afterHeapUsedMB,
          heapTotalMB: beforeHeapTotalMB,
          percentage: afterMemoryPercent.toFixed(1)
        },
        freed: {
          mb: memoryFreed,
          percentage: ((memoryFreed / beforeHeapUsedMB) * 100).toFixed(1)
        }
      });
    } catch (error) {
      logger.error('Memory cleanup failed', error, req);
      res.status(500).json({ error: 'Memory cleanup failed' });
    }
  });

  // Storage status endpoint
  app.get('/api/storage/status', requireAdmin, async (req, res) => {
    try {
      const status = await getStorageStatus();
      res.json(status);
    } catch (error) {
      logger.error('Storage status retrieval failed', error, req);
      res.status(500).json({ error: 'Storage status retrieval failed' });
    }
  });

  // List files endpoint
  app.get('/api/storage/files', requireAdmin, async (req, res) => {
    try {
      const files = await listFilesUniversal();
      res.json(files);
    } catch (error) {
      logger.error('File listing failed', error, req);
      res.status(500).json({ error: 'File listing failed' });
    }
  });

  // Authentication endpoints
  app.get('/api/auth/user', (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '') || req.session?.token;

      if (!token) {
        return res.json({ user: null });
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return res.json({ user: null });
      }

      // Return user info from JWT token
      res.json({
        user: {
          id: decoded.userId,
          email: (decoded as any)?.email || '',
          firstName: (decoded as any)?.firstName || '',
          lastName: (decoded as any)?.lastName || '',
          role: (decoded as any)?.role || 'user'
        }
      });
    } catch (error) {
      logger.error('Failed to get user info', error, req);
      res.json({ user: null });
    }
  });

  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          error: 'Όλα τα πεδία είναι υποχρεωτικά' 
        });
      }

      // Check if user already exists
      const existingUser = await db.select().from(authUsers).where(eq(authUsers.email, email)).limit(1);
      
      if (existingUser.length > 0) {
        return res.status(409).json({ 
          error: 'Ο χρήστης με αυτό το email υπάρχει ήδη' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db.insert(authUsers).values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        isVerified: 0
      }).returning();

      // Generate JWT token
      const token = generateToken(newUser.id, 'user');

      // Create session
      req.session.userId = newUser.id;
      req.session.token = token;

      logger.auth(newUser.id, 'signup', true, req);

      res.status(201).json({
        message: 'Επιτυχής εγγραφή!',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName
        },
        token: token
      });
    } catch (error) {
      logger.error('Signup failed', error, req);
      res.status(500).json({ 
        error: 'Σφάλμα κατά την εγγραφή' 
      });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authenticateUser(email, password);
      
      if (result.success) {
        // Set session
        (req.session as any).userId = result.user?.id;
        (req.session as any).token = result.token;
        
        logger.auth(result.user?.id, 'login', true, req);
        res.json(result);
      } else {
        logger.auth(email, 'login', false, req);
        res.status(401).json(result);
      }
    } catch (error) {
      logger.error('Login failed', error, req);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const result = await registerUser({ email, password, firstName, lastName });
      
      if (result.success) {
        // Set session
        (req.session as any).userId = result.user?.id;
        (req.session as any).token = result.token;
        
        logger.auth(result.user?.id, 'register', true, req);
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      logger.error('Registration failed', error, req);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/admin/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const result = await authenticateAdmin(username, password);
      
      if (result.success) {
        // Set session
        req.session.userId = result.user?.id;
        req.session.token = result.token;
        req.session.isAdmin = true;
        
        logger.auth(result.user?.id || '', 'admin_login', true, req);
        res.json(result);
    } else {
        logger.auth(username, 'admin_login', false, req);
        res.status(401).json(result);
      }
    } catch (error) {
      logger.error('Admin login failed', error, req);
      res.status(500).json({ error: 'Admin login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        logger.error('Logout failed', err, req);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  // Protected user endpoints
  app.get('/api/user/profile', requireAuth, (req, res) => {
    res.json({ user: req.user || null });
  });

  // File management endpoints (protected)
  app.get('/api/admin/files/:filename', requireAdmin, async (req, res) => {
    try {
      const { filename } = req.params;
      const { fileId } = req.query;
      
      if (config.storage.type === 'google-drive' && fileId) {
        // Serve from Google Drive
        const buffer = await downloadFileUniversal(filename, fileId as string);
        const fileInfo = await getFileInfoUniversal(filename, fileId as string);
        
        res.setHeader('Content-Type', fileInfo.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        res.send(buffer);
      } else {
        // Serve from local storage
        const filePath = getFilePath(filename);
        
        if (!fileExists(filename)) {
          return res.status(404).json({ error: 'File not found' });
        }

        const fileInfo = await getFileInfoUniversal(filename);
        res.setHeader('Content-Type', fileInfo.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        
        res.sendFile(filePath);
      }
    } catch (error) {
      logger.error('File download failed', error, req);
      res.status(500).json({ error: 'File download failed' });
    }
  });

  app.get('/api/admin/files/:filename/info', requireAdmin, async (req, res) => {
    try {
      const { filename } = req.params;
      const { fileId } = req.query;
      
      const fileInfo = await getFileInfoUniversal(filename, fileId as string);
      res.json(fileInfo);
    } catch (error) {
      logger.error('File info retrieval failed', error, req);
      res.status(500).json({ error: 'File info retrieval failed' });
    }
  });

  app.delete('/api/admin/files/:filename', requireAdmin, async (req, res) => {
    try {
      const { filename } = req.params;
      const { fileId } = req.query;
      
      await deleteFileUniversal(filename, fileId as string);
      logger.info(`File deleted: ${filename}`, { filename, fileId }, req);
      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      logger.error('File deletion failed', error, req);
      res.status(500).json({ error: 'File deletion failed' });
    }
  });

  // File upload endpoint (with validation)
  app.post('/api/upload', upload.single('image'), validateFileUpload, async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      let imageUrl: string;
      let fileId: string | undefined;
      let downloadUrl: string | undefined;

      if (config.storage.type === 'google-drive') {
        // Upload to Google Drive
        const result = await saveBase64ImageUniversal(req.file.path);
        
        imageUrl = result.downloadUrl || `/api/admin/files/${req.file.filename}`;
        fileId = result.fileId;
        downloadUrl = result.downloadUrl;
        
        // Clean up local file
        fs.unlinkSync(req.file.path);
      } else {
        // Use local storage
        imageUrl = `/api/admin/files/${req.file.filename}`;
      }
      
      logger.fileUpload(req.file.filename, req.file.size, req.user?.userId, req);
      
      res.json({ 
        success: true, 
        imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        fileId,
        downloadUrl
      });
    } catch (error) {
      logger.error('File upload failed', error, req);
      res.status(500).json({ error: 'File upload failed' });
    }
  });

  // Puzzle generator endpoint
  app.get('/api/puzzle-generator', (req, res) => {
    try {
      res.sendFile('server/puzzle-generator.html', { root: '.' });
    } catch (error) {
      logger.error('Puzzle generator access failed', error, req);
      res.status(500).json({ error: 'Puzzle generator access failed' });
    }
  });

  // Puzzle order endpoint (protected)
  app.post('/api/puzzle-order', requireAuth, async (req, res) => {
    try {
      const { image, designData, quantity, material, size } = req.body;
      
      if (!image || !designData || !quantity || !material || !size) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Save base64 image using universal storage
      const saveResult = await saveBase64ImageUniversal(image);
      
      let imageUrl: string;
      if (config.storage.type === 'google-drive' && saveResult.downloadUrl) {
        imageUrl = saveResult.downloadUrl;
      } else {
        imageUrl = `/api/admin/files/${saveResult.filename}`;
      }

      // Calculate price (simplified)
      const basePrice = 25; // Base price for puzzle
      const materialMultiplier = material === 'premium' ? 1.5 : 1.0;
      const sizeMultiplier = size === 'large' ? 1.3 : 1.0;
      const totalPrice = basePrice * materialMultiplier * sizeMultiplier * quantity;

      // Create order
      const newOrder = await db.insert(puzzleOrders).values({
        userId: (req.user?.userId || (req.session as any)?.userId)!,
        image: saveResult.filename,
        imageFileId: saveResult.fileId,
        imageDownloadUrl: saveResult.downloadUrl,
        designData: JSON.stringify(designData),
        quantity,
        material,
        size,
        totalPrice,
        status: 'pending'
      }).returning();

      logger.orderCreated(newOrder[0].id, totalPrice, (req.user?.userId || (req.session as any)?.userId)!, req);
      
      res.json({ 
        success: true, 
        orderId: newOrder[0].id,
        totalPrice,
        imageUrl
      });
    } catch (error) {
      logger.error('Order creation failed', error, req);
      res.status(500).json({ error: 'Order creation failed' });
    }
  });

  // Admin orders endpoint (protected)
  app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
      const orders = await db.select().from(puzzleOrders).orderBy(desc(puzzleOrders.createdAt));
      
      const ordersWithImageUrls = orders.map(order => {
        let imageUrl: string;
        if (order.imageFileId && order.imageDownloadUrl) {
          imageUrl = order.imageDownloadUrl;
      } else {
          imageUrl = `/api/admin/files/${order.image}`;
        }
        
        return {
          ...order,
          imageUrl,
          designData: order.designData ? JSON.parse(order.designData) : null
        };
      });

      res.json(ordersWithImageUrls);
    } catch (error) {
      logger.error('Orders retrieval failed', error, req);
      res.status(500).json({ error: 'Orders retrieval failed' });
    }
  });

  // Admin order status update (protected)
  app.put('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      await db.update(puzzleOrders)
        .set({ status })
        .where(eq(puzzleOrders.id, id));

      logger.info(`Order status updated: ${id} -> ${status}`, { orderId: id, status }, req);
      res.json({ success: true, message: 'Order status updated' });
    } catch (error) {
      logger.error('Order status update failed', error, req);
      res.status(500).json({ error: 'Order status update failed' });
    }
  });

  // Cart endpoints (protected)
  app.get('/api/cart', requireAuth, async (req, res) => {
    try {
      const userCartItems = await db.select().from(cartItems).where(eq(cartItems.userId, (req.user?.userId || (req.session as any)?.userId)!));
              res.json(userCartItems);
    } catch (error) {
      logger.error('Cart retrieval failed', error, req);
      res.status(500).json({ error: 'Cart retrieval failed' });
    }
  });

  app.post('/api/cart', requireAuth, async (req, res) => {
    try {
      const { productId, quantity } = req.body;
      
      if (!productId || !quantity) {
        return res.status(400).json({ error: 'Product ID and quantity are required' });
      }

      const newCartItem = await db.insert(cartItems).values({
        userId: (req.user?.userId || (req.session as any)?.userId)!,
        productId,
        quantity
      }).returning();

      res.json(newCartItem[0]);
    } catch (error) {
      logger.error('Cart item addition failed', error, req);
      res.status(500).json({ error: 'Cart item addition failed' });
    }
  });

  // ===== NEW ADVANCED FEATURES ENDPOINTS =====

  // File Synchronization endpoints
  app.post('/api/sync/start', requireAdmin, async (req, res) => {
    try {
      const { direction, force, deleteMissing, updateExisting } = req.body;
      
      const syncOptions = {
        direction: direction || 'bidirectional',
        force: force || false,
        deleteMissing: deleteMissing || false,
        updateExisting: updateExisting || false
      };

      const result = await fileSynchronizer.sync(syncOptions);
      res.json(result);
    } catch (error) {
      logger.error('Sync failed', error, req);
      res.status(500).json({ error: 'Sync failed' });
    }
  });

  app.get('/api/sync/conflicts', requireAdmin, async (req, res) => {
    try {
      const conflicts = await fileSynchronizer.checkConflicts();
      res.json(conflicts);
    } catch (error) {
      logger.error('Conflict check failed', error, req);
      res.status(500).json({ error: 'Conflict check failed' });
    }
  });

  // Bulk Operations endpoints
  app.post('/api/bulk/upload', requireAdmin, async (req, res) => {
    try {
      const { files, destination, processImages, imageOptions } = req.body;
      
      const operationId = await bulkOperationsManager.bulkUpload({
        files,
        destination: destination || 'google-drive',
        processImages: processImages || false,
        imageOptions
      });

      res.json({ operationId });
    } catch (error) {
      logger.error('Bulk upload failed', error, req);
      res.status(500).json({ error: 'Bulk upload failed' });
    }
  });

  app.post('/api/bulk/download', requireAdmin, async (req, res) => {
    try {
      const { fileIds, destination, includeMetadata } = req.body;
      
      const operationId = await bulkOperationsManager.bulkDownload({
        fileIds,
        destination,
        includeMetadata: includeMetadata || false
      });

      res.json({ operationId });
    } catch (error) {
      logger.error('Bulk download failed', error, req);
      res.status(500).json({ error: 'Bulk download failed' });
    }
  });

  app.post('/api/bulk/delete', requireAdmin, async (req, res) => {
    try {
      const { fileIds, locations } = req.body;
      
      const operationId = await bulkOperationsManager.bulkDelete({
        fileIds,
        locations: locations || 'both'
      });

      res.json({ operationId });
    } catch (error) {
      logger.error('Bulk delete failed', error, req);
      res.status(500).json({ error: 'Bulk delete failed' });
    }
  });

  app.get('/api/bulk/operations', requireAdmin, async (req, res) => {
    try {
      const operations = bulkOperationsManager.getAllOperations();
      res.json(operations);
    } catch (error) {
      logger.error('Bulk operations retrieval failed', error, req);
      res.status(500).json({ error: 'Bulk operations retrieval failed' });
    }
  });

  app.get('/api/bulk/operations/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const operation = bulkOperationsManager.getOperationStatus(id);
      
      if (!operation) {
        return res.status(404).json({ error: 'Operation not found' });
      }

      res.json(operation);
    } catch (error) {
      logger.error('Bulk operation status retrieval failed', error, req);
      res.status(500).json({ error: 'Bulk operation status retrieval failed' });
    }
  });

  // File Versioning endpoints
  app.post('/api/versions/:fileId', requireAdmin, async (req, res) => {
    try {
      const { fileId } = req.params;
      const { comment, metadata, force } = req.body;
      
      const version = await fileVersioningSystem.createVersion(fileId, {
        comment,
        metadata,
        force: force || false,
        createdBy: (req.user?.userId || (req.session as any)?.userId)!
      });

      res.json(version);
    } catch (error) {
      logger.error('Version creation failed', error, req);
      res.status(500).json({ error: 'Version creation failed' });
    }
  });

  app.get('/api/versions/:fileId', requireAdmin, async (req, res) => {
    try {
      const { fileId } = req.params;
      const versions = await fileVersioningSystem.getFileVersions(fileId);
      res.json(versions);
    } catch (error) {
      logger.error('Versions retrieval failed', error, req);
      res.status(500).json({ error: 'Versions retrieval failed' });
    }
  });

  app.get('/api/versions/stats/:fileId', requireAdmin, async (req, res) => {
    try {
      const { fileId } = req.params;
      const stats = await fileVersioningSystem.getVersionStats(fileId);
      res.json(stats);
    } catch (error) {
      logger.error('Version stats retrieval failed', error, req);
      res.status(500).json({ error: 'Version stats retrieval failed' });
    }
  });

  app.post('/api/versions/restore/:versionId', requireAdmin, async (req, res) => {
    try {
      const { versionId } = req.params;
      const { comment } = req.body;
      
      const restoredVersion = await fileVersioningSystem.restoreVersion(versionId, {
        comment,
        createdBy: (req.user?.userId || (req.session as any)?.userId)!
      });

      res.json(restoredVersion);
    } catch (error) {
      logger.error('Version restoration failed', error, req);
      res.status(500).json({ error: 'Version restoration failed' });
    }
  });

  app.delete('/api/versions/:versionId', requireAdmin, async (req, res) => {
    try {
      const { versionId } = req.params;
      await fileVersioningSystem.deleteVersion(versionId);
      res.json({ message: 'Version deleted successfully' });
    } catch (error) {
      logger.error('Version deletion failed', error, req);
      res.status(500).json({ error: 'Version deletion failed' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/overview', requireAdmin, async (req, res) => {
    try {
      const overview = await analyticsSystem.getStorageOverview();
      res.json(overview);
    } catch (error) {
      logger.error('Analytics overview retrieval failed', error, req);
      res.status(500).json({ error: 'Analytics overview retrieval failed' });
    }
  });

  app.get('/api/analytics/trends', requireAdmin, async (req, res) => {
    try {
      const { days, weeks, months } = req.query;
      
      const [dailyUploads, weeklyGrowth, monthlyUsage] = await Promise.all([
        analyticsSystem.getDailyUploads(Number(days) || 30),
        analyticsSystem.getWeeklyGrowth(Number(weeks) || 12),
        analyticsSystem.getMonthlyUsage(Number(months) || 12)
      ]);

      res.json({ dailyUploads, weeklyGrowth, monthlyUsage });
    } catch (error) {
      logger.error('Analytics trends retrieval failed', error, req);
      res.status(500).json({ error: 'Analytics trends retrieval failed' });
    }
  });

  app.get('/api/analytics/performance', requireAdmin, async (req, res) => {
    try {
      const performance = await analyticsSystem.getPerformanceMetrics();
      res.json(performance);
    } catch (error) {
      logger.error('Performance metrics retrieval failed', error, req);
      res.status(500).json({ error: 'Performance metrics retrieval failed' });
    }
  });

  app.get('/api/analytics/users', requireAdmin, async (req, res) => {
    try {
      const userActivity = await analyticsSystem.getUserActivity();
      res.json(userActivity);
    } catch (error) {
      logger.error('User activity retrieval failed', error, req);
      res.status(500).json({ error: 'User activity retrieval failed' });
    }
  });

  app.get('/api/analytics/files', requireAdmin, async (req, res) => {
    try {
      const fileInsights = await analyticsSystem.getFileInsights();
      res.json(fileInsights);
    } catch (error) {
      logger.error('File insights retrieval failed', error, req);
      res.status(500).json({ error: 'File insights retrieval failed' });
    }
  });

  app.get('/api/analytics/comprehensive', requireAdmin, async (req, res) => {
    try {
      const analytics = await analyticsSystem.getComprehensiveAnalytics();
      res.json(analytics);
    } catch (error) {
      logger.error('Comprehensive analytics retrieval failed', error, req);
      res.status(500).json({ error: 'Comprehensive analytics retrieval failed' });
    }
  });

  app.get('/api/analytics/export', requireAdmin, async (req, res) => {
    try {
      const { format } = req.query;
      const data = await analyticsSystem.exportAnalytics(format as 'json' | 'csv' || 'json');
      
      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="analytics.${format || 'json'}"`);
      res.send(data);
    } catch (error) {
      logger.error('Analytics export failed', error, req);
      res.status(500).json({ error: 'Analytics export failed' });
    }
  });

  // Backup endpoints
  app.post('/api/backup/full', requireAdmin, async (req, res) => {
    try {
      const backupId = await backupSystem.createFullBackup();
      res.json({ backupId });
    } catch (error) {
      logger.error('Full backup failed', error, req);
      res.status(500).json({ error: 'Full backup failed' });
    }
  });

  app.post('/api/backup/incremental', requireAdmin, async (req, res) => {
    try {
      const { lastBackupDate } = req.body;
      
      if (!lastBackupDate) {
        return res.status(400).json({ error: 'Last backup date is required' });
      }

      const backupId = await backupSystem.createIncrementalBackup(new Date(lastBackupDate));
      res.json({ backupId });
    } catch (error) {
      logger.error('Incremental backup failed', error, req);
      res.status(500).json({ error: 'Incremental backup failed' });
    }
  });

  app.get('/api/backup/jobs', requireAdmin, async (req, res) => {
    try {
      const jobs = backupSystem.getAllBackupJobs();
      res.json(jobs);
    } catch (error) {
      logger.error('Backup jobs retrieval failed', error, req);
      res.status(500).json({ error: 'Backup jobs retrieval failed' });
    }
  });

  app.get('/api/backup/jobs/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const job = backupSystem.getBackupJobStatus(id);
      
      if (!job) {
        return res.status(404).json({ error: 'Backup job not found' });
      }

      res.json(job);
    } catch (error) {
      logger.error('Backup job status retrieval failed', error, req);
      res.status(500).json({ error: 'Backup job status retrieval failed' });
    }
  });

  app.post('/api/backup/restore/:backupId', requireAdmin, async (req, res) => {
    try {
      const { backupId } = req.params;
      const { restoreFiles, restoreDatabase, restoreAnalytics, restoreVersions } = req.body;
      
      await backupSystem.restoreBackup(backupId, {
        restoreFiles,
        restoreDatabase,
        restoreAnalytics,
        restoreVersions
      });

      res.json({ message: 'Backup restored successfully' });
    } catch (error) {
      logger.error('Backup restoration failed', error, req);
      res.status(500).json({ error: 'Backup restoration failed' });
    }
  });

  app.post('/api/backup/cleanup', requireAdmin, async (req, res) => {
    try {
      const deletedCount = await backupSystem.cleanupOldBackups();
      res.json({ deletedCount, message: 'Old backups cleaned up successfully' });
    } catch (error) {
      logger.error('Backup cleanup failed', error, req);
      res.status(500).json({ error: 'Backup cleanup failed' });
    }
  });

  app.get('/api/backup/config', requireAdmin, async (req, res) => {
    try {
      const config = backupSystem.getConfig();
      res.json(config);
    } catch (error) {
      logger.error('Backup config retrieval failed', error, req);
      res.status(500).json({ error: 'Backup config retrieval failed' });
    }
  });

  app.put('/api/backup/config', requireAdmin, async (req, res) => {
    try {
      const newConfig = req.body;
      backupSystem.updateConfig(newConfig);
      res.json({ message: 'Backup configuration updated successfully' });
    } catch (error) {
      logger.error('Backup config update failed', error, req);
      res.status(500).json({ error: 'Backup config update failed' });
    }
  });

  // ===== ADVANCED ANALYTICS & REPORTING ENDPOINTS =====

  // Business metrics
  app.get('/api/analytics/business', requireAdmin, async (req, res) => {
    try {
      const { timeRange } = req.query;
      const metrics = await advancedAnalyticsSystem.getBusinessMetrics(timeRange as any || 'month');
      res.json(metrics);
    } catch (error) {
      logger.error('Business metrics retrieval failed', error, req);
      res.status(500).json({ error: 'Business metrics retrieval failed' });
    }
  });

  // Sales reports
  app.get('/api/analytics/sales', requireAdmin, async (req, res) => {
    try {
      const { period, startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const report = await advancedAnalyticsSystem.getSalesReport(period as any || 'monthly', start, end);
      res.json(report);
    } catch (error) {
      logger.error('Sales report retrieval failed', error, req);
      res.status(500).json({ error: 'Sales report retrieval failed' });
    }
  });

  // Customer analytics
  app.get('/api/analytics/customers/:customerId', requireAdmin, async (req, res) => {
    try {
      const { customerId } = req.params;
      const analytics = await advancedAnalyticsSystem.getCustomerAnalytics(customerId);
      
      if (!analytics) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      res.json(analytics);
    } catch (error) {
      logger.error('Customer analytics retrieval failed', error, req);
      res.status(500).json({ error: 'Customer analytics retrieval failed' });
    }
  });

  // Product analytics
  app.get('/api/analytics/products/:productId', requireAdmin, async (req, res) => {
    try {
      const { productId } = req.params;
      const analytics = await advancedAnalyticsSystem.getProductAnalytics(productId);
      
      if (!analytics) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(analytics);
    } catch (error) {
      logger.error('Product analytics retrieval failed', error, req);
      res.status(500).json({ error: 'Product analytics retrieval failed' });
    }
  });

  // Comprehensive report
  app.get('/api/analytics/report', requireAdmin, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();
      
      const report = await advancedAnalyticsSystem.generateComprehensiveReport(start, end);
      res.json(report);
    } catch (error) {
      logger.error('Comprehensive report generation failed', error, req);
      res.status(500).json({ error: 'Comprehensive report generation failed' });
    }
  });

  // ===== ORDER TRACKING ENDPOINTS =====

  // Get order tracking
  app.get('/api/tracking/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const tracking = await orderTrackingSystem.getOrderTracking(orderId);
      
      if (!tracking) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      res.json(tracking);
    } catch (error) {
      logger.error('Order tracking retrieval failed', error, req);
      res.status(500).json({ error: 'Order tracking retrieval failed' });
    }
  });

  // Update order status (admin only)
  app.put('/api/tracking/:orderId/status', requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, message, location, estimatedDelivery, trackingNumber, notes } = req.body;
      
      const update = {
        orderId,
        status,
        message,
        location,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
        trackingNumber,
        notes
      };

      const tracking = await orderTrackingSystem.updateOrderStatus(update);
      res.json(tracking);
    } catch (error) {
      logger.error('Order status update failed', error, req);
      res.status(500).json({ error: 'Order status update failed' });
    }
  });

  // Get orders by status
  app.get('/api/tracking/status/:status', requireAdmin, async (req, res) => {
    try {
      const { status } = req.params;
      const orders = await orderTrackingSystem.getOrdersByStatus(status as any);
      res.json(orders);
    } catch (error) {
      logger.error('Orders by status retrieval failed', error, req);
      res.status(500).json({ error: 'Orders by status retrieval failed' });
    }
  });

  // Get customer orders
  app.get('/api/tracking/customer/:customerId', requireAdmin, async (req, res) => {
    try {
      const { customerId } = req.params;
      const orders = await orderTrackingSystem.getCustomerOrders(customerId);
      res.json(orders);
    } catch (error) {
      logger.error('Customer orders retrieval failed', error, req);
      res.status(500).json({ error: 'Customer orders retrieval failed' });
    }
  });

  // Search orders
  app.get('/api/tracking/search', requireAdmin, async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const orders = await orderTrackingSystem.searchOrders(query as string);
      res.json(orders);
    } catch (error) {
      logger.error('Order search failed', error, req);
      res.status(500).json({ error: 'Order search failed' });
    }
  });

  // Get order statistics
  app.get('/api/tracking/stats', requireAdmin, async (req, res) => {
    try {
      const stats = await orderTrackingSystem.getOrderStatistics();
      res.json(stats);
    } catch (error) {
      logger.error('Order statistics retrieval failed', error, req);
      res.status(500).json({ error: 'Order statistics retrieval failed' });
    }
  });

  // Bulk status update
  app.put('/api/tracking/bulk-update', requireAdmin, async (req, res) => {
    try {
      const { updates } = req.body;
      
      if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Updates array is required' });
      }
      
      const results = await orderTrackingSystem.bulkUpdateStatus(updates);
      res.json(results);
    } catch (error) {
      logger.error('Bulk status update failed', error, req);
      res.status(500).json({ error: 'Bulk status update failed' });
    }
  });

  // ===== EMAIL NOTIFICATIONS ENDPOINTS =====

  // Send order confirmation email
  app.post('/api/email/order-confirmation', requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.body;
      
      const tracking = await orderTrackingSystem.getOrderTracking(orderId);
      if (!tracking) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      await emailNotificationSystem.sendOrderConfirmationEmail(tracking);
      res.json({ message: 'Order confirmation email sent' });
    } catch (error) {
      logger.error('Order confirmation email failed', error, req);
      res.status(500).json({ error: 'Order confirmation email failed' });
    }
  });

  // Send welcome email
  app.post('/api/email/welcome', requireAdmin, async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        return res.status(400).json({ error: 'Email and name are required' });
      }
      
      await emailNotificationSystem.sendWelcomeEmail(email, name);
      res.json({ message: 'Welcome email sent' });
    } catch (error) {
      logger.error('Welcome email failed', error, req);
      res.status(500).json({ error: 'Welcome email failed' });
    }
  });

  // Get email templates
  app.get('/api/email/templates', requireAdmin, async (req, res) => {
    try {
      const templates = emailNotificationSystem.getTemplates();
      res.json(templates);
    } catch (error) {
      logger.error('Email templates retrieval failed', error, req);
      res.status(500).json({ error: 'Email templates retrieval failed' });
    }
  });

  // Get email queue status
  app.get('/api/email/queue', requireAdmin, async (req, res) => {
    try {
      const status = emailNotificationSystem.getQueueStatus();
      res.json(status);
    } catch (error) {
      logger.error('Email queue status retrieval failed', error, req);
      res.status(500).json({ error: 'Email queue status retrieval failed' });
    }
  });

  // Clear email queue
  app.delete('/api/email/queue', requireAdmin, async (req, res) => {
    try {
      emailNotificationSystem.clearQueue();
      res.json({ message: 'Email queue cleared' });
    } catch (error) {
      logger.error('Email queue clear failed', error, req);
      res.status(500).json({ error: 'Email queue clear failed' });
    }
  });

  // Get email configuration
  app.get('/api/email/config', requireAdmin, async (req, res) => {
    try {
      const config = emailNotificationSystem.getConfig();
      res.json(config);
    } catch (error) {
      logger.error('Email config retrieval failed', error, req);
      res.status(500).json({ error: 'Email config retrieval failed' });
    }
  });

  // Update email configuration
  app.put('/api/email/config', requireAdmin, async (req, res) => {
    try {
      const newConfig = req.body;
      emailNotificationSystem.updateConfig(newConfig);
      res.json({ message: 'Email configuration updated' });
    } catch (error) {
      logger.error('Email config update failed', error, req);
      res.status(500).json({ error: 'Email config update failed' });
    }
  });

  // ===== PERFORMANCE OPTIMIZATION ENDPOINTS =====

  // Get performance metrics
  app.get('/api/performance/metrics', requireAdmin, async (req, res) => {
    try {
      const metrics = performanceOptimizationSystem.getPerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      logger.error('Performance metrics retrieval failed', error, req);
      res.status(500).json({ error: 'Performance metrics retrieval failed' });
    }
  });

  // Get cache statistics
  app.get('/api/performance/cache', requireAdmin, async (req, res) => {
    try {
      const stats = performanceOptimizationSystem.getCacheStats();
      res.json(stats);
    } catch (error) {
      logger.error('Cache statistics retrieval failed', error, req);
      res.status(500).json({ error: 'Cache statistics retrieval failed' });
    }
  });

  // Clear cache
  app.delete('/api/performance/cache', requireAdmin, async (req, res) => {
    try {
      await performanceOptimizationSystem.clear();
      res.json({ message: 'Cache cleared' });
    } catch (error) {
      logger.error('Cache clear failed', error, req);
      res.status(500).json({ error: 'Cache clear failed' });
    }
  });

  // Get cache configuration
  app.get('/api/performance/cache/config', requireAdmin, async (req, res) => {
    try {
      const config = performanceOptimizationSystem.getCacheConfig();
      res.json(config);
    } catch (error) {
      logger.error('Cache config retrieval failed', error, req);
      res.status(500).json({ error: 'Cache config retrieval failed' });
    }
  });

  // Update cache configuration
  app.put('/api/performance/cache/config', requireAdmin, async (req, res) => {
    try {
      const newConfig = req.body;
      performanceOptimizationSystem.updateCacheConfig(newConfig);
      res.json({ message: 'Cache configuration updated' });
    } catch (error) {
      logger.error('Cache config update failed', error, req);
      res.status(500).json({ error: 'Cache config update failed' });
    }
  });

  // Get CDN configuration
  app.get('/api/performance/cdn/config', requireAdmin, async (req, res) => {
    try {
      const config = performanceOptimizationSystem.getCDNConfig();
      res.json(config);
    } catch (error) {
      logger.error('CDN config retrieval failed', error, req);
      res.status(500).json({ error: 'CDN config retrieval failed' });
    }
  });

  // Update CDN configuration
  app.put('/api/performance/cdn/config', requireAdmin, async (req, res) => {
    try {
      const newConfig = req.body;
      performanceOptimizationSystem.updateCDNConfig(newConfig);
      res.json({ message: 'CDN configuration updated' });
    } catch (error) {
      logger.error('CDN config update failed', error, req);
      res.status(500).json({ error: 'CDN config update failed' });
    }
  });

  // Purge CDN cache
  app.post('/api/performance/cdn/purge', requireAdmin, async (req, res) => {
    try {
      const { paths } = req.body;
      
      if (!Array.isArray(paths)) {
        return res.status(400).json({ error: 'Paths array is required' });
      }
      
      const success = await performanceOptimizationSystem.purgeCDNCache(paths);
      res.json({ success, message: success ? 'CDN cache purged' : 'CDN cache purge failed' });
    } catch (error) {
      logger.error('CDN cache purge failed', error, req);
      res.status(500).json({ error: 'CDN cache purge failed' });
    }
  });

  // Get CDN URL
  app.get('/api/performance/cdn/url', async (req, res) => {
    try {
      const { path, type } = req.query;
      
      if (!path) {
        return res.status(400).json({ error: 'Path is required' });
      }
      
      const url = performanceOptimizationSystem.getCDNUrl(path as string, type as any);
      res.json({ url });
    } catch (error) {
      logger.error('CDN URL generation failed', error, req);
      res.status(500).json({ error: 'CDN URL generation failed' });
    }
  });

  // ===== INTEGRATED ENDPOINTS =====

  // Get user orders
  app.get('/api/user/orders', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const orders = await db.select()
        .from(puzzleOrders)
        .where(eq(puzzleOrders.userId, userId))
        .orderBy(desc(puzzleOrders.createdAt));

      res.json({ orders });
    } catch (error) {
      logger.error('Failed to get user orders', error, req);
      res.status(500).json({ error: 'Failed to get user orders' });
    }
  });

  // Basic order creation endpoint
  app.post('/api/orders', requireAuth, async (req, res) => {
    // Set proper headers to avoid 412 errors
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    
    try {
      const { items, totalPrice, shippingAddress, paymentMethod } = req.body;
      const userId = req.user?.userId;

      console.log('Order creation attempt:', { userId, itemsCount: items?.length, totalPrice });

      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Το καλάθι είναι άδειο' });
      }

      // DATA VALIDATION: Clean and validate all data (remove base64 images to reduce payload)
      const cleanItems = items.map((item: any) => ({
        name: String(item.name || 'Custom Puzzle').substring(0, 255),
        price: parseFloat(item.price) || 25,
        quantity: parseInt(item.quantity) || 1,
        material: String(item.material || 'paper').substring(0, 50),
        size: String(item.size || '20x30').substring(0, 20),
        image: item.image && item.image.startsWith('data:image') ? 'base64_image' : (item.image || ''),
        description: String(item.description || 'Custom puzzle design').substring(0, 500)
      }));

      console.log('Validated items:', cleanItems.length);

      // Create order with first item as main order
      const firstItem = cleanItems[0];
      
      // IMAGE HANDLING: Simplified image handling to avoid storage issues
      let imageFilename = 'default-puzzle.jpg';
      let imageFileId: string | null = null;
      let imageDownloadUrl: string | null = null;

      if (firstItem.image && firstItem.image.startsWith('data:image')) {
        try {
          console.log('Processing base64 image...');
          // Generate a simple filename without saving to storage
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 15);
          imageFilename = `puzzle_${timestamp}_${randomId}.jpg`;
          console.log('Generated image filename:', imageFilename);
        } catch (error) {
          console.warn('Failed to process image:', error);
          imageFilename = 'default-puzzle.jpg'; // fallback
        }
      } else if (firstItem.image) {
        imageFilename = firstItem.image;
      }

      console.log('Creating order with image:', imageFilename);

      // Calculate total price if not provided
      const calculatedTotalPrice = totalPrice || cleanItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

      const [newOrder] = await db.insert(puzzleOrders).values({
        userId,
        image: imageFilename,
        imageFileId: imageFileId,
        imageDownloadUrl: imageDownloadUrl,
        designData: JSON.stringify(cleanItems),
        quantity: cleanItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0),
        material: firstItem.material,
        size: firstItem.size,
        totalPrice: calculatedTotalPrice,
        status: 'pending',
        createdAt: new Date().toISOString()
      }).returning();

      console.log('Order created successfully:', newOrder.id);

      // MEMORY OPTIMIZATION: Clear cart only after successful order
      if (newOrder) {
        try {
          await db.delete(cartItems).where(eq(cartItems.userId, userId));
          console.log('Cart cleared for user:', userId);
        } catch (error) {
          console.warn('Failed to clear cart:', error);
        }
      }

      logger.orderCreated(newOrder.id, calculatedTotalPrice, userId, req);

      res.status(201).json({
        message: 'Η παραγγελία δημιουργήθηκε επιτυχώς!',
        orderId: newOrder.id,
        order: newOrder
      });
    } catch (error: any) {
      console.error('Order creation error:', error);
      
      // ERROR HANDLING: Better error responses with detailed logging
      if (error.code === 'SQLITE_ERROR') {
        logger.error('SQLITE_ERROR in order creation:', {
          error: error.message,
          code: error.code,
          userId: req.user?.userId,
          itemsCount: req.body?.items?.length,
          totalPrice: req.body?.totalPrice
        });
        res.status(500).json({ error: 'Database error - παρακαλώ δοκιμάστε ξανά' });
      } else if (error.message && error.message.includes('unsupported image format')) {
        logger.error('Image format error in order creation:', {
          error: error.message,
          userId: req.user?.userId,
          itemsCount: req.body?.items?.length
        });
        res.status(400).json({ error: 'Μη υποστηριζόμενη μορφή εικόνας' });
      } else {
        logger.error('General error in order creation:', {
          error: error.message,
          userId: req.user?.userId,
          itemsCount: req.body?.items?.length
        });
        res.status(500).json({ error: 'Σφάλμα κατά τη δημιουργία της παραγγελίας' });
      }
    }
  });

  // Order creation with email notification
  app.post('/api/orders/create-with-notification', requireAuth, async (req, res) => {
    try {
      const { image, designData, quantity, material, size } = req.body;
      
      if (!image || !designData || !quantity || !material || !size) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Save base64 image using universal storage
      const saveResult = await saveBase64ImageUniversal(image);
      
      let imageUrl: string;
      if (config.storage.type === 'google-drive' && saveResult.downloadUrl) {
        imageUrl = saveResult.downloadUrl;
      } else {
        imageUrl = `/api/admin/files/${saveResult.filename}`;
      }

      // Calculate price
      const basePrice = 25;
      const materialMultiplier = material === 'premium' ? 1.5 : 1.0;
      const sizeMultiplier = size === 'large' ? 1.3 : 1.0;
      const totalPrice = basePrice * materialMultiplier * sizeMultiplier * quantity;

      // Create order
      const newOrder = await db.insert(puzzleOrders).values({
        userId: (req.user?.userId || (req.session as any)?.userId)!,
        image: saveResult.filename,
        imageFileId: saveResult.fileId,
        imageDownloadUrl: saveResult.downloadUrl,
        designData: JSON.stringify(designData),
        quantity,
        material,
        size,
        totalPrice,
        status: 'pending'
      }).returning();

      // Get tracking information
      const tracking = await orderTrackingSystem.getOrderTracking(newOrder[0].id);
      
      if (tracking) {
        // Send order confirmation email
        await emailNotificationSystem.sendOrderConfirmationEmail(tracking);
      }

      logger.orderCreated(newOrder[0].id, totalPrice, (req.user?.userId || (req.session as any)?.userId)!, req);
      
      res.json({ 
        success: true, 
        orderId: newOrder[0].id,
        totalPrice,
        imageUrl,
        tracking
      });
    } catch (error) {
      logger.error('Order creation with notification failed', error, req);
      res.status(500).json({ error: 'Order creation with notification failed' });
    }
  });

  // Real-time order tracking with WebSocket support
  app.get('/api/tracking/:orderId/realtime', async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Set headers for Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      // Send initial tracking data
      const tracking = await orderTrackingSystem.getOrderTracking(orderId);
      if (tracking) {
        res.write(`data: ${JSON.stringify({ type: 'initial', data: tracking })}\n\n`);
      }

      // Subscribe to real-time updates
      const unsubscribe = orderTrackingSystem.subscribeToOrderUpdates(orderId, (update) => {
        res.write(`data: ${JSON.stringify({ type: 'update', data: update })}\n\n`);
      });

      // Handle client disconnect
      req.on('close', () => {
        unsubscribe();
      });
    } catch (error) {
      logger.error('Real-time tracking failed', error, req);
      res.status(500).json({ error: 'Real-time tracking failed' });
    }
  });

  // Dashboard with all metrics
  app.get('/api/dashboard', requireAdmin, async (req, res) => {
    try {
      const [
        businessMetrics,
        orderStats,
        performanceMetrics,
        emailQueueStatus,
        cacheStats
      ] = await Promise.all([
        advancedAnalyticsSystem.getBusinessMetrics('month'),
        orderTrackingSystem.getOrderStatistics(),
        performanceOptimizationSystem.getPerformanceMetrics(),
        emailNotificationSystem.getQueueStatus(),
        performanceOptimizationSystem.getCacheStats()
      ]);

      res.json({
        businessMetrics,
        orderStats,
        performanceMetrics,
        emailQueueStatus,
        cacheStats,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Dashboard data retrieval failed', error, req);
      res.status(500).json({ error: 'Dashboard data retrieval failed' });
    }
  });

  // ===== ADMIN DOWNLOAD ENDPOINTS =====

  // Download customer image from Google Drive
  app.get('/api/admin/download-image/:orderId', requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Get order details
      const order = await db.select()
        .from(puzzleOrders)
        .where(eq(puzzleOrders.id, orderId))
        .limit(1);

      if (order.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const orderData = order[0];

      // Check if image is stored in Google Drive
      if (orderData.imageFileId && orderData.imageDownloadUrl) {
        // Redirect to Google Drive download URL
        res.redirect(orderData.imageDownloadUrl);
      } else {
        // Serve local file
        const imagePath = getFilePath(orderData.image);
        if (fileExists(imagePath)) {
          res.download(imagePath);
        } else {
          res.status(404).json({ error: 'Image file not found' });
        }
      }
    } catch (error) {
      logger.error('Image download failed', error, req);
      res.status(500).json({ error: 'Image download failed' });
    }
  });

  // Download design SVG from Google Drive
  app.get('/api/admin/download-design/:orderId', requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Get order details
      const order = await db.select()
        .from(puzzleOrders)
        .where(eq(puzzleOrders.id, orderId))
        .limit(1);

      if (order.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const orderData = order[0];
      const designData = JSON.parse(orderData.designData);

      // Generate design SVG
      const designSVG = generateDesignSVG(designData);
      
      // Set headers for SVG download
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="design_${orderId}.svg"`);
      res.send(designSVG);
    } catch (error) {
      logger.error('Design SVG download failed', error, req);
      res.status(500).json({ error: 'Design SVG download failed' });
    }
  });

  // Download laser SVG from Google Drive
  app.get('/api/admin/download-laser/:orderId', requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // Get order details
      const order = await db.select()
        .from(puzzleOrders)
        .where(eq(puzzleOrders.id, orderId))
        .limit(1);

      if (order.length === 0) {
        return res.status(404).json({ error: 'Order not found' });
      }

      const orderData = order[0];
      
      // Parse designData from database
      const designData = JSON.parse(orderData.designData);

      // Check if it's a fractal puzzle with customization data
      if (designData && Array.isArray(designData) && designData[0]?.customization) {
        const customization = designData[0].customization;

        // Priority 1: Use svgLaser (laser cutting paths only)
        if (customization.svgLaser) {
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Content-Disposition', `attachment; filename="laser_${orderId}.svg"`);
          res.send(customization.svgLaser);
          return;
        }

        // Priority 2: Use svgData (fallback for laser cutting)
        if (customization.svgData) {
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Content-Disposition', `attachment; filename="laser_${orderId}.svg"`);
          res.send(customization.svgData);
          return;
        }

        // Priority 3: Clean svgOutput (remove image, keep only paths)
        if (customization.svgOutput) {
          // Remove image data from SVG, keep only paths
          const cleanSVG = customization.svgOutput.replace(/<image[^>]*>/g, '');
          res.setHeader('Content-Type', 'image/svg+xml');
          res.setHeader('Content-Disposition', `attachment; filename="laser_${orderId}.svg"`);
          res.send(cleanSVG);
          return;
        }
      }

      // Fallback: Generate laser SVG using existing function
      const laserSVG = generateLaserSVG(designData);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="laser_${orderId}.svg"`);
      res.send(laserSVG);
    } catch (error) {
      logger.error('Laser SVG download failed', error, req);
      res.status(500).json({ error: 'Laser SVG download failed' });
    }
  });

  // Get all orders for admin panel
  app.get('/api/admin/orders', requireAdmin, async (req, res) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = db.select({
        id: puzzleOrders.id,
        userId: puzzleOrders.userId,
        image: puzzleOrders.image,
        imageFileId: puzzleOrders.imageFileId,
        imageDownloadUrl: puzzleOrders.imageDownloadUrl,
        quantity: puzzleOrders.quantity,
        material: puzzleOrders.material,
        size: puzzleOrders.size,
        totalPrice: puzzleOrders.totalPrice,
        status: puzzleOrders.status,
        createdAt: puzzleOrders.createdAt,
        updatedAt: puzzleOrders.updatedAt,
        customerEmail: authUsers.email,
        customerName: sql`${authUsers.firstName} || ' ' || ${authUsers.lastName}`
      })
      .from(puzzleOrders)
      .leftJoin(authUsers, eq(puzzleOrders.userId, authUsers.id));

      // Apply filters
      if (status) {
        query = query.where(eq(puzzleOrders.status, status as string));
      }

      if (search) {
        query = query.where(sql`${authUsers.email} LIKE ${`%${search}%`} OR ${puzzleOrders.id} LIKE ${`%${search}%`}`);
      }

      // Get total count
      const countQuery = db.select({ count: sql`count(*)` })
        .from(puzzleOrders)
        .leftJoin(authUsers, eq(puzzleOrders.userId, authUsers.id));

      const [orders, countResult] = await Promise.all([
        query.orderBy(desc(puzzleOrders.createdAt)).limit(Number(limit)).offset(offset),
        countQuery
      ]);

      const totalCount = Number(countResult[0]?.count || 0);
      const totalPages = Math.ceil(totalCount / Number(limit));

      res.json({
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalCount,
          totalPages,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });
    } catch (error) {
      logger.error('Orders retrieval failed', error, req);
      res.status(500).json({ error: 'Orders retrieval failed' });
    }
  });

  // ===== PUZZLE SAVE ENDPOINT =====

  // Complete puzzle save endpoint
  app.post('/api/puzzle/save', requireAuth, async (req, res) => {
    try {
      const { image, designData, quantity, material, size } = req.body;
      
      if (!image || !designData || !quantity || !material || !size) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Save base64 image using universal storage
      const saveResult = await saveBase64ImageUniversal(image);
      
      let imageUrl: string;
      if (config.storage.type === 'google-drive' && saveResult.downloadUrl) {
        imageUrl = saveResult.downloadUrl;
      } else {
        imageUrl = `/api/admin/files/${saveResult.filename}`;
      }

      // Calculate price
      const basePrice = 25;
      const materialMultiplier = material === 'premium' ? 1.5 : 1.0;
      const sizeMultiplier = size === 'large' ? 1.3 : 1.0;
      const totalPrice = basePrice * materialMultiplier * sizeMultiplier * quantity;

      // Save design SVG to Google Drive
      const designSVG = generateDesignSVG(designData);
      const designFileName = `design_${Date.now()}.svg`;
      const designSaveResult = await saveBase64ImageUniversal(
        `data:image/svg+xml;base64,${Buffer.from(designSVG).toString('base64')}`,
        designFileName
      );

      // Save laser SVG to Google Drive
      const laserSVG = generateLaserSVG(designData);
      const laserFileName = `laser_${Date.now()}.svg`;
      const laserSaveResult = await saveBase64ImageUniversal(
        `data:image/svg+xml;base64,${Buffer.from(laserSVG).toString('base64')}`,
        laserFileName
      );

      // Create order in database
      const newOrder = await db.insert(puzzleOrders).values({
        userId: (req.user?.userId || (req.session as any)?.userId)!,
        image: saveResult.filename,
        imageFileId: saveResult.fileId,
        imageDownloadUrl: saveResult.downloadUrl,
        designData: JSON.stringify(designData),
        quantity,
        material,
        size,
        totalPrice,
        status: 'pending'
      }).returning();

      // Get tracking information
      const tracking = await orderTrackingSystem.getOrderTracking(newOrder[0].id);
      
      if (tracking) {
        // Send order confirmation email
        await emailNotificationSystem.sendOrderConfirmationEmail(tracking);
      }

      logger.orderCreated(newOrder[0].id, totalPrice, (req.user?.userId || (req.session as any)?.userId)!, req);
      
      res.json({ 
        success: true, 
        orderId: newOrder[0].id,
        totalPrice,
        imageUrl,
        designUrl: designSaveResult.downloadUrl || `/api/admin/files/${designSaveResult.filename}`,
        laserUrl: laserSaveResult.downloadUrl || `/api/admin/files/${laserSaveResult.filename}`,
        tracking
      });
    } catch (error) {
      logger.error('Puzzle save failed', error, req);
      res.status(500).json({ error: 'Puzzle save failed' });
    }
  });

  // GDPR Compliance Endpoints
  app.get('/api/user/export', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      // Export user data
      const userData = await exportUserData(userId);
      
      res.json({
        success: true,
        data: userData,
        exportedAt: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Data export failed:', error);
      res.status(500).json({ error: 'Failed to export user data' });
    }
  });

  app.delete('/api/user/account', requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      // Delete user data
      await deleteUserData(userId);
      
      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          logger.error('Session destruction failed:', err);
        }
      });
      
      res.json({ 
        success: true,
        message: 'Account deleted successfully' 
      });
    } catch (error) {
      logger.error('Account deletion failed:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  });

  // Production Monitoring Endpoints
  app.get('/api/monitoring/alerts', requireAdmin, async (req, res) => {
    try {
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      
      const alerts = {
        memoryUsage: {
          used: heapUsedMB,
          total: heapTotalMB,
          percentage: Math.round((heapUsedMB / heapTotalMB) * 100),
          status: heapUsedMB > 500 ? 'warning' : 'healthy'
        },
        diskSpace: await checkDiskSpace(),
        databaseConnections: await checkDatabaseConnections(),
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };
      
      res.json(alerts);
    } catch (error) {
      logger.error('Monitoring alerts failed:', error);
      res.status(500).json({ error: 'Failed to get monitoring alerts' });
    }
  });

  app.get('/api/monitoring/performance', requireAdmin, async (req, res) => {
    try {
      const performance = {
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        timestamp: new Date().toISOString()
      };
      
      res.json(performance);
    } catch (error) {
      logger.error('Performance monitoring failed:', error);
      res.status(500).json({ error: 'Failed to get performance data' });
    }
  });



  // Add missing cart endpoints
  app.get('/api/cart', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userCartItems = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
              res.json(userCartItems);
    } catch (error) {
      logger.error('Failed to fetch cart items', error, req);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  });

  app.post('/api/cart', requireAuth, async (req, res) => {
    try {
      const userId = req.user?.userId || req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const { productId, quantity = 1 } = req.body;
      
      const [newItem] = await db.insert(cartItems).values({
        userId,
        productId,
        quantity
      }).returning();

      res.json(newItem);
    } catch (error) {
      logger.error('Failed to add item to cart', error, req);
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  });

  return app;
}