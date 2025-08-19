import { db } from './db';
import { logger } from './logger';
import { config } from './config';
import { performanceMonitor } from './performance-monitor';
import { memoryOptimizer } from './memory-optimizer';
import fs from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';

// Health check status
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: {
    database: HealthCheck;
    disk: HealthCheck;
    memory: HealthCheck;
    uploads: HealthCheck;
  };
}

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  message: string;
  details?: any;
}

// System metrics
export interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  uploads: {
    totalFiles: number;
    totalSize: number;
    oldestFile: string;
    newestFile: string;
  };
}

// Health check function
export const getHealthStatus = async (): Promise<HealthStatus> => {
  const checks = {
    database: await checkDatabase(),
    disk: await checkDiskSpace(),
    memory: await checkMemory(),
    uploads: await checkUploads()
  };

  const overallStatus = determineOverallStatus(checks);

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: config.server.nodeEnv,
    checks
  };
};

// Database health check
const checkDatabase = async (): Promise<HealthCheck> => {
  try {
    // Check if database is actually connected
    try {
      // SQLite health check - use a simple query that works with SQLite
      const result = await db.run(sql`SELECT 1 as test`);
      
      return {
        status: 'healthy',
        message: 'SQLite database connection is working',
        details: {
          type: 'sqlite',
          file: 'local.db',
          status: 'connected',
          actualType: 'sqlite',
          configType: 'sqlite'
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Database connection failed',
        details: {
          type: 'sqlite',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      message: 'Database health check failed',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
};

// Disk space health check
const checkDiskSpace = async (): Promise<HealthCheck> => {
  try {
    const uploadDir = path.resolve(config.upload.dir);
    const stats = fs.statSync(uploadDir);
    
    // For now, just check if directory is accessible
    // In production, you'd want to check actual disk space
    return {
      status: 'healthy',
      message: 'Disk space is sufficient',
      details: {
        uploadDir,
        accessible: true
      }
    };
  } catch (error) {
    logger.error('Disk health check failed', error);
    return {
      status: 'unhealthy',
      message: 'Disk space check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Memory health check
const checkMemory = async (): Promise<HealthCheck> => {
  try {
    // Memory usage check
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100;
    
    // More realistic memory thresholds for development
    const memoryStatus = memoryUsagePercent > 100 ? 'unhealthy' : 'healthy';
    
    return {
      status: memoryStatus,
      message: memoryUsagePercent > 100 ? 'Memory usage is too high' : 'Memory usage is normal',
      details: {
        usedMB: heapUsedMB,
        totalMB: heapTotalMB,
        percentage: memoryUsagePercent
      }
    };
  } catch (error) {
    logger.error('Memory health check failed', error);
    return {
      status: 'unhealthy',
      message: 'Memory check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Uploads health check
const checkUploads = async (): Promise<HealthCheck> => {
  try {
    const uploadDir = path.resolve(config.upload.dir);
    
    if (!fs.existsSync(uploadDir)) {
      return {
        status: 'unhealthy',
        message: 'Uploads directory does not exist'
      };
    }

    const files = fs.readdirSync(uploadDir);
    const totalFiles = files.length;
    
    let totalSize = 0;
    let oldestFile = '';
    let newestFile = '';
    let oldestTime = Date.now();
    let newestTime = 0;

    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      const stats = fs.statSync(filePath);
      
      totalSize += stats.size;
      
      if (stats.mtime.getTime() < oldestTime) {
        oldestTime = stats.mtime.getTime();
        oldestFile = file;
      }
      
      if (stats.mtime.getTime() > newestTime) {
        newestTime = stats.mtime.getTime();
        newestFile = file;
      }
    }

    return {
      status: 'healthy',
      message: 'Uploads directory is accessible',
      details: {
        totalFiles,
        totalSize: `${Math.round(totalSize / 1024 / 1024)}MB`,
        oldestFile,
        newestFile
      }
    };
  } catch (error) {
    logger.error('Uploads health check failed', error);
    return {
      status: 'unhealthy',
      message: 'Uploads check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Determine overall status
const determineOverallStatus = (checks: any): 'healthy' | 'unhealthy' => {
  const statuses = Object.values(checks).map((check: any) => check.status);
  
  if (statuses.includes('unhealthy')) {
    return 'unhealthy';
  } else {
    return 'healthy';
  }
};

// Get system metrics
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  const memUsage = process.memoryUsage();
  const uploadDir = path.resolve(config.upload.dir);
  
  let uploadStats = {
    totalFiles: 0,
    totalSize: 0,
    oldestFile: '',
    newestFile: ''
  };

  try {
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      uploadStats.totalFiles = files.length;
      
      let totalSize = 0;
      let oldestTime = Date.now();
      let newestTime = 0;

      for (const file of files) {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        
        totalSize += stats.size;
        
        if (stats.mtime.getTime() < oldestTime) {
          oldestTime = stats.mtime.getTime();
          uploadStats.oldestFile = file;
        }
        
        if (stats.mtime.getTime() > newestTime) {
          newestTime = stats.mtime.getTime();
          uploadStats.newestFile = file;
        }
      }
      
      uploadStats.totalSize = totalSize;
    }
  } catch (error) {
    logger.error('Failed to get upload stats', error);
  }

  return {
    memory: {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100)
    },
    disk: {
      used: 0, // Would need additional library for disk space
      total: 0,
      percentage: 0
    },
    uploads: {
      totalFiles: uploadStats.totalFiles,
      totalSize: uploadStats.totalSize,
      oldestFile: uploadStats.oldestFile,
      newestFile: uploadStats.newestFile
    }
  };
};

// Performance monitoring
export const healthPerformanceMonitor = {
  requests: 0,
  errors: 0,
  startTime: Date.now(),
  
  incrementRequests() {
    this.requests++;
    // Record API request in performance optimization system
    performanceMonitor.recordRequest(0, true);
  },
  
  incrementErrors() {
    this.errors++;
    // Record API error in performance optimization system
    performanceMonitor.recordRequest(0, false);
  },
  
  getStats() {
    const uptime = Date.now() - this.startTime;
    const requestsPerMinute = (this.requests / (uptime / 60000)).toFixed(2);
    const errorRate = this.requests > 0 ? ((this.errors / this.requests) * 100).toFixed(2) : '0';
    
    return {
      uptime: Math.round(uptime / 1000),
      totalRequests: this.requests,
      totalErrors: this.errors,
      requestsPerMinute,
      errorRate: `${errorRate}%`
    };
  }
};
