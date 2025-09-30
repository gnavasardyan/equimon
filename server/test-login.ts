import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

async function testLogin() {
  console.log('Testing login for admin@test.ru...\n');
  
  const [user] = await db.select().from(users).where(eq(users.email, 'admin@test.ru'));
  
  if (!user) {
    console.log('❌ User not found!');
    return;
  }
  
  console.log('✓ User found:');
  console.log(`  Email: ${user.email}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Active: ${user.isActive}`);
  console.log(`  Password hash: ${user.passwordHash.substring(0, 20)}...`);
  
  const testPassword = 'admin123';
  console.log(`\nTesting password: "${testPassword}"`);
  
  const isValid = await bcrypt.compare(testPassword, user.passwordHash);
  console.log(`Password valid: ${isValid ? '✓ YES' : '❌ NO'}`);
  
  // Try with hash from scratch
  const newHash = await bcrypt.hash(testPassword, 10);
  const isNewValid = await bcrypt.compare(testPassword, newHash);
  console.log(`\nNew hash test: ${isNewValid ? '✓ YES' : '❌ NO'}`);
}

testLogin().catch(console.error);
