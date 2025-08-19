import { logger } from './logger';

export interface PerformanceMetrics {
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
    percentage: number;
  };
  cpuUsage: {
    user: number;
    system: number;
    total: number;
  };
  responseTime: {
    average: number;
    min: number;
    max: number;
    count: number;
  };
  throughput: {
    requestsPerSecond: number;
    activeConnections: number;
  };
}

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private metrics: PerformanceMetrics;
  private responseTimes: number[] = [];
  private requestCount = 0;
  private startTime = Date.now();

  private constructor() {
    this.metrics = {
      memoryUsage: { heapUsed: 0, heapTotal: 0, external: 0, rss: 0, percentage: 0 },
      cpuUsage: { user: 0, system: 0, total: 0 },
      responseTime: { average: 0, min: 0, max: 0, count: 0 },
      throughput: { requestsPerSecond: 0, activeConnections: 0 }
    };
  }

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Advanced memory optimization
  optimizeMemory(): void {
    const memUsage = process.memoryUsage();
    const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const percentage = (heapUsedMB / heapTotalMB) * 100;

    this.metrics.memoryUsage = {
      heapUsed: heapUsedMB,
      heapTotal: heapTotalMB,
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
      percentage
    };

    // Aggressive memory cleanup if usage is high
    if (percentage > 85) {
      this.performAggressiveCleanup();
    } else if (percentage > 75) {
      this.performStandardCleanup();
    }
  }

  private performStandardCleanup(): void {
    if (global.gc) {
      global.gc();
      logger.info('Standard garbage collection performed');
    }

    // Clear module cache for non-essential modules
    if (process.env.NODE_ENV === 'development') {
      Object.keys(require.cache).forEach(key => {
        if (key.includes('node_modules') && !key.includes('express')) {
          delete require.cache[key];
        }
      });
    }
  }

  private performAggressiveCleanup(): void {
    logger.warn('Performing aggressive memory cleanup');

    // Multiple GC calls
    if (global.gc) {
      for (let i = 0; i < 3; i++) {
        global.gc();
      }
    }

    // Clear all caches
    if (global.cache) {
      global.cache = {};
    }

    // Clear temporary data
    if (global.tempData) {
      global.tempData = {};
    }

    // Clear V8 promise rejections
    if (global.__v8_promise_rejections) {
      global.__v8_promise_rejections = [];
    }

    // Force memory compaction
    if (process.memoryUsage) {
      const before = process.memoryUsage();
      this.performMemoryCompaction();
      const after = process.memoryUsage();
      
      const freed = before.heapUsed - after.heapUsed;
      logger.info(`Aggressive cleanup freed ${Math.round(freed / 1024 / 1024)}MB`);
    }
  }

  private performMemoryCompaction(): void {
    // Create temporary objects to trigger compaction
    const temp = [];
    for (let i = 0; i < 1000; i++) {
      temp.push({ id: i, data: 'temp' });
    }
    
    // Clear them immediately
    temp.length = 0;
  }

  // Response time tracking
  trackResponseTime(duration: number): void {
    this.responseTimes.push(duration);
    this.requestCount++;

    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }

    this.updateResponseTimeMetrics();
  }

  private updateResponseTimeMetrics(): void {
    if (this.responseTimes.length === 0) return;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const sum = this.responseTimes.reduce((a, b) => a + b, 0);

    this.metrics.responseTime = {
      average: sum / this.responseTimes.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      count: this.responseTimes.length
    };

    // Calculate throughput
    const uptime = (Date.now() - this.startTime) / 1000;
    this.metrics.throughput.requestsPerSecond = this.requestCount / uptime;
  }

  // CPU usage monitoring
  updateCpuUsage(): void {
    const usage = process.cpuUsage();
    this.metrics.cpuUsage = {
      user: Math.round(usage.user / 1000), // Convert to milliseconds
      system: Math.round(usage.system / 1000),
      total: Math.round((usage.user + usage.system) / 1000)
    };
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    this.optimizeMemory();
    this.updateCpuUsage();
    return { ...this.metrics };
  }

  // Performance alerts
  checkPerformanceAlerts(): void {
    const alerts: string[] = [];

    if (this.metrics.memoryUsage.percentage > 90) {
      alerts.push('Critical memory usage detected');
    }

    if (this.metrics.responseTime.average > 1000) {
      alerts.push('High response time detected');
    }

    if (this.metrics.cpuUsage.total > 500) {
      alerts.push('High CPU usage detected');
    }

    alerts.forEach(alert => {
      logger.warn(`Performance Alert: ${alert}`);
    });
  }

  // Auto-scaling recommendations
  getScalingRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.metrics.memoryUsage.percentage > 80) {
      recommendations.push('Consider increasing memory allocation');
    }

    if (this.metrics.throughput.requestsPerSecond > 100) {
      recommendations.push('Consider horizontal scaling');
    }

    if (this.metrics.responseTime.average > 500) {
      recommendations.push('Consider database optimization');
    }

    return recommendations;
  }
}

export const performanceOptimizer = PerformanceOptimizer.getInstance();
