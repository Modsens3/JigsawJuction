import { db } from './db';
import { fileStorage, puzzleOrders, authUsers, cartItems } from '../shared/schema';
import { eq, and, desc, sql, count, sum, avg, max, min, gte, lte } from 'drizzle-orm';
import { logger } from './logger';
import { analyticsService } from './analytics';

export interface BusinessMetrics {
  revenue: {
    total: number;
    monthly: number;
    daily: number;
    average: number;
    growth: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
    averageValue: number;
  };
  customers: {
    total: number;
    active: number;
    new: number;
    returning: number;
    averageOrders: number;
  };
  products: {
    total: number;
    featured: number;
    popular: number;
    averagePrice: number;
  };
  performance: {
    conversionRate: number;
    averageOrderValue: number;
    customerLifetimeValue: number;
    repeatPurchaseRate: number;
  };
}

export interface SalesReport {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  topCustomers: Array<{
    email: string;
    orders: number;
    revenue: number;
  }>;
}

export interface CustomerAnalytics {
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
  orderHistory: Array<{
    orderId: string;
    date: Date;
    amount: number;
    status: string;
  }>;
  preferences: {
    favoriteMaterials: string[];
    favoriteSizes: string[];
    averageQuantity: number;
  };
}

export interface ProductAnalytics {
  productId: string;
  name: string;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  popularity: number;
  conversionRate: number;
  inventory: {
    available: number;
    reserved: number;
    sold: number;
  };
}

export class AdvancedAnalyticsSystem {
  // Get comprehensive business metrics
  async getBusinessMetrics(timeRange: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<BusinessMetrics> {
    try {
      const now = new Date();
      const startDate = this.getStartDate(now, timeRange);

      // Revenue metrics
      const revenueData = await this.getRevenueMetrics(startDate, now);
      
      // Order metrics
      const orderData = await this.getOrderMetrics(startDate, now);
      
      // Customer metrics
      const customerData = await this.getCustomerMetrics(startDate, now);
      
      // Product metrics
      const productData = await this.getProductMetrics();
      
      // Performance metrics
      const performanceData = await this.getPerformanceMetrics(startDate, now);

      return {
        revenue: revenueData,
        orders: orderData,
        customers: customerData,
        products: productData,
        performance: performanceData
      };
    } catch (error) {
      logger.error('Failed to get business metrics', error);
      throw error;
    }
  }

  // Get revenue metrics
  private async getRevenueMetrics(startDate: Date, endDate: Date) {
    const totalRevenue = await db.select({
      total: sum(puzzleOrders.totalPrice)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    const monthlyRevenue = await db.select({
      monthly: sum(puzzleOrders.totalPrice)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, new Date(endDate.getFullYear(), endDate.getMonth(), 1).toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    const dailyRevenue = await db.select({
      daily: sum(puzzleOrders.totalPrice)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()).toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    const avgRevenue = await db.select({
      average: avg(puzzleOrders.totalPrice)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    // Calculate growth (simplified)
    const previousPeriod = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
    const previousRevenue = await db.select({
      total: sum(puzzleOrders.totalPrice)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, previousPeriod.toISOString()),
      lte(puzzleOrders.createdAt, startDate.toISOString())
    ));

    const currentTotal = Number(totalRevenue[0].total) || 0;
    const previousTotal = Number(previousRevenue[0].total) || 0;
    const growth = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    return {
      total: currentTotal,
      monthly: Number(monthlyRevenue[0].monthly) || 0,
      daily: Number(dailyRevenue[0].daily) || 0,
      average: Number(avgRevenue[0].average) || 0,
      growth
    };
  }

  // Get order metrics
  private async getOrderMetrics(startDate: Date, endDate: Date) {
    const totalOrders = await db.select({
      total: count(puzzleOrders.id)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    const pendingOrders = await db.select({
      pending: count(puzzleOrders.id)
    })
    .from(puzzleOrders)
    .where(and(
      eq(puzzleOrders.status, 'pending'),
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    const completedOrders = await db.select({
      completed: count(puzzleOrders.id)
    })
    .from(puzzleOrders)
    .where(and(
      eq(puzzleOrders.status, 'completed'),
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    const cancelledOrders = await db.select({
      cancelled: count(puzzleOrders.id)
    })
    .from(puzzleOrders)
    .where(and(
      eq(puzzleOrders.status, 'cancelled'),
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    const avgOrderValue = await db.select({
      average: avg(puzzleOrders.totalPrice)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    return {
      total: Number(totalOrders[0].total) || 0,
      pending: Number(pendingOrders[0].pending) || 0,
      completed: Number(completedOrders[0].completed) || 0,
      cancelled: Number(cancelledOrders[0].cancelled) || 0,
      averageValue: Number(avgOrderValue[0].average) || 0
    };
  }

  // Get customer metrics
  private async getCustomerMetrics(startDate: Date, endDate: Date) {
    const totalCustomers = await db.select({
      total: count(authUsers.id)
    })
    .from(authUsers);

    const activeCustomers = await db.select({
      active: count(sql`DISTINCT ${puzzleOrders.userId}`)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    const newCustomers = await db.select({
      new: count(authUsers.id)
    })
    .from(authUsers)
    .where(and(
      gte(authUsers.createdAt, startDate.toISOString()),
      lte(authUsers.createdAt, endDate.toISOString())
    ));

    // Calculate returning customers (customers with more than 1 order)
    const returningCustomers = await db.select({
      returning: count(sql`DISTINCT ${puzzleOrders.userId}`)
    })
    .from(puzzleOrders)
    .where(sql`${puzzleOrders.userId} IN (
      SELECT ${puzzleOrders.userId} 
      FROM ${puzzleOrders} 
      GROUP BY ${puzzleOrders.userId} 
      HAVING COUNT(*) > 1
    )`);

    const avgOrdersPerCustomer = await db.select({
      average: avg(sql`order_count`)
    })
    .from(sql`(
      SELECT ${puzzleOrders.userId}, COUNT(*) as order_count
      FROM ${puzzleOrders}
      GROUP BY ${puzzleOrders.userId}
    )`);

    return {
      total: Number(totalCustomers[0].total) || 0,
      active: Number(activeCustomers[0].active) || 0,
      new: Number(newCustomers[0].new) || 0,
      returning: Number(returningCustomers[0].returning) || 0,
      averageOrders: Number(avgOrdersPerCustomer[0].average) || 0
    };
  }

  // Get product metrics
  private async getProductMetrics() {
    return {
      total: 0,
      featured: 0,
      popular: 0,
      averagePrice: 0
    };
  }

  // Get performance metrics
  private async getPerformanceMetrics(startDate: Date, endDate: Date) {
    // Calculate conversion rate (orders / unique visitors - simplified)
    const totalOrders = await db.select({
      orders: count(puzzleOrders.id)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    const uniqueVisitors = await db.select({
      visitors: count(sql`DISTINCT ${puzzleOrders.userId}`)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    const conversionRate = Number(uniqueVisitors[0].visitors) > 0 ? 
      (Number(totalOrders[0].orders) / Number(uniqueVisitors[0].visitors)) * 100 : 0;

    // Average order value
    const avgOrderValue = await db.select({
      average: avg(puzzleOrders.totalPrice)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ));

    // Customer lifetime value (simplified)
    const customerLifetimeValue = await db.select({
      clv: avg(sql`total_spent`)
    })
    .from(sql`(
      SELECT ${puzzleOrders.userId}, SUM(${puzzleOrders.totalPrice}) as total_spent
      FROM ${puzzleOrders}
      GROUP BY ${puzzleOrders.userId}
    )`);

    // Repeat purchase rate
    const repeatPurchaseRate = await db.select({
      rate: avg(sql`has_multiple_orders`)
    })
    .from(sql`(
      SELECT ${puzzleOrders.userId}, 
             CASE WHEN COUNT(*) > 1 THEN 1 ELSE 0 END as has_multiple_orders
      FROM ${puzzleOrders}
      GROUP BY ${puzzleOrders.userId}
    )`);

    return {
      conversionRate,
      averageOrderValue: Number(avgOrderValue[0].average) || 0,
      customerLifetimeValue: Number(customerLifetimeValue[0].clv) || 0,
      repeatPurchaseRate: Number(repeatPurchaseRate[0].rate) * 100 || 0
    };
  }

  // Get sales report for specific period
  async getSalesReport(period: 'daily' | 'weekly' | 'monthly' | 'yearly', startDate: Date, endDate: Date): Promise<SalesReport> {
    try {
      const orders = await db.select()
        .from(puzzleOrders)
        .where(and(
          gte(puzzleOrders.createdAt, startDate.toISOString()),
          lte(puzzleOrders.createdAt, endDate.toISOString())
        ));

      const revenue = orders.reduce((sum: number, order: any) => sum + Number(order.totalPrice), 0);
      const averageOrderValue = orders.length > 0 ? revenue / orders.length : 0;

      // Get top products
      const topProducts = await this.getTopProducts(startDate, endDate);

      // Get top customers
      const topCustomers = await this.getTopCustomers(startDate, endDate);

      return {
        period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
        revenue,
        orders: orders.length,
        customers: new Set(orders.map((o: any) => o.userId)).size,
        averageOrderValue,
        topProducts,
        topCustomers
      };
    } catch (error) {
      logger.error('Failed to get sales report', error);
      throw error;
    }
  }

  // Get top products
  private async getTopProducts(startDate: Date, endDate: Date) {
    const result = await db.select({
      name: "Product",
      orders: count(puzzleOrders.id),
      revenue: sum(puzzleOrders.totalPrice)
    })
    .from(puzzleOrders)
    .where(and(
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ))
    .groupBy(puzzleOrders.id)
    .orderBy(desc(sum(puzzleOrders.totalPrice)))
    .limit(5);

    return result.map((row: any) => ({
      name: row.name,
      orders: Number(row.orders),
      revenue: Number(row.revenue) || 0
    }));
  }

  // Get top customers
  private async getTopCustomers(startDate: Date, endDate: Date) {
    const result = await db.select({
      email: authUsers.email,
      orders: count(puzzleOrders.id),
      revenue: sum(puzzleOrders.totalPrice)
    })
    .from(authUsers)
    .leftJoin(puzzleOrders, eq(authUsers.id, puzzleOrders.userId))
    .where(and(
      gte(puzzleOrders.createdAt, startDate.toISOString()),
      lte(puzzleOrders.createdAt, endDate.toISOString())
    ))
    .groupBy(authUsers.id)
    .orderBy(desc(sum(puzzleOrders.totalPrice)))
    .limit(5);

    return result.map(row => ({
      email: row.email,
      orders: Number(row.orders),
      revenue: Number(row.revenue) || 0
    }));
  }

  // Get customer analytics
  async getCustomerAnalytics(customerId: string): Promise<CustomerAnalytics | null> {
    try {
      const customer = await db.select()
        .from(authUsers)
        .where(eq(authUsers.id, customerId))
        .limit(1);

      if (customer.length === 0) return null;

      const orders = await db.select()
        .from(puzzleOrders)
        .where(eq(puzzleOrders.userId, customerId))
        .orderBy(desc(puzzleOrders.createdAt));

      const totalSpent = orders.reduce((sum: number, order: any) => sum + Number(order.totalPrice), 0);
      const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

      // Get customer preferences
      const materials = [...new Set(orders.map((o: any) => String(o.material)))] as string[];
      const sizes = [...new Set(orders.map((o: any) => String(o.size)))] as string[];
      const averageQuantity = orders.reduce((sum: number, order: any) => sum + Number(order.quantity), 0) / orders.length;

      return {
        customerId,
        email: customer[0].email,
        firstName: customer[0].firstName,
        lastName: customer[0].lastName,
        totalOrders: orders.length,
        totalSpent,
        averageOrderValue,
        firstOrderDate: orders.length > 0 ? new Date(orders[orders.length - 1].createdAt) : new Date(),
        lastOrderDate: orders.length > 0 ? new Date(orders[0].createdAt) : new Date(),
        orderHistory: orders.map((order: any) => ({
          orderId: order.id,
          date: new Date(order.createdAt),
          amount: Number(order.totalPrice),
          status: order.status
        })),
        preferences: {
          favoriteMaterials: materials,
          favoriteSizes: sizes,
          averageQuantity
        }
      };
    } catch (error) {
      logger.error('Failed to get customer analytics', error);
      throw error;
    }
  }

  // Get product analytics
  async getProductAnalytics(productId: string): Promise<ProductAnalytics | null> {
    return null;
  }

  // Generate comprehensive report
  async generateComprehensiveReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const [
        businessMetrics,
        salesReport,
        analytics
      ] = await Promise.all([
        this.getBusinessMetrics('month'),
        this.getSalesReport('monthly', startDate, endDate),
        analyticsService.getDashboardAnalytics()
      ]);

      return {
        period: {
          start: startDate,
          end: endDate
        },
        businessMetrics,
        salesReport,
        analytics,
        generatedAt: new Date()
      };
    } catch (error) {
      logger.error('Failed to generate comprehensive report', error);
      throw error;
    }
  }

  // Helper method to get start date based on time range
  private getStartDate(now: Date, timeRange: 'day' | 'week' | 'month' | 'year'): Date {
    const start = new Date(now);
    
    switch (timeRange) {
      case 'day':
        start.setDate(start.getDate() - 1);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    
    return start;
  }
}

// Export singleton instance
export const advancedAnalyticsSystem = new AdvancedAnalyticsSystem();
