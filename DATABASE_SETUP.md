# Database Setup Guide

## Overview

This project uses **Prisma ORM v6.14+** with **PostgreSQL** as the database. The setup includes comprehensive models for Cities, Users, Reviews, and NextAuth.js authentication.

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
- **Type-safe queries** with generated Prisma Client
- **Connection pooling** with Prisma Accelerate

## Setup Instructions

### 1. Database Configuration

#### Option A: Local PostgreSQL

```bash
# Install PostgreSQL locally
brew install postgresql
brew services start postgresql

# Create database
psql postgres
CREATE DATABASE freenomad;
\q
```

#### Option B: Neon PostgreSQL (Recommended)

1. Go to [Neon Console](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string
4. Update `.env` file with your DATABASE_URL

**For Vercel Deployment:**

- Neon automatically provides multiple connection URLs for different use cases
- `DATABASE_URL`: Main connection URL with connection pooling
- `DATABASE_URL_UNPOOLED`: Direct connection without pooling (for migrations)
- `POSTGRES_PRISMA_URL`: Optimized for Prisma with connection pooling
- All environment variables are automatically configured for Production, Preview, and Development environments

### 2. Environment Variables

Update your `.env` file:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:5432/freenomad?schema=public"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# External APIs
UNSPLASH_ACCESS_KEY="your-unsplash-access-key"
UNSPLASH_SECRET_KEY="your-unsplash-secret-key"

# Admin Configuration
ADMIN_EMAIL="admin@freenomad.com"
```

### 3. Database Operations

#### Test Connection

```bash
npm run db:test
```

#### Generate Prisma Client

```bash
npm run db:generate
```

**Note**: The project includes a `postinstall` script that automatically runs `prisma generate` after dependency installation, ensuring the Prisma client is always up-to-date in both development and production environments.

#### Push Schema (Development)

```bash
npm run db:push
```

#### Create Migration (Production)

```bash
npm run db:migrate
```

#### Seed Database

```bash
npm run db:seed
```

#### Open Prisma Studio

```bash
npm run db:studio
```

#### Reset Database

```bash
npm run db:reset
```

## Database Schema Details

### City Model

```prisma
model City {
  id          String   @id @default(cuid())
  name        String   @unique
  country     String
  region      String?
  latitude    Float
  longitude   Float
  population  Int?
  timezone    String?

  // Nomad-specific metrics
  costOfLiving    Int?     // Monthly cost in USD
  internetSpeed   Float?   // Mbps
  safetyRating    Float?   // 1-10 scale
  walkability     Float?   // 1-10 scale
  nightlife       Float?   // 1-10 scale
  culture         Float?   // 1-10 scale
  weather         Float?   // 1-10 scale

  // Content fields
  description     String?  @db.Text
  shortDescription String?
  imageUrl        String?
  imageAttribution String?

  // Metadata
  featured        Boolean  @default(false)
  verified        Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  reviews         Review[]
}
```

### User Model

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified DateTime?

  // Profile information
  bio           String?
  location      String?
  website       String?
  isAdmin       Boolean   @default(false)

  // Relations
  accounts      Account[]
  sessions      Session[]
  reviews       Review[]
}
```

### Review Model

```prisma
model Review {
  id        String   @id @default(cuid())
  rating    Int      // 1-5 stars
  title     String
  content   String   @db.Text

  // Specific ratings
  internetRating    Int? // 1-5 stars
  costRating        Int? // 1-5 stars
  safetyRating      Int? // 1-5 stars
  funRating         Int? // 1-5 stars

  // Metadata
  helpful           Int      @default(0)
  verified          Boolean  @default(false)

  // Relations
  userId            String
  cityId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  city              City     @relation(fields: [cityId], references: [id], onDelete: Cascade)

  // Constraints
  @@unique([userId, cityId]) // One review per user per city
}
```

## Performance Optimizations

### Indexes

- **Cities**: country, featured, costOfLiving, internetSpeed, safetyRating
- **Reviews**: cityId, rating, createdAt
- **Users**: email (unique)

### Connection Pooling

Prisma Accelerate is configured for:

- **Connection pooling**
- **Query caching**
- **Global database access**

## Development Workflow

1. **Schema Changes**: Edit `prisma/schema.prisma`
2. **Generate Client**: `npm run db:generate`
3. **Push Changes**: `npm run db:push` (development)
4. **Create Migration**: `npm run db:migrate` (production)
5. **Seed Data**: `npm run db:seed`
6. **Test**: `npm run db:test`

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check DATABASE_URL format
   - Verify database server is running
   - Confirm credentials are correct

2. **Migration Errors**
   - Reset database: `npm run db:reset`
   - Check schema syntax
   - Ensure no conflicting constraints

3. **Type Errors**
   - Regenerate client: `npm run db:generate`
   - Restart TypeScript server
   - Check import paths

### Useful Commands

```bash
# View database
npm run db:studio

# Check connection
npm run db:test

# Reset everything
npm run db:reset

# Fresh start
npm run db:generate && npm run db:push && npm run db:seed
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
   - Prisma client is auto-generated via `postinstall` script

### Troubleshooting Vercel + Neon Issues

1. **Connection Timeouts**
   - Ensure `POSTGRES_PRISMA_URL` is used for Prisma operations
   - Use `DATABASE_URL_UNPOOLED` for direct database operations

2. **Build Failures**
   - Verify `postinstall` script runs: `"postinstall": "prisma generate"`
   - Check Vercel build logs for Prisma client generation

3. **Environment Variable Issues**
   - All Neon variables should be available in Preview environment
   - Use `vercel env ls` to verify configuration

## Production Considerations

1. **Use migrations** instead of `db:push` for production
2. **Set up connection pooling** with Neon's built-in pooling
3. **Monitor database performance** using Neon dashboard
4. **Implement proper backup strategy** with Neon's automated backups
5. **Configure proper indexes** for query performance
6. **Set up database backups**
7. **Monitor query performance**

---

_For more information, see the [Prisma Documentation](https://www.prisma.io/docs/)_
