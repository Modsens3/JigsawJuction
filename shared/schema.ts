import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

// Authentication tables
export const authUsers = sqliteTable("auth_users", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isVerified: integer("is_verified").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => authUsers.id),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Puzzle templates table
export const puzzleTemplates = sqliteTable("puzzle_templates", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  imageFileId: text("image_file_id"), // Google Drive file ID
  basePrice: real("base_price").notNull(),
  featured: integer("featured").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Puzzle orders table
export const puzzleOrders = sqliteTable("puzzle_orders", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => authUsers.id),
  image: text("image").notNull(), // Local filename or Google Drive file ID
  imageFileId: text("image_file_id"), // Google Drive file ID
  imageDownloadUrl: text("image_download_url"), // Google Drive download URL
  designData: text("design_data").notNull(),
  quantity: integer("quantity").notNull(),
  material: text("material").notNull(),
  size: text("size").notNull(),
  totalPrice: real("total_price").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Cart items table
export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => authUsers.id),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// File storage table for tracking files
export const fileStorage = sqliteTable("file_storage", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  filename: text("filename").notNull(),
  fileId: text("file_id"), // Google Drive file ID
  downloadUrl: text("download_url"), // Google Drive download URL
  webViewLink: text("web_view_link"), // Google Drive web view link
  storageType: text("storage_type").notNull().default("local"), // local, google-drive
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  uploadedBy: text("uploaded_by").references(() => authUsers.id),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// File versions table for version control
export const fileVersions = sqliteTable("file_versions", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  fileId: text("file_id").notNull().references(() => fileStorage.id),
  version: integer("version").notNull(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  fileIdDrive: text("file_id_drive"), // Google Drive file ID for this version
  downloadUrl: text("download_url"), // Google Drive download URL
  webViewLink: text("web_view_link"), // Google Drive web view link
  storageType: text("storage_type").notNull().default("local"), // local, google-drive, both
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  checksum: text("checksum").notNull(), // SHA256 hash for change detection
  metadata: text("metadata"), // JSON string for version metadata
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  createdBy: text("created_by").references(() => authUsers.id),
  comment: text("comment"), // Version comment/description
  isCurrent: integer("is_current").default(0), // Whether this is the current version
});

// Additional tables that the server expects

// Orders table (alias for puzzleOrders)
export const orders = puzzleOrders;

// Order items table
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  orderId: text("order_id").notNull().references(() => puzzleOrders.id),
  productId: text("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Loyalty transactions table
export const loyaltyTransactions = sqliteTable("loyalty_transactions", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => authUsers.id),
  type: text("type").notNull(), // earn, spend, expire
  points: integer("points").notNull(),
  description: text("description"),
  orderId: text("order_id").references(() => puzzleOrders.id),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
});

// Blog posts table
export const blogPosts = sqliteTable("blog_posts", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  authorId: text("author_id").notNull().references(() => authUsers.id),
  published: integer("published").default(0),
  publishedAt: text("published_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Subscriptions table
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => authUsers.id),
  plan: text("plan").notNull(), // basic, premium, pro
  status: text("status").notNull().default("active"), // active, cancelled, expired
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Puzzle progress table
export const puzzleProgress = sqliteTable("puzzle_progress", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => authUsers.id),
  puzzleId: text("puzzle_id").notNull().references(() => puzzleOrders.id),
  progress: integer("progress").notNull().default(0), // 0-100
  completedPieces: integer("completed_pieces").notNull().default(0),
  totalPieces: integer("total_pieces").notNull(),
  startedAt: text("started_at").default(sql`(datetime('now'))`),
  completedAt: text("completed_at"),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Social gallery table
export const socialGallery = sqliteTable("social_gallery", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  userId: text("user_id").notNull().references(() => authUsers.id),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  likes: integer("likes").notNull().default(0),
  published: integer("published").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Predefined puzzles table
export const predefinedPuzzles = sqliteTable("predefined_puzzles", {
  id: text("id").primaryKey().default(sql`(hex(randomblob(16)))`),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'round', 'octagon', 'square'
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard', 'very_hard'
  pieces: integer("pieces").notNull(),
  imageUrl: text("image_url"),
  imageFileId: text("image_file_id"),
  basePrice: real("base_price").notNull(),
  featured: integer("featured").default(0),
  createdAt: text("created_at").default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").default(sql`(datetime('now'))`),
});

// Users table (alias for authUsers)
export const users = authUsers;

// Insert schemas for validation
export const insertAuthUserSchema = createInsertSchema(authUsers);
export const insertSessionSchema = createInsertSchema(sessions);
export const insertPuzzleTemplateSchema = createInsertSchema(puzzleTemplates);
export const insertPuzzleOrderSchema = createInsertSchema(puzzleOrders);
export const insertCartItemSchema = createInsertSchema(cartItems);
export const insertFileStorageSchema = createInsertSchema(fileStorage);
export const insertFileVersionSchema = createInsertSchema(fileVersions);
export const insertOrderItemSchema = createInsertSchema(orderItems);
export const insertLoyaltyTransactionSchema = createInsertSchema(loyaltyTransactions);
export const insertBlogPostSchema = createInsertSchema(blogPosts);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertPuzzleProgressSchema = createInsertSchema(puzzleProgress);
export const insertSocialGallerySchema = createInsertSchema(socialGallery);
export const insertPredefinedPuzzleSchema = createInsertSchema(predefinedPuzzles);

// Type exports
export type AuthUser = typeof authUsers.$inferSelect;
export type NewAuthUser = typeof authUsers.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type PuzzleTemplate = typeof puzzleTemplates.$inferSelect;
export type NewPuzzleTemplate = typeof puzzleTemplates.$inferInsert;
export type PuzzleOrder = typeof puzzleOrders.$inferSelect;
export type NewPuzzleOrder = typeof puzzleOrders.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;
export type FileStorage = typeof fileStorage.$inferSelect;
export type NewFileStorage = typeof fileStorage.$inferInsert;
export type FileVersion = typeof fileVersions.$inferSelect;
export type NewFileVersion = typeof fileVersions.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type NewLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;
export type BlogPost = typeof blogPosts.$inferSelect;
export type NewBlogPost = typeof blogPosts.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type PuzzleProgress = typeof puzzleProgress.$inferSelect;
export type NewPuzzleProgress = typeof puzzleProgress.$inferInsert;
export type SocialGalleryPost = typeof socialGallery.$inferSelect;
export type NewSocialGalleryPost = typeof socialGallery.$inferInsert;
export type PredefinedPuzzle = typeof predefinedPuzzles.$inferSelect;
export type NewPredefinedPuzzle = typeof predefinedPuzzles.$inferInsert;

// Additional type aliases for compatibility
export type User = AuthUser;
export type NewUser = NewAuthUser;
export type Order = PuzzleOrder;
export type NewOrder = NewPuzzleOrder;
export type InsertUser = NewAuthUser;
export type InsertOrder = NewPuzzleOrder;
export type InsertCartItem = NewCartItem;
export type InsertLoyaltyTransaction = NewLoyaltyTransaction;
export type InsertBlogPost = NewBlogPost;
export type InsertSubscription = NewSubscription;
export type InsertPuzzleProgress = NewPuzzleProgress;
export type InsertPuzzleTemplate = NewPuzzleTemplate;
export type InsertPuzzleOrder = NewPuzzleOrder;
export type InsertOrderItem = NewOrderItem;
export type InsertSocialGalleryPost = NewSocialGalleryPost;
export type InsertPredefinedPuzzle = NewPredefinedPuzzle;

// PuzzleConfiguration type for cart context
export interface PuzzleConfiguration {
  material: string;
  size: string;
  quantity: number;
  designData?: any;
}
