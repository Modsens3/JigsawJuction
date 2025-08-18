import { drizzle } from "drizzle-orm/neon-http";
import { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import BetterSqlite3 from "better-sqlite3";
import * as schema from "../shared/schema";
import { config } from "./config";
import { logger } from "./logger";

let db: any;
let actualDatabaseType: 'sqlite' | 'postgresql' = 'sqlite';
let databaseConnected = false;
let connectionPool: any = null;

// PostgreSQL connection pool configuration
const createPostgreSQLPool = async () => {
  try {
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: config.database.url,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      ssl: config.server.nodeEnv === 'production' ? { rejectUnauthorized: false } : false
    });

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('PostgreSQL connection pool created successfully');
    return pool;
  } catch (error) {
    logger.error('Failed to create PostgreSQL connection pool', error);
    throw error;
  }
};

// Database health check
export const checkDatabaseHealth = async () => {
  try {
    if (actualDatabaseType === 'postgresql' && connectionPool) {
      const client = await connectionPool.connect();
      await client.query('SELECT 1 as health_check');
      client.release();
      return { status: 'healthy', type: 'postgresql' };
    } else if (actualDatabaseType === 'sqlite') {
      await db.run('SELECT 1 as health_check');
      return { status: 'healthy', type: 'sqlite' };
    }
    return { status: 'unhealthy', type: 'unknown' };
  } catch (error) {
    logger.error('Database health check failed', error);
    return { status: 'unhealthy', type: actualDatabaseType, error: (error as Error).message };
  }
};

// Initialize database with proper error handling
const initializeDatabase = async () => {
  try {
    if (config.database.type === 'postgresql' && config.database.url) {
      // PostgreSQL setup (for production)
      try {
        // Create connection pool
        connectionPool = await createPostgreSQLPool();
        
        // Create drizzle instance with pool
        const { neon } = await import("@neondatabase/serverless");
        const sql = neon(config.database.url);
        db = drizzle(sql, { schema });
        
        actualDatabaseType = 'postgresql';
        databaseConnected = true;
        console.log('✅ Connected to PostgreSQL database with connection pooling');
        
        // Run migrations
        await runMigrations();
        
      } catch (error) {
        console.error('❌ PostgreSQL connection failed, falling back to SQLite:', error);
        // Fallback to SQLite if PostgreSQL fails
        config.database.type = 'sqlite';
        config.database.url = undefined;
        actualDatabaseType = 'sqlite';
        const sqlite = new BetterSqlite3('local.db');
        db = drizzleSQLite(sqlite, { schema });
        databaseConnected = true;
        console.log('✅ Fallback to SQLite database');
        
        // Create SQLite tables
        await createSQLiteTables(sqlite);
      }
    } else {
      // SQLite setup (for local development)
      console.log('✅ Using SQLite for local development');
      config.database.type = 'sqlite';
      config.database.url = undefined;
      actualDatabaseType = 'sqlite';
      const sqlite = new BetterSqlite3('local.db');
      db = drizzleSQLite(sqlite, { schema });
      databaseConnected = true;
      
      // Create SQLite tables
      await createSQLiteTables(sqlite);
    }
  } catch (error) {
    logger.error('Database initialization failed', error);
    throw error;
  }
};

// Run database migrations
const runMigrations = async () => {
  try {
    if (actualDatabaseType === 'postgresql') {
      // PostgreSQL migrations
      const migrations: Promise<any>[] = [
        // Add your PostgreSQL migrations here
        // Example: await db.execute(sql`CREATE TABLE IF NOT EXISTS ...`);
      ];
      
      for (const migration of migrations) {
        await migration;
      }
      
      logger.info('PostgreSQL migrations completed successfully');
    }
  } catch (error) {
    logger.error('Migration failed', error);
    throw error;
  }
};

// Create SQLite tables
const createSQLiteTables = async (sqlite: BetterSqlite3.Database) => {
  try {
    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        is_verified INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `);

    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES auth_users(id)
      )
    `);

    // Puzzle templates table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS puzzle_templates (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        name TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        image_file_id TEXT,
        base_price REAL NOT NULL,
        featured INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);

    // Puzzle orders table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS puzzle_orders (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT NOT NULL,
        image TEXT NOT NULL,
        image_file_id TEXT,
        image_download_url TEXT,
        design_data TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        material TEXT NOT NULL,
        size TEXT NOT NULL,
        total_price REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES auth_users(id)
      )
    `);

    // Cart items table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        user_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES auth_users(id)
      )
    `);

    // File storage table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS file_storage (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        filename TEXT NOT NULL,
        file_id TEXT,
        download_url TEXT,
        web_view_link TEXT,
        storage_type TEXT NOT NULL DEFAULT 'local',
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        uploaded_by TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (uploaded_by) REFERENCES auth_users(id)
      )
    `);

    // File versions table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS file_versions (
        id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
        file_id TEXT NOT NULL,
        version INTEGER NOT NULL,
        filename TEXT NOT NULL,
        original_filename TEXT NOT NULL,
        file_id_drive TEXT,
        download_url TEXT,
        web_view_link TEXT,
        storage_type TEXT NOT NULL DEFAULT 'local',
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        checksum TEXT NOT NULL,
        metadata TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        created_by TEXT,
        comment TEXT,
        is_current INTEGER DEFAULT 0,
        FOREIGN KEY (file_id) REFERENCES file_storage(id),
        FOREIGN KEY (created_by) REFERENCES auth_users(id)
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    logger.error('Failed to create SQLite tables', error);
    throw error;
  }
};

// Initialize database
initializeDatabase();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down database connections...');
  
  if (connectionPool) {
    await connectionPool.end();
    logger.info('PostgreSQL connection pool closed');
  }
  
  process.exit(0);
});

export { db };

// Export database connection status for health checks
export const getDatabaseStatus = () => ({
  type: actualDatabaseType,
  connected: databaseConnected,
  configType: config.database.type,
  hasUrl: !!config.database.url,
  poolSize: connectionPool ? connectionPool.totalCount : 0
});