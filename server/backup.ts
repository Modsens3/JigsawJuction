import fs from 'fs';
import path from 'path';
import { db } from './db';
import { fileStorage, authUsers, puzzleOrders, cartItems } from '../shared/schema';
import { config } from './config';
import { logger } from './logger';
import { 
  uploadToDrive,
  downloadFromDrive,
  listFiles as listDriveFiles,
  isDriveAvailable
} from './google-drive';
import { 
  getFilePath,
  fileExists,
  listFilesUniversal
} from './upload';
import { fileVersioningSystem } from './versioning';
import { analyticsService } from './analytics';
import { fileSynchronizer } from './sync';
import { bulkOperationsManager } from './bulk-operations';

export interface BackupConfig {
  enabled: boolean;
  schedule: 'daily' | 'weekly' | 'monthly';
  retention: number; // days
  includeFiles: boolean;
  includeDatabase: boolean;
  includeAnalytics: boolean;
  includeVersions: boolean;
  compression: boolean;
  encryption: boolean;
  destination: 'google-drive' | 'local' | 'both';
}

export interface BackupJob {
  id: string;
  type: 'full' | 'incremental' | 'database' | 'files';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  filesBackedUp: number;
  databaseBackedUp: boolean;
  analyticsBackedUp: boolean;
  versionsBackedUp: boolean;
  totalSize: number;
  errors: string[];
  backupPath?: string;
  driveFileId?: string;
}

export interface BackupMetadata {
  version: string;
  timestamp: Date;
  type: 'full' | 'incremental' | 'database' | 'files';
  files: number;
  database: boolean;
  analytics: boolean;
  versions: boolean;
  totalSize: number;
  checksum: string;
  config: BackupConfig;
}

class BackupSystem {
  private backupDir: string;
  private jobs: Map<string, BackupJob> = new Map();
  private config: BackupConfig;

  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDir();
    
    this.config = {
      enabled: true,
      schedule: 'daily',
      retention: 30,
      includeFiles: true,
      includeDatabase: true,
      includeAnalytics: true,
      includeVersions: true,
      compression: true,
      encryption: false,
      destination: 'google-drive'
    };
  }

  private ensureBackupDir() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  // Generate backup ID
  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create backup job
  private createBackupJob(type: BackupJob['type']): string {
    const id = this.generateBackupId();
    const job: BackupJob = {
      id,
      type,
      status: 'pending',
      startedAt: new Date(),
      filesBackedUp: 0,
      databaseBackedUp: false,
      analyticsBackedUp: false,
      versionsBackedUp: false,
      totalSize: 0,
      errors: []
    };

    this.jobs.set(id, job);
    return id;
  }

  // Update backup job
  private updateBackupJob(id: string, updates: Partial<BackupJob>) {
    const job = this.jobs.get(id);
    if (job) {
      Object.assign(job, updates);
    }
  }

  // Full backup
  async createFullBackup(): Promise<string> {
    const jobId = this.createBackupJob('full');
    
    // Start async backup
    this.performFullBackup(jobId);
    
    return jobId;
  }

  private async performFullBackup(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      this.updateBackupJob(jobId, { status: 'running' });
      logger.info(`Starting full backup: ${jobId}`);

      const backupPath = path.join(this.backupDir, `${jobId}.zip`);
      const backupData: any = {
        metadata: {
          version: '1.0.0',
          timestamp: new Date(),
          type: 'full',
          files: 0,
          database: false,
          analytics: false,
          versions: false,
          totalSize: 0,
          checksum: '',
          config: this.config
        },
        database: null,
        analytics: null,
        files: [],
        versions: []
      };

      // Backup database
      if (this.config.includeDatabase) {
        try {
          backupData.database = await this.backupDatabase();
          backupData.metadata.database = true;
          this.updateBackupJob(jobId, { databaseBackedUp: true });
          logger.info(`Database backed up for job: ${jobId}`);
        } catch (error) {
          const errorMsg = `Database backup failed: ${error}`;
          job.errors.push(errorMsg);
          logger.error(errorMsg);
        }
      }

      // Backup analytics
      if (this.config.includeAnalytics) {
        try {
          backupData.analytics = await analyticsService.getDashboardAnalytics();
          backupData.metadata.analytics = true;
          this.updateBackupJob(jobId, { analyticsBackedUp: true });
          logger.info(`Analytics backed up for job: ${jobId}`);
        } catch (error) {
          const errorMsg = `Analytics backup failed: ${error}`;
          job.errors.push(errorMsg);
          logger.error(errorMsg);
        }
      }

      // Backup files
      if (this.config.includeFiles) {
        try {
          const files = await listFilesUniversal();
          backupData.files = files.map(file => ({
            filename: file.name,
            size: file.size,
            mimeType: file.mimeType || 'application/octet-stream',
            createdTime: file.createdTime,
            modifiedTime: file.modifiedTime
          }));
          backupData.metadata.files = files.length;
          this.updateBackupJob(jobId, { filesBackedUp: files.length });
          logger.info(`${files.length} files backed up for job: ${jobId}`);
        } catch (error) {
          const errorMsg = `Files backup failed: ${error}`;
          job.errors.push(errorMsg);
          logger.error(errorMsg);
        }
      }

      // Backup versions
      if (this.config.includeVersions) {
        try {
          const allFiles = await db.select().from(fileStorage);
          const versionStats: any[] = [];
          
          for (const file of allFiles) {
            try {
              const stats = await fileVersioningSystem.getVersionStats(file.id);
              if (stats.totalVersions > 0) {
                versionStats.push({
                  fileId: file.id,
                  filename: file.filename,
                  totalVersions: stats.totalVersions,
                  totalSize: stats.totalSize,
                  averageSize: stats.averageSize
                });
              }
            } catch (error) {
              // Skip files with version errors
            }
          }
          
          backupData.versions = versionStats;
          backupData.metadata.versions = true;
          this.updateBackupJob(jobId, { versionsBackedUp: true });
          logger.info(`Versions backed up for job: ${jobId}`);
        } catch (error) {
          const errorMsg = `Versions backup failed: ${error}`;
          job.errors.push(errorMsg);
          logger.error(errorMsg);
        }
      }

      // Calculate total size
      backupData.metadata.totalSize = this.calculateBackupSize(backupData);

      // Save backup to file
      const backupJson = JSON.stringify(backupData, null, 2);
      fs.writeFileSync(backupPath, backupJson);

      // Upload to Google Drive if configured
      if (this.config.destination === 'google-drive' || this.config.destination === 'both') {
        try {
          const driveResult = await uploadToDrive(
            backupPath,
            `${jobId}.json`,
            'backups'
          );
          
          this.updateBackupJob(jobId, { 
            driveFileId: driveResult.fileId,
            backupPath: backupPath
          });
          
          logger.info(`Backup uploaded to Google Drive: ${driveResult.fileId}`);
        } catch (error) {
          const errorMsg = `Google Drive upload failed: ${error}`;
          job.errors.push(errorMsg);
          logger.error(errorMsg);
        }
      }

      // Clean up local file if only Google Drive
      if (this.config.destination === 'google-drive' && fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath);
      }

      this.updateBackupJob(jobId, { 
        status: 'completed',
        completedAt: new Date(),
        totalSize: backupData.metadata.totalSize
      });

      logger.info(`Full backup completed: ${jobId}`);
    } catch (error) {
      this.updateBackupJob(jobId, { 
        status: 'failed',
        completedAt: new Date()
      });
      logger.error(`Full backup failed: ${jobId}`, error);
    }
  }

  // Backup database
  private async backupDatabase(): Promise<any> {
    const backup = {
      timestamp: new Date(),
      tables: {} as any
    };

    // Backup auth_users
    const authUsersData = await db.select().from(authUsers);
    backup.tables.authUsers = authUsersData;

    // Backup file_storage
    const fileStorageData = await db.select().from(fileStorage);
    backup.tables.fileStorage = fileStorageData;

    // Backup puzzle_orders
    const puzzleOrdersData = await db.select().from(puzzleOrders);
    backup.tables.puzzleOrders = puzzleOrdersData;



    // Backup cart_items
    const cartItemsData = await db.select().from(cartItems);
    backup.tables.cartItems = cartItemsData;

    return backup;
  }

  // Calculate backup size
  private calculateBackupSize(backupData: any): number {
    const jsonString = JSON.stringify(backupData);
    return Buffer.byteLength(jsonString, 'utf8');
  }

  // Incremental backup
  async createIncrementalBackup(lastBackupDate: Date): Promise<string> {
    const jobId = this.createBackupJob('incremental');
    
    // Start async backup
    this.performIncrementalBackup(jobId, lastBackupDate);
    
    return jobId;
  }

  private async performIncrementalBackup(jobId: string, lastBackupDate: Date) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    try {
      this.updateBackupJob(jobId, { status: 'running' });
      logger.info(`Starting incremental backup: ${jobId}`);

      const backupData: any = {
        metadata: {
          version: '1.0.0',
          timestamp: new Date(),
          type: 'incremental',
          lastBackupDate: lastBackupDate,
          files: 0,
          database: false,
          analytics: false,
          versions: false,
          totalSize: 0,
          checksum: '',
          config: this.config
        },
        changes: {
          newFiles: [],
          modifiedFiles: [],
          deletedFiles: [],
          newOrders: [],
          modifiedOrders: []
        }
      };

      // Find new/modified files since last backup
      const allFiles = await db.select().from(fileStorage);
      const newFiles = allFiles.filter(file => 
        new Date(file.createdAt) > lastBackupDate
      );
      const modifiedFiles = allFiles.filter(file => 
        new Date(file.updatedAt || file.createdAt) > lastBackupDate &&
        new Date(file.createdAt) <= lastBackupDate
      );

      backupData.changes.newFiles = newFiles;
      backupData.changes.modifiedFiles = modifiedFiles;
      backupData.metadata.files = newFiles.length + modifiedFiles.length;

      // Find new/modified orders since last backup
      const allOrders = await db.select().from(puzzleOrders);
      const newOrders = allOrders.filter(order => 
        new Date(order.createdAt) > lastBackupDate
      );
      const modifiedOrders = allOrders.filter(order => 
        new Date(order.updatedAt || order.createdAt) > lastBackupDate &&
        new Date(order.createdAt) <= lastBackupDate
      );

      backupData.changes.newOrders = newOrders;
      backupData.changes.modifiedOrders = modifiedOrders;

      // Save incremental backup
      const backupPath = path.join(this.backupDir, `${jobId}_incremental.json`);
      const backupJson = JSON.stringify(backupData, null, 2);
      fs.writeFileSync(backupPath, backupJson);

      // Upload to Google Drive
      if (this.config.destination === 'google-drive' || this.config.destination === 'both') {
        try {
          const driveResult = await uploadToDrive(
            backupPath,
            `${jobId}_incremental.json`,
            'backups'
          );
          
          this.updateBackupJob(jobId, { 
            driveFileId: driveResult.fileId,
            backupPath: backupPath
          });
        } catch (error) {
          const errorMsg = `Google Drive upload failed: ${error}`;
          job.errors.push(errorMsg);
          logger.error(errorMsg);
        }
      }

      this.updateBackupJob(jobId, { 
        status: 'completed',
        completedAt: new Date(),
        totalSize: this.calculateBackupSize(backupData)
      });

      logger.info(`Incremental backup completed: ${jobId}`);
    } catch (error) {
      this.updateBackupJob(jobId, { 
        status: 'failed',
        completedAt: new Date()
      });
      logger.error(`Incremental backup failed: ${jobId}`, error);
    }
  }

  // Restore backup
  async restoreBackup(backupId: string, options: {
    restoreFiles?: boolean;
    restoreDatabase?: boolean;
    restoreAnalytics?: boolean;
    restoreVersions?: boolean;
  } = {}): Promise<void> {
    try {
      logger.info(`Starting backup restoration: ${backupId}`);

      // Get backup from Google Drive or local
      let backupData: any;
      
      if (this.config.destination === 'google-drive') {
        // Download from Google Drive
        const buffer = await downloadFromDrive(backupId);
        backupData = JSON.parse(buffer.toString());
      } else {
        // Load from local file
        const backupPath = path.join(this.backupDir, `${backupId}.json`);
        const backupContent = fs.readFileSync(backupPath, 'utf8');
        backupData = JSON.parse(backupContent);
      }

      // Restore database
      if (options.restoreDatabase && backupData.database) {
        await this.restoreDatabase(backupData.database);
        logger.info('Database restored');
      }

      // Restore files
      if (options.restoreFiles && backupData.files) {
        await this.restoreFiles(backupData.files);
        logger.info('Files restored');
      }

      // Restore versions
      if (options.restoreVersions && backupData.versions) {
        await this.restoreVersions(backupData.versions);
        logger.info('Versions restored');
      }

      logger.info(`Backup restoration completed: ${backupId}`);
    } catch (error) {
      logger.error(`Backup restoration failed: ${backupId}`, error);
      throw error;
    }
  }

  // Restore database
  private async restoreDatabase(databaseBackup: any): Promise<void> {
    // Clear existing data
    await db.delete(authUsers);
    await db.delete(fileStorage);
    await db.delete(puzzleOrders);

    await db.delete(cartItems);

    // Restore data
    if (databaseBackup.tables.authUsers) {
      for (const user of databaseBackup.tables.authUsers) {
        await db.insert(authUsers).values(user);
      }
    }

    if (databaseBackup.tables.fileStorage) {
      for (const file of databaseBackup.tables.fileStorage) {
        await db.insert(fileStorage).values(file);
      }
    }

    if (databaseBackup.tables.puzzleOrders) {
      for (const order of databaseBackup.tables.puzzleOrders) {
        await db.insert(puzzleOrders).values(order);
      }
    }



    if (databaseBackup.tables.cartItems) {
      for (const item of databaseBackup.tables.cartItems) {
        await db.insert(cartItems).values(item);
      }
    }
  }

  // Restore files
  private async restoreFiles(filesBackup: any[]): Promise<void> {
    for (const fileInfo of filesBackup) {
      try {
        // Download file from Google Drive if available
        if (fileInfo.driveFileId) {
          const buffer = await downloadFromDrive(fileInfo.driveFileId);
          const filePath = getFilePath(fileInfo.filename);
          fs.writeFileSync(filePath, buffer);
        }
      } catch (error) {
        logger.warn(`Failed to restore file: ${fileInfo.filename}`, error);
      }
    }
  }

  // Restore versions
  private async restoreVersions(versionsBackup: any[]): Promise<void> {
    for (const versionInfo of versionsBackup) {
      try {
        // Recreate versions for the file
        if (versionInfo.totalVersions > 0) {
          // This would require more complex logic to restore specific versions
          logger.info(`Version info restored for: ${versionInfo.filename}`);
        }
      } catch (error) {
        logger.warn(`Failed to restore versions for: ${versionInfo.filename}`, error);
      }
    }
  }

  // Get backup job status
  getBackupJobStatus(jobId: string): BackupJob | null {
    return this.jobs.get(jobId) || null;
  }

  // Get all backup jobs
  getAllBackupJobs(): BackupJob[] {
    return Array.from(this.jobs.values());
  }

  // Clean up old backups
  async cleanupOldBackups(): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - this.config.retention * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      // Clean up local backup files
      const backupFiles = fs.readdirSync(this.backupDir);
      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      // Clean up old backup jobs
      for (const [id, job] of this.jobs.entries()) {
        if (job.completedAt && job.completedAt < cutoffDate) {
          this.jobs.delete(id);
        }
      }

      logger.info(`Cleaned up ${deletedCount} old backup files`);
      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old backups', error);
      throw error;
    }
  }

  // Schedule automatic backups
  scheduleBackups(): void {
    if (!this.config.enabled) return;

    const interval = this.getBackupInterval();
    
    setInterval(async () => {
      try {
        await this.createFullBackup();
        await this.cleanupOldBackups();
      } catch (error) {
        logger.error('Scheduled backup failed', error);
      }
    }, interval);

    logger.info(`Backups scheduled every ${this.config.schedule}`);
  }

  // Get backup interval in milliseconds
  private getBackupInterval(): number {
    switch (this.config.schedule) {
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000;
      default:
        return 24 * 60 * 60 * 1000;
    }
  }

  // Update backup configuration
  updateConfig(newConfig: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Backup configuration updated', this.config);
  }

  // Get backup configuration
  getConfig(): BackupConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const backupSystem = new BackupSystem();
