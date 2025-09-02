#!/bin/bash

# Pre-commit validation script for FreeNomad
# This script runs comprehensive checks to prevent CI/CD failures

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[PRE-COMMIT]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_separator() {
    echo -e "${BLUE}================================================${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to run a command with error handling
run_check() {
    local check_name="$1"
    local command="$2"
    local error_message="$3"
    
    print_status "Running $check_name..."
    
    if eval "$command"; then
        print_success "$check_name passed"
        return 0
    else
        print_error "$check_name failed"
        if [ -n "$error_message" ]; then
            echo -e "${RED}Error Details:${NC} $error_message"
        fi
        return 1
    fi
}

# Main validation function
main() {
    print_separator
    print_status "Starting pre-commit validation..."
    print_separator
    
    local failed_checks=0
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_error "node_modules not found. Please run 'npm install' first."
        exit 1
    fi
    
    # 1. TypeScript Type Checking
    if ! run_check "TypeScript type checking" "npm run type-check" "Fix TypeScript errors before committing. Run 'npm run type-check' to see details."; then
        ((failed_checks++))
    fi
    
    # 2. ESLint Check
    if ! run_check "ESLint validation" "npm run lint:check" "Fix ESLint errors before committing. Run 'npm run lint:check' to see details."; then
        print_warning "ESLint found issues. Attempting to auto-fix..."
        if npm run lint:check -- --fix; then
            print_success "ESLint auto-fix completed"
        else
            print_error "ESLint auto-fix failed. Manual intervention required."
            ((failed_checks++))
        fi
    fi
    
    # 3. Prettier Format Check
    if ! run_check "Prettier format check" "npm run format:check" "Code formatting issues found. Run 'npm run format' to fix."; then
        print_warning "Prettier found formatting issues. Auto-formatting..."
        if npm run format; then
            print_success "Code auto-formatted successfully"
            # Add formatted files to staging
            git add -A
        else
            print_error "Auto-formatting failed"
            ((failed_checks++))
        fi
    fi
    
    # 4. Build Check
    if ! run_check "Build verification" "npm run build" "Build failed. Fix build errors before committing."; then
        ((failed_checks++))
    fi
    
    # 5. Unit Tests
    if ! run_check "Unit tests" "npm run test" "Unit tests failed. Fix failing tests before committing."; then
        ((failed_checks++))
    fi
    
    # 6. Check for common issues
    print_status "Checking for common issues..."
    
    # Check for console.log statements in production code
    if grep -r "console\.log" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" > /dev/null 2>&1; then
        print_warning "Found console.log statements in source code:"
        grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" || true
        print_warning "Consider removing console.log statements before committing to production"
    fi
    
    # Check for TODO/FIXME comments
    if grep -r "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" > /dev/null 2>&1; then
        print_warning "Found TODO/FIXME comments:"
        grep -rn "TODO\|FIXME" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" || true
    fi
    
    # Check for large files
    large_files=$(find . -name "*.js" -o -name "*.ts" -o -name "*.tsx" -o -name "*.jsx" | xargs ls -la | awk '$5 > 100000 {print $9, $5}' || true)
    if [ -n "$large_files" ]; then
        print_warning "Found large files (>100KB):"
        echo "$large_files"
    fi
    
    # 7. Security Check - Look for hardcoded secrets (more specific patterns)
    print_status "Checking for hardcoded secrets..."
    # Look for actual secret patterns like API keys, passwords with values
    secret_patterns=(
        "password\s*=\s*['\"][^'\"]{8,}['\"]"  # password = "actual_password"
        "secret\s*=\s*['\"][^'\"]{8,}['\"]"    # secret = "actual_secret"
        "key\s*=\s*['\"][^'\"]{20,}['\"]"      # key = "actual_api_key"
        "token\s*=\s*['\"][^'\"]{20,}['\"]"    # token = "actual_token"
        "api[_-]?key\s*[=:]\s*['\"][^'\"]{10,}['\"]"  # api_key = "value"
        "access[_-]?token\s*[=:]\s*['\"][^'\"]{10,}['\"]"  # access_token = "value"
    )
    
    found_secrets=false
    for pattern in "${secret_patterns[@]}"; do
        if grep -rE "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ \
            | grep -v "src/generated/" \
            | grep -v "src/__mocks__/" \
            | grep -v "test" \
            | grep -v "spec" > /dev/null 2>&1; then
            if [ "$found_secrets" = false ]; then
                print_warning "Found potential hardcoded secrets in code. Please review:"
                found_secrets=true
            fi
            grep -rEn "$pattern" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" src/ \
                | grep -v "src/generated/" \
                | grep -v "src/__mocks__/" \
                | grep -v "test" \
                | grep -v "spec" || true
        fi
    done
    
    print_separator
    
    # Summary
    if [ $failed_checks -eq 0 ]; then
        print_success "All pre-commit checks passed! ✨"
        print_status "Ready to commit."
        exit 0
    else
        print_error "$failed_checks check(s) failed."
        print_error "Please fix the issues above before committing."
        print_separator
        echo -e "${YELLOW}Quick fixes:${NC}"
        echo "  • TypeScript errors: npm run type-check"
        echo "  • ESLint issues: npm run lint:check -- --fix"
        echo "  • Formatting: npm run format"
        echo "  • Build issues: npm run build"
        echo "  • Test failures: npm run test"
        print_separator
        exit 1
    fi
}

# Run main function
main "$@"