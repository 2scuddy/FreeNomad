# Complete Database Setup and Management Guide

## Overview

This comprehensive guide covers all aspects of database setup, development, and management for the FreeNomad project using **Prisma ORM v6.14+** with **PostgreSQL** via **Neon** as the database provider.

## Table of Contents

1. [Database Schema](#database-schema)
2. [Neon Database Setup](#neon-database-setup)
3. [Development Environment Setup](#development-environment-setup)
4. [Production Database Configuration](#production-database-configuration)
5. [Database Synchronization](#database-synchronization)
6. [Authentication Setup](#authentication-setup)
7. [Troubleshooting](#troubleshooting)

## Database Schema

### Models

- **User**: Authentication and user profiles with NextAuth.js integration
- **Account/Session/VerificationToken**: NextAuth.js authentication models
- **City**: Main entity with nomad-specific data (cost of living, internet speed, etc.)
- **Review**: User reviews and ratings for cities

### Key Features

- **Multi-schema support** with Prisma v6.14+
- **Optimized indexing** for performance
- **Proper relationships** with cascade deletes
- **Environment-specific configurations**

## Neon Database Setup

### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Neon account (sign up at [neon.tech](https://neon.tech))
- Git repository access

### 1. Create a Neon Project

1. **Sign up/Login to Neon**:
   - Visit [console.neon.tech](https://console.neon.tech)
   - Create an account or sign in

2. **Create New Project**:
   - Click "Create Project"
   - Choose PostgreSQL version (latest recommended)
   - Select region closest to your users
   - Name your project (e.g., "freenomad-production")

### 2. Database Environment Structure

```
┌─────────────────────┐    ┌─────────────────────┐
│   Production DB     │    │   Development DB    │
│ weathered-haze-...  │◄──►│ ancient-flower-...  │
│ (Main Branch)       │    │ (Dev Branch)        │
└─────────────────────┘    └─────────────────────┘
           │                           │
           │                           │
           ▼                           ▼
┌─────────────────────┐    ┌─────────────────────┐
│   Vercel Deploy     │    │   Local Dev Server │
│   (Production)      │    │   (Development)     │
└─────────────────────┘    └─────────────────────┘
```

## Development Environment Setup

### Environment Variables

Create `.env.development.local`:

```env
# Primary Database Connection (Development Branch)
DATABASE_URL="postgresql://neondb_owner:npg_bzuok1gTd7Bt@ep-purple-moon-adoz7i17-pooler.c-2.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

# Neon Development Project Configuration
NEON_PROJECT_ID="ancient-flower-53144348"
NEON_BRANCH_ID="br-calm-mud-ad9kht59"
NEON_DATABASE_NAME="neondb"
NEON_ROLE_NAME="neondb_owner"

# Production Database Connection (for synchronization)
PRODUCTION_DATABASE_URL="postgresql://neondb_owner:npg_PYrVHIoJL20c@ep-billowing-haze-aduxv2eu-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
PRODUCTION_PROJECT_ID="weathered-haze-60662026"

# Database Synchronization Settings
ENABLE_DB_SYNC="true"
SYNC_INTERVAL_HOURS="24"
SYNC_SCHEMA_ONLY="false"
SYNC_REFERENCE_DATA="true"
```

### Database Projects

#### Development Database
- **Project**: `freenomds-dev` (ancient-flower-53144348)
- **Branch**: `br-calm-mud-ad9kht59`
- **Endpoint**: `ep-purple-moon-adoz7i17`
- **Purpose**: Isolated development and testing

#### Production Database
- **Project**: `weathered-haze-60662026`
- **Branch**: Main branch
- **Purpose**: Live application data

## Production Database Configuration

### Environment Variables for Production

```env
DATABASE_URL="postgresql://neondb_owner:npg_PYrVHIoJL20c@ep-billowing-haze-aduxv2eu-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEON_PROJECT_ID="weathered-haze-60662026"
```

## Database Synchronization

### Automated Synchronization Features

- **Schema Synchronization**: Automatic schema updates from production
- **Reference Data Sync**: Consistent city and user data across environments
- **Backup and Recovery**: Automated backup before synchronization
- **Performance Monitoring**: Connection testing and performance metrics

### Synchronization Commands

```bash
# Sync development database with production
npm run db:sync

# Sync schema only
npm run db:sync:schema

# Dry run (preview changes)
npm run db:sync:dry-run

# Force sync (use with caution)
npx tsx scripts/sync-dev-database.ts --force
```

## Authentication Setup

### NextAuth.js Integration

The database includes full NextAuth.js support with:

- User authentication tables
- Session management
- Account linking (OAuth providers)
- Email verification tokens

### Database Authentication Fixes

Refer to the authentication-specific documentation for:
- OAuth provider setup
- Session configuration
- Security best practices

## Troubleshooting

### Common Issues

#### Connection Errors

**Problem**: `Connection refused` or `timeout` errors

**Solution**:
```bash
# Check environment variables
echo $DATABASE_URL

# Test connection
npm run db:test:dev

# Verify Neon project status
# Visit https://console.neon.tech
```

#### Schema Mismatch

**Problem**: Prisma client errors or type mismatches

**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate

# Sync schema from production
npm run db:sync:schema

# Push local schema changes
npx prisma db push
```

#### Synchronization Failures

**Problem**: Sync script fails with errors

**Solution**:
```bash
# Run dry run to identify issues
npm run db:sync:dry-run

# Force sync (use with caution)
npx tsx scripts/sync-dev-database.ts --force

# Restore from backup if needed
# (Manual process using backup files)
```

### Performance Issues

**Problem**: Slow database queries or timeouts

**Solution**:
```bash
# Check connection performance
npm run db:test:dev

# Verify Neon project region
# Ensure development and production are in same region

# Monitor query performance in application logs
```

### Error Codes

| Error Code | Description | Solution |
|------------|-------------|----------|
| `P1001` | Connection refused | Check DATABASE_URL and network |
| `P1008` | Timeout | Verify Neon project status |
| `P2002` | Unique constraint | Check for duplicate data |
| `P2025` | Record not found | Verify data synchronization |

## Security Best Practices

### Environment Variables
- Never commit `.env.development.local` to version control
- Use different credentials for development and production
- Regularly rotate database passwords
- Limit database access to necessary IP addresses

### Data Protection
- Development database should not contain real user data
- Clear sensitive information during synchronization
- Use anonymized data for testing when possible
- Regular backup verification

### Access Control
- Limit development database access to team members
- Use role-based access in Neon console
- Monitor database access logs
- Implement IP allowlisting when possible

## Performance Optimization

### Connection Pooling
- Development uses connection pooling by default
- Pool size automatically managed by Neon
- Monitor connection usage in Neon console

### Query Optimization
- Use Prisma query optimization features
- Monitor slow queries in development
- Test with production-like data volumes
- Implement proper indexing strategies

### Caching Strategy
- Application-level caching for static data
- Database query result caching
- CDN caching for images and assets

## Useful Commands

```bash
# View database
npm run db:studio

# Check connection
npm run db:test

# Reset everything
npm run db:reset

# Fresh start
npm run db:generate && npm run db:push && npm run db:seed

# Deploy to production
npm run build
vercel --prod
```

## Vercel Deployment with Neon

### Preview Branch Configuration

For Vercel preview deployments with Neon database:

1. **Environment Variables Setup**
   ```bash
   # All Neon variables are automatically configured for:
   # - Production: Main database
   # - Preview: Same database with branch isolation
   # - Development: Local development setup
   ```

2. **Preview Branch Database Strategy**
   - Neon supports database branching for preview deployments
   - Each preview deployment can use the same database with proper isolation
   - Connection pooling is automatically handled by Neon

3. **Deployment Commands**
   ```bash
   # Deploy to preview branch
   vercel --target preview

   # Check preview deployment
   vercel ls

   # Promote preview to production
   vercel --prod
   ```

4. **Database Migration Strategy**
   - Use `prisma db push` for preview branches (faster, no migration files)
   - Use `prisma migrate deploy` for production (proper migration history)

---

**Note**: This consolidated guide replaces the individual database setup documents. For specific authentication issues, refer to the dedicated authentication documentation files.