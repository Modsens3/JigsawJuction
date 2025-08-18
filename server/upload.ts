import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import { ensureUploadDir } from './config';
import { logger } from './logger';
import { 
  uploadToDrive, 
  uploadBase64ToDrive, 
  downloadFromDrive, 
  getFileInfo as getDriveFileInfo,
  deleteFromDrive,
  listFiles as listDriveFiles,
  isDriveAvailable
} from './google-drive';

// Ensure upload directory exists
const uploadDir = ensureUploadDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (config.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
    fieldSize: 10 * 1024 * 1024  // 10MB
  },
  fileFilter: fileFilter
});

// Save base64 image to file (local storage)
export async function saveBase64Image(base64Data: string, fileName?: string): Promise<string> {
  try {
    // Validate base64 data
    if (!base64Data || typeof base64Data !== 'string') {
      throw new Error('Invalid base64 data provided');
    }

    // Check if it's a valid data URL
    if (!base64Data.startsWith('data:image/')) {
      throw new Error('Invalid image data URL format');
    }

    // Extract MIME type and base64 content
    const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error('Invalid base64 data URL format');
    }

    const [, mimeType, base64Content] = matches;
    
    // Validate MIME type
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validMimeTypes.includes(mimeType)) {
      throw new Error(`Unsupported image format: ${mimeType}`);
    }

    // Validate base64 content
    if (!base64Content || base64Content.length === 0) {
      throw new Error('Empty base64 content');
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(base64Content, 'base64');
    
    // Validate buffer size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error('Image file too large (max 10MB)');
    }
    
    // Generate unique filename with proper extension
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const ext = mimeType === 'image/jpeg' || mimeType === 'image/jpg' ? '.jpg' : 
                mimeType === 'image/png' ? '.png' : 
                mimeType === 'image/gif' ? '.gif' : '.webp';
    const filename = fileName || `puzzle_image_${timestamp}_${randomSuffix}${ext}`;
    const filePath = path.join(uploadDir, filename);
    
    // Write file
    fs.writeFileSync(filePath, buffer);
    
    logger.info(`Base64 image saved to local storage: ${filename} (${buffer.length} bytes)`);
    return filename;
  } catch (error) {
    logger.error('Failed to save base64 image to local storage', error);
    throw error;
  }
}

// Save base64 image to Google Drive
export async function saveBase64ImageToDrive(base64Data: string, fileName?: string): Promise<{ fileId: string; filename: string; downloadUrl: string }> {
  try {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1E9);
    const filename = fileName || `puzzle_image_${timestamp}_${randomSuffix}.jpg`;
    
    const result = await uploadBase64ToDrive(base64Data, filename, 'image/jpeg');
    
    logger.info(`Base64 image saved to Google Drive: ${filename}`, { fileId: result.fileId });
    return {
      fileId: result.fileId,
      filename: filename,
      downloadUrl: result.downloadUrl
    };
  } catch (error) {
    logger.error('Failed to save base64 image to Google Drive', error);
    throw error;
  }
}

// Universal save function that chooses storage based on config
export async function saveBase64ImageUniversal(base64Data: string, fileName?: string): Promise<{ filename: string; fileId?: string; downloadUrl?: string }> {
  try {
    if (config.storage.type === 'google-drive') {
      const isAvailable = await isDriveAvailable();
      if (isAvailable) {
        const result = await saveBase64ImageToDrive(base64Data, fileName);
        return {
          filename: result.filename,
          fileId: result.fileId,
          downloadUrl: result.downloadUrl
        };
      } else {
        logger.warn('Google Drive not available, falling back to local storage');
      }
    }
    
    // Fallback to local storage
    const filename = await saveBase64Image(base64Data, fileName);
    return { filename };
  } catch (error) {
    logger.error('Failed to save base64 image', error);
    throw error;
  }
}

// Get file path (local storage)
export function getFilePath(filename: string): string {
  return path.join(uploadDir, filename);
}

// Check if file exists (local storage)
export function fileExists(filename: string): boolean {
  const filePath = getFilePath(filename);
  return fs.existsSync(filePath);
}

// Delete file (local storage)
export function deleteFile(filename: string): void {
  try {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`File deleted from local storage: ${filename}`);
    }
  } catch (error) {
    logger.error('Failed to delete file from local storage', error, { filename });
    throw error;
  }
}

// Get file info (local storage)
export function getFileInfo(filename: string): { size: number; mimeType: string; createdTime: Date } {
  try {
    const filePath = getFilePath(filename);
    const stats = fs.statSync(filePath);
    
    // Determine MIME type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let mimeType = 'application/octet-stream';
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.png':
        mimeType = 'image/png';
        break;
      case '.gif':
        mimeType = 'image/gif';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
      case '.svg':
        mimeType = 'image/svg+xml';
        break;
    }
    
    return {
      size: stats.size,
      mimeType: mimeType,
      createdTime: stats.birthtime
    };
  } catch (error) {
    logger.error('Failed to get file info from local storage', error, { filename });
    throw error;
  }
}

// Universal file operations
export async function getFileInfoUniversal(filename: string, fileId?: string): Promise<any> {
  try {
    if (config.storage.type === 'google-drive' && fileId) {
      const isAvailable = await isDriveAvailable();
      if (isAvailable) {
        return await getDriveFileInfo(fileId);
      }
    }
    
    // Fallback to local storage
    return getFileInfo(filename);
  } catch (error) {
    logger.error('Failed to get file info', error, { filename, fileId });
    throw error;
  }
}

export async function deleteFileUniversal(filename: string, fileId?: string): Promise<void> {
  try {
    if (config.storage.type === 'google-drive' && fileId) {
      const isAvailable = await isDriveAvailable();
      if (isAvailable) {
        await deleteFromDrive(fileId);
        return;
      }
    }
    
    // Fallback to local storage
    deleteFile(filename);
  } catch (error) {
    logger.error('Failed to delete file', error, { filename, fileId });
    throw error;
  }
}

export async function downloadFileUniversal(filename: string, fileId?: string): Promise<Buffer> {
  try {
    if (config.storage.type === 'google-drive' && fileId) {
      const isAvailable = await isDriveAvailable();
      if (isAvailable) {
        return await downloadFromDrive(fileId);
      }
    }
    
    // Fallback to local storage
    const filePath = getFilePath(filename);
    return fs.readFileSync(filePath);
  } catch (error) {
    logger.error('Failed to download file', error, { filename, fileId });
    throw error;
  }
}

export async function listFilesUniversal(): Promise<any[]> {
  try {
    if (config.storage.type === 'google-drive') {
      const isAvailable = await isDriveAvailable();
      if (isAvailable) {
        return await listDriveFiles();
      }
    }
    
    // Fallback to local storage
    const files = fs.readdirSync(uploadDir);
    return files.map(filename => {
      const filePath = getFilePath(filename);
      const stats = fs.statSync(filePath);
      return {
        name: filename,
        size: stats.size,
        createdTime: stats.birthtime,
        modifiedTime: stats.mtime
      };
    });
  } catch (error) {
    logger.error('Failed to list files', error);
    throw error;
  }
}

// Get storage status
export async function getStorageStatus(): Promise<{
  type: string;
  available: boolean;
  totalFiles: number;
  totalSize: number;
}> {
  try {
    const files = await listFilesUniversal();
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    
    return {
      type: config.storage.type,
      available: true,
      totalFiles: files.length,
      totalSize: totalSize
    };
  } catch (error) {
    logger.error('Failed to get storage status', error);
    return {
      type: config.storage.type,
      available: false,
      totalFiles: 0,
      totalSize: 0
    };
  }
}

// Clean up local files older than specified days
export const cleanupLocalFiles = async (daysOld: number = 30): Promise<{ deleted: number; errors: number }> => {
  const uploadDir = config.upload.dir;
  const cutoffTime = Date.now() - (daysOld * 24 * 60 * 60 * 1000);
  let deleted = 0;
  let errors = 0;

  try {
    const files = await fs.promises.readdir(uploadDir);
    
    for (const file of files) {
      const filePath = path.join(uploadDir, file);
      
      try {
        const stats = await fs.promises.stat(filePath);
        
        // Check if file is older than cutoff time
        if (stats.mtime.getTime() < cutoffTime) {
          await fs.promises.unlink(filePath);
          deleted++;
          logger.info(`Deleted old file: ${file}`);
        }
      } catch (error) {
        errors++;
        logger.error(`Error processing file ${file}:`, error);
      }
    }
    
    logger.info(`File cleanup completed: ${deleted} files deleted, ${errors} errors`);
    return { deleted, errors };
  } catch (error) {
    logger.error('File cleanup failed:', error);
    throw error;
  }
};
