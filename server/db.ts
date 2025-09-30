import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

// Use SQLite database file path from environment variable or default to ./sqlite.db
const dbPath = process.env.DATABASE_PATH || './sqlite.db';

const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
