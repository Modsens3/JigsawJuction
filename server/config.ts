import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables
dotenv.config();

// Configuration interface
interface Config {
  server: {
    port: number;
    nodeEnv: string;
  };
  database: {
    type: 'postgresql' | 'sqlite';
    url?: string;
  };
  upload: {
    dir: string;
    maxFileSize: number;
    allowedTypes: string[];
  };
  security: {
    sessionSecret: string;
    jwtSecret: string;
  };
  storage: {
    type: 'local' | 'cloud' | 'google-drive';
    googleDrive?: {
      folderId: string;
      serviceAccountPath: string;
    };
  };
}

// Configuration object
export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development'
  },
  database: {
    type: process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '' ? 'postgresql' : 'sqlite',
    url: process.env.DATABASE_URL
  },
  upload: {
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  security: {
    sessionSecret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
  },
  storage: {
    type: process.env.STORAGE_TYPE === 'google-drive' ? 'google-drive' : 
          process.env.STORAGE_TYPE === 'cloud' ? 'cloud' : 'local',
    googleDrive: {
      folderId: process.env.GOOGLE_DRIVE_FOLDER_ID || '1t6EIYP_O-no6phutgcPC4Tk7Kopdpw5A',
      serviceAccountPath: path.join(process.cwd(), 'google-drive-service-account.json')
    }
  }
};

// Ensure upload directory exists
export const ensureUploadDir = () => {
  const uploadDir = path.resolve(config.upload.dir);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// Validate Google Drive service account file
export const validateGoogleDriveConfig = () => {
  if (config.storage.type === 'google-drive') {
    const serviceAccountPath = config.storage.googleDrive?.serviceAccountPath;
    
    if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
      throw new Error(`
🚨 GOOGLE DRIVE CONFIGURATION ERROR 🚨

Missing or invalid Google Drive service account file:
${serviceAccountPath || 'Not configured'}

SETUP INSTRUCTIONS:
1. Download your Google Drive service account JSON file
2. Save it as 'google-drive-service-account.json' in the project root
3. Ensure the file contains valid JSON with service account credentials
4. Verify GOOGLE_DRIVE_FOLDER_ID is set in your .env file

Current configuration:
- Storage Type: ${config.storage.type}
- Service Account Path: ${serviceAccountPath}
- Folder ID: ${config.storage.googleDrive?.folderId}

For more information, see: https://developers.google.com/drive/api/guides/service-accounts
      `);
    }

    // Validate JSON structure
    try {
      const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
      const serviceAccount = JSON.parse(serviceAccountContent);
      
      if (!serviceAccount.client_email || !serviceAccount.private_key) {
        throw new Error('Invalid service account JSON structure');
      }
      
      console.log('✅ Google Drive service account validated successfully');
    } catch (error) {
      throw new Error(`
🚨 GOOGLE DRIVE SERVICE ACCOUNT INVALID 🚨

The service account file exists but contains invalid JSON or missing required fields.

Error: ${error instanceof Error ? error.message : 'Unknown error'}

Required fields:
- client_email
- private_key
- project_id

Please check your service account JSON file and ensure it's properly formatted.
      `);
    }
  }
};
