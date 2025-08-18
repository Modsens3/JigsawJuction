import { db } from './db';
import { authUsers, puzzleOrders, cartItems, fileStorage } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from './logger';
import { deleteFileUniversal } from './upload';
import { deleteFromDrive } from './google-drive';
import { config } from './config';

// Export user data for GDPR compliance
export const exportUserData = async (userId: string) => {
  try {
    // Get user information
    const user = await db.select().from(authUsers).where(eq(authUsers.id, userId)).limit(1);
    
    // Get user orders
    const orders = await db.select().from(puzzleOrders).where(eq(puzzleOrders.userId, userId));
    
    // Get user cart items
    const cart = await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    
    // Get user files
    const files = await db.select().from(fileStorage).where(eq(fileStorage.uploadedBy, userId));
    
    return {
      user: user[0] || null,
      orders: orders,
      cart: cart,
      files: files,
      exportDate: new Date().toISOString(),
      dataTypes: ['user', 'orders', 'cart', 'files']
    };
  } catch (error) {
    logger.error('Failed to export user data:', error);
    throw error;
  }
};

// Delete user data for GDPR compliance
export const deleteUserData = async (userId: string) => {
  try {
    // Delete user files from storage
    const files = await db.select().from(fileStorage).where(eq(fileStorage.uploadedBy, userId));
    
    for (const file of files) {
      try {
        // Delete from local storage
        await deleteFileUniversal(file.id);
        
        // Delete from Google Drive if applicable
        if (config.storage.type === 'google-drive' && file.fileId) {
          await deleteFromDrive(file.fileId);
        }
      } catch (error) {
        logger.error(`Failed to delete file ${file.id}:`, error);
      }
    }
    
    // Delete from database (in order to respect foreign key constraints)
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
    await db.delete(puzzleOrders).where(eq(puzzleOrders.userId, userId));
    await db.delete(fileStorage).where(eq(fileStorage.uploadedBy, userId));
    await db.delete(authUsers).where(eq(authUsers.id, userId));
    
    logger.info(`User data deleted for user: ${userId}`);
    
    return {
      success: true,
      deletedFiles: files.length,
      deletedAt: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Failed to delete user data:', error);
    throw error;
  }
};

// Anonymize user data (alternative to deletion)
export const anonymizeUserData = async (userId: string) => {
  try {
    const anonymizedEmail = `deleted_${Date.now()}@deleted.com`;
    const anonymizedName = 'Deleted User';
    
    // Anonymize user information
    await db.update(authUsers)
      .set({
        email: anonymizedEmail,
        name: anonymizedName,
        isAdmin: false
      })
      .where(eq(authUsers.id, userId));
    
    // Anonymize order customer information
    await db.update(puzzleOrders)
      .set({
        customerEmail: anonymizedEmail,
        customerName: anonymizedName
      })
      .where(eq(puzzleOrders.userId, userId));
    
    logger.info(`User data anonymized for user: ${userId}`);
    
    return {
      success: true,
      anonymizedAt: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Failed to anonymize user data:', error);
    throw error;
  }
};
