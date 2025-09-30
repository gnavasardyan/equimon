import { db } from './db';
import { users } from '@shared/schema';

async function checkUsers() {
  console.log('Checking users in SQLite database...\n');
  
  const allUsers = await db.select().from(users);
  
  console.log(`Found ${allUsers.length} users:`);
  allUsers.forEach(user => {
    console.log(`  - ${user.email} (${user.role}) - Active: ${user.isActive}, Password hash length: ${user.passwordHash?.length || 0}`);
  });
}

checkUsers().catch(console.error);
