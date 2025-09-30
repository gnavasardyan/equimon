import Database from 'better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '@shared/schema';

const dbPath = process.env.DATABASE_PATH || './sqlite.db';
console.log(`Initializing SQLite database at: ${dbPath}`);

const sqlite = new Database(dbPath);
sqlite.pragma('journal_mode = WAL');

const db = drizzle(sqlite, { schema });

// Create tables
const createTables = () => {
  console.log('Creating tables...');
  
  // Sessions
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions(expire);
  `);

  // Users
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      first_name TEXT,
      last_name TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'monitor',
      company_id TEXT REFERENCES companies(id),
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `);

  // Companies
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      license_type TEXT DEFAULT 'basic',
      max_stations INTEGER DEFAULT 10,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `);

  // Stations
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS stations (
      id TEXT PRIMARY KEY,
      uuid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      location TEXT,
      company_id TEXT REFERENCES companies(id),
      status TEXT NOT NULL DEFAULT 'pending',
      last_seen INTEGER,
      metadata TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
  `);

  // Devices
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      station_id TEXT NOT NULL REFERENCES stations(id),
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      model TEXT,
      serial_number TEXT,
      status TEXT DEFAULT 'active',
      metadata TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );
  `);

  // Sensor Data
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sensor_data (
      id TEXT PRIMARY KEY,
      device_id TEXT NOT NULL REFERENCES devices(id),
      parameter TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      timestamp INTEGER,
      metadata TEXT
    );
  `);

  // Alerts
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      station_id TEXT REFERENCES stations(id),
      device_id TEXT REFERENCES devices(id),
      title TEXT NOT NULL,
      description TEXT,
      level TEXT NOT NULL DEFAULT 'info',
      is_resolved INTEGER DEFAULT 0,
      resolved_at INTEGER,
      resolved_by TEXT REFERENCES users(id),
      created_at INTEGER
    );
  `);

  // Alert Rules
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS alert_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      company_id TEXT NOT NULL REFERENCES companies(id),
      parameter TEXT NOT NULL,
      condition TEXT NOT NULL,
      threshold REAL NOT NULL,
      level TEXT NOT NULL DEFAULT 'warning',
      is_active INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER
    );
  `);

  console.log('Tables created successfully!');
};

createTables();
sqlite.close();
console.log('SQLite database initialized successfully!');
