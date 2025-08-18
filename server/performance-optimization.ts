import { logger } from './logger';
import { config } from './config';
import { EventEmitter } from 'events';
import crypto from 'crypto';

export interface CacheConfig {
  enabled: boolean;
  type: 'memory' | 'redis' | 'file';
  ttl: number; // Time to live in seconds
  maxSize: number; // Maximum number of items
  cleanupInterval: number; // Cleanup interval in seconds
}

export interface CacheItem {
  key: string;
  value: any;
  timestamp: number;
  ttl: number;
  hits: number;
  size: number;
}

export interface CDNConfig {
  enabled: boolean;
  provider: 'cloudflare' | 'aws-cloudfront' | 'custom';
  baseUrl: string;
  apiKey?: string;
  zoneId?: string;
  cacheHeaders: {
    images: string;
    static: string;
    api: string;
  };
}

export interface PerformanceMetrics {
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
    items: number;
  };
  cdn: {
    requests: number;
    bandwidth: number;
    cacheHitRate: number;
  };
  api: {
    responseTime: number;
    requestsPerSecond: number;
    errorRate: number;
  };
  database: {
    queryTime: number;
    connections: number;
    slowQueries: number;
  };
}

export class PerformanceOptimizationSystem extends EventEmitter {
  private cacheConfig: CacheConfig;
  private cdnConfig: CDNConfig;
  private cache: Map<string, CacheItem> = new Map();
  private metrics: PerformanceMetrics;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    
    this.cacheConfig = {
      enabled: true,
      type: 'memory',
      ttl: 3600, // 1 hour
      maxSize: 1000,
      cleanupInterval: 300 // 5 minutes
    };

    this.cdnConfig = {
      enabled: true,
      provider: 'cloudflare',
      baseUrl: 'https://cdn.jigsawjunction.com',
      cacheHeaders: {
        images: 'public, max-age=31536000', // 1 year
        static: 'public, max-age=86400', // 1 day
        api: 'public, max-age=300' // 5 minutes
      }
    };

    this.metrics = {
      cache: { hits: 0, misses: 0, hitRate: 0, size: 0, items: 0 },
      cdn: { requests: 0, bandwidth: 0, cacheHitRate: 0 },
      api: { responseTime: 0, requestsPerSecond: 0, errorRate: 0 },
      database: { queryTime: 0, connections: 0, slowQueries: 0 }
    };

    this.initializeCache();
  }

  // Initialize cache system
  private initializeCache(): void {
    if (!this.cacheConfig.enabled) return;

    // Start cleanup interval
    this.cleanupInterval = setInterval(() => {
      this.cleanupCache();
    }, this.cacheConfig.cleanupInterval * 1000);

    logger.info('Cache system initialized', this.cacheConfig);
  }

  // Cache operations
  async get(key: string): Promise<any | null> {
    if (!this.cacheConfig.enabled) return null;

    try {
      const item = this.cache.get(key);
      
      if (!item) {
        this.metrics.cache.misses++;
        this.updateCacheHitRate();
        return null;
      }

      // Check if item has expired
      if (Date.now() - item.timestamp > item.ttl * 1000) {
        this.cache.delete(key);
        this.metrics.cache.misses++;
        this.updateCacheHitRate();
        return null;
      }

      // Update hit count
      item.hits++;
      this.metrics.cache.hits++;
      this.updateCacheHitRate();

      return item.value;
    } catch (error) {
      logger.error('Cache get error', error, { key });
      return null;
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.cacheConfig.enabled) return;

    try {
      // Check cache size limit
      if (this.cache.size >= this.cacheConfig.maxSize) {
        this.evictOldest();
      }

      const item: CacheItem = {
        key,
        value,
        timestamp: Date.now(),
        ttl: ttl || this.cacheConfig.ttl,
        hits: 0,
        size: this.calculateSize(value)
      };

      this.cache.set(key, item);
      this.updateCacheMetrics();

      // Emit cache event
      this.emit('cacheSet', { key, size: item.size });
    } catch (error) {
      logger.error('Cache set error', error, { key });
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.cacheConfig.enabled) return false;

    try {
      const deleted = this.cache.delete(key);
      if (deleted) {
        this.updateCacheMetrics();
        this.emit('cacheDelete', { key });
      }
      return deleted;
    } catch (error) {
      logger.error('Cache delete error', error, { key });
      return false;
    }
  }

  async clear(): Promise<void> {
    if (!this.cacheConfig.enabled) return;

    try {
      this.cache.clear();
      this.updateCacheMetrics();
      this.emit('cacheClear');
      logger.info('Cache cleared');
    } catch (error) {
      logger.error('Cache clear error', error);
    }
  }

  // Cache utilities
  private cleanupCache(): void {
    if (!this.cacheConfig.enabled) return;

    try {
      const now = Date.now();
      let deletedCount = 0;

      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > item.ttl * 1000) {
          this.cache.delete(key);
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        this.updateCacheMetrics();
        logger.info(`Cache cleanup: ${deletedCount} items removed`);
      }
    } catch (error) {
      logger.error('Cache cleanup error', error);
    }
  }

  private evictOldest(): void {
    if (!this.cacheConfig.enabled) return;

    try {
      let oldestKey: string | null = null;
      let oldestTime = Date.now();

      for (const [key, item] of this.cache.entries()) {
        if (item.timestamp < oldestTime) {
          oldestTime = item.timestamp;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
        logger.info(`Cache eviction: ${oldestKey} removed`);
      }
    } catch (error) {
      logger.error('Cache eviction error', error);
    }
  }

  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch {
      return 0;
    }
  }

  private updateCacheHitRate(): void {
    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = total > 0 ? (this.metrics.cache.hits / total) * 100 : 0;
  }

  private updateCacheMetrics(): void {
    let totalSize = 0;
    for (const item of this.cache.values()) {
      totalSize += item.size;
    }

    this.metrics.cache.size = totalSize;
    this.metrics.cache.items = this.cache.size;
  }

  // CDN operations
  getCDNUrl(path: string, type: 'images' | 'static' | 'api' = 'static'): string {
    if (!this.cdnConfig.enabled) {
      return path;
    }

    // Generate cache-busting parameter for development
    const cacheBuster = process.env.NODE_ENV === 'development' ? `?v=${Date.now()}` : '';
    
    return `${this.cdnConfig.baseUrl}/${path}${cacheBuster}`;
  }

  getCacheHeaders(type: 'images' | 'static' | 'api'): Record<string, string> {
    if (!this.cdnConfig.enabled) {
      return {};
    }

    return {
      'Cache-Control': this.cdnConfig.cacheHeaders[type],
      'CDN-Cache-Control': this.cdnConfig.cacheHeaders[type]
    };
  }

  async purgeCDNCache(paths: string[]): Promise<boolean> {
    if (!this.cdnConfig.enabled) return false;

    try {
      // This would integrate with CDN provider API
      // For now, just log the purge request
      logger.info('CDN cache purge requested', { paths });
      
      // Simulate CDN purge
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.emit('cdnPurged', { paths });
      return true;
    } catch (error) {
      logger.error('CDN cache purge failed', error, { paths });
      return false;
    }
  }

  // Performance monitoring
  recordApiRequest(responseTime: number, success: boolean): void {
    this.metrics.api.responseTime = responseTime;
    this.metrics.api.requestsPerSecond = 1 / (responseTime / 1000);
    
    if (!success) {
      // Increment error rate (simplified)
      this.metrics.api.errorRate = Math.min(this.metrics.api.errorRate + 0.1, 100);
    }
  }

  recordDatabaseQuery(queryTime: number, isSlow: boolean = false): void {
    this.metrics.database.queryTime = queryTime;
    
    if (isSlow) {
      this.metrics.database.slowQueries++;
    }
  }

  recordCDNRequest(bandwidth: number, cacheHit: boolean): void {
    this.metrics.cdn.requests++;
    this.metrics.cdn.bandwidth += bandwidth;
    
    if (cacheHit) {
      this.metrics.cdn.cacheHitRate = Math.min(this.metrics.cdn.cacheHitRate + 0.1, 100);
    }
  }

  // Get performance metrics
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Cache statistics
  getCacheStats(): {
    size: number;
    items: number;
    hits: number;
    misses: number;
    hitRate: number;
    keys: string[];
  } {
    return {
      size: this.metrics.cache.size,
      items: this.metrics.cache.items,
      hits: this.metrics.cache.hits,
      misses: this.metrics.cache.misses,
      hitRate: this.metrics.cache.hitRate,
      keys: Array.from(this.cache.keys())
    };
  }

  // Cache middleware for Express
  cacheMiddleware(ttl: number = 300): (req: any, res: any, next: any) => void {
    return async (req: any, res: any, next: any) => {
      if (!this.cacheConfig.enabled) {
        return next();
      }

      try {
        // Generate cache key from request
        const cacheKey = this.generateCacheKey(req);
        
        // Try to get from cache
        const cachedResponse = await this.get(cacheKey);
        
        if (cachedResponse) {
          // Return cached response
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('X-Cache-Key', cacheKey);
          return res.json(cachedResponse);
        }

        // Cache miss - store original send method
        const originalSend = res.send;
        const originalJson = res.json;

        // Override send method to cache response
        const cacheRef = this;
        res.send = function(data: any) {
          if (res.statusCode === 200) {
            cacheRef.set(cacheKey, data, ttl);
          }
          return originalSend.call(res, data);
        };

        res.json = function(data: any) {
          if (res.statusCode === 200) {
            cacheRef.set(cacheKey, data, ttl);
          }
          return originalJson.call(res, data);
        };

        res.setHeader('X-Cache', 'MISS');
        res.setHeader('X-Cache-Key', cacheKey);
        
        next();
      } catch (error) {
        logger.error('Cache middleware error', error);
        next();
      }
    };
  }

  // Generate cache key from request
  private generateCacheKey(req: any): string {
    const keyData = {
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      user: req.user?.id || 'anonymous'
    };

    const keyString = JSON.stringify(keyData);
    return crypto.createHash('md5').update(keyString).digest('hex');
  }

  // Rate limiting middleware
  rateLimitMiddleware(limit: number = 100, windowMs: number = 60000): (req: any, res: any, next: any) => void {
    const requests = new Map<string, { count: number; resetTime: number }>();

    return (req: any, res: any, next: any) => {
      const key = req.ip || req.connection.remoteAddress || 'unknown';
      const now = Date.now();

      // Clean up expired entries
      for (const [k, v] of requests.entries()) {
        if (now > v.resetTime) {
          requests.delete(k);
        }
      }

      const requestData = requests.get(key);
      
      if (!requestData || now > requestData.resetTime) {
        // First request or window expired
        requests.set(key, {
          count: 1,
          resetTime: now + windowMs
        });
        return next();
      }

      if (requestData.count >= limit) {
        // Rate limit exceeded
        res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        });
        return;
      }

      // Increment request count
      requestData.count++;
      next();
    };
  }

  // Compression middleware
  compressionMiddleware(): (req: any, res: any, next: any) => void {
    return (req: any, res: any, next: any) => {
      const acceptEncoding = req.headers['accept-encoding'] || '';
      
      if (acceptEncoding.includes('gzip')) {
        res.setHeader('Content-Encoding', 'gzip');
        // In production, you would use compression library
        // For now, just set the header
      }
      
      next();
    };
  }

  // Update configurations
  updateCacheConfig(newConfig: Partial<CacheConfig>): void {
    this.cacheConfig = { ...this.cacheConfig, ...newConfig };
    logger.info('Cache configuration updated', this.cacheConfig);
  }

  updateCDNConfig(newConfig: Partial<CDNConfig>): void {
    this.cdnConfig = { ...this.cdnConfig, ...newConfig };
    logger.info('CDN configuration updated', this.cdnConfig);
  }

  // Get configurations
  getCacheConfig(): CacheConfig {
    return { ...this.cacheConfig };
  }

  getCDNConfig(): CDNConfig {
    return { ...this.cdnConfig };
  }

  // Cleanup on shutdown
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.cache.clear();
    logger.info('Performance optimization system shutdown');
  }
}

// Export singleton instance
export const performanceOptimizationSystem = new PerformanceOptimizationSystem();
