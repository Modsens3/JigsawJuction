import fs from 'fs';
import path from 'path';
import { db } from './db';
import { fileStorage } from '../shared/schema';
import { eq, and, isNull, isNotNull } from 'drizzle-orm';
import { config } from './config';
import { logger } from './logger';
import { 
  listFiles as listDriveFiles,
  uploadToDrive,
  downloadFromDrive,
  deleteFromDrive,
  getFileInfo as getDriveFileInfo,
  isDriveAvailable
} from './google-drive';
import { 
  listFilesUniversal,
  getFilePath,
  fileExists,
  deleteFile,
  getFileInfo
} from './upload';

export interface SyncStatus {
  totalFiles: number;
  syncedFiles: number;
  failedFiles: number;
  newFiles: number;
  updatedFiles: number;
  deletedFiles: number;
  errors: string[];
}

export interface SyncOptions {
  direction: 'local-to-drive' | 'drive-to-local' | 'bidirectional';
  force: boolean;
  deleteMissing: boolean;
  updateExisting: boolean;
}

export class FileSynchronizer {
  private syncStatus: SyncStatus = {
    totalFiles: 0,
    syncedFiles: 0,
    failedFiles: 0,
    newFiles: 0,
    updatedFiles: 0,
    deletedFiles: 0,
    errors: []
  };

  constructor() {
    this.resetStatus();
  }

  private resetStatus() {
    this.syncStatus = {
      totalFiles: 0,
      syncedFiles: 0,
      failedFiles: 0,
      newFiles: 0,
      updatedFiles: 0,
      deletedFiles: 0,
      errors: []
    };
  }

  private addError(error: string) {
    this.syncStatus.errors.push(error);
    this.syncStatus.failedFiles++;
    logger.error('Sync error', { error });
  }

  // Get all files from database
  private async getDatabaseFiles() {
    try {
      const files = await db.select().from(fileStorage);
      return files;
    } catch (error) {
      this.addError(`Database query failed: ${error}`);
      return [];
    }
  }

  // Get local files
  private async getLocalFiles() {
    try {
      const uploadDir = path.resolve(config.upload.dir);
      if (!fs.existsSync(uploadDir)) {
        return [];
      }

      const files = fs.readdirSync(uploadDir);
      const localFiles: Array<{ name: string; size: number; modifiedTime: Date; path: string }> = [];

      for (const filename of files) {
        const filePath = path.join(uploadDir, filename);
        const stats = fs.statSync(filePath);
        
        localFiles.push({
          name: filename,
          size: stats.size,
          modifiedTime: stats.mtime,
          path: filePath
        });
      }

      return localFiles;
    } catch (error) {
      this.addError(`Local files scan failed: ${error}`);
      return [];
    }
  }

  // Get Google Drive files
  private async getDriveFiles() {
    try {
      if (!(await isDriveAvailable())) {
        this.addError('Google Drive not available');
        return [];
      }

      const files = await listDriveFiles();
      return files;
    } catch (error) {
      this.addError(`Google Drive files scan failed: ${error}`);
      return [];
    }
  }

  // Sync local files to Google Drive
  private async syncLocalToDrive(options: SyncOptions) {
    try {
      const localFiles: Array<{ name: string; size: number; modifiedTime: Date; path: string }> = await this.getLocalFiles();
      const dbFiles: Array<{ id: string; filename: string; fileId: string | null; size: number | null; mimeType: string } & any> = await this.getDatabaseFiles();
      
      this.syncStatus.totalFiles = localFiles.length;

      for (const localFile of localFiles) {
        try {
          // Check if file exists in database
          const dbFile = dbFiles.find(f => f.filename === localFile.name);
          
          if (!dbFile || !dbFile.fileId || options.force) {
            // Upload to Google Drive
            const result = await uploadToDrive(
              localFile.path,
              localFile.name,
              'application/octet-stream'
            );

            // Update or create database record
            if (dbFile) {
              await db.update(fileStorage)
                .set({
                  fileId: result.fileId,
                  downloadUrl: result.downloadUrl,
                  webViewLink: result.webViewLink,
                  storageType: 'google-drive'
                })
                .where(eq(fileStorage.id, dbFile.id));
            } else {
              await db.insert(fileStorage).values({
                filename: localFile.name,
                fileId: result.fileId,
                downloadUrl: result.downloadUrl,
                webViewLink: result.webViewLink,
                storageType: 'google-drive',
                mimeType: 'application/octet-stream',
                size: localFile.size
              });
            }

            this.syncStatus.syncedFiles++;
            this.syncStatus.newFiles++;
            logger.info(`File synced to Drive: ${localFile.name}`);
          }
        } catch (error) {
          this.addError(`Failed to sync ${localFile.name}: ${error}`);
        }
      }
    } catch (error) {
      this.addError(`Local to Drive sync failed: ${error}`);
    }
  }

  // Sync Google Drive files to local
  private async syncDriveToLocal(options: SyncOptions) {
    try {
      const driveFiles: Array<{ id: string; name: string; size?: number; mimeType?: string; createdTime?: string; modifiedTime?: string }> = await this.getDriveFiles();
      const dbFiles: Array<{ id: string; filename: string; fileId: string | null; size: number | null; mimeType: string } & any> = await this.getDatabaseFiles();
      
      this.syncStatus.totalFiles = driveFiles.length;

      for (const driveFile of driveFiles) {
        try {
          // Check if file exists locally
          const dbFile = dbFiles.find(f => f.fileId === driveFile.id);
          const localExists = fileExists(driveFile.name);

          if (!localExists || options.force) {
            // Download from Google Drive
            const buffer = await downloadFromDrive(driveFile.id);
            const filePath = getFilePath(driveFile.name);
            
            fs.writeFileSync(filePath, buffer);

            // Update or create database record
            if (dbFile) {
              await db.update(fileStorage)
                .set({
                  storageType: 'local',
                  size: driveFile.size || buffer.length
                })
                .where(eq(fileStorage.id, dbFile.id));
            } else {
              await db.insert(fileStorage).values({
                filename: driveFile.name,
                storageType: 'local',
                mimeType: driveFile.mimeType || 'application/octet-stream',
                size: driveFile.size || buffer.length
              });
            }

            this.syncStatus.syncedFiles++;
            this.syncStatus.newFiles++;
            logger.info(`File synced to local: ${driveFile.name}`);
          }
        } catch (error) {
          this.addError(`Failed to sync ${driveFile.name}: ${error}`);
        }
      }
    } catch (error) {
      this.addError(`Drive to Local sync failed: ${error}`);
    }
  }

  // Bidirectional sync
  private async syncBidirectional(options: SyncOptions) {
    try {
      // First sync local to drive
      await this.syncLocalToDrive(options);
      
      // Then sync drive to local
      await this.syncDriveToLocal(options);
      
      // Handle conflicts and deletions
      if (options.deleteMissing) {
        await this.handleDeletions();
      }
    } catch (error) {
      this.addError(`Bidirectional sync failed: ${error}`);
    }
  }

  // Handle file deletions
  private async handleDeletions() {
    try {
      const dbFiles = await this.getDatabaseFiles();
      const localFiles = await this.getLocalFiles();
      const driveFiles = await this.getDriveFiles();

      for (const dbFile of dbFiles) {
        const localExists = localFiles.some(f => f.name === dbFile.filename);
        const driveExists = driveFiles.some(f => f.id === dbFile.fileId);

        if (!localExists && !driveExists) {
          // File doesn't exist in either location, delete from database
          await db.delete(fileStorage).where(eq(fileStorage.id, dbFile.id));
          this.syncStatus.deletedFiles++;
          logger.info(`Deleted orphaned file record: ${dbFile.filename}`);
        }
      }
    } catch (error) {
      this.addError(`Deletion handling failed: ${error}`);
    }
  }

  // Main sync method
  async sync(options: SyncOptions): Promise<SyncStatus> {
    this.resetStatus();
    logger.info('Starting file synchronization', { options });

    try {
      switch (options.direction) {
        case 'local-to-drive':
          await this.syncLocalToDrive(options);
          break;
        case 'drive-to-local':
          await this.syncDriveToLocal(options);
          break;
        case 'bidirectional':
          await this.syncBidirectional(options);
          break;
      }

      logger.info('File synchronization completed', this.syncStatus);
    } catch (error) {
      this.addError(`Sync process failed: ${error}`);
    }

    return this.syncStatus;
  }

  // Get sync status
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Check for conflicts
  async checkConflicts(): Promise<{
    conflicts: Array<{
      filename: string;
      localSize: number;
      driveSize: number;
      localModified: Date;
      driveModified: Date;
    }>;
    orphanedLocal: string[];
    orphanedDrive: string[];
  }> {
    const conflicts: Array<{ filename: string; localSize: number; driveSize: number; localModified: Date; driveModified: Date }> = [];
    const orphanedLocal: string[] = [];
    const orphanedDrive: string[] = [];

    try {
      const localFiles: Array<{ name: string; size: number; modifiedTime: Date; path: string }> = await this.getLocalFiles();
      const driveFiles: Array<{ id: string; name: string; size?: number; mimeType?: string; createdTime?: string; modifiedTime?: string }> = await this.getDriveFiles();
      const dbFiles: Array<{ id: string; filename: string; fileId: string | null; size: number | null; mimeType: string } & any> = await this.getDatabaseFiles();

      // Check for conflicts
      for (const dbFile of dbFiles) {
        const localFile = localFiles.find(f => f.name === dbFile.filename);
        const driveFile = driveFiles.find(f => f.id === dbFile.fileId);

        if (localFile && driveFile) {
          const localModified = localFile.modifiedTime;
          const driveModified = new Date(driveFile.modifiedTime ?? driveFile.createdTime ?? new Date().toISOString());

          if (Math.abs(localModified.getTime() - driveModified.getTime()) > 60000) { // 1 minute tolerance
            conflicts.push({
              filename: dbFile.filename,
              localSize: localFile.size,
              driveSize: driveFile.size || 0,
              localModified,
              driveModified
            });
          }
        }
      }

      // Check for orphaned files
      for (const localFile of localFiles) {
        const dbFile = dbFiles.find(f => f.filename === localFile.name);
        if (!dbFile) {
          orphanedLocal.push(localFile.name);
        }
      }

      for (const driveFile of driveFiles) {
        const dbFile = dbFiles.find(f => f.fileId === driveFile.id);
        if (!dbFile) {
          orphanedDrive.push(driveFile.name);
        }
      }
    } catch (error) {
      logger.error('Conflict check failed', error);
    }

    return { conflicts, orphanedLocal, orphanedDrive };
  }
}

// Export singleton instance
export const fileSynchronizer = new FileSynchronizer();
