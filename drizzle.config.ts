import { defineConfig } from "drizzle-kit";

// Check if DATABASE_URL is provided for PostgreSQL, otherwise use SQLite
const isPostgreSQL = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '';

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: isPostgreSQL ? "postgresql" : "sqlite",
  dbCredentials: isPostgreSQL ? {
    url: process.env.DATABASE_URL!,
  } : {
    url: "./local.db",
  },
});
