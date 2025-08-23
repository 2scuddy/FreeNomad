# GitHub Branching Strategy & Vercel Integration

This document outlines the streamlined GitHub branching strategy integrated with Vercel for production deployment, ensuring clear separation between environments while enabling smooth progression from development to production.

## 📋 Table of Contents

- [Branch Structure](#branch-structure)
- [Workflow Overview](#workflow-overview)
- [Vercel Integration](#vercel-integration)
- [Development Workflow](#development-workflow)
- [Deployment Process](#deployment-process)
- [Branch Protection Rules](#branch-protection-rules)
- [Setup Instructions](#setup-instructions)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🌳 Branch Structure

### Main Branches

#### `main` - Production Branch

- **Purpose**: Represents production-ready code
- **Vercel Environment**: Production deployment
- **Domain**: `freenomad.com`
- **Protection Level**: Highest (requires 2 approvals, all checks must pass)
- **Merge Source**: Only from `staging` branch
- **Auto-deploy**: ✅ Enabled

#### `staging` - Preview/Testing Branch

- **Purpose**: Serves as preview/staging environment for testing
- **Vercel Environment**: Preview deployment
- **Domain**: `staging.freenomad.com`
- **Protection Level**: Medium (requires 1 approval, core checks must pass)
- **Merge Source**: From `develop` branch
- **Auto-deploy**: ✅ Enabled

#### `develop` - Development Integration Branch

- **Purpose**: Primary development branch for ongoing work
- **Vercel Environment**: Development preview
- **Domain**: `dev.freenomad.com`
- **Protection Level**: Basic (requires 1 approval, basic checks)
- **Merge Source**: From `feature/*` branches
- **Auto-deploy**: ✅ Enabled

### Supporting Branches

#### `feature/*` - Feature Development

- **Purpose**: Individual feature development
- **Naming Convention**: `feature/feature-name` or `feature/TICKET-123-description`
- **Vercel Environment**: Preview deployment (optional)
- **Protection Level**: None
- **Merge Target**: `develop` branch
- **Auto-deploy**: ⚠️ Optional (can be enabled per feature)

#### `hotfix/*` - Emergency Fixes

- **Purpose**: Critical production fixes
- **Naming Convention**: `hotfix/issue-description` or `hotfix/TICKET-123`
- **Merge Target**: Both `main` and `develop`
- **Protection Level**: Expedited review process

#### `release/*` - Release Preparation

- **Purpose**: Prepare releases, version bumps, final testing
- **Naming Convention**: `release/v1.2.3`
- **Merge Target**: `main` (then back-merge to `develop`)

## 🔄 Workflow Overview

```mermaid
gitGraph
    commit id: "Initial"
    branch develop
    checkout develop
    commit id: "Dev setup"

    branch feature/auth
    checkout feature/auth
    commit id: "Add auth"
    commit id: "Fix tests"

    checkout develop
    merge feature/auth
    commit id: "Merge auth"

    branch staging
    checkout staging
    merge develop
    commit id: "Staging deploy"

    checkout main
    merge staging
    commit id: "Production deploy"

    checkout develop
    merge main
    commit id: "Sync develop"
```

### Development Flow

1. **Feature Development**

   ```bash
   # Create feature branch from develop
   git checkout develop
   git pull origin develop
   git checkout -b feature/user-authentication

   # Develop and commit changes
   git add .
   git commit -m "feat: implement user authentication"
   git push origin feature/user-authentication
   ```

2. **Pull Request to Develop**
   - Create PR from `feature/user-authentication` → `develop`
   - Automated checks run (linting, tests, build)
   - Code review and approval
   - Merge to `develop`

3. **Staging Deployment**

   ```bash
   # Regular merge from develop to staging
   git checkout staging
   git pull origin staging
   git merge develop
   git push origin staging
   ```

4. **Production Release**
   ```bash
   # After staging testing, merge to main
   git checkout main
   git pull origin main
   git merge staging
   git push origin main
   ```

## 🚀 Vercel Integration

### Environment Configuration

| Branch      | Environment | Domain                  | Auto-Deploy | Monitoring             |
| ----------- | ----------- | ----------------------- | ----------- | ---------------------- |
| `main`      | Production  | `freenomad.com`         | ✅          | Full monitoring        |
| `staging`   | Preview     | `staging.freenomad.com` | ✅          | Performance monitoring |
| `develop`   | Preview     | `dev.freenomad.com`     | ✅          | Basic monitoring       |
| `feature/*` | Preview     | Auto-generated          | ⚠️ Optional | None                   |

### Environment Variables

#### Production (`main`)

```bash
NODE_ENV=production
VERCEL_ENV=production
NEXT_PUBLIC_APP_ENV=production
NEXTAUTH_URL=https://freenomad.com
DATABASE_URL=postgresql://prod_connection
```

#### Staging (`staging`)

```bash
NODE_ENV=production
VERCEL_ENV=preview
NEXT_PUBLIC_APP_ENV=staging
NEXTAUTH_URL=https://staging.freenomad.com
DATABASE_URL=postgresql://staging_connection
```

#### Development (`develop`)

```bash
NODE_ENV=development
VERCEL_ENV=preview
NEXT_PUBLIC_APP_ENV=development
NEXTAUTH_URL=https://dev.freenomad.com
DATABASE_URL=postgresql://dev_connection
```

### Deployment Triggers

- **Automatic**: Push to `main`, `staging`, `develop`
- **Manual**: Feature branches (can be enabled)
- **Preview**: All pull requests get preview deployments

## 👨‍💻 Development Workflow

### Starting New Feature

1. **Sync with latest develop**

   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Create feature branch**

   ```bash
   git checkout -b feature/TICKET-123-user-profile
   ```

3. **Develop with regular commits**

   ```bash
   # Make changes
   git add .
   git commit -m "feat: add user profile component"

   # Continue development
   git add .
   git commit -m "test: add user profile tests"

   # Push regularly
   git push origin feature/TICKET-123-user-profile
   ```

4. **Create Pull Request**
   - Target: `develop` branch
   - Fill out PR template
   - Assign reviewers
   - Link to ticket/issue

### Code Review Process

1. **Automated Checks**
   - ✅ Linting (ESLint)
   - ✅ Type checking (TypeScript)
   - ✅ Unit tests
   - ✅ Build verification
   - ✅ Security scan

2. **Manual Review**
   - Code quality
   - Architecture compliance
   - Test coverage
   - Documentation

3. **Approval & Merge**
   - Required approvals met
   - All checks passing
   - Conflicts resolved
   - Squash and merge

### Release Process

#### Weekly Staging Deployment

```bash
# Every week, promote develop to staging
git checkout staging
git pull origin staging
git merge develop
git push origin staging

# Verify staging deployment
# Run additional tests
# Stakeholder review
```

#### Production Release

```bash
# After staging approval, promote to production
git checkout main
git pull origin main
git merge staging
git tag v1.2.3
git push origin main --tags

# Verify production deployment
# Monitor for issues
# Update release notes
```

## 🛡️ Branch Protection Rules

### Main Branch Protection

- ✅ Require pull request reviews (2 approvals)
- ✅ Dismiss stale reviews
- ✅ Require review from code owners
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Include administrators
- ❌ Allow force pushes
- ❌ Allow deletions

**Required Status Checks:**

- Quality Checks
- E2E Tests
- Security Checks
- Lighthouse Performance

### Staging Branch Protection

- ✅ Require pull request reviews (1 approval)
- ✅ Dismiss stale reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ❌ Include administrators
- ❌ Allow force pushes
- ❌ Allow deletions

**Required Status Checks:**

- Quality Checks
- Integration Tests
- E2E Tests

### Develop Branch Protection

- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ❌ Dismiss stale reviews
- ❌ Include administrators
- ❌ Allow force pushes
- ❌ Allow deletions

**Required Status Checks:**

- Quality Checks
- Integration Tests

## ⚙️ Setup Instructions

### 1. Repository Setup

```bash
# Clone repository
git clone https://github.com/your-org/FreeNomad.git
cd FreeNomad

# Create main branches
git checkout -b develop
git push origin develop

git checkout -b staging
git push origin staging

# Return to main
git checkout main
```

### 2. GitHub Branch Protection

#### Option A: Automated Setup

```bash
# Set GitHub token
export GITHUB_TOKEN=your_personal_access_token

# Run setup script
node .github/setup-branch-protection.js
```

#### Option B: Manual Setup

1. Go to repository Settings → Branches
2. Add protection rules for each branch
3. Configure according to `.github/branch-protection-setup.json`

### 3. Vercel Configuration

1. **Connect Repository**
   - Link GitHub repository to Vercel
   - Configure deployment settings

2. **Environment Variables**

   ```bash
   # Production
   vercel env add NEXTAUTH_SECRET production
   vercel env add DATABASE_URL production

   # Staging
   vercel env add NEXTAUTH_SECRET preview
   vercel env add DATABASE_URL preview
   ```

3. **Domain Configuration**
   - Production: `freenomad.com`
   - Staging: `staging.freenomad.com`
   - Development: `dev.freenomad.com`

### 4. Team Permissions

```bash
# Create teams (GitHub organization)
# - maintainers: Full access
# - senior-developers: Can approve main PRs
# - developers: Standard access

# Assign team permissions in repository settings
```

## 📝 Best Practices

### Commit Messages

Use conventional commits format:

```
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
test: add integration tests for auth
refactor: optimize database queries
```

### Branch Naming

- `feature/TICKET-123-short-description`
- `hotfix/critical-security-fix`
- `release/v1.2.3`
- `chore/update-dependencies`

### Pull Request Guidelines

- Clear, descriptive title
- Detailed description
- Link to related issues
- Screenshots for UI changes
- Test instructions
- Breaking changes noted

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations
- [ ] Accessibility compliance

### Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Feature flags configured
- [ ] Monitoring alerts set up
- [ ] Rollback plan prepared

## 🔧 Troubleshooting

### Common Issues

#### Branch Protection Not Working

```bash
# Check protection status
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/owner/repo/branches/main/protection

# Re-run setup script
node .github/setup-branch-protection.js
```

#### Vercel Deployment Failing

```bash
# Check environment variables
vercel env ls

# Check build logs
vercel logs

# Redeploy
vercel --prod
```

#### Merge Conflicts

```bash
# Update feature branch with latest develop
git checkout feature/my-feature
git fetch origin
git rebase origin/develop

# Resolve conflicts and continue
git add .
git rebase --continue
git push --force-with-lease origin feature/my-feature
```

#### Failed Status Checks

```bash
# Run checks locally
npm run lint
npm run type-check
npm run test
npm run build

# Fix issues and push
git add .
git commit -m "fix: resolve linting issues"
git push origin feature/my-feature
```

### Emergency Procedures

#### Hotfix Process

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Make fix
git add .
git commit -m "fix: resolve critical security vulnerability"
git push origin hotfix/critical-security-fix

# Create PR to main (expedited review)
# After merge, back-merge to develop and staging
```

#### Rollback Production

```bash
# Option 1: Revert commit
git checkout main
git revert HEAD
git push origin main

# Option 2: Rollback in Vercel dashboard
# Go to deployments and promote previous version
```

## 📊 Monitoring & Analytics

### Key Metrics

- Deployment frequency
- Lead time for changes
- Mean time to recovery
- Change failure rate

### Tools Integration

- **GitHub Actions**: CI/CD pipeline
- **Vercel Analytics**: Performance monitoring
- **Lighthouse CI**: Performance audits
- **Sentry**: Error tracking
- **GitHub Insights**: Development metrics

---

## 🎯 Quick Reference

### Daily Workflow

1. Pull latest `develop`
2. Create feature branch
3. Develop and test
4. Create PR to `develop`
5. Code review and merge

### Weekly Workflow

1. Merge `develop` to `staging`
2. Test staging environment
3. Stakeholder review
4. Prepare for production release

### Release Workflow

1. Merge `staging` to `main`
2. Tag release version
3. Monitor production
4. Update documentation
5. Back-merge to `develop`

### Emergency Workflow

1. Create hotfix branch from `main`
2. Implement fix
3. Expedited review
4. Deploy to production
5. Back-merge to all branches

---

**📚 Additional Resources:**

- [GitHub Flow Documentation](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Vercel Deployment Documentation](https://vercel.com/docs/concepts/deployments)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Best Practices](https://git-scm.com/book/en/v2)
