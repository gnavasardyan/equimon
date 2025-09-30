import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users, companies, stations, devices, sensorData } from '@shared/schema';

async function seed() {
  console.log('Seeding SQLite database...');

  // Create a test company
  const companyId = nanoid();
  await db.insert(companies).values({
    id: companyId,
    name: 'ООО "Тестовое Производство"',
    licenseType: 'enterprise',
    maxStations: 50,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('✓ Created test company');

  // Create admin user
  const adminId = nanoid();
  const adminPassword = await bcrypt.hash('admin123', 10);
  await db.insert(users).values({
    id: adminId,
    email: 'admin@test.ru',
    firstName: 'Иван',
    lastName: 'Админов',
    passwordHash: adminPassword,
    role: 'admin',
    companyId: companyId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('✓ Created admin user (admin@test.ru / admin123)');

  // Create operator user
  const operatorId = nanoid();
  const operatorPassword = await bcrypt.hash('operator123', 10);
  await db.insert(users).values({
    id: operatorId,
    email: 'operator@test.ru',
    firstName: 'Петр',
    lastName: 'Операторов',
    passwordHash: operatorPassword,
    role: 'operator',
    companyId: companyId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('✓ Created operator user (operator@test.ru / operator123)');

  // Create monitor user
  const monitorId = nanoid();
  const monitorPassword = await bcrypt.hash('monitor123', 10);
  await db.insert(users).values({
    id: monitorId,
    email: 'monitor@test.ru',
    firstName: 'Анна',
    lastName: 'Мониторова',
    passwordHash: monitorPassword,
    role: 'monitor',
    companyId: companyId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('✓ Created monitor user (monitor@test.ru / monitor123)');

  // Create test stations
  const station1Id = nanoid();
  const station1Uuid = crypto.randomUUID();
  await db.insert(stations).values({
    id: station1Id,
    uuid: station1Uuid,
    name: 'Станция №1 - Цех А',
    location: 'Главный производственный цех',
    companyId: companyId,
    status: 'active',
    lastSeen: new Date(),
    metadata: JSON.stringify({ floor: 1, zone: 'A' }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(`✓ Created station 1 (UUID: ${station1Uuid})`);

  const station2Id = nanoid();
  const station2Uuid = crypto.randomUUID();
  await db.insert(stations).values({
    id: station2Id,
    uuid: station2Uuid,
    name: 'Станция №2 - Цех B',
    location: 'Сборочный цех',
    companyId: companyId,
    status: 'active',
    lastSeen: new Date(),
    metadata: JSON.stringify({ floor: 2, zone: 'B' }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(`✓ Created station 2 (UUID: ${station2Uuid})`);

  // Create test devices
  const device1Id = nanoid();
  await db.insert(devices).values({
    id: device1Id,
    stationId: station1Id,
    name: 'Термодатчик T-101',
    type: 'temperature',
    model: 'TH-2000',
    serialNumber: 'SN-2024-001',
    status: 'active',
    metadata: JSON.stringify({ range: '-50 to 200°C', accuracy: '±0.1°C' }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const device2Id = nanoid();
  await db.insert(devices).values({
    id: device2Id,
    stationId: station1Id,
    name: 'Датчик давления P-201',
    type: 'pressure',
    model: 'PR-5000',
    serialNumber: 'SN-2024-002',
    status: 'active',
    metadata: JSON.stringify({ range: '0-1000 bar', accuracy: '±0.5%' }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const device3Id = nanoid();
  await db.insert(devices).values({
    id: device3Id,
    stationId: station2Id,
    name: 'Датчик вибрации V-301',
    type: 'vibration',
    model: 'VB-3000',
    serialNumber: 'SN-2024-003',
    status: 'active',
    metadata: JSON.stringify({ range: '0-100 Hz', sensitivity: 'high' }),
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log('✓ Created 3 test devices');

  // Create sample sensor data
  const now = Date.now();
  const sensorDataValues = [];
  
  // Generate temperature data for last 24 hours
  for (let i = 0; i < 24; i++) {
    sensorDataValues.push({
      id: nanoid(),
      deviceId: device1Id,
      parameter: 'temperature',
      value: 20 + Math.random() * 10, // 20-30°C
      unit: '°C',
      timestamp: new Date(now - (23 - i) * 3600000),
      metadata: JSON.stringify({ quality: 'good' }),
    });
  }

  // Generate pressure data
  for (let i = 0; i < 24; i++) {
    sensorDataValues.push({
      id: nanoid(),
      deviceId: device2Id,
      parameter: 'pressure',
      value: 100 + Math.random() * 50, // 100-150 bar
      unit: 'bar',
      timestamp: new Date(now - (23 - i) * 3600000),
      metadata: JSON.stringify({ quality: 'good' }),
    });
  }

  // Generate vibration data
  for (let i = 0; i < 24; i++) {
    sensorDataValues.push({
      id: nanoid(),
      deviceId: device3Id,
      parameter: 'vibration',
      value: 10 + Math.random() * 20, // 10-30 Hz
      unit: 'Hz',
      timestamp: new Date(now - (23 - i) * 3600000),
      metadata: JSON.stringify({ quality: 'good' }),
    });
  }

  await db.insert(sensorData).values(sensorDataValues);
  console.log('✓ Created 72 sensor data records');

  console.log('\nSeed completed successfully!');
  console.log('\nTest users:');
  console.log('  Admin:    admin@test.ru / admin123');
  console.log('  Operator: operator@test.ru / operator123');
  console.log('  Monitor:  monitor@test.ru / monitor123');
  console.log(`\nStation UUIDs:`);
  console.log(`  Station 1: ${station1Uuid}`);
  console.log(`  Station 2: ${station2Uuid}`);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
