import fs from 'fs';
import path from 'path';
import { config } from './config';
import { logger } from './logger';
import { db, getDatabaseStatus } from './db';

// Check disk space
export const checkDiskSpace = async () => {
  try {
    const uploadDir = config.upload.dir;
    const stats = await fs.promises.statfs(uploadDir);
    
    const totalBytes = stats.blocks * stats.bsize;
    const freeBytes = stats.bavail * stats.bsize;
    const usedBytes = totalBytes - freeBytes;
    const usedPercentage = Math.round((usedBytes / totalBytes) * 100);
    
    return {
      total: Math.round(totalBytes / 1024 / 1024), // MB
      used: Math.round(usedBytes / 1024 / 1024),   // MB
      free: Math.round(freeBytes / 1024 / 1024),   // MB
      percentage: usedPercentage,
      status: usedPercentage > 90 ? 'warning' : usedPercentage > 95 ? 'critical' : 'healthy'
    };
  } catch (error) {
    logger.error('Disk space check failed:', error);
    return {
      total: 0,
      used: 0,
      free: 0,
      percentage: 0,
      status: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Check database connections
export const checkDatabaseConnections = async () => {
  try {
    const dbStatus = getDatabaseStatus();
    
    if (dbStatus.type === 'postgresql' && db.pool) {
      const pool = db.pool;
      return {
        type: 'postgresql',
        total: pool.totalCount,
        idle: pool.idleCount,
        waiting: pool.waitingCount,
        status: pool.totalCount > 10 ? 'warning' : 'healthy'
      };
    } else if (dbStatus.type === 'sqlite') {
      return {
        type: 'sqlite',
        total: 1,
        idle: 1,
        waiting: 0,
        status: 'healthy'
      };
    } else {
      return {
        type: 'unknown',
        total: 0,
        idle: 0,
        waiting: 0,
        status: 'unknown'
      };
    }
  } catch (error) {
    logger.error('Database connection check failed:', error);
    return {
      type: 'error',
      total: 0,
      idle: 0,
      waiting: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Check Google Drive quota (if applicable)
export const checkGoogleDriveQuota = async () => {
  try {
    if (config.storage.type !== 'google-drive') {
      return {
        available: 'N/A',
        used: 'N/A',
        status: 'not_applicable'
      };
    }
    
    // This would require Google Drive API quota check
    // For now, return a placeholder
    return {
      available: '15GB',
      used: 'Unknown',
      status: 'unknown'
    };
  } catch (error) {
    logger.error('Google Drive quota check failed:', error);
    return {
      available: 'Unknown',
      used: 'Unknown',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
