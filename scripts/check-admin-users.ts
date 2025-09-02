import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndCreateAdminUser() {
  try {
    // Check if there are any admin users
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      }
    });

    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach((user: any) => {
      console.log(`- ${user.email} (${user.name || 'No name'}) - Role: ${user.role}`);
    });

    if (adminUsers.length === 0) {
      console.log('\nNo admin users found. Creating a test admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@freenomad.com',
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: new Date()
        }
      });
      
      console.log(`Created admin user: ${adminUser.email}`);
      console.log('Login credentials:');
      console.log('Email: admin@freenomad.com');
      console.log('Password: admin123');
    }

    // Also check all users to see their roles
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    console.log('\nAll users in database:');
    allUsers.forEach((user: any) => {
      console.log(`- ${user.email} (${user.name || 'No name'}) - Role: ${user.role}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateAdminUser();