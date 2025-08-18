import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { config } from './config';
import { logger } from './logger';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

let drive: any = null;
let isInitialized = false;

// Rate limiting configuration
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Folder organization structure
const FOLDER_STRUCTURE = {
  ORDERS: 'orders',
  DESIGNS: 'designs',
  TEMPLATES: 'templates',
  BACKUPS: 'backups',
  TEMP: 'temp'
};

// Initialize Google Drive with retry logic
export const initializeDrive = async (): Promise<boolean> => {
  if (isInitialized) return true;

  try {
    const serviceAccountPath = path.join(process.cwd(), 'google-drive-service-account.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      logger.error('Google Drive service account file not found');
      return false;
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    
    const auth = new JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    drive = google.drive({ version: 'v3', auth });
    
    // Test connection
    await drive.files.list({ pageSize: 1 });
    
    isInitialized = true;
    logger.info('Google Drive initialized successfully');
    
    // Create folder structure
    await createFolderStructure();
    
    return true;
  } catch (error) {
    logger.error('Failed to initialize Google Drive', error);
    return false;
  }
};

// Create organized folder structure
const createFolderStructure = async () => {
  try {
    const rootFolderId = config.storage.googleDrive?.folderId;
    if (!rootFolderId) {
      throw new Error('Google Drive folder ID not configured');
    }
    
    for (const [key, folderName] of Object.entries(FOLDER_STRUCTURE)) {
      await createFolderIfNotExists(folderName, rootFolderId);
    }
    
    logger.info('Google Drive folder structure created');
  } catch (error) {
    logger.error('Failed to create folder structure', error);
  }
};

// Create folder if it doesn't exist
const createFolderIfNotExists = async (folderName: string, parentId: string): Promise<string> => {
  try {
    // Check if folder exists
    const response = await drive.files.list({
      q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)'
    });

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id;
    }

    // Create folder
    const folderMetadata = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id'
    });

    logger.info(`Created folder: ${folderName}`);
    return folder.data.id;
  } catch (error) {
    logger.error(`Failed to create folder: ${folderName}`, error);
    throw error;
  }
};

// Get organized folder path
const getFolderPath = (type: 'orders' | 'designs' | 'templates' | 'backups' | 'temp', date?: string): string => {
  const baseFolder = FOLDER_STRUCTURE[type.toUpperCase() as keyof typeof FOLDER_STRUCTURE];
  
  if (date) {
    const [year, month] = date.split('-');
    return `${baseFolder}/${year}/${month}`;
  }
  
  return baseFolder;
};

// Upload with retry logic and rate limiting
export const uploadToDrive = async (filePath: string, fileName: string, folderType: string = 'temp'): Promise<any> => {
  if (!isInitialized) {
    await initializeDrive();
  }

  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      
      // Compress image before upload
      const compressedBuffer = await compressImage(filePath);
      
      // Create organized folder structure
      const date = new Date().toISOString().split('T')[0];
      const folderPath = getFolderPath(folderType as any, date);
      const folderId = await createFolderIfNotExists(folderPath, config.storage.googleDrive?.folderId || '');
      if (!folderId) {
        throw new Error('Failed to create or find folder in Google Drive');
      }
      
      const fileMetadata = {
        name: fileName,
        parents: [folderId]
      };

      const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(filePath)
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink'
      });

      logger.info(`File uploaded successfully: ${fileName}`);
      return {
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        downloadUrl: response.data.webContentLink
      };
      
    } catch (error: any) {
      retries++;
      logger.warn(`Upload attempt ${retries} failed for ${fileName}:`, error.message);
      
      if (retries >= MAX_RETRIES) {
        logger.error(`Failed to upload ${fileName} after ${MAX_RETRIES} attempts`);
        throw error;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
    }
  }
};

// Compress image before upload
const compressImage = async (filePath: string): Promise<Buffer> => {
  try {
    const compressed = await sharp(filePath)
      .jpeg({ quality: 85, progressive: true })
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
    
    return compressed;
  } catch (error) {
    logger.warn('Image compression failed, using original', error);
    return fs.readFileSync(filePath);
  }
};

// Upload base64 with organization
export const uploadBase64ToDrive = async (base64Data: string, fileName: string, mimeType: string = 'image/jpeg', folderType: string = 'temp'): Promise<any> => {
  if (!isInitialized) {
    await initializeDrive();
  }

  try {
    // Remove data URL prefix
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');
    
    // Compress image
    const compressedBuffer = await sharp(buffer)
      .jpeg({ quality: 85, progressive: true })
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
    
    // Create organized folder structure
    const date = new Date().toISOString().split('T')[0];
    const folderPath = getFolderPath(folderType as any, date);
    const folderId = await createFolderIfNotExists(folderPath, config.storage.googleDrive?.folderId || '');
    
    const fileMetadata = {
      name: fileName,
      parents: [folderId]
    };

    const media = {
      mimeType: mimeType,
      body: compressedBuffer
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink'
    });

    logger.info(`Base64 file uploaded successfully: ${fileName}`);
    return {
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
      downloadUrl: response.data.webContentLink
    };
  } catch (error) {
    logger.error('Failed to upload base64 file', error);
    throw error;
  }
};

// Download with retry logic
export const downloadFromDrive = async (fileId: string): Promise<Buffer> => {
  if (!isInitialized) {
    await initializeDrive();
  }

  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
      
      const response = await drive.files.get({
        fileId: fileId,
        alt: 'media'
      }, { responseType: 'arraybuffer' });

      return Buffer.from(response.data);
      
    } catch (error: any) {
      retries++;
      logger.warn(`Download attempt ${retries} failed for ${fileId}:`, error.message);
      
      if (retries >= MAX_RETRIES) {
        logger.error(`Failed to download ${fileId} after ${MAX_RETRIES} attempts`);
        throw error;
      }
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * retries));
    }
  }
  
  throw new Error('Download failed after all retries');
};

// Get file info with caching
const fileInfoCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const getFileInfo = async (fileId: string): Promise<any> => {
  if (!isInitialized) {
    await initializeDrive();
  }

  // Check cache
  const cached = fileInfoCache.get(fileId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, size, mimeType, createdTime, modifiedTime, webViewLink, webContentLink'
    });

    // Cache the result
    fileInfoCache.set(fileId, {
      data: response.data,
      timestamp: Date.now()
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to get file info', error);
    throw error;
  }
};

// Delete file with cleanup
export const deleteFromDrive = async (fileId: string): Promise<boolean> => {
  if (!isInitialized) {
    await initializeDrive();
  }

  try {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    
    await drive.files.delete({
      fileId: fileId
    });

    // Remove from cache
    fileInfoCache.delete(fileId);
    
    logger.info(`File deleted successfully: ${fileId}`);
    return true;
  } catch (error) {
    logger.error('Failed to delete file', error);
    return false;
  }
};

// List files with organization
export const listFiles = async (folderType: string = 'temp', limit: number = 100): Promise<any[]> => {
  if (!isInitialized) {
    await initializeDrive();
  }

  try {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY));
    
    const folderPath = getFolderPath(folderType as any);
    const folderId = await createFolderIfNotExists(folderPath, config.storage.googleDrive?.folderId || '');
    
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'files(id, name, size, mimeType, createdTime, modifiedTime, webViewLink)',
      pageSize: limit,
      orderBy: 'createdTime desc'
    });

    return response.data.files || [];
  } catch (error) {
    logger.error('Failed to list files', error);
    return [];
  }
};

// Cleanup old files (older than 30 days)
export const cleanupOldFiles = async (daysOld: number = 30): Promise<number> => {
  if (!isInitialized) {
    await initializeDrive();
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    const response = await drive.files.list({
      q: `createdTime < '${cutoffDate.toISOString()}' and trashed=false`,
      fields: 'files(id, name, createdTime)',
      pageSize: 1000
    });

    let deletedCount = 0;
    
    for (const file of response.data.files || []) {
      try {
        await deleteFromDrive(file.id);
        deletedCount++;
      } catch (error) {
        logger.warn(`Failed to delete old file: ${file.name}`, error);
      }
    }

    logger.info(`Cleaned up ${deletedCount} old files`);
    return deletedCount;
  } catch (error) {
    logger.error('Failed to cleanup old files', error);
    return 0;
  }
};

// Get folder info
export const getFolderInfo = async (folderType: string = 'temp'): Promise<any> => {
  if (!isInitialized) {
    await initializeDrive();
  }

  try {
    const folderPath = getFolderPath(folderType as any);
    const folderId = await createFolderIfNotExists(folderPath, config.storage.googleDrive?.folderId || '');
    
    const response = await drive.files.get({
      fileId: folderId,
      fields: 'id, name, size, createdTime, modifiedTime'
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to get folder info', error);
    throw error;
  }
};

// Check if Drive is available
export const isDriveAvailable = async (): Promise<boolean> => {
  try {
    if (!isInitialized) {
      return await initializeDrive();
    }
    return true;
  } catch (error) {
    return false;
  }
};

// Get Drive instance
export const getDrive = () => {
  if (!isInitialized) {
    throw new Error('Google Drive not initialized');
  }
  return drive;
};
