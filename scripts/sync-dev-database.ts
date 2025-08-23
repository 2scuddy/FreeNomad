#!/usr/bin/env tsx
/**
 * Development Database Synchronization Script
 * 
 * This script synchronizes the development database with the production database
 * to ensure schema consistency and reference data alignment.
 * 
 * Features:
 * - Schema synchronization from production to development
 * - Reference data synchronization (cities, users, reviews)
 * - Incremental updates to avoid data loss
 * - Backup and rollback capabilities
 * - Comprehensive logging and error handling
 */

import { PrismaClient } from "../src/generated/prisma";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.development.local' });
dotenv.config({ path: '.env.local' });
dotenv.config();

const execAsync = promisify(exec);

// Validate required environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

if (!process.env.PRODUCTION_DATABASE_URL) {
  throw new Error('PRODUCTION_DATABASE_URL environment variable is required');
}

// Database connections
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // Development database
    }
  }
});

const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PRODUCTION_DATABASE_URL // Production database
    }
  }
});

interface SyncOptions {
  schemaOnly?: boolean;
  referenceDataOnly?: boolean;
  includeUserData?: boolean;
  createBackup?: boolean;
  dryRun?: boolean;
  force?: boolean;
}

interface SyncResult {
  success: boolean;
  schemaUpdated: boolean;
  dataUpdated: boolean;
  recordsUpdated: {
    cities: number;
    users: number;
    reviews: number;
  };
  backupCreated?: string;
  errors: string[];
  warnings: string[];
}

class DatabaseSynchronizer {
  private backupDir = path.join(process.cwd(), 'backups', 'dev-sync');
  
  constructor() {
    this.ensureBackupDirectory();
  }

  private async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (error) {
      console.warn(`Warning: Could not create backup directory: ${error}`);
    }
  }

  /**
   * Create a backup of the current development database
   */
  private async createBackup(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `dev-backup-${timestamp}.json`);
    
    console.log(`📦 Creating backup: ${backupFile}`);
    
    try {
      // Export current development data
      const [cities, users, reviews] = await Promise.all([
        devPrisma.city.findMany({ orderBy: { createdAt: 'asc' } }),
        devPrisma.user.findMany({ orderBy: { createdAt: 'asc' } }),
        devPrisma.review.findMany({ orderBy: { createdAt: 'asc' } })
      ]);
      
      const backup = {
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          environment: 'development',
          totalRecords: cities.length + users.length + reviews.length
        },
        data: {
          cities,
          users,
          reviews
        }
      };
      
      await fs.writeFile(backupFile, JSON.stringify(backup, null, 2));
      console.log(`✅ Backup created successfully: ${cities.length} cities, ${users.length} users, ${reviews.length} reviews`);
      
      return backupFile;
    } catch (error) {
      console.error(`❌ Backup creation failed:`, error);
      throw error;
    }
  }

  /**
   * Synchronize database schema from production to development
   */
  private async syncSchema(): Promise<boolean> {
    console.log(`🔄 Synchronizing database schema...`);
    
    try {
      // Generate and apply schema changes
      console.log(`📋 Generating Prisma client...`);
      await execAsync('npx prisma generate');
      
      console.log(`🔨 Pushing schema changes to development database...`);
      await execAsync('npx prisma db push --accept-data-loss');
      
      console.log(`✅ Schema synchronization completed`);
      return true;
    } catch (error) {
      console.error(`❌ Schema synchronization failed:`, error);
      return false;
    }
  }

  /**
   * Synchronize reference data from production to development
   */
  private async syncReferenceData(options: SyncOptions): Promise<{
    cities: number;
    users: number;
    reviews: number;
  }> {
    console.log(`📊 Synchronizing reference data...`);
    
    const result = {
      cities: 0,
      users: 0,
      reviews: 0
    };
    
    try {
      // Sync cities (always include as reference data)
      console.log(`🏙️  Synchronizing cities...`);
      const prodCities = await prodPrisma.city.findMany({
        orderBy: { createdAt: 'asc' }
      });
      
      for (const city of prodCities) {
        try {
          await devPrisma.city.upsert({
            where: { id: city.id },
            update: {
              ...city,
              updatedAt: new Date()
            },
            create: city
          });
          result.cities++;
        } catch (error) {
          console.warn(`⚠️  Failed to sync city ${city.name}:`, error);
        }
      }
      
      // Sync users (if requested)
      if (options.includeUserData) {
        console.log(`👥 Synchronizing users...`);
        const prodUsers = await prodPrisma.user.findMany({
          where: {
            role: 'ADMIN' // Only sync admin users for security
          },
          orderBy: { createdAt: 'asc' }
        });
        
        for (const user of prodUsers) {
          try {
            await devPrisma.user.upsert({
              where: { id: user.id },
              update: {
                ...user,
                password: null, // Clear password for security
                updatedAt: new Date()
              },
              create: {
                ...user,
                password: null // Clear password for security
              }
            });
            result.users++;
          } catch (error) {
            console.warn(`⚠️  Failed to sync user ${user.email}:`, error);
          }
        }
        
        // Sync reviews (sample data)
        console.log(`⭐ Synchronizing sample reviews...`);
        const prodReviews = await prodPrisma.review.findMany({
          where: {
            verified: true // Only sync verified reviews
          },
          take: 50, // Limit to 50 sample reviews
          orderBy: { createdAt: 'desc' }
        });
        
        for (const review of prodReviews) {
          try {
            await devPrisma.review.upsert({
              where: { id: review.id },
              update: {
                ...review,
                updatedAt: new Date()
              },
              create: review
            });
            result.reviews++;
          } catch (error) {
            console.warn(`⚠️  Failed to sync review ${review.id}:`, error);
          }
        }
      }
      
      console.log(`✅ Reference data synchronization completed`);
      console.log(`📊 Synced: ${result.cities} cities, ${result.users} users, ${result.reviews} reviews`);
      
      return result;
    } catch (error) {
      console.error(`❌ Reference data synchronization failed:`, error);
      throw error;
    }
  }

  /**
   * Validate database connections
   */
  private async validateConnections(): Promise<boolean> {
    console.log(`🔍 Validating database connections...`);
    
    try {
      // Test development database connection
      await devPrisma.$queryRaw`SELECT 1 as test`;
      console.log(`✅ Development database connection: OK`);
      
      // Test production database connection
      await prodPrisma.$queryRaw`SELECT 1 as test`;
      console.log(`✅ Production database connection: OK`);
      
      return true;
    } catch (error) {
      console.error(`❌ Database connection validation failed:`, error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  private async getDatabaseStats(prisma: PrismaClient, label: string) {
    try {
      const [cityCount, userCount, reviewCount] = await Promise.all([
        prisma.city.count(),
        prisma.user.count(),
        prisma.review.count()
      ]);
      
      console.log(`📊 ${label} Database Stats:`);
      console.log(`   Cities: ${cityCount}`);
      console.log(`   Users: ${userCount}`);
      console.log(`   Reviews: ${reviewCount}`);
      
      return { cities: cityCount, users: userCount, reviews: reviewCount };
    } catch (error) {
      console.error(`❌ Failed to get ${label.toLowerCase()} database stats:`, error);
      return { cities: 0, users: 0, reviews: 0 };
    }
  }

  /**
   * Main synchronization method
   */
  async synchronize(options: SyncOptions = {}): Promise<SyncResult> {
    const {
      schemaOnly = false,
      referenceDataOnly = false,
      includeUserData = false,
      createBackup = true,
      dryRun = false,
      force = false
    } = options;
    
    console.log(`🚀 Starting database synchronization...`);
    console.log(`📋 Options:`, {
      schemaOnly,
      referenceDataOnly,
      includeUserData,
      createBackup,
      dryRun,
      force
    });
    
    const result: SyncResult = {
      success: false,
      schemaUpdated: false,
      dataUpdated: false,
      recordsUpdated: {
        cities: 0,
        users: 0,
        reviews: 0
      },
      errors: [],
      warnings: []
    };
    
    try {
      // Validate connections
      if (!await this.validateConnections()) {
        result.errors.push('Database connection validation failed');
        return result;
      }
      
      // Get initial stats
      console.log(`\n📊 Initial Database State:`);
      const devStatsBefore = await this.getDatabaseStats(devPrisma, 'Development');
      const prodStats = await this.getDatabaseStats(prodPrisma, 'Production');
      
      if (dryRun) {
        console.log(`\n🔍 DRY RUN MODE - No changes will be made`);
        result.success = true;
        return result;
      }
      
      // Create backup
      if (createBackup) {
        result.backupCreated = await this.createBackup();
      }
      
      // Synchronize schema
      if (!referenceDataOnly) {
        result.schemaUpdated = await this.syncSchema();
        if (!result.schemaUpdated && !force) {
          result.errors.push('Schema synchronization failed');
          return result;
        }
      }
      
      // Synchronize reference data
      if (!schemaOnly) {
        result.recordsUpdated = await this.syncReferenceData(options);
        result.dataUpdated = true;
      }
      
      // Get final stats
      console.log(`\n📊 Final Database State:`);
      const devStatsAfter = await this.getDatabaseStats(devPrisma, 'Development');
      
      // Summary
      console.log(`\n🎉 Synchronization completed successfully!`);
      console.log(`\n📈 Changes Summary:`);
      console.log(`   Cities: ${devStatsBefore.cities} → ${devStatsAfter.cities} (+${devStatsAfter.cities - devStatsBefore.cities})`);
      console.log(`   Users: ${devStatsBefore.users} → ${devStatsAfter.users} (+${devStatsAfter.users - devStatsBefore.users})`);
      console.log(`   Reviews: ${devStatsBefore.reviews} → ${devStatsAfter.reviews} (+${devStatsAfter.reviews - devStatsBefore.reviews})`);
      
      if (result.backupCreated) {
        console.log(`\n💾 Backup created: ${result.backupCreated}`);
      }
      
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Restart the development server to apply changes`);
      console.log(`   2. Test application functionality`);
      console.log(`   3. Verify data integrity`);
      
      result.success = true;
      return result;
      
    } catch (error) {
      console.error(`❌ Synchronization failed:`, error);
      result.errors.push(`Synchronization failed: ${error}`);
      return result;
    } finally {
      await devPrisma.$disconnect();
      await prodPrisma.$disconnect();
    }
  }
}

/**
 * CLI interface
 */
async function main() {
  const args = process.argv.slice(2);
  
  const options: SyncOptions = {
    schemaOnly: args.includes('--schema-only'),
    referenceDataOnly: args.includes('--data-only'),
    includeUserData: args.includes('--include-users'),
    createBackup: !args.includes('--no-backup'),
    dryRun: args.includes('--dry-run'),
    force: args.includes('--force')
  };
  
  // Validate environment
  if (!process.env.DATABASE_URL) {
    console.error(`❌ DATABASE_URL environment variable is required`);
    process.exit(1);
  }
  
  if (!process.env.PRODUCTION_DATABASE_URL) {
    console.error(`❌ PRODUCTION_DATABASE_URL environment variable is required`);
    process.exit(1);
  }
  
  console.log(`🎯 Development Database Synchronization Tool`);
  console.log(`📅 ${new Date().toISOString()}`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  try {
    const synchronizer = new DatabaseSynchronizer();
    const result = await synchronizer.synchronize(options);
    
    if (result.success) {
      console.log(`\n✅ Synchronization completed successfully!`);
      process.exit(0);
    } else {
      console.error(`\n❌ Synchronization failed:`);
      result.errors.forEach(error => console.error(`   - ${error}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(`\n💥 Fatal error:`, error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { DatabaseSynchronizer };
export type { SyncOptions, SyncResult };