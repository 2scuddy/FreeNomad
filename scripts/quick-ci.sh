#!/bin/bash

# Quick Local CI Pipeline Script
# Faster version focusing on essential validation steps

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

print_step "Starting Quick Local CI Pipeline for FreeNomad"
echo "============================================="

# Step 1: Environment Check
print_step "Step 1: Environment Check"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

# Check for required environment variables
if [ -f ".env.local" ] || [ -f ".env" ]; then
    print_success "Environment file found"
else
    print_warning "No environment file found. Some operations may fail."
fi

# Step 2: Install Dependencies (if needed)
print_step "Step 2: Checking Dependencies"
if [ ! -d "node_modules" ]; then
    print_step "Installing dependencies..."
    npm ci
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Step 3: Generate Prisma Client
print_step "Step 3: Generating Prisma Client"
npm run db:generate
print_success "Prisma client generated"

# Step 4: TypeScript Check (faster than full ESLint)
print_step "Step 4: TypeScript Validation"
if npm run type-check; then
    print_success "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

# Step 5: Prettier Check
print_step "Step 5: Code Formatting Check"
if npm run format:check; then
    print_success "Code formatting check passed"
else
    print_warning "Code formatting issues found. Run 'npm run format' to fix."
fi

# Step 6: Security Scan
print_step "Step 6: Security Scan"
if npm audit --audit-level=high; then
    print_success "Security audit passed"
else
    print_warning "Security vulnerabilities found. Review npm audit output."
fi

# Step 7: Tests
print_step "Step 7: Running Tests"
if npm run test; then
    print_success "Tests passed"
else
    print_error "Tests failed"
    exit 1
fi

# Step 8: Build Application
print_step "Step 8: Building Application"
export NODE_ENV=production
if npm run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Step 9: Validate Build Output
print_step "Step 9: Validating Build Output"
if [ -d ".next" ] && [ -f ".next/BUILD_ID" ]; then
    BUILD_ID=$(cat .next/BUILD_ID)
    print_success "Build validation passed (Build ID: ${BUILD_ID})"
else
    print_error "Build output validation failed"
    exit 1
fi

# Step 10: Package Information
print_step "Step 10: Package Summary"
if [ -d ".next" ]; then
    NEXT_SIZE=$(du -sh .next 2>/dev/null | cut -f1 || echo "Unknown")
    print_step "Build size: ${NEXT_SIZE}"
    
    # Count important files
    JS_FILES=$(find .next -name "*.js" 2>/dev/null | wc -l || echo "0")
    CSS_FILES=$(find .next -name "*.css" 2>/dev/null | wc -l || echo "0")
    
    print_step "Generated files: ${JS_FILES} JS, ${CSS_FILES} CSS"
fi

# Final Summary
echo "============================================="
print_success "Quick CI Pipeline Completed Successfully!"
echo ""
echo "Summary:"
echo "✅ TypeScript validation passed"
echo "✅ Code formatting checked"
echo "✅ Security scan completed"
echo "✅ Tests passed"
echo "✅ Build successful"
echo "✅ Build output validated"
echo ""
print_step "Your application is ready for deployment!"
print_step "To run full linting: npm run lint"
print_step "To run performance tests: npm install -g @lhci/cli && lhci autorun"