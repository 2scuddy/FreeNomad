# Pre-Commit Validation Guide

## Overview

This document outlines the automated pre-commit validation process implemented to prevent CI/CD failures and maintain code quality. The validation system runs comprehensive checks before allowing commits and merges.

## 🎯 Goals

- **Prevent CI/CD failures** by catching issues early
- **Maintain consistent code quality** across the team
- **Automate repetitive checks** to reduce manual overhead
- **Provide clear feedback** to help developers fix issues quickly
- **Enforce security best practices** and coding standards

## 🔧 Validation Components

### 1. Pre-Commit Hooks (Local)

Runs automatically when you attempt to commit code:

#### Comprehensive Validation Script

- **Location**: `scripts/pre-commit-validation.sh`
- **Triggers**: Every `git commit`
- **Checks**:
  - TypeScript type checking
  - ESLint validation with auto-fix
  - Prettier formatting with auto-fix
  - Build verification
  - Unit tests
  - Security scanning for potential secrets
  - Large file detection
  - TODO/FIXME comment detection

#### Lint-Staged Configuration

- **File-specific checks** for staged files only
- **Auto-formatting** and **auto-fixing** where possible
- **Security audits** for package.json changes

### 2. GitHub Actions Workflows

#### CI/CD Pipeline (`ci-cd.yml`)

- **Triggers**: Push to `main`, `development`, `staging`
- **Strict mode**: No warnings allowed
- **Comprehensive testing** with database setup
- **Security scanning** with Trivy
- **Build verification** before deployment

#### Pull Request Validation (`pr-validation.yml`)

- **Triggers**: PR creation/updates to main branches
- **Additional checks**:
  - PR title format validation
  - Merge conflict detection
  - Bundle size analysis
  - E2E smoke tests
  - Code coverage validation (70% minimum)
  - Automated PR comments with results

## 📋 Validation Requirements

### Code Quality Standards

| Check          | Requirement                      | Auto-Fix |
| -------------- | -------------------------------- | -------- |
| **TypeScript** | No compilation errors            | ❌       |
| **ESLint**     | Zero warnings/errors             | ✅       |
| **Prettier**   | Consistent formatting            | ✅       |
| **Tests**      | All tests pass                   | ❌       |
| **Build**      | Successful build                 | ❌       |
| **Coverage**   | ≥70% test coverage               | ❌       |
| **Security**   | No high-severity vulnerabilities | ❌       |
| **File Size**  | <500KB per file                  | ❌       |

### Pull Request Standards

- **Title Format**: Must follow conventional commit format
  - ✅ `feat: add user authentication`
  - ✅ `fix(api): resolve login issue`
  - ❌ `updated some stuff`
- **No merge conflicts**
- **All validation checks pass**
- **Automated validation comment**

## 🚀 Getting Started

### Initial Setup

1. **Install dependencies**:

   ```bash
   npm install
   ```

2. **Verify Husky is installed**:

   ```bash
   npx husky install
   ```

3. **Test the validation script**:
   ```bash
   ./scripts/pre-commit-validation.sh
   ```

### Daily Workflow

1. **Make your changes**
2. **Stage your files**: `git add .`
3. **Commit**: `git commit -m "feat: your change description"`
   - Validation runs automatically
   - Issues are auto-fixed where possible
   - Manual fixes required for remaining issues
4. **Push**: `git push origin your-branch`

## 🛠️ Quick Fixes

When validation fails, use these commands to fix common issues:

```bash
# Fix TypeScript errors
npm run type-check

# Fix ESLint issues
npm run lint:check -- --fix

# Fix formatting
npm run format

# Run tests
npm run test

# Build check
npm run build

# Security audit
npm audit fix
```

## 🔍 Understanding Validation Output

The validation script provides color-coded output:

- 🔵 **Blue**: Information/status messages
- ✅ **Green**: Successful checks
- ⚠️ **Yellow**: Warnings (non-blocking)
- ❌ **Red**: Errors (blocking)

### Example Output

```bash
[PRE-COMMIT] Starting pre-commit validation...
================================================
[PRE-COMMIT] Running TypeScript type checking...
✓ TypeScript type checking passed
[PRE-COMMIT] Running ESLint validation...
⚠ ESLint found issues. Attempting to auto-fix...
✓ ESLint auto-fix completed
[PRE-COMMIT] Running Prettier format check...
⚠ Prettier found formatting issues. Auto-formatting...
✓ Code auto-formatted successfully
================================================
✓ All pre-commit checks passed! ✨
[PRE-COMMIT] Ready to commit.
```

## 🚨 Common Issues and Solutions

### TypeScript Errors

**Problem**: Type errors in your code

**Solution**:

```bash
npm run type-check
# Fix the reported type errors manually
```

### ESLint Failures

**Problem**: Code style or quality issues

**Solution**:

```bash
npm run lint:check -- --fix
# Review and fix any remaining issues
```

### Test Failures

**Problem**: Unit tests are failing

**Solution**:

```bash
npm run test
# Fix failing tests or update snapshots if needed
npm run test -- --updateSnapshot
```

### Build Failures

**Problem**: Code doesn't compile/build

**Solution**:

1. Check TypeScript errors first
2. Verify all imports are correct
3. Check for missing dependencies

### Large Files

**Problem**: Files exceed size limits

**Solution**:

- Split large components into smaller ones
- Move large data to separate files
- Use dynamic imports for heavy dependencies

## 🔒 Security Considerations

### Automatic Security Checks

- **Secret detection**: Scans for potential passwords, API keys, tokens
- **Dependency auditing**: Checks for vulnerable packages
- **Code analysis**: Identifies potential security issues

### Best Practices

- Never commit secrets or API keys
- Use environment variables for sensitive data
- Keep dependencies updated
- Review security warnings carefully

## 🎛️ Configuration

### Customizing Validation

To modify validation rules:

1. **Pre-commit script**: Edit `scripts/pre-commit-validation.sh`
2. **Lint-staged**: Modify `package.json` lint-staged section
3. **ESLint**: Update `eslint.config.mjs`
4. **Prettier**: Modify `.prettierrc`

### Bypassing Validation (Emergency Only)

```bash
# Skip pre-commit hooks (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"

# Skip specific checks in CI (use with caution)
# Add [skip ci] to commit message
git commit -m "docs: update readme [skip ci]"
```

⚠️ **Warning**: Only bypass validation in true emergencies. All bypassed commits should be fixed in follow-up commits.

## 📊 Monitoring and Metrics

### GitHub Actions

- View workflow runs in the **Actions** tab
- Check PR validation comments
- Monitor build success rates

### Local Metrics

- Pre-commit hook success/failure rates
- Common failure patterns
- Time spent on validation

## 🤝 Team Guidelines

### For Developers

1. **Run validation locally** before pushing
2. **Fix issues promptly** - don't let them accumulate
3. **Ask for help** if you're stuck on validation errors
4. **Keep PRs small** to make validation faster
5. **Write tests** for new features

### For Code Reviewers

1. **Verify all checks pass** before reviewing
2. **Don't approve PRs** with failing validation
3. **Help teammates** understand validation failures
4. **Suggest improvements** to validation rules when needed

### For Project Maintainers

1. **Monitor validation effectiveness**
2. **Update rules** as project evolves
3. **Provide training** on validation tools
4. **Balance strictness** with developer productivity

## 📚 Additional Resources

- [ESLint Configuration Guide](https://eslint.org/docs/user-guide/configuring/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Husky Git Hooks](https://typicode.github.io/husky/)

## 🆘 Getting Help

If you encounter issues with validation:

1. **Check this guide** for common solutions
2. **Run validation locally** to debug
3. **Check GitHub Actions logs** for detailed error messages
4. **Ask the team** in your communication channel
5. **Create an issue** if you find bugs in the validation system

---

**Remember**: The validation system is here to help maintain code quality and prevent issues. While it may seem strict initially, it will save time and prevent bugs in the long run.
