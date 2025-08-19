import { logger } from './logger';

export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  percentage: number;
  timestamp: number;
}

export interface MemoryOptimizationConfig {
  maxHeapUsage: number; // Percentage
  gcThreshold: number; // Percentage
  cleanupInterval: number; // Milliseconds
  maxMemoryHistory: number; // Number of records to keep
}

export class AdvancedMemoryOptimizer {
  private static instance: AdvancedMemoryOptimizer;
  private memoryHistory: MemoryStats[] = [];
  private cleanupInterval: NodeJS.Timeout | null = null;
  private config: MemoryOptimizationConfig;

  private constructor() {
    this.config = {
      maxHeapUsage: 85,
      gcThreshold: 80,
      cleanupInterval: 30000, // 30 seconds
      maxMemoryHistory: 100
    };
  }

  static getInstance(): AdvancedMemoryOptimizer {
    if (!AdvancedMemoryOptimizer.instance) {
      AdvancedMemoryOptimizer.instance = new AdvancedMemoryOptimizer();
    }
    return AdvancedMemoryOptimizer.instance;
  }

  getMemoryStats(): MemoryStats {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const percentage = (heapUsedMB / heapTotalMB) * 100;

    const stats: MemoryStats = {
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      percentage,
      timestamp: Date.now()
    };

    this.memoryHistory.push(stats);
    if (this.memoryHistory.length > this.config.maxMemoryHistory) {
      this.memoryHistory.shift();
    }

    return stats;
  }

  async optimizeMemory(): Promise<{ freed: number; optimized: boolean }> {
    const beforeStats = this.getMemoryStats();
    let freed = 0;

    try {
      // Clear module cache
      this.clearModuleCache();

      // Clear global variables
      this.clearGlobalVariables();

      // Force garbage collection
      if (global.gc) {
        global.gc();
        await this.delay(100);
        global.gc();
      }

      // Clear event listeners
      this.clearEventListeners();

      // Clear timers
      this.clearTimers();

      const afterStats = this.getMemoryStats();
      freed = beforeStats.heapUsed - afterStats.heapUsed;

      logger.info(`Memory optimization completed: freed ${freed}MB`);

      return {
        freed: Math.max(0, freed),
        optimized: freed > 0
      };
    } catch (error) {
      logger.error('Memory optimization failed:', error);
      return { freed: 0, optimized: false };
    }
  }

  private clearModuleCache(): void {
    try {
      Object.keys(require.cache).forEach(key => {
        if (key.includes('node_modules')) {
          delete require.cache[key];
        }
      });
    } catch (error) {
      // Ignore errors in module cache clearing
    }
  }

  private clearGlobalVariables(): void {
    // Clear common global variables that might hold references
    const globalsToClear = [
      'cache', 'tempData', '__v8_promise_rejections',
      'tempFiles', 'uploadCache', 'sessionCache'
    ];

    globalsToClear.forEach(key => {
      if (global[key as keyof typeof global]) {
        (global as any)[key] = {};
      }
    });
  }

  private clearEventListeners(): void {
    try {
      const events = ['uncaughtException', 'unhandledRejection', 'warning'];
      events.forEach(event => {
        const listeners = process.listeners(event);
        if (listeners.length > 1) {
          // Keep only the first listener (usually the main error handler)
          for (let i = 1; i < listeners.length; i++) {
            process.removeListener(event, listeners[i]);
          }
        }
      });
    } catch (error) {
      // Ignore errors in event listener clearing
    }
  }

  private clearTimers(): void {
    try {
      // Clear any pending timers that might be holding references
      if (global.__timers) {
        global.__timers.forEach((timer: any) => {
          if (timer && typeof timer.unref === 'function') {
            timer.unref();
          }
        });
      }
    } catch (error) {
      // Ignore errors in timer clearing
    }
  }

  startMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(async () => {
      const stats = this.getMemoryStats();
      
      if (stats.percentage > this.config.gcThreshold) {
        logger.warn(`High memory usage detected: ${stats.percentage.toFixed(1)}%`);
        await this.optimizeMemory();
      }

      // Log memory usage every 5 minutes
      if (stats.timestamp % (5 * 60 * 1000) < 30000) {
        logger.info(`Memory usage: ${stats.heapUsed}MB / ${stats.heapTotal}MB (${stats.percentage.toFixed(1)}%)`);
      }
    }, this.config.cleanupInterval);
  }

  stopMonitoring(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  getMemoryHistory(): MemoryStats[] {
    return [...this.memoryHistory];
  }

  getMemoryTrend(): { trend: 'increasing' | 'decreasing' | 'stable'; rate: number } {
    if (this.memoryHistory.length < 2) {
      return { trend: 'stable', rate: 0 };
    }

    const recent = this.memoryHistory.slice(-10);
    const first = recent[0];
    const last = recent[recent.length - 1];
    const timeDiff = last.timestamp - first.timestamp;
    const memoryDiff = last.heapUsed - first.heapUsed;
    const rate = timeDiff > 0 ? (memoryDiff / timeDiff) * 1000 : 0; // MB per second

    if (rate > 1) return { trend: 'increasing', rate };
    if (rate < -1) return { trend: 'decreasing', rate };
    return { trend: 'stable', rate };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  updateConfig(newConfig: Partial<MemoryOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Memory optimization config updated:', this.config);
  }
}

export const memoryOptimizer = AdvancedMemoryOptimizer.getInstance();
