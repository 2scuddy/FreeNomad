#!/bin/bash

# Local CI Pipeline Script
# This script runs the same validation steps as the GitHub Actions workflow
# but locally without requiring external services

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}[CI]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the project root
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_step "Starting Local CI Pipeline for FreeNomad"
echo "==========================================="

# Step 1: Environment Check
print_step "Step 1: Environment Check"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Check for required environment variables
if [ -f ".env.local" ]; then
    print_success "Environment file found"
else
    print_warning "No .env.local file found. Some tests may fail."
fi

# Step 2: Install Dependencies
print_step "Step 2: Installing Dependencies"
npm ci
print_success "Dependencies installed"

# Step 3: Generate Prisma Client
print_step "Step 3: Generating Prisma Client"
npm run db:generate
print_success "Prisma client generated"

# Step 4: Code Quality Checks
print_step "Step 4: Running Code Quality Checks"

# ESLint check (optimized)
print_step "Running ESLint (fast mode with cache)..."
START_TIME=$(date +%s)
if npm run lint:fast; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    print_success "ESLint passed (${DURATION}s)"
else
    print_error "ESLint failed"
    print_step "Tip: Run 'npm run lint' to auto-fix issues"
    print_step "For full project scan: npm run lint:check"
    exit 1
fi

# Prettier check
print_step "Running Prettier check..."
if npm run format:check; then
    print_success "Prettier check passed"
else
    print_error "Prettier check failed"
    exit 1
fi

# TypeScript check
print_step "Running TypeScript check..."
if npm run type-check; then
    print_success "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

# Step 5: Security Scan (if available)
print_step "Step 5: Security Scan"
if command -v npm audit &> /dev/null; then
    print_step "Running npm audit..."
    if npm audit --audit-level=high; then
        print_success "Security audit passed"
    else
        print_warning "Security vulnerabilities found. Review npm audit output."
    fi
else
    print_warning "npm audit not available"
fi

# Step 6: Tests
print_step "Step 6: Running Tests"
if npm run test; then
    print_success "Tests passed"
else
    print_error "Tests failed"
    exit 1
fi

# Step 7: Build Application
print_step "Step 7: Building Application"
export NODE_ENV=production
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 8: Performance Check (if Lighthouse CLI is available)
print_step "Step 8: Performance Check"
if command -v lhci &> /dev/null; then
    print_step "Running Lighthouse CI..."
    if lhci autorun; then
        print_success "Performance check passed"
    else
        print_warning "Performance check failed or had warnings"
    fi
else
    print_warning "Lighthouse CI not installed. Skipping performance check."
    print_step "To install: npm install -g @lhci/cli"
fi

# Step 9: Package for Deployment
print_step "Step 9: Creating Deployment Package"
if [ -d ".next" ]; then
    tar -czf deployment-package.tar.gz \
        .next/ \
        public/ \
        package.json \
        package-lock.json \
        next.config.ts \
        prisma/ 2>/dev/null || true
    
    if [ -f "deployment-package.tar.gz" ]; then
        PACKAGE_SIZE=$(du -h deployment-package.tar.gz | cut -f1)
        print_success "Deployment package created (${PACKAGE_SIZE})"
    else
        print_error "Failed to create deployment package"
        exit 1
    fi
else
    print_error "Build output not found. Build may have failed."
    exit 1
fi

# Step 10: Cleanup
print_step "Step 10: Cleanup"
if [ -f "deployment-package.tar.gz" ]; then
    rm deployment-package.tar.gz
    print_success "Cleanup completed"
fi

# Final Summary
echo "==========================================="
print_success "Local CI Pipeline Completed Successfully!"
echo ""
echo "Summary:"
echo "✅ Code quality checks passed"
echo "✅ Security scan completed"
echo "✅ Tests passed"
echo "✅ Build successful"
echo "✅ Deployment package ready"
echo ""
print_step "Your application is ready for deployment!"