import fs from 'fs';
import path from 'path';
import { db } from './db';
import { fileStorage, authUsers } from '../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { config } from './config';
import { logger } from './logger';
import { 
  uploadToDrive,
  downloadFromDrive,
  deleteFromDrive,
  getFileInfo as getDriveFileInfo
} from './google-drive';
import { 
  getFilePath,
  fileExists,
  deleteFile,
  getFileInfo
} from './upload';
import crypto from 'crypto';

export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  filename: string;
  originalFilename: string;
  fileIdDrive?: string;
  downloadUrl?: string;
  webViewLink?: string;
  storageType: 'local' | 'google-drive' | 'both';
  mimeType: string;
  size: number;
  checksum: string;
  metadata: any;
  createdAt: Date;
  createdBy?: string;
  comment?: string;
  isCurrent: boolean;
}

export interface VersionMetadata {
  description?: string;
  tags?: string[];
  changes?: string[];
  processingOptions?: any;
  originalSize?: number;
  compressionRatio?: number;
}

// Import fileVersions from shared schema
import { fileVersions } from '../shared/schema';

export class FileVersioningSystem {
  private versionDir: string;

  constructor() {
    this.versionDir = path.join(config.upload.dir, 'versions');
    this.ensureVersionDir();
  }

  private ensureVersionDir() {
    if (!fs.existsSync(this.versionDir)) {
      fs.mkdirSync(this.versionDir, { recursive: true });
    }
  }

  // Generate checksum for file
  private async generateChecksum(buffer: Buffer): Promise<string> {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  // Get file buffer from storage
  private async getFileBuffer(file: any): Promise<Buffer> {
    if (file.fileId && file.storageType === 'google-drive') {
      return await downloadFromDrive(file.fileId);
    } else {
      const filePath = getFilePath(file.filename);
      return fs.readFileSync(filePath);
    }
  }

  // Create new version of a file
  async createVersion(
    fileId: string, 
    options: {
      comment?: string;
      metadata?: VersionMetadata;
      createdBy?: string;
      force?: boolean;
    } = {}
  ): Promise<FileVersion> {
    try {
      // Get current file
      const currentFile = await db.select().from(fileStorage).where(eq(fileStorage.id, fileId)).limit(1);
      
      if (currentFile.length === 0) {
        throw new Error('File not found');
      }

      const file = currentFile[0];

      // Get current version number
      const currentVersion = await db.select()
        .from(fileVersions)
        .where(eq(fileVersions.fileId, fileId))
        .orderBy(desc(fileVersions.version))
        .limit(1);

      const nextVersion = currentVersion.length > 0 ? currentVersion[0].version + 1 : 1;

      // Get file buffer and generate checksum
      const fileBuffer = await this.getFileBuffer(file);
      const checksum = await this.generateChecksum(fileBuffer);

      // Check if file has changed (unless forced)
      if (!options.force && currentVersion.length > 0) {
        const lastChecksum = currentVersion[0].checksum;
        if (checksum === lastChecksum) {
          throw new Error('File has not changed since last version');
        }
      }

      // Create version filename
      const versionFilename = `${path.parse(file.filename).name}_v${nextVersion}${path.extname(file.filename)}`;
      const versionPath = path.join(this.versionDir, versionFilename);

      // Save version file locally
      fs.writeFileSync(versionPath, fileBuffer);

      // Upload to Google Drive if configured
      let driveFileId: string | undefined;
      let downloadUrl: string | undefined;
      let webViewLink: string | undefined;

      if (config.storage.type === 'google-drive') {
        try {
          const driveResult = await uploadToDrive(
            versionPath,
            versionFilename,
            'versions'
          );
          driveFileId = driveResult.fileId;
          downloadUrl = driveResult.downloadUrl;
          webViewLink = driveResult.webViewLink;
        } catch (error) {
          logger.warn('Failed to upload version to Google Drive', error);
        }
      }

      // Determine storage type
      let storageType: 'local' | 'google-drive' | 'both' = 'local';
      if (driveFileId) {
        storageType = 'both';
      }

      // Set all previous versions as not current
      await db.update(fileVersions)
        .set({ isCurrent: 0 })
        .where(eq(fileVersions.fileId, fileId));

      // Create version record
      const versionData = {
        fileId: fileId,
        version: nextVersion,
        filename: versionFilename,
        originalFilename: file.filename,
        fileIdDrive: driveFileId,
        downloadUrl: downloadUrl,
        webViewLink: webViewLink,
        storageType: storageType,
        mimeType: file.mimeType,
        size: fileBuffer.length,
        checksum: checksum,
        metadata: JSON.stringify(options.metadata || {}),
        createdBy: options.createdBy,
        comment: options.comment,
        isCurrent: 1
      };

      const [newVersion] = await db.insert(fileVersions).values(versionData).returning();

      logger.info(`Created version ${nextVersion} for file: ${file.filename}`, {
        fileId,
        version: nextVersion,
        checksum
      });

      return {
        ...newVersion,
        metadata: JSON.parse(newVersion.metadata || '{}'),
        createdAt: new Date(newVersion.createdAt),
        isCurrent: Boolean(newVersion.isCurrent)
      };
    } catch (error) {
      logger.error('Failed to create file version', error, { fileId });
      throw error;
    }
  }

  // Get all versions of a file
  async getFileVersions(fileId: string): Promise<FileVersion[]> {
    try {
      const versions = await db.select()
        .from(fileVersions)
        .where(eq(fileVersions.fileId, fileId))
        .orderBy(desc(fileVersions.version));

      return versions.map(version => ({
        ...version,
        metadata: JSON.parse(version.metadata || '{}'),
        createdAt: new Date(version.createdAt),
        isCurrent: Boolean(version.isCurrent)
      }));
    } catch (error) {
      logger.error('Failed to get file versions', error, { fileId });
      throw error;
    }
  }

  // Get specific version
  async getVersion(versionId: string): Promise<FileVersion | null> {
    try {
      const [version] = await db.select()
        .from(fileVersions)
        .where(eq(fileVersions.id, versionId))
        .limit(1);

      if (!version) return null;

      return {
        ...version,
        metadata: JSON.parse(version.metadata || '{}'),
        createdAt: new Date(version.createdAt),
        isCurrent: Boolean(version.isCurrent)
      };
    } catch (error) {
      logger.error('Failed to get version', error, { versionId });
      throw error;
    }
  }

  // Restore file to specific version
  async restoreVersion(versionId: string, options: { comment?: string; createdBy?: string } = {}): Promise<FileVersion> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      // Get current file
      const currentFile = await db.select().from(fileStorage).where(eq(fileStorage.id, version.fileId)).limit(1);
      if (currentFile.length === 0) {
        throw new Error('Original file not found');
      }

      const file = currentFile[0];

      // Get version file buffer
      let versionBuffer: Buffer;
      if (version.fileIdDrive && version.storageType !== 'local') {
        versionBuffer = await downloadFromDrive(version.fileIdDrive);
      } else {
        const versionPath = path.join(this.versionDir, version.filename);
        versionBuffer = fs.readFileSync(versionPath);
      }

      // Update current file
      const newFilename = `${path.parse(file.filename).name}_restored_${Date.now()}${path.extname(file.filename)}`;
      const newPath = getFilePath(newFilename);
      fs.writeFileSync(newPath, versionBuffer);

      // Update database record
      await db.update(fileStorage)
        .set({
          filename: newFilename,
          size: versionBuffer.length,
          updatedAt: new Date().toISOString()
        })
        .where(eq(fileStorage.id, version.fileId));

      // Create new version for the restored file
      const restoredVersion = await this.createVersion(version.fileId, {
        comment: `Restored from version ${version.version}. ${options.comment || ''}`,
        metadata: {},
        createdBy: options.createdBy,
        force: true
      });

      logger.info(`Restored file to version ${version.version}`, {
        fileId: version.fileId,
        versionId,
        newFilename
      });

      return restoredVersion;
    } catch (error) {
      logger.error('Failed to restore version', error, { versionId });
      throw error;
    }
  }

  // Compare two versions
  async compareVersions(versionId1: string, versionId2: string): Promise<{
    version1: FileVersion;
    version2: FileVersion;
    differences: {
      size: { v1: number; v2: number; difference: number };
      checksum: { v1: string; v2: string; identical: boolean };
      metadata: { v1: any; v2: any; differences: string[] };
    };
  }> {
    try {
      const [version1, version2] = await Promise.all([
        this.getVersion(versionId1),
        this.getVersion(versionId2)
      ]);

      if (!version1 || !version2) {
        throw new Error('One or both versions not found');
      }

      if (version1.fileId !== version2.fileId) {
        throw new Error('Cannot compare versions of different files');
      }

      const differences = {
        size: {
          v1: version1.size,
          v2: version2.size,
          difference: version2.size - version1.size
        },
        checksum: {
          v1: version1.checksum,
          v2: version2.checksum,
          identical: version1.checksum === version2.checksum
        },
        metadata: {
          v1: version1.metadata,
          v2: version2.metadata,
          differences: this.compareMetadata(version1.metadata, version2.metadata)
        }
      };

      return { version1, version2, differences };
    } catch (error) {
      logger.error('Failed to compare versions', error, { versionId1, versionId2 });
      throw error;
    }
  }

  // Compare metadata objects
  private compareMetadata(meta1: any, meta2: any): string[] {
    const differences: string[] = [];
    const allKeys = new Set([...Object.keys(meta1), ...Object.keys(meta2)]);

    for (const key of allKeys) {
      if (!(key in meta1)) {
        differences.push(`Added: ${key} = ${JSON.stringify(meta2[key])}`);
      } else if (!(key in meta2)) {
        differences.push(`Removed: ${key} = ${JSON.stringify(meta1[key])}`);
      } else if (JSON.stringify(meta1[key]) !== JSON.stringify(meta2[key])) {
        differences.push(`Changed: ${key} from ${JSON.stringify(meta1[key])} to ${JSON.stringify(meta2[key])}`);
      }
    }

    return differences;
  }

  // Delete version
  async deleteVersion(versionId: string): Promise<void> {
    try {
      const version = await this.getVersion(versionId);
      if (!version) {
        throw new Error('Version not found');
      }

      // Delete from Google Drive
      if (version.fileIdDrive) {
        try {
          await deleteFromDrive(version.fileIdDrive);
        } catch (error) {
          logger.warn('Failed to delete version from Google Drive', error);
        }
      }

      // Delete local file
      const versionPath = path.join(this.versionDir, version.filename);
      if (fs.existsSync(versionPath)) {
        fs.unlinkSync(versionPath);
      }

      // Delete from database
      await db.delete(fileVersions).where(eq(fileVersions.id, versionId));

      logger.info(`Deleted version: ${version.filename}`, { versionId });
    } catch (error) {
      logger.error('Failed to delete version', error, { versionId });
      throw error;
    }
  }

  // Get version statistics
  async getVersionStats(fileId: string): Promise<{
    totalVersions: number;
    totalSize: number;
    averageSize: number;
    oldestVersion: Date | null;
    newestVersion: Date | null;
    versionHistory: Array<{ version: number; size: number; createdAt: Date }>;
  }> {
    try {
      const versions = await this.getFileVersions(fileId);
      
      if (versions.length === 0) {
        return {
          totalVersions: 0,
          totalSize: 0,
          averageSize: 0,
          oldestVersion: null,
          newestVersion: null,
          versionHistory: []
        };
      }

      const totalSize = versions.reduce((sum, v) => sum + v.size, 0);
      const averageSize = totalSize / versions.length;
      const oldestVersion = versions[versions.length - 1].createdAt;
      const newestVersion = versions[0].createdAt;

      const versionHistory = versions.map(v => ({
        version: v.version,
        size: v.size,
        createdAt: v.createdAt
      }));

      return {
        totalVersions: versions.length,
        totalSize,
        averageSize,
        oldestVersion,
        newestVersion,
        versionHistory
      };
    } catch (error) {
      logger.error('Failed to get version stats', error, { fileId });
      throw error;
    }
  }

  // Clean up old versions
  async cleanupOldVersions(fileId: string, options: {
    keepVersions?: number;
    olderThanDays?: number;
    minSize?: number;
  } = {}): Promise<number> {
    try {
      const versions = await this.getFileVersions(fileId);
      let deletedCount = 0;

      // Keep only the specified number of versions
      if (options.keepVersions && versions.length > options.keepVersions) {
        const toDelete = versions.slice(options.keepVersions);
        for (const version of toDelete) {
          await this.deleteVersion(version.id);
          deletedCount++;
        }
      }

      // Delete versions older than specified days
      if (options.olderThanDays) {
        const cutoffDate = new Date(Date.now() - options.olderThanDays * 24 * 60 * 60 * 1000);
        const oldVersions = versions.filter(v => v.createdAt < cutoffDate && !v.isCurrent);
        
        for (const version of oldVersions) {
          await this.deleteVersion(version.id);
          deletedCount++;
        }
      }

      // Delete versions smaller than specified size
      if (options.minSize) {
        const smallVersions = versions.filter(v => v.size < options.minSize! && !v.isCurrent);
        
        for (const version of smallVersions) {
          await this.deleteVersion(version.id);
          deletedCount++;
        }
      }

      logger.info(`Cleaned up ${deletedCount} old versions for file: ${fileId}`);
      return deletedCount;
    } catch (error) {
      logger.error('Failed to cleanup old versions', error, { fileId });
      throw error;
    }
  }
}

// Export singleton instance
export const fileVersioningSystem = new FileVersioningSystem();
