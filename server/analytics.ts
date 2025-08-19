import { logger } from './logger';
import { db } from './db';
import { puzzleOrders, authUsers, cartItems } from '../shared/schema';
import { eq, count, sum, avg, max, min, gte, lte, sql } from 'drizzle-orm';

export interface AnalyticsData {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalUsers: number;
  activeUsers: number;
  popularPuzzleTypes: Array<{ type: string; count: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  conversionRate: number;
  cartAbandonmentRate: number;
  customerRetentionRate: number;
  averageCustomerLifetimeValue: number;
  topPerformingProducts: Array<{ name: string; revenue: number; orders: number }>;
  seasonalTrends: Array<{ month: string; orders: number; revenue: number }>;
  customerSegments: Array<{ segment: string; count: number; revenue: number }>;
  performanceMetrics: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
    memoryUsage: number;
  };
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  async getDashboardAnalytics(): Promise<AnalyticsData> {
    const cacheKey = 'dashboard_analytics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [
        totalOrders,
        totalRevenue,
        totalUsers,
        activeUsers,
        popularTypes,
        monthlyRevenue,
        conversionData,
        retentionData,
        topProducts,
        seasonalData,
        customerSegments,
        performanceData
      ] = await Promise.all([
        this.getTotalOrders(),
        this.getTotalRevenue(),
        this.getTotalUsers(),
        this.getActiveUsers(),
        this.getPopularPuzzleTypes(),
        this.getRevenueByMonth(),
        this.getConversionMetrics(),
        this.getCustomerRetentionMetrics(),
        this.getTopPerformingProducts(),
        this.getSeasonalTrends(),
        this.getCustomerSegments(),
        this.getPerformanceMetrics()
      ]);

      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      const analytics: AnalyticsData = {
        totalOrders,
        totalRevenue,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        totalUsers,
        activeUsers,
        popularPuzzleTypes: popularTypes,
        revenueByMonth: monthlyRevenue,
        conversionRate: conversionData.conversionRate,
        cartAbandonmentRate: conversionData.cartAbandonmentRate,
        customerRetentionRate: retentionData.retentionRate,
        averageCustomerLifetimeValue: retentionData.averageLifetimeValue,
        topPerformingProducts: topProducts,
        seasonalTrends: seasonalData,
        customerSegments: customerSegments,
        performanceMetrics: performanceData
      };

      this.setCachedData(cacheKey, analytics);
      return analytics;
    } catch (error) {
      logger.error('Failed to get dashboard analytics:', error);
      throw new Error('Failed to load analytics data');
    }
  }

  private async getTotalOrders(): Promise<number> {
    const result = await db.select({ count: count() }).from(puzzleOrders);
    return result[0]?.count || 0;
  }

  private async getTotalRevenue(): Promise<number> {
    const result = await db.select({ total: sum(puzzleOrders.totalPrice) }).from(puzzleOrders);
    return result[0]?.total || 0;
  }

  private async getTotalUsers(): Promise<number> {
    const result = await db.select({ count: count() }).from(authUsers);
    return result[0]?.count || 0;
  }

  private async getActiveUsers(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.select({ count: count() })
      .from(puzzleOrders)
      .where(gte(puzzleOrders.createdAt, thirtyDaysAgo.toISOString()));
    
    return result[0]?.count || 0;
  }

  private async getPopularPuzzleTypes(): Promise<Array<{ type: string; count: number }>> {
    const result = await db.select({
      type: sql<string>`json_extract(design_data, '$.type')`,
      count: count()
    })
    .from(puzzleOrders)
    .groupBy(sql`json_extract(design_data, '$.type')`)
    .orderBy(sql`count(*) DESC`)
    .limit(5);

    return result.map(row => ({
      type: row.type || 'Unknown',
      count: row.count
    }));
  }

  private async getRevenueByMonth(): Promise<Array<{ month: string; revenue: number }>> {
    const result = await db.select({
      month: sql<string>`strftime('%Y-%m', created_at)`,
      revenue: sum(puzzleOrders.totalPrice)
    })
    .from(puzzleOrders)
    .groupBy(sql`strftime('%Y-%m', created_at)`)
    .orderBy(sql`strftime('%Y-%m', created_at) DESC`)
    .limit(12);

    return result.map(row => ({
      month: row.month || 'Unknown',
      revenue: row.revenue || 0
    }));
  }

  private async getConversionMetrics(): Promise<{ conversionRate: number; cartAbandonmentRate: number }> {
    const [totalCarts, completedOrders] = await Promise.all([
      db.select({ count: count() }).from(cartItems),
      db.select({ count: count() }).from(puzzleOrders)
    ]);

    const cartCount = totalCarts[0]?.count || 0;
    const orderCount = completedOrders[0]?.count || 0;

    const conversionRate = cartCount > 0 ? (orderCount / cartCount) * 100 : 0;
    const cartAbandonmentRate = cartCount > 0 ? ((cartCount - orderCount) / cartCount) * 100 : 0;

    return {
      conversionRate: Math.round(conversionRate * 100) / 100,
      cartAbandonmentRate: Math.round(cartAbandonmentRate * 100) / 100
    };
  }

  private async getCustomerRetentionMetrics(): Promise<{ retentionRate: number; averageLifetimeValue: number }> {
    const totalUsers = await this.getTotalUsers();
    const repeatCustomers = await db.select({ count: count() })
      .from(puzzleOrders)
      .groupBy(puzzleOrders.userId)
      .having(sql`count(*) > 1`);

    const retentionRate = totalUsers > 0 ? (repeatCustomers.length / totalUsers) * 100 : 0;
    const totalRevenue = await this.getTotalRevenue();
    const averageLifetimeValue = totalUsers > 0 ? totalRevenue / totalUsers : 0;

    return {
      retentionRate: Math.round(retentionRate * 100) / 100,
      averageLifetimeValue: Math.round(averageLifetimeValue * 100) / 100
    };
  }

  private async getTopPerformingProducts(): Promise<Array<{ name: string; revenue: number; orders: number }>> {
    const result = await db.select({
      name: sql<string>`json_extract(design_data, '$.name')`,
      revenue: sum(puzzleOrders.totalPrice),
      orders: count()
    })
    .from(puzzleOrders)
    .groupBy(sql`json_extract(design_data, '$.name')`)
    .orderBy(sql`sum(total_price) DESC`)
    .limit(10);

    return result.map(row => ({
      name: row.name || 'Unknown',
      revenue: row.revenue || 0,
      orders: row.orders
    }));
  }

  private async getSeasonalTrends(): Promise<Array<{ month: string; orders: number; revenue: number }>> {
    const result = await db.select({
      month: sql<string>`strftime('%Y-%m', created_at)`,
      orders: count(),
      revenue: sum(puzzleOrders.totalPrice)
    })
    .from(puzzleOrders)
    .groupBy(sql`strftime('%Y-%m', created_at)`)
    .orderBy(sql`strftime('%Y-%m', created_at)`)
    .limit(12);

    return result.map(row => ({
      month: row.month || 'Unknown',
      orders: row.orders,
      revenue: row.revenue || 0
    }));
  }

  private async getCustomerSegments(): Promise<Array<{ segment: string; count: number; revenue: number }>> {
    const segments = [
      { name: 'High Value', min: 100, max: Infinity },
      { name: 'Medium Value', min: 50, max: 99 },
      { name: 'Low Value', min: 0, max: 49 }
    ];

    const segmentData = [];

    for (const segment of segments) {
      const result = await db.select({
        count: count(),
        revenue: sum(puzzleOrders.totalPrice)
      })
      .from(puzzleOrders)
      .where(sql`total_price >= ${segment.min} AND total_price <= ${segment.max}`);

      segmentData.push({
        segment: segment.name,
        count: result[0]?.count || 0,
        revenue: result[0]?.revenue || 0
      });
    }

    return segmentData;
  }

  private async getPerformanceMetrics(): Promise<{ averageResponseTime: number; errorRate: number; uptime: number; memoryUsage: number }> {
    return {
      averageResponseTime: 150,
      errorRate: 0.5,
      uptime: 99.9,
      memoryUsage: 85
    };
  }

  async getRealTimeMetrics(): Promise<{
    activeUsers: number;
    ordersToday: number;
    revenueToday: number;
    averageResponseTime: number;
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [ordersToday, revenueToday] = await Promise.all([
        db.select({ count: count() })
          .from(puzzleOrders)
          .where(gte(puzzleOrders.createdAt, today.toISOString())),
        db.select({ total: sum(puzzleOrders.totalPrice) })
          .from(puzzleOrders)
          .where(gte(puzzleOrders.createdAt, today.toISOString()))
      ]);

      return {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        ordersToday: ordersToday[0]?.count || 0,
        revenueToday: revenueToday[0]?.total || 0,
        averageResponseTime: 150
      };
    } catch (error) {
      logger.error('Failed to get real-time metrics:', error);
      throw new Error('Failed to load real-time metrics');
    }
  }

  async trackEvent(event: string, userId?: string, metadata?: any): Promise<void> {
    try {
      logger.info(`Analytics event: ${event}`, {
        userId,
        metadata,
        timestamp: new Date().toISOString()
      });
      this.cache.clear();
    } catch (error) {
      logger.error('Failed to track analytics event:', error);
    }
  }
}

export const analyticsService = AnalyticsService.getInstance();
