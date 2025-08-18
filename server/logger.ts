import fs from 'fs';
import path from 'path';
import { config } from './config';

// Log levels
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
}

// Logger class
class Logger {
  private logDir: string;
  private logFile: string;
  private errorFile: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, 'app.log');
    this.errorFile = path.join(this.logDir, 'error.log');
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private formatLogEntry(entry: LogEntry): string {
    const baseLog = `[${entry.timestamp}] [${entry.level}] ${entry.message}`;
    
    if (entry.userId) {
      return `${baseLog} | User: ${entry.userId}`;
    }
    
    if (entry.ip) {
      return `${baseLog} | IP: ${entry.ip}`;
    }
    
    return baseLog;
  }

  private writeToFile(filePath: string, logEntry: LogEntry): void {
    try {
      const logLine = this.formatLogEntry(logEntry);
      const fullLog = `${logLine}${logEntry.data ? ` | Data: ${JSON.stringify(logEntry.data)}` : ''}${logEntry.error ? ` | Error: ${JSON.stringify(logEntry.error)}` : ''}\n`;
      
      fs.appendFileSync(filePath, fullLog);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  private log(level: LogLevel, message: string, data?: any, error?: any, req?: any): void {
    const timestamp = new Date().toISOString();
    
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      data,
      error,
      userId: req?.user?.userId,
      ip: req?.ip,
      userAgent: req?.get('User-Agent')
    };

    // Console output
    const consoleMessage = this.formatLogEntry(logEntry);
    if (level === LogLevel.ERROR) {
      console.error(consoleMessage);
    } else if (level === LogLevel.WARN) {
      console.warn(consoleMessage);
    } else {
      console.log(consoleMessage);
    }

    // File output
    this.writeToFile(this.logFile, logEntry);
    
    // Error-specific file
    if (level === LogLevel.ERROR) {
      this.writeToFile(this.errorFile, logEntry);
    }
  }

  // Public logging methods
  error(message: string, error?: any, req?: any): void {
    this.log(LogLevel.ERROR, message, undefined, error, req);
  }

  warn(message: string, data?: any, req?: any): void {
    this.log(LogLevel.WARN, message, data, undefined, req);
  }

  info(message: string, data?: any, req?: any): void {
    this.log(LogLevel.INFO, message, data, undefined, req);
  }

  debug(message: string, data?: any, req?: any): void {
    if (config.server.nodeEnv === 'development') {
      this.log(LogLevel.DEBUG, message, data, undefined, req);
    }
  }

  // Specialized logging methods
  request(req: any, res: any, duration: number): void {
    const message = `${req.method} ${req.path} ${res.statusCode}`;
    const data = {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    };
    
    this.info(message, data, req);
  }

  auth(userId: string, action: string, success: boolean, req?: any): void {
    const message = `Authentication ${action} ${success ? 'successful' : 'failed'}`;
    const data = { userId, action, success };
    
    if (success) {
      this.info(message, data, req);
    } else {
      this.warn(message, data, req);
    }
  }

  fileUpload(filename: string, size: number, userId?: string, req?: any): void {
    const message = `File uploaded: ${filename}`;
    const data = { filename, size: `${size} bytes`, userId };
    
    this.info(message, data, req);
  }

  orderCreated(orderId: string, total: number, userId?: string, req?: any): void {
    const message = `Order created: ${orderId}`;
    const data = { orderId, total, userId };
    
    this.info(message, data, req);
  }

  // Log rotation (basic implementation)
  rotateLogs(): void {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (fs.existsSync(this.logFile)) {
        const rotatedLogFile = path.join(this.logDir, `app-${timestamp}.log`);
        fs.renameSync(this.logFile, rotatedLogFile);
      }
      
      if (fs.existsSync(this.errorFile)) {
        const rotatedErrorFile = path.join(this.logDir, `error-${timestamp}.log`);
        fs.renameSync(this.errorFile, rotatedErrorFile);
      }
      
      this.info('Log files rotated successfully');
    } catch (error) {
      console.error('Failed to rotate log files:', error);
    }
  }

  // Get log statistics
  getLogStats(): any {
    try {
      const stats = {
        totalLogs: 0,
        errors: 0,
        warnings: 0,
        info: 0,
        debug: 0
      };

      if (fs.existsSync(this.logFile)) {
        const content = fs.readFileSync(this.logFile, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        stats.totalLogs = lines.length;
        stats.errors = lines.filter(line => line.includes('[ERROR]')).length;
        stats.warnings = lines.filter(line => line.includes('[WARN]')).length;
        stats.info = lines.filter(line => line.includes('[INFO]')).length;
        stats.debug = lines.filter(line => line.includes('[DEBUG]')).length;
      }

      return stats;
    } catch (error) {
      console.error('Failed to get log stats:', error);
      return { error: 'Failed to get log statistics' };
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Middleware for request logging
export const requestLoggerMiddleware = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.request(req, res, duration);
  });
  
  next();
};
