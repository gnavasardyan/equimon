import { db } from "./db";
import { companies, stations, devices, sensorData, users } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Create a test company
    const [company] = await db.insert(companies).values({
      name: "ООО Производственная компания",
      licenseType: "pro",
      maxStations: 50,
      isActive: true,
    }).returning();

    console.log("Created company:", company.name);

    // Create test stations
    const stationsData = [
      {
        uuid: "550e8400-e29b-41d4-a716-446655440001",
        name: "БС-001 Цех №1",
        location: "Производственный цех №1",
        companyId: company.id,
        status: "active" as const,
        lastSeen: new Date(),
        metadata: { type: "industrial", floor: 1 }
      },
      {
        uuid: "550e8400-e29b-41d4-a716-446655440002",
        name: "БС-002 Склад",
        location: "Основной склад",
        companyId: company.id,
        status: "active" as const,
        lastSeen: new Date(Date.now() - 300000), // 5 minutes ago
        metadata: { type: "warehouse", floor: 0 }
      },
      {
        uuid: "550e8400-e29b-41d4-a716-446655440003",
        name: "БС-003 Лаборатория",
        location: "Контрольная лаборатория",
        companyId: company.id,
        status: "error" as const,
        lastSeen: new Date(Date.now() - 1800000), // 30 minutes ago
        metadata: { type: "laboratory", floor: 2 }
      },
      {
        uuid: "550e8400-e29b-41d4-a716-446655440004",
        name: "БС-004 Офис",
        location: "Административное здание",
        companyId: company.id,
        status: "inactive" as const,
        lastSeen: new Date(Date.now() - 86400000), // 1 day ago
        metadata: { type: "office", floor: 3 }
      },
      {
        uuid: "550e8400-e29b-41d4-a716-446655440005",
        name: "БС-005 Новая станция",
        location: null,
        companyId: null, // Not activated yet
        status: "pending" as const,
        lastSeen: null,
        metadata: { type: "industrial" }
      }
    ];

    const createdStations = [];
    for (const stationData of stationsData) {
      const [station] = await db.insert(stations).values(stationData).returning();
      createdStations.push(station);
      console.log("Created station:", station.name);
    }

    // Create devices for active stations
    const devicesData = [];
    createdStations.forEach((station, index) => {
      if (station.status === "active" || station.status === "error") {
        devicesData.push(
          {
            stationId: station.id,
            name: `Температурный датчик ${index + 1}`,
            type: "temperature_sensor",
            model: "TempSense Pro 3000",
            serialNumber: `TS${1000 + index}`,
            status: "active",
            metadata: { range: "-40 to +85°C", accuracy: "±0.1°C" }
          },
          {
            stationId: station.id,
            name: `Датчик влажности ${index + 1}`,
            type: "humidity_sensor",
            model: "HumidSense 2000",
            serialNumber: `HS${2000 + index}`,
            status: "active",
            metadata: { range: "0-100% RH", accuracy: "±2%" }
          },
          {
            stationId: station.id,
            name: `Датчик давления ${index + 1}`,
            type: "pressure_sensor",
            model: "PressSense Elite",
            serialNumber: `PS${3000 + index}`,
            status: station.status === "error" ? "error" : "active",
            metadata: { range: "0-10 bar", accuracy: "±0.05%" }
          }
        );
      }
    });

    const createdDevices = [];
    for (const deviceData of devicesData) {
      const [device] = await db.insert(devices).values(deviceData).returning();
      createdDevices.push(device);
    }

    console.log(`Created ${createdDevices.length} devices`);

    // Generate sensor data for the last 24 hours
    const now = new Date();
    const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    for (const device of createdDevices) {
      if (device.status === "active") {
        const dataPoints = [];
        
        // Generate data for every 10 minutes for the last 24 hours
        for (let time = startTime.getTime(); time <= now.getTime(); time += 10 * 60 * 1000) {
          const timestamp = new Date(time);
          
          if (device.type === "temperature_sensor") {
            dataPoints.push({
              deviceId: device.id,
              parameter: "temperature",
              value: (20 + Math.random() * 15 + Math.sin(time / 3600000) * 5).toFixed(1),
              unit: "°C",
              timestamp,
              metadata: { sensor_status: "normal" }
            });
          } else if (device.type === "humidity_sensor") {
            dataPoints.push({
              deviceId: device.id,
              parameter: "humidity",
              value: (45 + Math.random() * 20 + Math.sin(time / 7200000) * 10).toFixed(1),
              unit: "%",
              timestamp,
              metadata: { sensor_status: "normal" }
            });
          } else if (device.type === "pressure_sensor") {
            dataPoints.push({
              deviceId: device.id,
              parameter: "pressure",
              value: (1000 + Math.random() * 50 + Math.sin(time / 5400000) * 20).toFixed(2),
              unit: "mbar",
              timestamp,
              metadata: { sensor_status: "normal" }
            });
          }
        }

        // Insert data in batches
        const batchSize = 100;
        for (let i = 0; i < dataPoints.length; i += batchSize) {
          const batch = dataPoints.slice(i, i + batchSize);
          await db.insert(sensorData).values(batch);
        }
      }
    }

    console.log("Generated sensor data for last 24 hours");
    console.log("Database seeding completed successfully!");
    
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

// Run seeding
seedDatabase().then(() => {
  console.log("Seeding finished");
  process.exit(0);
}).catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
