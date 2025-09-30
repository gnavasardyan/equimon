import { storage } from './storage';

async function smokeTest() {
  console.log('=== SQLite Migration Smoke Test ===\n');

  try {
    // Test 1: User login
    console.log('Test 1: Get user by email');
    const user = await storage.getUserByEmail('admin@test.ru');
    console.log(`✓ Found user: ${user?.email} (${user?.role})`);

    if (!user) {
      throw new Error('User not found!');
    }

    // Test 2: Get company
    console.log('\nTest 2: Get company');
    const company = await storage.getCompany(user.companyId!);
    console.log(`✓ Found company: ${company?.name}`);

    // Test 3: Get stations
    console.log('\nTest 3: Get stations');
    const stations = await storage.getStations(user.companyId!);
    console.log(`✓ Found ${stations.length} stations`);
    stations.forEach(s => console.log(`  - ${s.name} (${s.status})`));

    // Test 4: Get devices
    console.log('\nTest 4: Get all company devices');
    const devices = await storage.getAllCompanyDevices(user.companyId!);
    console.log(`✓ Found ${devices.length} devices`);
    devices.forEach(d => console.log(`  - ${d.name} (${d.type})`));

    // Test 5: Get alerts
    console.log('\nTest 5: Get alerts');
    const alerts = await storage.getAlerts(user.companyId!);
    console.log(`✓ Found ${alerts.length} alerts`);

    // Test 6: Get dashboard stats
    console.log('\nTest 6: Get dashboard stats');
    const stats = await storage.getDashboardStats(user.companyId!);
    console.log(`✓ Dashboard stats:`);
    console.log(`  - Active stations: ${stats.activeStations}`);
    console.log(`  - Connected devices: ${stats.connectedDevices}`);
    console.log(`  - Active alerts: ${stats.activeAlerts}`);

    // Test 7: Create new user
    console.log('\nTest 7: Create new user');
    const newUser = await storage.createUser({
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: 'testhash',
      role: 'monitor',
      companyId: user.companyId!,
      isActive: true,
    });
    console.log(`✓ Created user: ${newUser.email} (ID: ${newUser.id})`);

    // Test 8: Update user
    console.log('\nTest 8: Update user');
    const updatedUser = await storage.updateUser(newUser.id, { firstName: 'Updated' });
    console.log(`✓ Updated user: ${updatedUser.firstName} ${updatedUser.lastName}`);

    console.log('\n=== All tests passed! ✓ ===');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

smokeTest();
