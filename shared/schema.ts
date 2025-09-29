import { sql, relations } from 'drizzle-orm';
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON stored as text
    expire: integer("expire", { mode: 'timestamp' }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles (no enums in SQLite, using text with check constraints)
// Valid values: 'admin', 'operator', 'monitor'
// Valid station statuses: 'active', 'inactive', 'error', 'pending'
// Valid alert levels: 'info', 'warning', 'critical'

// Users table (mandatory for Replit Auth)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: text("role").default('monitor').notNull(),
  companyId: text("company_id").references(() => companies.id),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Companies table
export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  licenseType: text("license_type").default('basic'),
  maxStations: integer("max_stations").default(10),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Base stations table
export const stations = sqliteTable("stations", {
  id: text("id").primaryKey(),
  uuid: text("uuid").unique().notNull(),
  name: text("name").notNull(),
  location: text("location"),
  companyId: text("company_id").references(() => companies.id),
  status: text("status").default('pending').notNull(),
  lastSeen: integer("last_seen", { mode: 'timestamp' }),
  metadata: text("metadata"), // JSON stored as text
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Devices table
export const devices = sqliteTable("devices", {
  id: text("id").primaryKey(),
  stationId: text("station_id").references(() => stations.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  model: text("model"),
  serialNumber: text("serial_number"),
  status: text("status").default('active'),
  metadata: text("metadata"), // JSON stored as text
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Sensor data table
export const sensorData = sqliteTable("sensor_data", {
  id: text("id").primaryKey(),
  deviceId: text("device_id").references(() => devices.id).notNull(),
  parameter: text("parameter").notNull(),
  value: real("value").notNull(),
  unit: text("unit"),
  timestamp: integer("timestamp", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  metadata: text("metadata"), // JSON stored as text
});

// Alerts table
export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey(),
  stationId: text("station_id").references(() => stations.id),
  deviceId: text("device_id").references(() => devices.id),
  title: text("title").notNull(),
  description: text("description"),
  level: text("level").default('info').notNull(),
  isResolved: integer("is_resolved", { mode: 'boolean' }).default(false),
  resolvedAt: integer("resolved_at", { mode: 'timestamp' }),
  resolvedBy: text("resolved_by").references(() => users.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Alert rules table
export const alertRules = sqliteTable("alert_rules", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  parameter: text("parameter").notNull(),
  condition: text("condition").notNull(), // >, <, =, etc.
  threshold: real("threshold").notNull(),
  level: text("level").default('warning').notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  company: one(companies, {
    fields: [users.companyId],
    references: [companies.id],
  }),
  resolvedAlerts: many(alerts),
}));

export const companiesRelations = relations(companies, ({ many }) => ({
  users: many(users),
  stations: many(stations),
  alertRules: many(alertRules),
}));

export const stationsRelations = relations(stations, ({ one, many }) => ({
  company: one(companies, {
    fields: [stations.companyId],
    references: [companies.id],
  }),
  devices: many(devices),
  alerts: many(alerts),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  station: one(stations, {
    fields: [devices.stationId],
    references: [stations.id],
  }),
  sensorData: many(sensorData),
  alerts: many(alerts),
}));

export const sensorDataRelations = relations(sensorData, ({ one }) => ({
  device: one(devices, {
    fields: [sensorData.deviceId],
    references: [devices.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  station: one(stations, {
    fields: [alerts.stationId],
    references: [stations.id],
  }),
  device: one(devices, {
    fields: [alerts.deviceId],
    references: [devices.id],
  }),
  resolvedByUser: one(users, {
    fields: [alerts.resolvedBy],
    references: [users.id],
  }),
}));

export const alertRulesRelations = relations(alertRules, ({ one }) => ({
  company: one(companies, {
    fields: [alertRules.companyId],
    references: [companies.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStationSchema = createInsertSchema(stations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSensorDataSchema = createInsertSchema(sensorData).omit({
  id: true,
  timestamp: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertAlertRuleSchema = createInsertSchema(alertRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Station = typeof stations.$inferSelect;
export type Device = typeof devices.$inferSelect;
export type SensorData = typeof sensorData.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type AlertRule = typeof alertRules.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertStation = z.infer<typeof insertStationSchema>;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;
export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type InsertAlertRule = z.infer<typeof insertAlertRuleSchema>;
