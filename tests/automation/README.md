# Automation Tests TypeScript Configuration

## Configuration Guidelines

This document outlines the TypeScript configuration rules for the automation test suite to prevent common configuration errors.

## ✅ Current Configuration

The `tsconfig.json` in this directory is configured to:

- **Extend**: Project root TypeScript configuration
- **Target**: ES2020 for modern Node.js compatibility
- **Module**: CommonJS for Node.js automation scripts
- **No Emit**: `true` - Tests don't need compilation output
- **Base URL**: Project root (`../../`) for proper path resolution
- **Path Mapping**: `@/*` maps to `src/*` for source imports

## 🚫 Configuration Rules to Prevent Errors

### Rule 1: rootDir Constraint

**❌ DON'T**: Set `rootDir` when including files outside the test directory

```json
// BAD - Causes "not under rootDir" errors
{
  "compilerOptions": {
    "rootDir": "./"
  },
  "include": ["./**/*.ts", "../../src/**/*.ts"]
}
```

**✅ DO**: Omit `rootDir` or set it to encompass all included files

```json
// GOOD - Let TypeScript infer rootDir
{
  "compilerOptions": {
    // No rootDir specified
  },
  "include": ["./**/*.ts", "../../src/**/*.ts"]
}
```

### Rule 2: Output Configuration

**❌ DON'T**: Set `noEmit: false` and `outDir` for test-only configurations

```json
// BAD - Tests don't need compilation output
{
  "compilerOptions": {
    "noEmit": false,
    "outDir": "./dist"
  }
}
```

**✅ DO**: Use `noEmit: true` for type-checking only

```json
// GOOD - Type checking without output
{
  "compilerOptions": {
    "noEmit": true
  }
}
```

### Rule 3: Path Resolution

**❌ DON'T**: Use relative baseUrl with cross-directory includes

```json
// BAD - Path resolution conflicts
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["../../src/*"]
    }
  }
}
```

**✅ DO**: Use project root as baseUrl for consistent resolution

```json
// GOOD - Consistent path resolution
{
  "compilerOptions": {
    "baseUrl": "../../",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Rule 4: Exclude Patterns

**❌ DON'T**: Forget to exclude node_modules at different levels

```json
// BAD - May include unwanted files
{
  "exclude": ["node_modules"]
}
```

**✅ DO**: Include comprehensive exclude patterns

```json
// GOOD - Comprehensive exclusions
{
  "exclude": ["node_modules", "dist", "../../node_modules"]
}
```

## 🔍 Validation Checklist

Before modifying this configuration, verify:

- [ ] No `rootDir` conflicts with `include` patterns
- [ ] `noEmit: true` for test-only configurations
- [ ] `baseUrl` encompasses all included directories
- [ ] Path mappings work with the chosen `baseUrl`
- [ ] Exclude patterns cover all irrelevant directories
- [ ] Configuration extends project root settings appropriately

## 🛠️ Testing Configuration

To validate the configuration:

```bash
# Check TypeScript compilation
npx tsc --noEmit --project tests/automation/tsconfig.json

# Verify path resolution
npx tsc --showConfig --project tests/automation/tsconfig.json
```

## 📚 References

- [TypeScript Configuration Reference](https://www.typescriptlang.org/tsconfig)
- [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

---

**Last Updated**: $(date)
**Configuration Version**: 1.0
**Validation Status**: ✅ Verified
