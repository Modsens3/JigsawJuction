import { 
  type PuzzleOrder, type InsertPuzzleOrder, 
  type CartItem, type InsertCartItem, type User, type InsertUser,
  type Order, type InsertOrder, type LoyaltyTransaction, type BlogPost, type InsertBlogPost,
  type Subscription, type InsertSubscription, type PuzzleProgress, type InsertPuzzleProgress,
  type SocialGalleryPost
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Order methods
  createPuzzleOrder(order: InsertPuzzleOrder): Promise<PuzzleOrder>;
  getPuzzleOrderById(id: string): Promise<PuzzleOrder | undefined>;
  
  // Cart methods
  getCartItems(sessionId: string): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;

  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLoyalty(id: string, points: number, tier: string, totalSpent: string): Promise<User | undefined>;

  // Loyalty methods
  getLoyaltyTransactions(userId: string): Promise<LoyaltyTransaction[]>;
  createLoyaltyTransaction(transaction: { userId: string; points: number; type: string; description?: string; orderId?: string }): Promise<LoyaltyTransaction>;



  // Enhanced order methods
  getUserOrders(userId: string): Promise<Order[]>;
  createEnhancedOrder(order: InsertOrder): Promise<Order>;

  // Blog methods
  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;

  // Subscription methods
  getUserSubscriptions(userId: string): Promise<Subscription[]>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;

  // Progress tracking methods
  getPuzzleProgress(userId: string): Promise<PuzzleProgress[]>;
  updatePuzzleProgress(id: string, completedPieces: number, timeSpent: number): Promise<PuzzleProgress | undefined>;

  // Social gallery methods
  getSocialGallery(): Promise<SocialGalleryPost[]>;
  getUserSocialPosts(userId: string): Promise<SocialGalleryPost[]>;
  
  // Simple order methods for admin
  createSimpleOrder(order: any): Promise<any>;
  getAllSimpleOrders(): any[];
  getSimpleOrderById(id: string): any;
}

export class DatabaseStorage implements IStorage {
  // All methods will use the database instead of memory
  async getUserByEmail(email: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    const { db } = await import("./db");
    const { users } = await import("@shared/schema");
    
    return await db.select().from(users);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const { db } = await import("./db");
    const { users } = await import("@shared/schema");
    
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUserLoyalty(id: string, points: number, tier: string, totalSpent: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const [user] = await db
      .update(users)
      .set({ loyaltyPoints: points, loyaltyTier: tier as any, totalSpent })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getLoyaltyTransactions(userId: string): Promise<LoyaltyTransaction[]> {
    const { db } = await import("./db");
    const { loyaltyTransactions } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    return await db.select().from(loyaltyTransactions).where(eq(loyaltyTransactions.userId, userId));
  }

  async createLoyaltyTransaction(transaction: { userId: string; points: number; type: string; description?: string; orderId?: string }): Promise<LoyaltyTransaction> {
    const { db } = await import("./db");
    const { loyaltyTransactions } = await import("@shared/schema");
    
    const [loyaltyTransaction] = await db.insert(loyaltyTransactions).values(transaction).returning();
    return loyaltyTransaction;
  }



  async getUserOrders(userId: string): Promise<Order[]> {
    const { db } = await import("./db");
    const { orders } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createEnhancedOrder(order: InsertOrder): Promise<Order> {
    const { db } = await import("./db");
    const { orders } = await import("@shared/schema");
    
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    const { db } = await import("./db");
    const { blogPosts } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    if (published !== undefined) {
      return await db.select().from(blogPosts).where(eq(blogPosts.published, published ? 1 : 0));
    }
    return await db.select().from(blogPosts);
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
    const { db } = await import("./db");
    const { blogPosts } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, slug));
    return post;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const { db } = await import("./db");
    const { blogPosts } = await import("@shared/schema");
    
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const { db } = await import("./db");
    const { subscriptions } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    return await db.select().from(subscriptions).where(eq(subscriptions.userId, userId));
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const { db } = await import("./db");
    const { subscriptions } = await import("@shared/schema");
    
    const [newSubscription] = await db.insert(subscriptions).values(subscription).returning();
    return newSubscription;
  }

  async getPuzzleProgress(userId: string): Promise<PuzzleProgress[]> {
    const { db } = await import("./db");
    const { puzzleProgress } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    return await db.select().from(puzzleProgress).where(eq(puzzleProgress.userId, userId));
  }

  async updatePuzzleProgress(id: string, completedPieces: number, timeSpent: number): Promise<PuzzleProgress | undefined> {
    const { db } = await import("./db");
    const { puzzleProgress } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const completionPercentage = (completedPieces / 1000) * 100; // Assuming 1000 pieces max
    const [progress] = await db
      .update(puzzleProgress)
      .set({ 
        completedPieces, 
        timeSpentMinutes: timeSpent,
        completionPercentage: completionPercentage.toString()
      })
      .where(eq(puzzleProgress.id, id))
      .returning();
    return progress;
  }

  async getSocialGallery(): Promise<SocialGalleryPost[]> {
    const { db } = await import("./db");
    const { socialGallery } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    return await db.select().from(socialGallery).where(eq(socialGallery.published, 1));
  }

  async getUserSocialPosts(userId: string): Promise<SocialGalleryPost[]> {
    const { db } = await import("./db");
    const { socialGallery } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    return await db.select().from(socialGallery).where(eq(socialGallery.userId, userId));
  }



  // Simple order methods for admin
  async createSimpleOrder(order: any): Promise<any> {
    simpleOrders.push(order);
    return order;
  }

  getAllSimpleOrders(): any[] {
    return simpleOrders;
  }

  getSimpleOrderById(id: string): any {
    return simpleOrders.find(order => order.id === id);
  }

  async createPuzzleOrder(order: InsertPuzzleOrder): Promise<PuzzleOrder> {
    const { db } = await import("./db");
    const { puzzleOrders } = await import("@shared/schema");
    
    const [newOrder] = await db.insert(puzzleOrders).values(order).returning();
    return newOrder;
  }

  async getPuzzleOrderById(id: string): Promise<PuzzleOrder | undefined> {
    const { db } = await import("./db");
    const { puzzleOrders } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const [order] = await db.select().from(puzzleOrders).where(eq(puzzleOrders.id, id));
    return order;
  }

  async getCartItems(sessionId: string): Promise<CartItem[]> {
    const { db } = await import("./db");
    const { cartItems } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    return await db.select().from(cartItems).where(eq(cartItems.userId, sessionId));
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    const { db } = await import("./db");
    const { cartItems } = await import("@shared/schema");
    
    const [newItem] = await db.insert(cartItems).values(item).returning();
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const { db } = await import("./db");
    const { cartItems } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return item;
  }

  async removeCartItem(id: string): Promise<boolean> {
    const { db } = await import("./db");
    const { cartItems } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return (result.rowCount || 0) > 0;
  }

  async clearCart(sessionId: string): Promise<void> {
    const { db } = await import("./db");
    const { cartItems } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    await db.delete(cartItems).where(eq(cartItems.userId, sessionId));
  }
}

// Simple order storage for admin panel
const simpleOrders: any[] = [];

export class MemStorage implements IStorage {
  private orders: Map<string, PuzzleOrder>;
  private cartItems: Map<string, CartItem>;

  constructor() {
    this.orders = new Map();
    this.cartItems = new Map();
  }
    



  async createPuzzleOrder(insertOrder: InsertPuzzleOrder): Promise<PuzzleOrder> {
    const id = randomUUID();
    const order: PuzzleOrder = {
      ...insertOrder,
      id,
      status: insertOrder.status ?? 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageFileId: (insertOrder as any).imageFileId ?? null,
      imageDownloadUrl: (insertOrder as any).imageDownloadUrl ?? null,
    };
    this.orders.set(id, order);
    return order;
  }

  async getPuzzleOrderById(id: string): Promise<PuzzleOrder | undefined> {
    return this.orders.get(id);
  }

  async getCartItems(sessionId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => (item as any).userId === sessionId);
  }

  async addCartItem(insertItem: InsertCartItem): Promise<CartItem> {
    const id = randomUUID();
    const item: CartItem = {
      ...insertItem,
      id,
      quantity: insertItem.quantity ?? 1,
      createdAt: new Date().toISOString(),
    };
    this.cartItems.set(id, item);
    return item;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
      return item;
    }
    return undefined;
  }

  async removeCartItem(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    Array.from(this.cartItems.entries()).forEach(([id, item]) => {
      if ((item as any).userId === sessionId) {
        this.cartItems.delete(id);
      }
    });
  }

  // Stub implementations for business features (not implemented in memory storage)
  async getUser(id: string): Promise<User | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getUserByEmail(email: string): Promise<User | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getAllUsers(): Promise<User[]> { throw new Error("Not implemented in MemStorage"); }
  async createUser(user: InsertUser): Promise<User> { throw new Error("Not implemented in MemStorage"); }
  async updateUserLoyalty(id: string, points: number, tier: string, totalSpent: string): Promise<User | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getLoyaltyTransactions(userId: string): Promise<LoyaltyTransaction[]> { throw new Error("Not implemented in MemStorage"); }
  async createLoyaltyTransaction(transaction: any): Promise<LoyaltyTransaction> { throw new Error("Not implemented in MemStorage"); }
  
  async getUserOrders(userId: string): Promise<Order[]> { throw new Error("Not implemented in MemStorage"); }
  async createEnhancedOrder(order: InsertOrder): Promise<Order> { throw new Error("Not implemented in MemStorage"); }
  async getBlogPosts(published?: boolean): Promise<BlogPost[]> { throw new Error("Not implemented in MemStorage"); }
  async getBlogPost(slug: string): Promise<BlogPost | undefined> { throw new Error("Not implemented in MemStorage"); }
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> { throw new Error("Not implemented in MemStorage"); }
  async getUserSubscriptions(userId: string): Promise<Subscription[]> { throw new Error("Not implemented in MemStorage"); }
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> { throw new Error("Not implemented in MemStorage"); }
  async getPuzzleProgress(userId: string): Promise<PuzzleProgress[]> { throw new Error("Not implemented in MemStorage"); }
  async updatePuzzleProgress(id: string, completedPieces: number, timeSpent: number): Promise<PuzzleProgress | undefined> { throw new Error("Not implemented in MemStorage"); }
  async getSocialGallery(): Promise<SocialGalleryPost[]> { throw new Error("Not implemented in MemStorage"); }
  async getUserSocialPosts(userId: string): Promise<SocialGalleryPost[]> { throw new Error("Not implemented in MemStorage"); }
  
  // Simple order methods for admin
  async createSimpleOrder(order: any): Promise<any> {
    simpleOrders.push(order);
    return order;
  }

  getAllSimpleOrders(): any[] {
    return simpleOrders;
  }

  getSimpleOrderById(id: string): any {
    return simpleOrders.find(order => order.id === id);
  }
}

// Switch to database storage for business features
export const storage = new DatabaseStorage();
