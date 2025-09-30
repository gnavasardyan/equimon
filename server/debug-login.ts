import bcrypt from 'bcryptjs';
import { storage } from './storage';

async function debugLogin() {
  console.log('Debug login process for admin@test.ru...\n');
  
  const email = 'admin@test.ru';
  const password = 'admin123';
  
  // Step 1: Find user
  const user = await storage.getUserByEmail(email);
  console.log('Step 1 - User found:', user ? 'YES' : 'NO');
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('  Email:', user.email);
  console.log('  Role:', user.role);
  console.log('  isActive (value):', user.isActive);
  console.log('  isActive (type):', typeof user.isActive);
  console.log('  isActive (truthiness):', !!user.isActive);
  console.log('  Password hash:', user.passwordHash?.substring(0, 20) + '...');
  
  // Step 2: Check active status
  console.log('\nStep 2 - Check if active...');
  if (!user.isActive) {
    console.log('❌ User is not active');
    return;
  } else {
    console.log('✓ User is active');
  }
  
  // Step 3: Verify password
  console.log('\nStep 3 - Verify password...');
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  console.log('Password valid:', isPasswordValid ? '✓ YES' : '❌ NO');
  
  if (!isPasswordValid) {
    console.log('❌ Invalid password');
    return;
  }
  
  console.log('\n✓✓✓ Login successful!');
}

debugLogin().catch(console.error);
