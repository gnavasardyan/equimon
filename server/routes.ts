import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertStationSchema, insertDeviceSchema, insertSensorDataSchema, insertAlertRuleSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Registration routes
  app.get('/api/v1/companies', isAuthenticated, async (req: any, res) => {
    try {
      const companies = await storage.getAllCompanies();
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ message: "Failed to fetch companies" });
    }
  });

  app.post('/api/v1/auth/complete-registration', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { companyId, role, newCompanyName } = req.body;

      if (!role || !['admin', 'operator', 'monitor'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }

      let finalCompanyId = companyId;

      // Create new company if needed
      if (newCompanyName && !companyId) {
        const newCompany = await storage.createCompany({
          name: newCompanyName,
          licenseType: 'basic',
          maxStations: 10,
          isActive: true
        });
        finalCompanyId = newCompany.id;
      }

      if (!finalCompanyId) {
        return res.status(400).json({ message: "Company ID or new company name required" });
      }

      // Update user with company and role
      const updatedUser = await storage.updateUser(userId, {
        companyId: finalCompanyId,
        role,
        updatedAt: new Date()
      });

      res.json(updatedUser);
    } catch (error) {
      console.error("Error completing registration:", error);
      res.status(500).json({ message: "Failed to complete registration" });
    }
  });

  // Dashboard routes
  app.get('/api/v1/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      const stats = await storage.getDashboardStats(user.companyId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  });

  // Station routes
  app.get('/api/v1/stations', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      const stations = await storage.getStations(user.companyId);
      res.json(stations);
    } catch (error) {
      console.error("Error fetching stations:", error);
      res.status(500).json({ message: "Failed to fetch stations" });
    }
  });

  app.post('/api/v1/stations/activate', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { uuid } = req.body;
      if (!uuid) {
        return res.status(400).json({ message: "UUID is required" });
      }

      // Check if station exists and is not already activated
      const existingStation = await storage.getStationByUuid(uuid);
      if (!existingStation) {
        return res.status(404).json({ message: "Station not found" });
      }

      if (existingStation.companyId) {
        return res.status(400).json({ message: "Station already activated" });
      }

      const station = await storage.activateStation(uuid, user.companyId);
      res.json(station);
    } catch (error) {
      console.error("Error activating station:", error);
      res.status(500).json({ message: "Failed to activate station" });
    }
  });

  app.get('/api/v1/stations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      const station = await storage.getStation(req.params.id);
      if (!station || station.companyId !== user.companyId) {
        return res.status(404).json({ message: "Station not found" });
      }

      res.json(station);
    } catch (error) {
      console.error("Error fetching station:", error);
      res.status(500).json({ message: "Failed to fetch station" });
    }
  });

  app.get('/api/v1/stations/:id/devices', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      const station = await storage.getStation(req.params.id);
      if (!station || station.companyId !== user.companyId) {
        return res.status(404).json({ message: "Station not found" });
      }

      const devices = await storage.getDevices(req.params.id);
      res.json(devices);
    } catch (error) {
      console.error("Error fetching devices:", error);
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.get('/api/v1/stations/:id/data', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      const station = await storage.getStation(req.params.id);
      if (!station || station.companyId !== user.companyId) {
        return res.status(404).json({ message: "Station not found" });
      }

      const devices = await storage.getDevices(req.params.id);
      const data = [];

      for (const device of devices) {
        const sensorData = await storage.getSensorData(device.id);
        data.push({
          device,
          sensorData: sensorData.slice(0, 10) // Last 10 readings
        });
      }

      res.json(data);
    } catch (error) {
      console.error("Error fetching station data:", error);
      res.status(500).json({ message: "Failed to fetch station data" });
    }
  });

  // Station update route
  app.put('/api/v1/stations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      if (user.role === 'monitor') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { id } = req.params;
      const station = await storage.getStation(id);
      
      if (!station || station.companyId !== user.companyId) {
        return res.status(404).json({ message: "Station not found" });
      }

      const updateData = insertStationSchema.partial().parse(req.body);
      const updatedStation = await storage.updateStation(id, updateData);
      res.json(updatedStation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating station:", error);
      res.status(500).json({ message: "Failed to update station" });
    }
  });

  // Station delete route (admin only)
  app.delete('/api/v1/stations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({ message: "Only administrators can delete stations" });
      }

      const { id } = req.params;
      const station = await storage.getStation(id);
      
      if (!station || station.companyId !== user.companyId) {
        return res.status(404).json({ message: "Station not found" });
      }

      // Note: In a real implementation, you might want to check if there are devices/data
      // associated with this station and handle them appropriately
      await storage.deleteStation(id);
      res.json({ message: "Station deleted successfully" });
    } catch (error) {
      console.error("Error deleting station:", error);
      res.status(500).json({ message: "Failed to delete station" });
    }
  });

  // Device routes
  app.post('/api/v1/devices', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      if (user.role === 'monitor') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const deviceData = insertDeviceSchema.parse(req.body);
      
      // Verify station belongs to user's company
      const station = await storage.getStation(deviceData.stationId);
      if (!station || station.companyId !== user.companyId) {
        return res.status(404).json({ message: "Station not found" });
      }

      const device = await storage.createDevice(deviceData);
      res.json(device);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating device:", error);
      res.status(500).json({ message: "Failed to create device" });
    }
  });

  // Sensor data routes
  app.post('/api/v1/sensor-data', isAuthenticated, async (req: any, res) => {
    try {
      const sensorDataArray = Array.isArray(req.body) ? req.body : [req.body];
      const results = [];

      for (const data of sensorDataArray) {
        const sensorDataInput = insertSensorDataSchema.parse(data);
        const result = await storage.insertSensorData(sensorDataInput);
        results.push(result);
      }

      res.json(results);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error inserting sensor data:", error);
      res.status(500).json({ message: "Failed to insert sensor data" });
    }
  });

  // Alert routes
  app.get('/api/v1/alerts', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const alerts = await storage.getAlerts(user.companyId, limit);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  app.post('/api/v1/alerts/:id/resolve', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role === 'monitor') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const alert = await storage.resolveAlert(req.params.id, user.id);
      res.json(alert);
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Alert rules routes
  app.get('/api/v1/alert-rules', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      const rules = await storage.getAlertRules(user.companyId);
      res.json(rules);
    } catch (error) {
      console.error("Error fetching alert rules:", error);
      res.status(500).json({ message: "Failed to fetch alert rules" });
    }
  });

  app.post('/api/v1/alert-rules', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      if (user.role === 'monitor') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const ruleData = insertAlertRuleSchema.parse({
        ...req.body,
        companyId: user.companyId
      });

      const rule = await storage.createAlertRule(ruleData);
      res.json(rule);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating alert rule:", error);
      res.status(500).json({ message: "Failed to create alert rule" });
    }
  });

  // User management routes (admin only)
  app.get('/api/v1/users', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      if (!user.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      const users = await storage.getUsersByCompany(user.companyId);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/v1/users/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { id } = req.params;
      const targetUser = await storage.getUser(id);
      
      if (!targetUser || targetUser.companyId !== user.companyId) {
        return res.status(404).json({ message: "User not found" });
      }

      const updateData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(id, updateData);
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.patch('/api/v1/users/:id/deactivate', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { id } = req.params;
      const targetUser = await storage.getUser(id);
      
      if (!targetUser || targetUser.companyId !== user.companyId) {
        return res.status(404).json({ message: "User not found" });
      }

      if (targetUser.id === user.id) {
        return res.status(400).json({ message: "Cannot deactivate yourself" });
      }

      const deactivatedUser = await storage.deactivateUser(id);
      res.json(deactivatedUser);
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: "Failed to deactivate user" });
    }
  });

  // Data search route
  app.get('/api/v1/data/search', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.companyId) {
        return res.status(400).json({ message: "User not associated with a company" });
      }

      const { deviceId, parameter, from, to } = req.query;
      
      if (!deviceId) {
        return res.status(400).json({ message: "Device ID is required" });
      }

      // Verify device belongs to user's company
      const device = await storage.getDevice(deviceId as string);
      if (!device) {
        return res.status(404).json({ message: "Device not found" });
      }

      const station = await storage.getStation(device.stationId);
      if (!station || station.companyId !== user.companyId) {
        return res.status(404).json({ message: "Device not found" });
      }

      const fromDate = from ? new Date(from as string) : undefined;
      const toDate = to ? new Date(to as string) : undefined;

      const data = await storage.getSensorData(deviceId as string, fromDate, toDate);
      
      // Filter by parameter if specified
      const filteredData = parameter 
        ? data.filter(d => d.parameter === parameter)
        : data;

      res.json(filteredData);
    } catch (error) {
      console.error("Error searching data:", error);
      res.status(500).json({ message: "Failed to search data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
