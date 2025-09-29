import {
  users,
  companies,
  stations,
  devices,
  sensorData,
  alerts,
  alertRules,
  type User,
  type UpsertUser,
  type Company,
  type Station,
  type Device,
  type SensorData,
  type Alert,
  type AlertRule,
  type InsertCompany,
  type InsertStation,
  type InsertDevice,
  type InsertSensorData,
  type InsertAlert,
  type InsertAlertRule,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, lte, count, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

// UUID generator for SQLite (since it doesn't have gen_random_uuid)
function generateId(): string {
  return nanoid();
}

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByCompany(companyId: string): Promise<User[]>;
  updateUser(id: string, data: Partial<UpsertUser>): Promise<User>;
  deactivateUser(id: string): Promise<User>;
  
  // Company operations
  getCompany(id: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  // Station operations
  getStations(companyId: string): Promise<Station[]>;
  getStation(id: string): Promise<Station | undefined>;
  getStationByUuid(uuid: string): Promise<Station | undefined>;
  createStation(station: InsertStation): Promise<Station>;
  updateStation(id: string, data: Partial<InsertStation>): Promise<Station>;
  deleteStation(id: string): Promise<void>;
  activateStation(uuid: string, companyId: string): Promise<Station>;
  
  // Device operations
  getDevices(stationId: string): Promise<Device[]>;
  getDevice(id: string): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: string, data: Partial<InsertDevice>): Promise<Device>;
  
  // Sensor data operations
  insertSensorData(data: InsertSensorData): Promise<SensorData>;
  getSensorData(deviceId: string, from?: Date, to?: Date): Promise<SensorData[]>;
  getLatestSensorData(deviceId: string): Promise<SensorData | undefined>;
  
  // Alert operations
  getAlerts(companyId: string, limit?: number): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: string, userId: string): Promise<Alert>;
  
  // Alert rules operations
  getAlertRules(companyId: string): Promise<AlertRule[]>;
  createAlertRule(rule: InsertAlertRule): Promise<AlertRule>;
  updateAlertRule(id: string, data: Partial<InsertAlertRule>): Promise<AlertRule>;
  
  // Dashboard statistics
  getDashboardStats(companyId: string): Promise<{
    activeStations: number;
    connectedDevices: number;
    activeAlerts: number;
    systemUptime: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userWithId = { ...userData, id: userData.id || generateId() };
    const [user] = await db
      .insert(users)
      .values(userWithId)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.companyId, companyId))
      .orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, data: Partial<UpsertUser>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async deactivateUser(id: string): Promise<User> {
    const [updated] = await db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  // Company operations
  async getCompany(id: string): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const companyWithId = { ...company, id: generateId() };
    const [created] = await db.insert(companies).values(companyWithId).returning();
    return created;
  }

  // Station operations
  async getStations(companyId: string): Promise<Station[]> {
    return await db
      .select()
      .from(stations)
      .where(eq(stations.companyId, companyId))
      .orderBy(desc(stations.updatedAt));
  }

  async getStation(id: string): Promise<Station | undefined> {
    const [station] = await db.select().from(stations).where(eq(stations.id, id));
    return station;
  }

  async getStationByUuid(uuid: string): Promise<Station | undefined> {
    const [station] = await db.select().from(stations).where(eq(stations.uuid, uuid));
    return station;
  }

  async createStation(station: InsertStation): Promise<Station> {
    const stationWithId = { ...station, id: generateId() };
    const [created] = await db.insert(stations).values(stationWithId).returning();
    return created;
  }

  async updateStation(id: string, data: Partial<InsertStation>): Promise<Station> {
    const [updated] = await db
      .update(stations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stations.id, id))
      .returning();
    return updated;
  }

  async deleteStation(id: string): Promise<void> {
    await db.delete(stations).where(eq(stations.id, id));
  }

  async activateStation(uuid: string, companyId: string): Promise<Station> {
    const [station] = await db
      .update(stations)
      .set({ 
        companyId, 
        status: 'active',
        updatedAt: new Date(),
        lastSeen: new Date()
      })
      .where(eq(stations.uuid, uuid))
      .returning();
    return station;
  }

  // Device operations
  async getDevices(stationId: string): Promise<Device[]> {
    return await db
      .select()
      .from(devices)
      .where(eq(devices.stationId, stationId))
      .orderBy(desc(devices.updatedAt));
  }

  async getDevice(id: string): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }

  async createDevice(device: InsertDevice): Promise<Device> {
    const deviceWithId = { ...device, id: generateId() };
    const [created] = await db.insert(devices).values(deviceWithId).returning();
    return created;
  }

  async updateDevice(id: string, data: Partial<InsertDevice>): Promise<Device> {
    const [updated] = await db
      .update(devices)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(devices.id, id))
      .returning();
    return updated;
  }

  // Sensor data operations
  async insertSensorData(data: InsertSensorData): Promise<SensorData> {
    const dataWithId = { ...data, id: generateId() };
    const [created] = await db.insert(sensorData).values(dataWithId).returning();
    return created;
  }

  async getSensorData(deviceId: string, from?: Date, to?: Date): Promise<SensorData[]> {
    if (from && to) {
      return await db
        .select()
        .from(sensorData)
        .where(
          and(
            eq(sensorData.deviceId, deviceId),
            gte(sensorData.timestamp, from),
            lte(sensorData.timestamp, to)
          )
        )
        .orderBy(desc(sensorData.timestamp));
    }
    
    return await db
      .select()
      .from(sensorData)
      .where(eq(sensorData.deviceId, deviceId))
      .orderBy(desc(sensorData.timestamp));
  }

  async getLatestSensorData(deviceId: string): Promise<SensorData | undefined> {
    const [data] = await db
      .select()
      .from(sensorData)
      .where(eq(sensorData.deviceId, deviceId))
      .orderBy(desc(sensorData.timestamp))
      .limit(1);
    return data;
  }

  // Alert operations
  async getAlerts(companyId: string, limit = 50): Promise<Alert[]> {
    return await db
      .select({
        id: alerts.id,
        stationId: alerts.stationId,
        deviceId: alerts.deviceId,
        title: alerts.title,
        description: alerts.description,
        level: alerts.level,
        isResolved: alerts.isResolved,
        resolvedAt: alerts.resolvedAt,
        resolvedBy: alerts.resolvedBy,
        createdAt: alerts.createdAt,
      })
      .from(alerts)
      .leftJoin(stations, eq(alerts.stationId, stations.id))
      .where(eq(stations.companyId, companyId))
      .orderBy(desc(alerts.createdAt))
      .limit(limit);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const alertWithId = { ...alert, id: generateId() };
    const [created] = await db.insert(alerts).values(alertWithId).returning();
    return created;
  }

  async resolveAlert(id: string, userId: string): Promise<Alert> {
    const [resolved] = await db
      .update(alerts)
      .set({ 
        isResolved: true, 
        resolvedAt: new Date(),
        resolvedBy: userId 
      })
      .where(eq(alerts.id, id))
      .returning();
    return resolved;
  }

  // Alert rules operations
  async getAlertRules(companyId: string): Promise<AlertRule[]> {
    return await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.companyId, companyId))
      .orderBy(desc(alertRules.updatedAt));
  }

  async createAlertRule(rule: InsertAlertRule): Promise<AlertRule> {
    const ruleWithId = { ...rule, id: generateId() };
    const [created] = await db.insert(alertRules).values(ruleWithId).returning();
    return created;
  }

  async updateAlertRule(id: string, data: Partial<InsertAlertRule>): Promise<AlertRule> {
    const [updated] = await db
      .update(alertRules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(alertRules.id, id))
      .returning();
    return updated;
  }

  // Dashboard statistics
  async getDashboardStats(companyId: string): Promise<{
    activeStations: number;
    connectedDevices: number;
    activeAlerts: number;
    systemUptime: number;
  }> {
    const [activeStationsResult] = await db
      .select({ count: count() })
      .from(stations)
      .where(and(eq(stations.companyId, companyId), eq(stations.status, 'active')));

    const [connectedDevicesResult] = await db
      .select({ count: count() })
      .from(devices)
      .leftJoin(stations, eq(devices.stationId, stations.id))
      .where(and(eq(stations.companyId, companyId), eq(devices.status, 'active')));

    const [activeAlertsResult] = await db
      .select({ count: count() })
      .from(alerts)
      .leftJoin(stations, eq(alerts.stationId, stations.id))
      .where(and(eq(stations.companyId, companyId), eq(alerts.isResolved, false)));

    return {
      activeStations: activeStationsResult?.count || 0,
      connectedDevices: connectedDevicesResult?.count || 0,
      activeAlerts: activeAlertsResult?.count || 0,
      systemUptime: 99.9, // This would be calculated from actual uptime data
    };
  }
}

export const storage = new DatabaseStorage();
