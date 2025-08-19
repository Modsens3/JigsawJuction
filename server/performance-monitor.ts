import { logger } from './logger';

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  requestsPerSecond: number;
  errorRate: number;
  timestamp: number;
}

export interface PerformanceAlert {
  type: 'warning' | 'critical';
  message: string;
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  timestamp: number;
}

export class AdvancedPerformanceMonitor {
  private static instance: AdvancedPerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private requestCount = 0;
  private errorCount = 0;
  private startTime = Date.now();
  private lastRequestTime = Date.now();

  private thresholds = {
    responseTime: 1000, // 1 second
    memoryUsage: 90, // 90%
    cpuUsage: 80, // 80%
    activeConnections: 100,
    requestsPerSecond: 50,
    errorRate: 5 // 5%
  };

  static getInstance(): AdvancedPerformanceMonitor {
    if (!AdvancedPerformanceMonitor.instance) {
      AdvancedPerformanceMonitor.instance = new AdvancedPerformanceMonitor();
    }
    return AdvancedPerformanceMonitor.instance;
  }

  incrementRequests(): void {
    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  incrementErrors(): void {
    this.errorCount++;
  }

  recordRequest(responseTime: number, success: boolean = true): void {
    this.requestCount++;
    this.lastRequestTime = Date.now();

    if (!success) {
      this.errorCount++;
    }

    const metrics: PerformanceMetrics = {
      responseTime,
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCpuUsage(),
      activeConnections: this.getActiveConnections(),
      requestsPerSecond: this.getRequestsPerSecond(),
      errorRate: this.getErrorRate(),
      timestamp: Date.now()
    };

    this.metrics.push(metrics);
    this.checkThresholds(metrics);
    this.cleanupOldMetrics();
  }

  private getMemoryUsage(): number {
    const memUsage = process.memoryUsage();
    return Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
  }

  private getCpuUsage(): number {
    // Simplified CPU usage calculation
    const startUsage = process.cpuUsage();
    const endUsage = process.cpuUsage(startUsage);
    return Math.round((endUsage.user + endUsage.system) / 1000);
  }

  private getActiveConnections(): number {
    // This would need to be implemented based on your server setup
    return Math.floor(Math.random() * 50) + 10; // Mock data
  }

  private getRequestsPerSecond(): number {
    const uptime = (Date.now() - this.startTime) / 1000;
    return Math.round(this.requestCount / uptime);
  }

  private getErrorRate(): number {
    if (this.requestCount === 0) return 0;
    return Math.round((this.errorCount / this.requestCount) * 100);
  }

  private checkThresholds(metrics: PerformanceMetrics): void {
    Object.entries(this.thresholds).forEach(([key, threshold]) => {
      const value = metrics[key as keyof PerformanceMetrics] as number;
      if (value > threshold) {
        this.createAlert(key as keyof PerformanceMetrics, value, threshold);
      }
    });
  }

  private createAlert(metric: keyof PerformanceMetrics, value: number, threshold: number): void {
    const alert: PerformanceAlert = {
      type: value > threshold * 1.5 ? 'critical' : 'warning',
      message: `${metric} exceeded threshold: ${value} > ${threshold}`,
      metric,
      value,
      threshold,
      timestamp: Date.now()
    };

    this.alerts.push(alert);
    logger.warn(`Performance alert: ${alert.message}`);
  }

  private cleanupOldMetrics(): void {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
    this.alerts = this.alerts.filter(a => a.timestamp > oneHourAgo);
  }

  getCurrentMetrics(): PerformanceMetrics {
    return {
      responseTime: 0,
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCpuUsage(),
      activeConnections: this.getActiveConnections(),
      requestsPerSecond: this.getRequestsPerSecond(),
      errorRate: this.getErrorRate(),
      timestamp: Date.now()
    };
  }

  getMetricsHistory(minutes: number = 60): PerformanceMetrics[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.metrics.filter(m => m.timestamp > cutoff);
  }

  getAlerts(minutes: number = 60): PerformanceAlert[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.alerts.filter(a => a.timestamp > cutoff);
  }

  getPerformanceSummary(): {
    averageResponseTime: number;
    averageMemoryUsage: number;
    totalRequests: number;
    totalErrors: number;
    uptime: number;
  } {
    const recentMetrics = this.getMetricsHistory(10); // Last 10 minutes
    const avgResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length 
      : 0;
    const avgMemoryUsage = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length 
      : 0;

    return {
      averageResponseTime: Math.round(avgResponseTime),
      averageMemoryUsage: Math.round(avgMemoryUsage),
      totalRequests: this.requestCount,
      totalErrors: this.errorCount,
      uptime: Math.round((Date.now() - this.startTime) / 1000)
    };
  }

  updateThresholds(newThresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    logger.info('Performance thresholds updated:', this.thresholds);
  }
}

export const performanceMonitor = AdvancedPerformanceMonitor.getInstance();
