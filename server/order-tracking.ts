import { db } from './db';
import { puzzleOrders, authUsers } from '../shared/schema';
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm';
import { logger } from './logger';
import { EventEmitter } from 'events';

export interface OrderStatus {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  timestamp: Date;
  message: string;
  location?: string;
  estimatedDelivery?: Date;
}

export interface OrderTracking {
  orderId: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  orderDetails: {
    image: string;
    quantity: number;
    material: string;
    size: string;
    totalPrice: number;
    createdAt: Date;
  };
  currentStatus: OrderStatus;
  statusHistory: OrderStatus[];
  estimatedDelivery: Date;
  trackingNumber?: string;
  shippingAddress?: string;
  notes?: string;
}

export interface OrderUpdate {
  orderId: string;
  status: OrderStatus['status'];
  message: string;
  location?: string;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  notes?: string;
}

export class OrderTrackingSystem extends EventEmitter {
  private trackingCache: Map<string, OrderTracking> = new Map();

  constructor() {
    super();
    this.setMaxListeners(100); // Allow many listeners for real-time updates
  }

  // Get order tracking information
  async getOrderTracking(orderId: string): Promise<OrderTracking | null> {
    try {
      // Check cache first
      if (this.trackingCache.has(orderId)) {
        return this.trackingCache.get(orderId)!;
      }

      const order = await db.select()
        .from(puzzleOrders)
        .where(eq(puzzleOrders.id, orderId))
        .limit(1);

      if (order.length === 0) {
        return null;
      }

      const customer = await db.select()
        .from(authUsers)
        .where(eq(authUsers.id, order[0].userId))
        .limit(1);

      if (customer.length === 0) {
        return null;
      }

      // Create status history based on order status
      const statusHistory = this.createStatusHistory(order[0]);
      const currentStatus = statusHistory[statusHistory.length - 1];

      // Calculate estimated delivery
      const estimatedDelivery = this.calculateEstimatedDelivery(order[0].createdAt, currentStatus.status);

      const tracking: OrderTracking = {
        orderId,
        customerId: order[0].userId,
        customerEmail: customer[0].email,
        customerName: `${customer[0].firstName} ${customer[0].lastName}`,
        orderDetails: {
          image: order[0].image,
          quantity: order[0].quantity,
          material: order[0].material,
          size: order[0].size,
          totalPrice: Number(order[0].totalPrice),
          createdAt: new Date(order[0].createdAt)
        },
        currentStatus,
        statusHistory,
        estimatedDelivery,
        trackingNumber: this.generateTrackingNumber(orderId),
        shippingAddress: 'Default Address', // Would come from order details
        notes: order[0].status === 'pending' ? 'Order received and being processed' : undefined
      };

      // Cache the tracking information
      this.trackingCache.set(orderId, tracking);

      return tracking;
    } catch (error) {
      logger.error('Failed to get order tracking', error, { orderId });
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(update: OrderUpdate): Promise<OrderTracking> {
    try {
      const { orderId, status, message, location, estimatedDelivery, trackingNumber, notes } = update;

      // Update order in database
      await db.update(puzzleOrders)
        .set({ 
          status,
          updatedAt: new Date().toISOString()
        })
        .where(eq(puzzleOrders.id, orderId));

      // Get updated tracking information
      const tracking = await this.getOrderTracking(orderId);
      if (!tracking) {
        throw new Error('Order not found');
      }

      // Create new status entry
      const newStatus: OrderStatus = {
        id: `status_${Date.now()}`,
        status,
        timestamp: new Date(),
        message,
        location,
        estimatedDelivery
      };

      // Update tracking information
      tracking.currentStatus = newStatus;
      tracking.statusHistory.push(newStatus);
      
      if (estimatedDelivery) {
        tracking.estimatedDelivery = estimatedDelivery;
      }
      
      if (trackingNumber) {
        tracking.trackingNumber = trackingNumber;
      }
      
      if (notes) {
        tracking.notes = notes;
      }

      // Update cache
      this.trackingCache.set(orderId, tracking);

      // Emit real-time update event
      this.emit('orderStatusUpdated', {
        orderId,
        tracking,
        previousStatus: tracking.statusHistory[tracking.statusHistory.length - 2]?.status || 'unknown'
      });

      // Log the status update
      logger.info(`Order status updated: ${orderId} -> ${status}`, {
        orderId,
        status,
        message,
        customerEmail: tracking.customerEmail
      });

      return tracking;
    } catch (error) {
      logger.error('Failed to update order status', error, { update });
      throw error;
    }
  }

  // Get orders by status
  async getOrdersByStatus(status: OrderStatus['status']): Promise<OrderTracking[]> {
    try {
      const orders = await db.select()
        .from(puzzleOrders)
        .where(eq(puzzleOrders.status, status))
        .orderBy(desc(puzzleOrders.createdAt));

      const trackingPromises = orders.map(order => this.getOrderTracking(order.id));
      const trackingResults = await Promise.all(trackingPromises);

      return trackingResults.filter(tracking => tracking !== null) as OrderTracking[];
    } catch (error) {
      logger.error('Failed to get orders by status', error, { status });
      throw error;
    }
  }

  // Get orders by customer
  async getCustomerOrders(customerId: string): Promise<OrderTracking[]> {
    try {
      const orders = await db.select()
        .from(puzzleOrders)
        .where(eq(puzzleOrders.userId, customerId))
        .orderBy(desc(puzzleOrders.createdAt));

      const trackingPromises = orders.map(order => this.getOrderTracking(order.id));
      const trackingResults = await Promise.all(trackingPromises);

      return trackingResults.filter(tracking => tracking !== null) as OrderTracking[];
    } catch (error) {
      logger.error('Failed to get customer orders', error, { customerId });
      throw error;
    }
  }

  // Get orders by date range
  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderTracking[]> {
    try {
      const orders = await db.select()
        .from(puzzleOrders)
        .where(and(
          gte(puzzleOrders.createdAt, startDate.toISOString()),
          lte(puzzleOrders.createdAt, endDate.toISOString())
        ))
        .orderBy(desc(puzzleOrders.createdAt));

      const trackingPromises = orders.map(order => this.getOrderTracking(order.id));
      const trackingResults = await Promise.all(trackingPromises);

      return trackingResults.filter(tracking => tracking !== null) as OrderTracking[];
    } catch (error) {
      logger.error('Failed to get orders by date range', error, { startDate, endDate });
      throw error;
    }
  }

  // Search orders
  async searchOrders(query: string): Promise<OrderTracking[]> {
    try {
      // Search by order ID, customer email, or tracking number
      const orders = await db.select()
        .from(puzzleOrders)
        .where(sql`${puzzleOrders.id} LIKE ${`%${query}%`} OR ${puzzleOrders.id} IN (
          SELECT ${puzzleOrders.id} 
          FROM ${puzzleOrders} 
          JOIN ${authUsers} ON ${puzzleOrders.userId} = ${authUsers.id}
          WHERE ${authUsers.email} LIKE ${`%${query}%`}
        )`)
        .orderBy(desc(puzzleOrders.createdAt));

      const trackingPromises = orders.map(order => this.getOrderTracking(order.id));
      const trackingResults = await Promise.all(trackingPromises);

      return trackingResults.filter(tracking => tracking !== null) as OrderTracking[];
    } catch (error) {
      logger.error('Failed to search orders', error, { query });
      throw error;
    }
  }

  // Get order statistics
  async getOrderStatistics(): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    refunded: number;
    averageProcessingTime: number;
  }> {
    try {
      const statusCounts = await Promise.all([
        this.getOrdersByStatus('pending'),
        this.getOrdersByStatus('processing'),
        this.getOrdersByStatus('shipped'),
        this.getOrdersByStatus('delivered'),
        this.getOrdersByStatus('cancelled'),
        this.getOrdersByStatus('refunded')
      ]);

      const [pending, processing, shipped, delivered, cancelled, refunded] = statusCounts;
      const total = pending.length + processing.length + shipped.length + delivered.length + cancelled.length + refunded.length;

      // Calculate average processing time (simplified)
      const processingOrders = await db.select()
        .from(puzzleOrders)
        .where(eq(puzzleOrders.status, 'processing'));

      const averageProcessingTime = processingOrders.length > 0 ? 
        processingOrders.reduce((sum, order) => {
          const createdAt = new Date(order.createdAt);
          const now = new Date();
          return sum + (now.getTime() - createdAt.getTime());
        }, 0) / processingOrders.length : 0;

      return {
        total,
        pending: pending.length,
        processing: processing.length,
        shipped: shipped.length,
        delivered: delivered.length,
        cancelled: cancelled.length,
        refunded: refunded.length,
        averageProcessingTime
      };
    } catch (error) {
      logger.error('Failed to get order statistics', error);
      throw error;
    }
  }

  // Subscribe to order updates (for real-time notifications)
  subscribeToOrderUpdates(orderId: string, callback: (update: any) => void): () => void {
    const eventHandler = (update: any) => {
      if (update.orderId === orderId) {
        callback(update);
      }
    };

    this.on('orderStatusUpdated', eventHandler);

    // Return unsubscribe function
    return () => {
      this.off('orderStatusUpdated', eventHandler);
    };
  }

  // Subscribe to all order updates (admin)
  subscribeToAllOrderUpdates(callback: (update: any) => void): () => void {
    this.on('orderStatusUpdated', callback);

    return () => {
      this.off('orderStatusUpdated', callback);
    };
  }

  // Bulk status update
  async bulkUpdateStatus(updates: OrderUpdate[]): Promise<OrderTracking[]> {
    try {
      const results = await Promise.all(
        updates.map(update => this.updateOrderStatus(update))
      );

      logger.info(`Bulk status update completed: ${updates.length} orders`);
      return results;
    } catch (error) {
      logger.error('Failed to bulk update status', error);
      throw error;
    }
  }

  // Create status history based on order
  private createStatusHistory(order: any): OrderStatus[] {
    const history: OrderStatus[] = [];

    // Initial order status
    history.push({
      id: 'status_initial',
      status: 'pending',
      timestamp: new Date(order.createdAt),
      message: 'Order received and being processed'
    });

    // Add current status if different from pending
    if (order.status !== 'pending') {
      const statusMessages = {
        processing: 'Order is being processed',
        shipped: 'Order has been shipped',
        delivered: 'Order has been delivered',
        cancelled: 'Order has been cancelled',
        refunded: 'Order has been refunded'
      };

      history.push({
        id: `status_${order.status}`,
        status: order.status as OrderStatus['status'],
        timestamp: new Date(order.updatedAt || order.createdAt),
        message: statusMessages[order.status as keyof typeof statusMessages] || 'Status updated'
      });
    }

    return history;
  }

  // Calculate estimated delivery date
  private calculateEstimatedDelivery(orderDate: string, currentStatus: OrderStatus['status']): Date {
    const orderCreated = new Date(orderDate);
    const now = new Date();
    
    let estimatedDays = 7; // Default 7 days

    switch (currentStatus) {
      case 'pending':
        estimatedDays = 7;
        break;
      case 'processing':
        estimatedDays = 5;
        break;
      case 'shipped':
        estimatedDays = 2;
        break;
      case 'delivered':
        estimatedDays = 0;
        break;
      case 'cancelled':
      case 'refunded':
        estimatedDays = 0;
        break;
    }

    const estimatedDelivery = new Date(orderCreated);
    estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays);
    
    return estimatedDelivery;
  }

  // Generate tracking number
  private generateTrackingNumber(orderId: string): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TRK${timestamp}${random}`.toUpperCase();
  }

  // Clear cache for specific order
  clearOrderCache(orderId: string): void {
    this.trackingCache.delete(orderId);
  }

  // Clear all cache
  clearAllCache(): void {
    this.trackingCache.clear();
  }

  // Get cache statistics
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.trackingCache.size,
      keys: Array.from(this.trackingCache.keys())
    };
  }
}

// Export singleton instance
export const orderTrackingSystem = new OrderTrackingSystem();
