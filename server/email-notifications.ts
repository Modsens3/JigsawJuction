import { logger } from './logger';
import { orderTrackingSystem, OrderTracking } from './order-tracking';
import { advancedAnalyticsSystem } from './advanced-analytics';
import { EventEmitter } from 'events';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[];
}

export interface EmailNotification {
  id: string;
  type: 'order_confirmation' | 'order_status_update' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'welcome' | 'password_reset' | 'newsletter';
  recipient: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
  metadata?: any;
}

export interface EmailConfig {
  provider: 'smtp' | 'sendgrid' | 'mailgun' | 'nodemailer';
  host?: string;
  port?: number;
  secure?: boolean;
  username?: string;
  password?: string;
  apiKey?: string;
  fromEmail: string;
  fromName: string;
  replyTo?: string;
}

export class EmailNotificationSystem extends EventEmitter {
  private config: EmailConfig;
  private templates: Map<string, EmailTemplate> = new Map();
  private notificationQueue: EmailNotification[] = [];
  private isProcessing = false;

  constructor(config: EmailConfig) {
    super();
    this.config = config;
    this.initializeTemplates();
    this.setupEventListeners();
  }

  // Initialize email templates
  private initializeTemplates() {
    // Order confirmation template
    this.templates.set('order_confirmation', {
      id: 'order_confirmation',
      name: 'Order Confirmation',
      subject: 'Order Confirmation - JigsawJunction',
      htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmed!</h1>
            </div>
            <div class="content">
              <h2>Hello {{customerName}},</h2>
              <p>Thank you for your order! We're excited to create your custom puzzle.</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> {{orderId}}</p>
                <p><strong>Order Date:</strong> {{orderDate}}</p>
                <p><strong>Total Amount:</strong> €{{totalAmount}}</p>
                <p><strong>Quantity:</strong> {{quantity}}</p>
                <p><strong>Material:</strong> {{material}}</p>
                <p><strong>Size:</strong> {{size}}</p>
                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
              </div>
              
              <p>You can track your order status anytime using your order ID: <strong>{{orderId}}</strong></p>
              
              <p style="text-align: center;">
                <a href="{{trackingUrl}}" class="button">Track My Order</a>
              </p>
              
              <p>If you have any questions, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>The JigsawJunction Team</p>
            </div>
            <div class="footer">
              <p>© 2024 JigsawJunction. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
        Order Confirmation - JigsawJunction
        
        Hello {{customerName}},
        
        Thank you for your order! We're excited to create your custom puzzle.
        
        Order Details:
        - Order ID: {{orderId}}
        - Order Date: {{orderDate}}
        - Total Amount: €{{totalAmount}}
        - Quantity: {{quantity}}
        - Material: {{material}}
        - Size: {{size}}
        - Estimated Delivery: {{estimatedDelivery}}
        
        You can track your order status anytime using your order ID: {{orderId}}
        
        If you have any questions, please don't hesitate to contact us.
        
        Best regards,
        The JigsawJunction Team
        
        © 2024 JigsawJunction. All rights reserved.
      `,
      variables: ['customerName', 'orderId', 'orderDate', 'totalAmount', 'quantity', 'material', 'size', 'estimatedDelivery', 'trackingUrl']
    });

    // Order status update template
    this.templates.set('order_status_update', {
      id: 'order_status_update',
      name: 'Order Status Update',
      subject: 'Order Status Update - JigsawJunction',
      htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Order Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #059669; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .status-update { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #059669; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #059669; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Order Status Update</h1>
            </div>
            <div class="content">
              <h2>Hello {{customerName}},</h2>
              <p>Your order status has been updated!</p>
              
              <div class="status-update">
                <h3>Status: {{newStatus}}</h3>
                <p><strong>Order ID:</strong> {{orderId}}</p>
                <p><strong>Updated:</strong> {{updateTime}}</p>
                <p><strong>Message:</strong> {{statusMessage}}</p>
                {{#if trackingNumber}}
                <p><strong>Tracking Number:</strong> {{trackingNumber}}</p>
                {{/if}}
                {{#if estimatedDelivery}}
                <p><strong>Estimated Delivery:</strong> {{estimatedDelivery}}</p>
                {{/if}}
              </div>
              
              <p style="text-align: center;">
                <a href="{{trackingUrl}}" class="button">View Order Details</a>
              </p>
              
              <p>Thank you for choosing JigsawJunction!</p>
              
              <p>Best regards,<br>The JigsawJunction Team</p>
            </div>
            <div class="footer">
              <p>© 2024 JigsawJunction. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
        Order Status Update - JigsawJunction
        
        Hello {{customerName}},
        
        Your order status has been updated!
        
        Status: {{newStatus}}
        Order ID: {{orderId}}
        Updated: {{updateTime}}
        Message: {{statusMessage}}
        {{#if trackingNumber}}Tracking Number: {{trackingNumber}}{{/if}}
        {{#if estimatedDelivery}}Estimated Delivery: {{estimatedDelivery}}{{/if}}
        
        Thank you for choosing JigsawJunction!
        
        Best regards,
        The JigsawJunction Team
        
        © 2024 JigsawJunction. All rights reserved.
      `,
      variables: ['customerName', 'orderId', 'newStatus', 'updateTime', 'statusMessage', 'trackingNumber', 'estimatedDelivery', 'trackingUrl']
    });

    // Welcome email template
    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome Email',
      subject: 'Welcome to JigsawJunction!',
      htmlTemplate: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to JigsawJunction</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧩 Welcome to JigsawJunction!</h1>
            </div>
            <div class="content">
              <h2>Hello {{customerName}},</h2>
              <p>Welcome to JigsawJunction! We're thrilled to have you join our community of puzzle enthusiasts.</p>
              
              <p>With JigsawJunction, you can:</p>
              <ul>
                <li>Create custom puzzles from your favorite images</li>
                <li>Choose from premium materials and sizes</li>
                <li>Track your orders in real-time</li>
                <li>Enjoy fast and reliable delivery</li>
              </ul>
              
              <p style="text-align: center;">
                <a href="{{websiteUrl}}" class="button">Start Creating</a>
              </p>
              
              <p>If you have any questions, our support team is here to help!</p>
              
              <p>Happy puzzling!<br>The JigsawJunction Team</p>
            </div>
            <div class="footer">
              <p>© 2024 JigsawJunction. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textTemplate: `
        Welcome to JigsawJunction!
        
        Hello {{customerName}},
        
        Welcome to JigsawJunction! We're thrilled to have you join our community of puzzle enthusiasts.
        
        With JigsawJunction, you can:
        - Create custom puzzles from your favorite images
        - Choose from premium materials and sizes
        - Track your orders in real-time
        - Enjoy fast and reliable delivery
        
        Happy puzzling!
        The JigsawJunction Team
        
        © 2024 JigsawJunction. All rights reserved.
      `,
      variables: ['customerName', 'websiteUrl']
    });
  }

  // Setup event listeners for order tracking system
  private setupEventListeners() {
    // Listen for order status updates
    orderTrackingSystem.on('orderStatusUpdated', async (update) => {
      try {
        await this.sendOrderStatusUpdateEmail(update);
      } catch (error) {
        logger.error('Failed to send order status update email', error);
      }
    });
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(tracking: OrderTracking): Promise<void> {
    try {
      const template = this.templates.get('order_confirmation');
      if (!template) {
        throw new Error('Order confirmation template not found');
      }

      const variables = {
        customerName: tracking.customerName,
        orderId: tracking.orderId,
        orderDate: tracking.orderDetails.createdAt.toLocaleDateString(),
        totalAmount: tracking.orderDetails.totalPrice.toFixed(2),
        quantity: tracking.orderDetails.quantity,
        material: tracking.orderDetails.material,
        size: tracking.orderDetails.size,
        estimatedDelivery: tracking.estimatedDelivery.toLocaleDateString(),
        trackingUrl: `http://localhost:3000/track-order/${tracking.orderId}`
      };

      const notification: EmailNotification = {
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'order_confirmation',
        recipient: tracking.customerEmail,
        subject: this.replaceVariables(template.subject, variables),
        htmlContent: this.replaceVariables(template.htmlTemplate, variables),
        textContent: this.replaceVariables(template.textTemplate, variables),
        status: 'pending',
        metadata: { orderId: tracking.orderId }
      };

      await this.queueEmail(notification);
      
      logger.info('Order confirmation email queued', {
        orderId: tracking.orderId,
        customerEmail: tracking.customerEmail
      });
    } catch (error) {
      logger.error('Failed to send order confirmation email', error);
      throw error;
    }
  }

  // Send order status update email
  async sendOrderStatusUpdateEmail(update: any): Promise<void> {
    try {
      const template = this.templates.get('order_status_update');
      if (!template) {
        throw new Error('Order status update template not found');
      }

      const tracking = update.tracking;
      const variables = {
        customerName: tracking.customerName,
        orderId: tracking.orderId,
        newStatus: tracking.currentStatus.status,
        updateTime: tracking.currentStatus.timestamp.toLocaleString(),
        statusMessage: tracking.currentStatus.message,
        trackingNumber: tracking.trackingNumber,
        estimatedDelivery: tracking.estimatedDelivery.toLocaleDateString(),
        trackingUrl: `http://localhost:3000/track-order/${tracking.orderId}`
      };

      const notification: EmailNotification = {
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'order_status_update',
        recipient: tracking.customerEmail,
        subject: this.replaceVariables(template.subject, variables),
        htmlContent: this.replaceVariables(template.htmlTemplate, variables),
        textContent: this.replaceVariables(template.textTemplate, variables),
        status: 'pending',
        metadata: { 
          orderId: tracking.orderId,
          previousStatus: update.previousStatus,
          newStatus: tracking.currentStatus.status
        }
      };

      await this.queueEmail(notification);
      
      logger.info('Order status update email queued', {
        orderId: tracking.orderId,
        customerEmail: tracking.customerEmail,
        status: tracking.currentStatus.status
      });
    } catch (error) {
      logger.error('Failed to send order status update email', error);
      throw error;
    }
  }

  // Send welcome email
  async sendWelcomeEmail(customerEmail: string, customerName: string): Promise<void> {
    try {
      const template = this.templates.get('welcome');
      if (!template) {
        throw new Error('Welcome email template not found');
      }

      const variables = {
        customerName,
        websiteUrl: 'http://localhost:3000'
      };

      const notification: EmailNotification = {
        id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'welcome',
        recipient: customerEmail,
        subject: this.replaceVariables(template.subject, variables),
        htmlContent: this.replaceVariables(template.htmlTemplate, variables),
        textContent: this.replaceVariables(template.textTemplate, variables),
        status: 'pending',
        metadata: { customerEmail, customerName }
      };

      await this.queueEmail(notification);
      
      logger.info('Welcome email queued', { customerEmail, customerName });
    } catch (error) {
      logger.error('Failed to send welcome email', error);
      throw error;
    }
  }

  // Queue email for sending
  private async queueEmail(notification: EmailNotification): Promise<void> {
    this.notificationQueue.push(notification);
    
    // Emit event for real-time updates
    this.emit('emailQueued', notification);
    
    // Process queue if not already processing
    if (!this.isProcessing) {
      this.processEmailQueue();
    }
  }

  // Process email queue
  private async processEmailQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      while (this.notificationQueue.length > 0) {
        const notification = this.notificationQueue.shift()!;
        
        try {
          await this.sendEmail(notification);
          notification.status = 'sent';
          notification.sentAt = new Date();
          
          logger.info('Email sent successfully', {
            id: notification.id,
            type: notification.type,
            recipient: notification.recipient
          });
        } catch (error) {
          notification.status = 'failed';
          notification.error = error instanceof Error ? error.message : 'Unknown error';
          
          logger.error('Failed to send email', error, {
            id: notification.id,
            type: notification.type,
            recipient: notification.recipient
          });
        }

        // Emit event for real-time updates
        this.emit('emailProcessed', notification);
        
        // Small delay to prevent overwhelming the email service
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Send email (mock implementation - would integrate with real email service)
  private async sendEmail(notification: EmailNotification): Promise<void> {
    // This is a mock implementation
    // In production, you would integrate with a real email service like:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Nodemailer with SMTP
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Email service temporarily unavailable');
    }
    
    // Log the email content (in production, this would be sent via email service)
    logger.info('Email content', {
      to: notification.recipient,
      subject: notification.subject,
      htmlLength: notification.htmlContent.length,
      textLength: notification.textContent.length
    });
  }

  // Replace variables in template
  private replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value || ''));
    }
    
    return result;
  }

  // Get email templates
  getTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get template by ID
  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  // Add custom template
  addTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template);
  }

  // Update email configuration
  updateConfig(newConfig: Partial<EmailConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Email configuration updated', this.config);
  }

  // Get email configuration
  getConfig(): EmailConfig {
    return { ...this.config };
  }

  // Get queue status
  getQueueStatus(): { length: number; isProcessing: boolean } {
    return {
      length: this.notificationQueue.length,
      isProcessing: this.isProcessing
    };
  }

  // Clear email queue
  clearQueue(): void {
    this.notificationQueue = [];
    logger.info('Email queue cleared');
  }

  // Subscribe to email events
  subscribeToEmailEvents(callback: (event: string, data: any) => void): () => void {
    const eventHandler = (data: any) => {
      callback('emailEvent', data);
    };

    this.on('emailQueued', eventHandler);
    this.on('emailProcessed', eventHandler);

    return () => {
      this.off('emailQueued', eventHandler);
      this.off('emailProcessed', eventHandler);
    };
  }
}

// Export singleton instance with default config
export const emailNotificationSystem = new EmailNotificationSystem({
  provider: 'nodemailer',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  username: process.env.EMAIL_USERNAME || 'noreply@jigsawjunction.com',
  password: process.env.EMAIL_PASSWORD || 'password',
  fromEmail: 'noreply@jigsawjunction.com',
  fromName: 'JigsawJunction'
});
