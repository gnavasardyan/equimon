import { sql, relations } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  integer,
  decimal,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for custom authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'operator', 'monitor']);
export const stationStatusEnum = pgEnum('station_status', ['active', 'inactive', 'error', 'pending']);
export const alertLevelEnum = pgEnum('alert_level', ['info', 'warning', 'critical']);

// Users table for custom authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  passwordHash: varchar("password_hash").notNull(),
  role: userRoleEnum("role").default('monitor'),
  companyId: varchar("company_id").references(() => companies.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Companies table
export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  licenseType: varchar("license_type").default('basic'),
  maxStations: integer("max_stations").default(10),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Base stations table
export const stations = pgTable("stations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  uuid: varchar("uuid").unique().notNull(),
  name: varchar("name").notNull(),
  location: varchar("location"),
  companyId: varchar("company_id").references(() => companies.id),
  status: stationStatusEnum("status").default('pending'),
  lastSeen: timestamp("last_seen"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Devices table
export const devices = pgTable("devices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stationId: varchar("station_id").references(() => stations.id).notNull(),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(),
  model: varchar("model"),
  serialNumber: varchar("serial_number"),
  status: varchar("status").default('active'),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sensor data table
export const sensorData = pgTable("sensor_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: varchar("device_id").references(() => devices.id).notNull(),
  parameter: varchar("parameter").notNull(),
  value: decimal("value").notNull(),
  unit: varchar("unit"),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"),
});

// Alerts table
export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  stationId: varchar("station_id").references(() => stations.id),
  deviceId: varchar("device_id").references(() => devices.id),
  title: varchar("title").notNull(),
  description: text("description"),
  level: alertLevelEnum("level").default('info'),
  isResolved: boolean("is_resolved").default(false),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alert rules table
export const alertRules = pgTable("alert_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  parameter: varchar("parameter").notNull(),
  condition: varchar("condition").notNull(), // >, <, =, etc.
  threshold: decimal("threshold").notNull(),
  level: alertLevelEnum("level").default('warning'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

// Authentication schemas
export const userRegistrationSchema = z.object({
  email: z.string().email("Введите корректный email"),
  firstName: z.string().min(1, "Введите имя"),
  lastName: z.string().min(1, "Введите фамилию"),
  password: z.string().min(6, "Пароль должен быть не менее 6 символов"),
  companyId: z.string().optional(),
  newCompanyName: z.string().optional(),
  role: z.enum(['admin', 'operator', 'monitor']).default('monitor'),
});

export const userLoginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(1, "Введите пароль"),
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

export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
