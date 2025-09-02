# Validation Troubleshooting Guide

## 🚨 Quick Reference

| Error Type          | Quick Fix             | Command                       |
| ------------------- | --------------------- | ----------------------------- |
| TypeScript errors   | Fix type issues       | `npm run type-check`          |
| ESLint failures     | Auto-fix style issues | `npm run lint:check -- --fix` |
| Prettier formatting | Auto-format code      | `npm run format`              |
| Test failures       | Run and fix tests     | `npm run test`                |
| Build errors        | Check compilation     | `npm run build`               |
| Security issues     | Update dependencies   | `npm audit fix`               |

## 🔧 Detailed Troubleshooting

### TypeScript Compilation Errors

#### Error: "Property 'X' does not exist on type 'Y'"

**Cause**: Accessing a property that doesn't exist on the type

**Solutions**:

```typescript
// ❌ Bad
const user: User = getUser();
console.log(user.nonExistentProperty);

// ✅ Good - Add property to interface
interface User {
  id: string;
  name: string;
  nonExistentProperty?: string; // Add optional property
}

// ✅ Good - Use optional chaining
console.log(user.nonExistentProperty?.toString());

// ✅ Good - Type assertion (use carefully)
console.log((user as any).nonExistentProperty);
```

#### Error: "Argument of type 'X' is not assignable to parameter of type 'Y'"

**Cause**: Type mismatch in function arguments

**Solutions**:

```typescript
// ❌ Bad
function processUser(id: number) {
  /* ... */
}
processUser("123"); // string passed to number parameter

// ✅ Good - Convert type
processUser(parseInt("123"));

// ✅ Good - Update function signature
function processUser(id: string | number) {
  /* ... */
}
```

#### Error: "Object is possibly 'null' or 'undefined'"

**Cause**: Accessing properties on potentially null/undefined values

**Solutions**:

```typescript
// ❌ Bad
const user = getUser(); // might return null
console.log(user.name); // Error: Object is possibly 'null'

// ✅ Good - Null check
if (user) {
  console.log(user.name);
}

// ✅ Good - Optional chaining
console.log(user?.name);

// ✅ Good - Nullish coalescing
const name = user?.name ?? "Unknown";
```

### ESLint Errors

#### Error: "'X' is defined but never used"

**Cause**: Unused variables, imports, or parameters

**Solutions**:

```typescript
// ❌ Bad
import { unusedFunction } from "./utils";
const unusedVariable = "test";

function example(unusedParam: string) {
  return "hello";
}

// ✅ Good - Remove unused code
import { usedFunction } from "./utils";

function example() {
  return "hello";
}

// ✅ Good - Prefix with underscore if intentionally unused
function example(_unusedParam: string) {
  return "hello";
}
```

#### Error: "Unexpected any. Specify a different type"

**Cause**: Using `any` type instead of specific types

**Solutions**:

```typescript
// ❌ Bad
function processData(data: any) {
  return data.someProperty;
}

// ✅ Good - Define proper interface
interface DataType {
  someProperty: string;
  otherProperty?: number;
}

function processData(data: DataType) {
  return data.someProperty;
}

// ✅ Good - Use generic types
function processData<T>(data: T): T {
  return data;
}

// ✅ Good - Use unknown for truly unknown data
function processData(data: unknown) {
  if (typeof data === "object" && data !== null) {
    // Type narrowing
    return (data as { someProperty: string }).someProperty;
  }
}
```

#### Error: "Missing return type annotation"

**Cause**: Function doesn't have explicit return type

**Solutions**:

```typescript
// ❌ Bad
function getUser() {
  return { id: 1, name: "John" };
}

// ✅ Good - Add return type
interface User {
  id: number;
  name: string;
}

function getUser(): User {
  return { id: 1, name: "John" };
}

// ✅ Good - For simple cases
function getUser(): { id: number; name: string } {
  return { id: 1, name: "John" };
}
```

### Prettier Formatting Issues

#### Error: "Code style issues"

**Cause**: Inconsistent formatting

**Auto-fix**:

```bash
npm run format
```

**Manual fixes**:

```typescript
// ❌ Bad formatting
const user = { id: 1, name: "John", email: "john@example.com" };
if (user.id > 0) {
  console.log(user.name);
}

// ✅ Good formatting (after prettier)
const user = {
  id: 1,
  name: "John",
  email: "john@example.com",
};

if (user.id > 0) {
  console.log(user.name);
}
```

### Test Failures

#### Error: "Test suite failed to run"

**Cause**: Import errors or setup issues

**Solutions**:

1. Check import paths:

   ```typescript
   // ❌ Bad
   import { Component } from "../../../components/Component";

   // ✅ Good
   import { Component } from "@/components/Component";
   ```

2. Verify test setup:
   ```bash
   # Regenerate test files
   npm run test -- --clearCache
   ```

#### Error: "Snapshot test failed"

**Cause**: Component output changed

**Solutions**:

```bash
# Update snapshots if changes are intentional
npm run test -- --updateSnapshot

# Update specific test
npm run test -- --updateSnapshot ComponentName.test.tsx
```

#### Error: "Mock function not called"

**Cause**: Expected function calls didn't happen

**Solutions**:

```typescript
// ❌ Bad
const mockFn = jest.fn();
// ... test code that should call mockFn
expect(mockFn).toHaveBeenCalled(); // Fails if not called

// ✅ Good - Debug the mock
console.log("Mock calls:", mockFn.mock.calls);
expect(mockFn).toHaveBeenCalledTimes(1);
expect(mockFn).toHaveBeenCalledWith(expectedArgs);
```

### Build Errors

#### Error: "Module not found"

**Cause**: Missing dependencies or incorrect import paths

**Solutions**:

1. Install missing dependency:

   ```bash
   npm install missing-package
   npm install --save-dev @types/missing-package
   ```

2. Fix import paths:

   ```typescript
   // ❌ Bad
   import { Component } from "./Component"; // File doesn't exist

   // ✅ Good
   import { Component } from "./components/Component";
   import { Component } from "@/components/Component";
   ```

#### Error: "Cannot resolve module"

**Cause**: TypeScript can't find the module

**Solutions**:

1. Check `tsconfig.json` paths:

   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     }
   }
   ```

2. Restart TypeScript server in your IDE

### Security Audit Failures

#### Error: "High severity vulnerabilities found"

**Cause**: Outdated dependencies with security issues

**Solutions**:

```bash
# Auto-fix vulnerabilities
npm audit fix

# Force fix (use with caution)
npm audit fix --force

# Update specific package
npm update package-name

# Check for outdated packages
npm outdated
```

#### Error: "Potential secrets detected"

**Cause**: Hardcoded secrets in code

**Solutions**:

```typescript
// ❌ Bad
const API_KEY = 'sk-1234567890abcdef';
const password = 'mySecretPassword';

// ✅ Good
const API_KEY = process.env.API_KEY;
const password = process.env.DATABASE_PASSWORD;

// ✅ Good - Use environment variables
// In .env.local (not committed)
API_KEY=sk-1234567890abcdef
DATABASE_PASSWORD=mySecretPassword
```

### Large File Issues

#### Error: "File size exceeds limit"

**Cause**: Files are too large (>500KB)

**Solutions**:

1. Split large components:

   ```typescript
   // ❌ Bad - One huge component
   export function MassiveComponent() {
     // 1000+ lines of code
   }

   // ✅ Good - Split into smaller components
   export function UserProfile() {
     return (
       <div>
         <UserHeader />
         <UserDetails />
         <UserActions />
       </div>
     );
   }
   ```

2. Use dynamic imports:

   ```typescript
   // ❌ Bad - Import heavy library
   import { HeavyLibrary } from "heavy-library";

   // ✅ Good - Dynamic import
   const loadHeavyLibrary = async () => {
     const { HeavyLibrary } = await import("heavy-library");
     return HeavyLibrary;
   };
   ```

## 🔄 Validation Pipeline Issues

### Pre-commit Hook Not Running

**Cause**: Husky not properly installed

**Solutions**:

```bash
# Reinstall Husky
npx husky install

# Make sure pre-commit hook is executable
chmod +x .husky/pre-commit

# Test the hook
./.husky/pre-commit
```

### GitHub Actions Failing

**Cause**: Environment differences or missing secrets

**Solutions**:

1. Check workflow logs in GitHub Actions tab
2. Verify environment variables are set
3. Test locally with same Node.js version:
   ```bash
   nvm use 20  # Match CI Node version
   npm ci      # Clean install like CI
   npm run build
   ```

### Database Connection Issues in CI

**Cause**: Database not properly set up in CI environment

**Solutions**:

1. Check PostgreSQL service in workflow
2. Verify DATABASE_URL format:

   ```bash
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/freenomad_test
   ```

3. Run Prisma commands:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🛠️ Emergency Procedures

### Bypassing Validation (Use Sparingly)

```bash
# Skip pre-commit hooks (emergency only)
git commit --no-verify -m "hotfix: critical issue"

# Skip CI checks (add to commit message)
git commit -m "docs: update readme [skip ci]"
```

⚠️ **Important**: Always follow up with a proper fix!

### Fixing Broken Main Branch

1. **Identify the issue**:

   ```bash
   git log --oneline -10  # Check recent commits
   ```

2. **Revert problematic commit**:

   ```bash
   git revert <commit-hash>
   ```

3. **Create hotfix branch**:
   ```bash
   git checkout -b hotfix/validation-fix
   # Fix the issues
   git commit -m "fix: resolve validation issues"
   ```

## 📞 Getting Help

### Self-Help Checklist

- [ ] Read the error message carefully
- [ ] Check this troubleshooting guide
- [ ] Run validation locally: `./scripts/pre-commit-validation.sh`
- [ ] Check GitHub Actions logs
- [ ] Try the suggested quick fixes

### When to Ask for Help

- Error messages are unclear or confusing
- Quick fixes don't resolve the issue
- Validation is blocking critical work
- You suspect a bug in the validation system

### How to Report Issues

When asking for help, include:

1. **Full error message**
2. **Steps to reproduce**
3. **Your environment** (OS, Node version, etc.)
4. **Recent changes** you made
5. **Validation output** (copy/paste the terminal output)

### Example Help Request

```
Subject: Pre-commit validation failing with TypeScript error

Error: Property 'userId' does not exist on type 'User'

Steps to reproduce:
1. Modified src/components/UserProfile.tsx
2. Added user.userId reference
3. Ran git commit

Environment:
- macOS 13.0
- Node.js 20.0.0
- npm 9.0.0

Validation output:
[PRE-COMMIT] Running TypeScript type checking...
❌ TypeScript type checking failed
Error Details: Fix TypeScript errors before committing...
```

---

**Remember**: Validation errors are there to help you catch issues early. Take time to understand and fix them properly rather than bypassing them.
