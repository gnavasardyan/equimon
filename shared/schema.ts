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

// Session storage table for custom authentication
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON as text
    expire: integer("expire", { mode: 'timestamp' }).notNull(),
  },
  (table) => ({
    expireIdx: index("IDX_session_expire").on(table.expire),
  }),
);

// Users table for custom authentication
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default('monitor').notNull(), // 'admin', 'operator', 'monitor'
  companyId: text("company_id").references(() => companies.id),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Companies table
export const companies = sqliteTable("companies", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  licenseType: text("license_type").default('basic'),
  maxStations: integer("max_stations").default(10),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Base stations table
export const stations = sqliteTable("stations", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  uuid: text("uuid").unique().notNull(),
  name: text("name").notNull(),
  location: text("location"),
  companyId: text("company_id").references(() => companies.id),
  status: text("status").default('pending').notNull(), // 'active', 'inactive', 'error', 'pending'
  lastSeen: integer("last_seen", { mode: 'timestamp' }),
  metadata: text("metadata"), // JSON as text
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Devices table
export const devices = sqliteTable("devices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  stationId: text("station_id").references(() => stations.id).notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  model: text("model"),
  serialNumber: text("serial_number"),
  status: text("status").default('active'),
  metadata: text("metadata"), // JSON as text
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Sensor data table
export const sensorData = sqliteTable("sensor_data", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  deviceId: text("device_id").references(() => devices.id).notNull(),
  parameter: text("parameter").notNull(),
  value: real("value").notNull(),
  unit: text("unit"),
  timestamp: integer("timestamp", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  metadata: text("metadata"), // JSON as text
});

// Alerts table
export const alerts = sqliteTable("alerts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  stationId: text("station_id").references(() => stations.id),
  deviceId: text("device_id").references(() => devices.id),
  title: text("title").notNull(),
  description: text("description"),
  level: text("level").default('info').notNull(), // 'info', 'warning', 'critical'
  isResolved: integer("is_resolved", { mode: 'boolean' }).default(false),
  resolvedAt: integer("resolved_at", { mode: 'timestamp' }),
  resolvedBy: text("resolved_by").references(() => users.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// Alert rules table
export const alertRules = sqliteTable("alert_rules", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  companyId: text("company_id").references(() => companies.id).notNull(),
  parameter: text("parameter").notNull(),
  condition: text("condition").notNull(), // >, <, =, etc.
  threshold: real("threshold").notNull(),
  level: text("level").default('warning').notNull(), // 'info', 'warning', 'critical'
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()),
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
}).superRefine((data, ctx) => {
  // If creating a new company, require newCompanyName
  if (!data.companyId && !data.newCompanyName) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Выберите существующую компанию или введите название новой",
      path: ['companyId'],
    });
  }
  // If newCompanyName is provided, companyId should be empty
  if (data.newCompanyName && data.companyId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Нельзя одновременно выбирать компанию и создавать новую",
      path: ['companyId'],
    });
  }
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
