import { db } from "./db";
import { sql } from "drizzle-orm";
import { 
  sessions, 
  users, 
  companies, 
  stations, 
  devices, 
  sensorData, 
  alerts, 
  alertRules 
} from "@shared/schema";

// Initialize SQLite database with tables
export async function initializeDatabase() {
  try {
    console.log("Initializing SQLite database...");
    
    // Create tables using drizzle
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        sid TEXT PRIMARY KEY,
        sess TEXT NOT NULL,
        expire INTEGER NOT NULL
      )
    `);

    await db.run(sql`
      CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire)
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        license_type TEXT DEFAULT 'basic',
        max_stations INTEGER DEFAULT 10,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        first_name TEXT,
        last_name TEXT,
        profile_image_url TEXT,
        role TEXT DEFAULT 'monitor' NOT NULL,
        company_id TEXT REFERENCES companies(id),
        is_active INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS stations (
        id TEXT PRIMARY KEY,
        uuid TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        location TEXT,
        company_id TEXT REFERENCES companies(id),
        status TEXT DEFAULT 'pending' NOT NULL,
        last_seen INTEGER,
        metadata TEXT,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        station_id TEXT REFERENCES stations(id) NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        model TEXT,
        serial_number TEXT,
        status TEXT DEFAULT 'active',
        metadata TEXT,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS sensor_data (
        id TEXT PRIMARY KEY,
        device_id TEXT REFERENCES devices(id) NOT NULL,
        parameter TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT,
        timestamp INTEGER DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        station_id TEXT REFERENCES stations(id),
        device_id TEXT REFERENCES devices(id),
        title TEXT NOT NULL,
        description TEXT,
        level TEXT DEFAULT 'info' NOT NULL,
        is_resolved INTEGER DEFAULT 0,
        resolved_at INTEGER,
        resolved_by TEXT REFERENCES users(id),
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS alert_rules (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        company_id TEXT REFERENCES companies(id) NOT NULL,
        parameter TEXT NOT NULL,
        condition TEXT NOT NULL,
        threshold REAL NOT NULL,
        level TEXT DEFAULT 'warning' NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at INTEGER DEFAULT CURRENT_TIMESTAMP,
        updated_at INTEGER DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("SQLite database initialized successfully!");
    return true;
  } catch (error) {
    console.error("Error initializing database:", error);
    return false;
  }
}