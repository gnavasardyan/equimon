import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from "@shared/schema";

// Use SQLite database file
const dbPath = process.env.DATABASE_URL?.startsWith('file:') 
  ? process.env.DATABASE_URL.replace('file:', '') 
  : './sqlite.db';
const sqlite = new Database(dbPath);

// Enable foreign keys in SQLite
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });
