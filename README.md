# FreeNomad 🌍

> **Discover the best cities for digital nomads with comprehensive data on cost of living, internet speed, safety, and more.**

FreeNomad is an open-source platform that helps digital nomads find their perfect destination by providing detailed information about cities worldwide, including cost of living, internet infrastructure, safety ratings, and community reviews.

## ✨ Features

- **🏙️ Comprehensive City Database**: Detailed information on 100+ nomad-friendly cities
- **💰 Cost Analysis**: Real-time cost of living data and budget calculators
- **🌐 Internet Infrastructure**: Speed tests, coworking spaces, and connectivity ratings
- **🛡️ Safety Metrics**: Crime statistics, healthcare quality, and safety ratings
- **⭐ Community Reviews**: Verified reviews from fellow digital nomads
- **🔍 Advanced Filtering**: Find cities based on your specific criteria
- **📱 Progressive Web App**: Works offline and installable on mobile devices
- **🚀 Performance Optimized**: Sub-1s load times with Core Web Vitals optimization

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Neon)
- **Authentication**: NextAuth.js v5
- **Deployment**: Vercel
- **Performance**: Service Worker, Image optimization, API caching

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn
- PostgreSQL database (local or Neon)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/freenomad.git
   cd freenomad
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/freenomad"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Optional: External APIs
   UNSPLASH_ACCESS_KEY="your-unsplash-key"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
freenomad/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   ├── auth/           # Authentication pages
│   │   ├── cities/         # City detail pages
│   │   └── admin/          # Admin dashboard
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   └── ...            # Feature components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries
│   │   ├── data-access/   # Database access layer
│   │   ├── validations/   # Zod schemas
│   │   └── ...           # Other utilities
│   └── generated/         # Generated Prisma client
├── prisma/               # Database schema and migrations
├── public/              # Static assets
├── .github/            # GitHub Actions workflows
└── docs/              # Documentation
```

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint with auto-fix
npm run lint:check   # Check linting without fixing
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm run type-check   # TypeScript type checking

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:migrate   # Create and run migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Database Schema

The application uses PostgreSQL with Prisma ORM. Key entities:

- **Cities**: Core city data with metrics and location info
- **Users**: User accounts with authentication and profiles
- **Reviews**: User-generated reviews and ratings
- **Relationships**: Foreign keys linking users to their reviews and cities

### API Endpoints

- `GET /api/cities` - List cities with filtering and pagination
- `GET /api/cities/[id]` - Get city details
- `POST /api/auth/register` - User registration
- `GET /api/user/profile` - User profile data
- `PATCH /api/user/profile` - Update user profile

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   - Fork this repository
   - Import project in Vercel dashboard
   - Configure environment variables

2. **Environment Variables**

   ```env
   DATABASE_URL=your-production-database-url
   NEXTAUTH_SECRET=your-production-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

3. **Deploy**
   - Push to main branch for automatic deployment
   - Or use Vercel CLI: `vercel --prod`

### Self-Hosting

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Set up production database**

   ```bash
   npm run db:push
   npm run db:seed
   ```

3. **Start production server**
   ```bash
   npm start
   ```

## 🔒 Security

- **Authentication**: Secure JWT-based authentication with NextAuth.js
- **Rate Limiting**: API endpoints protected against abuse
- **Input Validation**: Comprehensive Zod schemas for all inputs
- **Security Headers**: CSP, HSTS, and other security headers configured
- **Database Security**: Parameterized queries and connection pooling

## 🎯 Performance

- **Core Web Vitals**: Optimized for LCP <2.5s, CLS <0.1, INP optimization
- **Image Optimization**: WebP/AVIF formats with responsive sizing
- **Caching Strategy**: Multi-layer caching with service worker
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **Database Optimization**: Strategic indexing for <100ms query times

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests and linting: `npm run lint && npm run type-check`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js and Prettier configurations
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for quality checks

## 📊 Analytics & Monitoring

- **Vercel Analytics**: Performance and usage metrics
- **Core Web Vitals**: Real user monitoring
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Database and API performance tracking

## 🌐 API Documentation

Detailed API documentation is available at `/api/docs` when running the development server.

## 📄 License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Unsplash**: City photography
- **OpenStreetMap**: Location data
- **Nomad List**: Inspiration for the nomad community
- **Vercel**: Hosting and deployment platform
- **Neon**: PostgreSQL database hosting

## 📞 Support

- **Documentation**: [docs.freenomad.com](https://docs.freenomad.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/freenomad/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/freenomad/discussions)
- **Email**: support@freenomad.com

---

**Built with ❤️ for the digital nomad community**

[Website](https://freenomad.vercel.app) • [Documentation](https://docs.freenomad.com) • [Community](https://github.com/yourusername/freenomad/discussions)
