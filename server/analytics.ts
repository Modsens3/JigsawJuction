import { db } from './db';
import { fileStorage, puzzleOrders, authUsers } from '../shared/schema';
import { eq, and, desc, sql, count, sum, avg, max, min } from 'drizzle-orm';
import { logger } from './logger';
import { getStorageStatus } from './upload';
import { fileVersioningSystem } from './versioning';
import { bulkOperationsManager } from './bulk-operations';

export interface StorageAnalytics {
  overview: {
    totalFiles: number;
    totalSize: number;
    averageFileSize: number;
    storageTypes: { [key: string]: number };
    fileTypes: { [key: string]: number };
  };
  trends: {
    dailyUploads: Array<{ date: string; count: number; size: number }>;
    weeklyGrowth: Array<{ week: string; growth: number }>;
    monthlyUsage: Array<{ month: string; files: number; size: number }>;
  };
  performance: {
    uploadSpeed: number;
    downloadSpeed: number;
    errorRate: number;
    storageEfficiency: number;
  };
  userActivity: {
    topUploaders: Array<{ userId: string; files: number; size: number }>;
    activeUsers: number;
    newUsers: number;
  };
  fileInsights: {
    largestFiles: Array<{ filename: string; size: number; type: string }>;
    mostDownloaded: Array<{ filename: string; downloads: number }>;
    duplicateFiles: Array<{ filename: string; count: number }>;
  };
  systemHealth: {
    storageHealth: string;
    syncStatus: string;
    backupStatus: string;
    errors: Array<{ type: string; count: number; lastOccurrence: Date }>;
  };
}

export interface AnalyticsOptions {
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
  includeDeleted?: boolean;
  groupBy?: 'user' | 'type' | 'storage' | 'date';
  limit?: number;
}

export class AnalyticsSystem {
  // Get storage overview
  async getStorageOverview(): Promise<StorageAnalytics['overview']> {
    try {
      // Get total files and size
      const totalStats = await db.select({
        totalFiles: count(fileStorage.id),
        totalSize: sum(fileStorage.size),
        averageSize: avg(fileStorage.size)
      }).from(fileStorage);

      // Get storage type distribution
      const storageTypes = await db.select({
        storageType: fileStorage.storageType,
        count: count(fileStorage.id)
      })
      .from(fileStorage)
      .groupBy(fileStorage.storageType);

      // Get file type distribution
      const fileTypes = await db.select({
        mimeType: fileStorage.mimeType,
        count: count(fileStorage.id)
      })
      .from(fileStorage)
      .groupBy(fileStorage.mimeType);

      const storageTypeMap: { [key: string]: number } = {};
      const fileTypeMap: { [key: string]: number } = {};

      storageTypes.forEach((st: any) => {
        storageTypeMap[st.storageType] = Number(st.count);
      });

      fileTypes.forEach((ft: any) => {
        const type = ft.mimeType.split('/')[0]; // Get main type (image, video, etc.)
        fileTypeMap[type] = (fileTypeMap[type] || 0) + Number(ft.count);
      });

      return {
        totalFiles: Number(totalStats[0].totalFiles),
        totalSize: Number(totalStats[0].totalSize) || 0,
        averageFileSize: Number(totalStats[0].averageSize) || 0,
        storageTypes: storageTypeMap,
        fileTypes: fileTypeMap
      };
    } catch (error) {
      logger.error('Failed to get storage overview', error);
      throw error;
    }
  }

  // Get daily upload trends
  async getDailyUploads(days: number = 30): Promise<StorageAnalytics['trends']['dailyUploads']> {
    try {
      const result = await db.select({
        date: sql<string>`DATE(${fileStorage.createdAt})`,
        count: count(fileStorage.id),
        size: sum(fileStorage.size)
      })
      .from(fileStorage)
      .where(sql`${fileStorage.createdAt} >= DATE('now', '-${days} days')`)
      .groupBy(sql`DATE(${fileStorage.createdAt})`)
      .orderBy(sql`DATE(${fileStorage.createdAt})`);

      return result.map((row: any) => ({
        date: row.date,
        count: Number(row.count),
        size: Number(row.size) || 0
      }));
    } catch (error) {
      logger.error('Failed to get daily uploads', error);
      throw error;
    }
  }

  // Get weekly growth
  async getWeeklyGrowth(weeks: number = 12): Promise<StorageAnalytics['trends']['weeklyGrowth']> {
    try {
      const result = await db.select({
        week: sql<string>`strftime('%Y-W%W', ${fileStorage.createdAt})`,
        count: count(fileStorage.id)
      })
      .from(fileStorage)
      .where(sql`${fileStorage.createdAt} >= DATE('now', '-${weeks * 7} days')`)
      .groupBy(sql`strftime('%Y-W%W', ${fileStorage.createdAt})`)
      .orderBy(sql`strftime('%Y-W%W', ${fileStorage.createdAt})`);

      const growth: Array<{ week: string; growth: number }> = [];
      
      for (let i = 1; i < result.length; i++) {
        const current = Number(result[i].count);
        const previous = Number(result[i - 1].count);
        const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
        
        growth.push({
          week: result[i].week,
          growth: growthRate
        });
      }

      return growth;
    } catch (error) {
      logger.error('Failed to get weekly growth', error);
      throw error;
    }
  }

  // Get monthly usage
  async getMonthlyUsage(months: number = 12): Promise<StorageAnalytics['trends']['monthlyUsage']> {
    try {
      const result = await db.select({
        month: sql<string>`strftime('%Y-%m', ${fileStorage.createdAt})`,
        files: count(fileStorage.id),
        size: sum(fileStorage.size)
      })
      .from(fileStorage)
      .where(sql`${fileStorage.createdAt} >= DATE('now', '-${months} months')`)
      .groupBy(sql`strftime('%Y-%m', ${fileStorage.createdAt})`)
      .orderBy(sql`strftime('%Y-%m', ${fileStorage.createdAt})`);

      return result.map(row => ({
        month: row.month,
        files: Number(row.files),
        size: Number(row.size) || 0
      }));
    } catch (error) {
      logger.error('Failed to get monthly usage', error);
      throw error;
    }
  }

  // Get performance metrics
  async getPerformanceMetrics(): Promise<StorageAnalytics['performance']> {
    try {
      // Get recent operations for performance calculation
      const operations = bulkOperationsManager.getAllOperations();
      const recentOperations = operations.filter(op => 
        op.startedAt > new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      );

      let totalUploadTime = 0;
      let totalDownloadTime = 0;
      let totalErrors = 0;
      let totalOperations = 0;

      recentOperations.forEach(op => {
        if (op.completedAt) {
          const duration = op.completedAt.getTime() - op.startedAt.getTime();
          
          if (op.type === 'upload') {
            totalUploadTime += duration;
          } else if (op.type === 'download') {
            totalDownloadTime += duration;
          }
          
          totalErrors += op.failedFiles;
          totalOperations += op.totalFiles;
        }
      });

      const uploadCount = recentOperations.filter(op => op.type === 'upload').length;
      const downloadCount = recentOperations.filter(op => op.type === 'download').length;

      const uploadSpeed = uploadCount > 0 ? totalUploadTime / uploadCount : 0;
      const downloadSpeed = downloadCount > 0 ? totalDownloadTime / downloadCount : 0;
      const errorRate = totalOperations > 0 ? (totalErrors / totalOperations) * 100 : 0;

      // Calculate storage efficiency (compression ratio)
      const overview = await this.getStorageOverview();
      const storageEfficiency = overview.totalSize > 0 ? 
        (overview.totalSize / (overview.totalSize * 1.2)) * 100 : 100; // Assume 20% overhead

      return {
        uploadSpeed,
        downloadSpeed,
        errorRate,
        storageEfficiency
      };
    } catch (error) {
      logger.error('Failed to get performance metrics', error);
      throw error;
    }
  }

  // Get user activity
  async getUserActivity(): Promise<StorageAnalytics['userActivity']> {
    try {
      // Get top uploaders
      const topUploaders = await db.select({
        userId: fileStorage.uploadedBy,
        files: count(fileStorage.id),
        size: sum(fileStorage.size)
      })
      .from(fileStorage)
      .where(sql`${fileStorage.uploadedBy} IS NOT NULL`)
      .groupBy(fileStorage.uploadedBy)
      .orderBy(desc(count(fileStorage.id)))
      .limit(10);

      // Get active users (users who uploaded in last 30 days)
      const activeUsers = await db.select({
        count: count(sql`DISTINCT ${fileStorage.uploadedBy}`)
      })
      .from(fileStorage)
      .where(sql`${fileStorage.uploadedBy} IS NOT NULL AND ${fileStorage.createdAt} >= DATE('now', '-30 days')`);

      // Get new users (users who joined in last 30 days)
      const newUsers = await db.select({
        count: count(authUsers.id)
      })
      .from(authUsers)
      .where(sql`${authUsers.createdAt} >= DATE('now', '-30 days')`);

      return {
        topUploaders: topUploaders.map(uploader => ({
          userId: uploader.userId!,
          files: Number(uploader.files),
          size: Number(uploader.size) || 0
        })),
        activeUsers: Number(activeUsers[0].count),
        newUsers: Number(newUsers[0].count)
      };
    } catch (error) {
      logger.error('Failed to get user activity', error);
      throw error;
    }
  }

  // Get file insights
  async getFileInsights(): Promise<StorageAnalytics['fileInsights']> {
    try {
      // Get largest files
      const largestFiles = await db.select({
        filename: fileStorage.filename,
        size: fileStorage.size,
        mimeType: fileStorage.mimeType
      })
      .from(fileStorage)
      .orderBy(desc(fileStorage.size))
      .limit(10);

      // Get most downloaded files (files with download URLs)
      const mostDownloaded = await db.select({
        filename: fileStorage.filename,
        downloadUrl: fileStorage.downloadUrl
      })
      .from(fileStorage)
      .where(sql`${fileStorage.downloadUrl} IS NOT NULL`)
      .orderBy(desc(fileStorage.size))
      .limit(10);

      // Get duplicate files (same filename)
      const duplicateFiles = await db.select({
        filename: fileStorage.filename,
        count: count(fileStorage.id)
      })
      .from(fileStorage)
      .groupBy(fileStorage.filename)
      .having(sql`count(${fileStorage.id}) > 1`)
      .orderBy(desc(count(fileStorage.id)))
      .limit(10);

      return {
        largestFiles: largestFiles.map(file => ({
          filename: file.filename,
          size: Number(file.size),
          type: file.mimeType
        })),
        mostDownloaded: mostDownloaded.map(file => ({
          filename: file.filename,
          downloads: 1 // Placeholder - would need download tracking
        })),
        duplicateFiles: duplicateFiles.map(file => ({
          filename: file.filename,
          count: Number(file.count)
        }))
      };
    } catch (error) {
      logger.error('Failed to get file insights', error);
      throw error;
    }
  }

  // Get system health
  async getSystemHealth(): Promise<StorageAnalytics['systemHealth']> {
    try {
      const storageStatus = await getStorageStatus();
      
      // Get recent errors from operations
      const operations = bulkOperationsManager.getAllOperations();
      const recentErrors = operations
        .filter(op => op.errors.length > 0 && op.startedAt > new Date(Date.now() - 24 * 60 * 60 * 1000))
        .flatMap(op => op.errors);

      // Group errors by type
      const errorGroups: { [key: string]: number } = {};
      recentErrors.forEach(error => {
        const errorType = error.split(':')[0];
        errorGroups[errorType] = (errorGroups[errorType] || 0) + 1;
      });

      const errors = Object.entries(errorGroups).map(([type, count]) => ({
        type,
        count,
        lastOccurrence: new Date()
      }));

      return {
        storageHealth: storageStatus.available ? 'healthy' : 'unhealthy',
        syncStatus: 'synced', // Placeholder - would need sync status tracking
        backupStatus: 'backed_up', // Placeholder - would need backup status tracking
        errors
      };
    } catch (error) {
      logger.error('Failed to get system health', error);
      throw error;
    }
  }

  // Get comprehensive analytics
  async getComprehensiveAnalytics(options: AnalyticsOptions = {}): Promise<StorageAnalytics> {
    try {
      const [
        overview,
        dailyUploads,
        weeklyGrowth,
        monthlyUsage,
        performance,
        userActivity,
        fileInsights,
        systemHealth
      ] = await Promise.all([
        this.getStorageOverview(),
        this.getDailyUploads(),
        this.getWeeklyGrowth(),
        this.getMonthlyUsage(),
        this.getPerformanceMetrics(),
        this.getUserActivity(),
        this.getFileInsights(),
        this.getSystemHealth()
      ]);

      return {
        overview,
        trends: {
          dailyUploads,
          weeklyGrowth,
          monthlyUsage
        },
        performance,
        userActivity,
        fileInsights,
        systemHealth
      };
    } catch (error) {
      logger.error('Failed to get comprehensive analytics', error);
      throw error;
    }
  }

  // Get custom analytics query
  async getCustomAnalytics(query: string, params: any[] = []): Promise<any> {
    try {
      // This is a simplified version - in production you'd want proper SQL injection protection
      const result = await db.execute(sql.raw(query));
      return result;
    } catch (error) {
      logger.error('Failed to execute custom analytics query', error);
      throw error;
    }
  }

  // Export analytics data
  async exportAnalytics(format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const analytics = await this.getComprehensiveAnalytics();
      
      if (format === 'json') {
        return JSON.stringify(analytics, null, 2);
      } else {
        // Convert to CSV format
        const csvRows: Array<Array<string | number>> = [];
        
        // Overview
        csvRows.push(['Category', 'Metric', 'Value']);
        csvRows.push(['Overview', 'Total Files', analytics.overview.totalFiles]);
        csvRows.push(['Overview', 'Total Size', analytics.overview.totalSize]);
        csvRows.push(['Overview', 'Average File Size', analytics.overview.averageFileSize]);
        
        // Storage Types
        Object.entries(analytics.overview.storageTypes).forEach(([type, count]) => {
          csvRows.push(['Storage Types', type, count]);
        });
        
        // File Types
        Object.entries(analytics.overview.fileTypes).forEach(([type, count]) => {
          csvRows.push(['File Types', type, count]);
        });
        
        return csvRows.map(row => row.join(',')).join('\n');
      }
    } catch (error) {
      logger.error('Failed to export analytics', error);
      throw error;
    }
  }
}

// Export singleton instance
export const analyticsSystem = new AnalyticsSystem();
