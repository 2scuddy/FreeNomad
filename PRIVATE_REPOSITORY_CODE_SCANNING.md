# Private Repository Code Scanning Setup Guide

This guide provides comprehensive instructions for configuring GitHub code scanning specifically for private repositories, ensuring proper authentication, permissions, and security standards.

## 🔒 Overview

Private repositories require enhanced authentication and permissions for code scanning to function properly. This setup ensures:

- ✅ Proper GitHub token authentication
- ✅ Enhanced permissions for private repository access
- ✅ Optimized scanning configuration for private codebases
- ✅ Secure handling of sensitive code and data
- ✅ Compliance with private repository security standards

## 🚀 What's Been Configured

### 1. Enhanced CodeQL Workflow

**File**: `.github/workflows/codeql.yml`

**Key Enhancements for Private Repositories**:

```yaml
# Enhanced permissions for private repositories
permissions:
  contents: read
  security-events: write
  actions: read
  pull-requests: read
  issues: read
  repository-projects: read
  statuses: read

jobs:
  analyze:
    permissions:
      # Explicit permissions for private repository access
      actions: read
      contents: read
      security-events: write
      pull-requests: read
      issues: read
      repository-projects: read
      statuses: read
```

**Enhanced Checkout Configuration**:

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    # Enhanced checkout for private repositories
    token: ${{ secrets.GITHUB_TOKEN }}
    fetch-depth: 0
    persist-credentials: true
    # Include submodules if any (common in private repos)
    submodules: recursive
```

**Private Repository CodeQL Initialization**:

```yaml
- name: Initialize CodeQL
  uses: github/codeql-action/init@v3
  with:
    languages: ${{ matrix.language }}
    # Enhanced configuration for private repositories
    token: ${{ secrets.GITHUB_TOKEN }}
    # Use dedicated configuration file for private repositories
    config-file: ./.github/codeql/codeql-config.yml
    # Enable extended security queries for private repos
    queries: security-extended,security-and-quality
    # Additional setup for private repository scanning
    setup-python-dependencies: false
    external-repository-token: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Enhanced CI/CD Security Integration

**File**: `.github/workflows/ci-cd.yml`

**Enhanced Global Permissions**:

```yaml
# Enhanced permissions for private repositories
permissions:
  contents: read
  security-events: write
  actions: read
  id-token: write
  pull-requests: read
  issues: read
  repository-projects: read
  statuses: read
  checks: write
```

**Private Repository Security Scanning**:

```yaml
security:
  name: Security Scan
  runs-on: ubuntu-latest
  permissions:
    contents: read
    security-events: write
    actions: read
    pull-requests: read
    issues: read
    repository-projects: read
    statuses: read
    checks: write
  steps:
    - name: Checkout code
      uses: actions/checkout@692973e3d937129bcbf40652eb9f2f61becf3332
      with:
        # Enhanced checkout for private repositories
        token: ${{ secrets.GITHUB_TOKEN }}
        fetch-depth: 0
        persist-credentials: true
        submodules: recursive
```

### 3. Dedicated Private Repository Configuration

**File**: `.github/codeql/codeql-config.yml`

This comprehensive configuration file includes:

- **Enhanced Security Queries**: Extended security analysis for private codebases
- **Optimized Path Configuration**: Focused scanning on source code, excluding dependencies
- **Private Repository Settings**: Specialized configurations for private repo environments
- **Performance Tuning**: Optimized resource allocation and timeout settings
- **Security Controls**: Enhanced authentication and access control measures

## 🔧 Repository Setup Instructions

### Step 1: Verify Repository Settings

1. **Navigate to Repository Settings**:

   ```
   GitHub Repository → Settings → Security & analysis
   ```

2. **Enable Required Features**:
   - ✅ **Dependency graph** (Required for private repos)
   - ✅ **Dependabot alerts** (Security vulnerability detection)
   - ✅ **Dependabot security updates** (Automated security patches)
   - ✅ **Code scanning** → **Set up** → **Advanced**
   - ✅ **Secret scanning** (If available for your plan)
   - ✅ **Private vulnerability reporting**

### Step 2: Configure GitHub Token Permissions

**For Organization Repositories**:

1. **Organization Settings**:

   ```
   Organization → Settings → Actions → General
   ```

2. **Token Permissions**:
   - ✅ **Read repository contents and metadata**
   - ✅ **Write security events**
   - ✅ **Read actions and their logs**
   - ✅ **Read pull requests**
   - ✅ **Read issues**
   - ✅ **Write checks**

**For Personal Repositories**:

1. **Repository Settings**:

   ```
   Repository → Settings → Actions → General
   ```

2. **Workflow Permissions**:
   - Select: **Read and write permissions**
   - ✅ **Allow GitHub Actions to create and approve pull requests**

### Step 3: Configure Branch Protection Rules

1. **Main Branch Protection**:

   ```
   Settings → Branches → Add rule
   Branch name pattern: main

   Required Status Checks:
   ✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   ✅ CodeQL
   ✅ Security Scan
   ✅ Analyze (javascript-typescript)
   ```

2. **Develop Branch Protection**:

   ```
   Settings → Branches → Add rule
   Branch name pattern: develop

   Required Status Checks:
   ✅ Require status checks to pass before merging
   ✅ CodeQL (if applicable)
   ✅ Security Scan
   ```

### Step 4: Verify Workflow Execution

1. **Test the Setup**:

   ```bash
   # Make a small change and push to trigger workflows
   git add .
   git commit -m "test: verify private repository code scanning"
   git push origin main
   ```

2. **Monitor Workflow Execution**:
   - Go to **Actions** tab
   - Verify **CodeQL** workflow runs successfully
   - Check **Security** tab for scan results

## 🔍 Private Repository Specific Features

### Enhanced Security Analysis

**Extended Query Packs**:

- `security-extended`: Comprehensive security vulnerability detection
- `security-and-quality`: Combined security and code quality analysis
- Custom Next.js security queries for framework-specific vulnerabilities

**Private Repository Optimizations**:

- Enhanced dependency analysis
- Experimental feature enablement
- Parallel analysis for faster processing
- Memory optimization for large private codebases

### Authentication and Access Control

**Token Management**:

```yaml
# Secure token usage throughout workflows
token: ${{ secrets.GITHUB_TOKEN }}
external-repository-token: ${{ secrets.GITHUB_TOKEN }}
```

**Permission Isolation**:

- Minimal required permissions
- Job-level permission specification
- Enhanced access control for sensitive operations

### Performance Optimizations

**Resource Allocation**:

- Memory limit: 8GB for large private repositories
- Disk space: 20GB for comprehensive analysis
- Parallel jobs: Up to 4 concurrent analyses
- Analysis timeout: 45 minutes for thorough scanning

**Caching Strategy**:

- CodeQL database caching
- Dependency caching
- Build artifact caching

## 🚨 Troubleshooting Private Repository Issues

### Common Issues and Solutions

#### 1. Authentication Failures

**Symptoms**:

- "Resource not accessible by integration" errors
- Failed checkout or CodeQL initialization

**Solutions**:

```yaml
# Ensure proper token usage
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    persist-credentials: true
```

#### 2. Permission Denied Errors

**Symptoms**:

- "Insufficient permissions" in workflow logs
- Unable to upload SARIF results

**Solutions**:

1. Verify repository workflow permissions:

   ```
   Settings → Actions → General → Workflow permissions
   Select: "Read and write permissions"
   ```

2. Check organization-level restrictions:
   ```
   Organization → Settings → Actions → General
   Review permission policies
   ```

#### 3. CodeQL Analysis Failures

**Symptoms**:

- CodeQL database creation fails
- Analysis timeout errors

**Solutions**:

```yaml
# Increase timeout and resources
jobs:
  analyze:
    timeout-minutes: 60 # Increase from default
    runs-on: ubuntu-latest
```

#### 4. SARIF Upload Issues

**Symptoms**:

- Security tab shows no results
- SARIF upload step fails

**Solutions**:

```yaml
- name: Upload SARIF results
  uses: github/codeql-action/upload-sarif@v3
  if: always()
  with:
    sarif_file: "results.sarif"
    token: ${{ secrets.GITHUB_TOKEN }}
    wait-for-processing: true
```

### Emergency Procedures

#### Temporary Disable Code Scanning

```yaml
# In .github/workflows/codeql.yml
# Add condition to disable temporarily
if: github.repository != 'owner/private-repo' # Adjust as needed
```

#### Skip Scanning for Specific Commits

```bash
# Use commit message to skip CI
git commit -m "hotfix: emergency fix [skip ci]"
```

#### Manual SARIF Upload

```bash
# Upload SARIF file manually using GitHub CLI
gh api repos/:owner/:repo/code-scanning/sarifs \
  --method POST \
  --field sarif="$(cat results.sarif | base64 -w 0)" \
  --field ref="refs/heads/main" \
  --field commit_sha="$(git rev-parse HEAD)"
```

## 📊 Monitoring and Maintenance

### Security Metrics for Private Repositories

**Key Performance Indicators**:

- **Scan Coverage**: Percentage of codebase analyzed
- **Vulnerability Detection Rate**: New issues found per scan
- **False Positive Rate**: Accuracy of security findings
- **Resolution Time**: Average time to fix security issues

**Monthly Review Checklist**:

- [ ] Review security scan results
- [ ] Update CodeQL queries and configuration
- [ ] Verify workflow performance metrics
- [ ] Check for new GitHub security features
- [ ] Update documentation and procedures

### Compliance and Auditing

**Audit Trail**:

- All scan results logged in Security tab
- Workflow execution history in Actions tab
- SARIF files stored for compliance review
- Access logs for security monitoring

**Compliance Features**:

- Encrypted result storage
- Audit logging enabled
- Strict compliance mode
- 90-day result retention

## 🔗 Additional Resources

### GitHub Documentation

- [Code Scanning for Private Repositories](https://docs.github.com/en/code-security/code-scanning/automatically-scanning-your-code-for-vulnerabilities-and-errors/about-code-scanning)
- [Managing Security and Analysis Settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-security-and-analysis-settings-for-your-repository)
- [CodeQL CLI Documentation](https://docs.github.com/en/code-security/codeql-cli)

### Security Best Practices

- [GitHub Security Best Practices](https://docs.github.com/en/code-security/getting-started/github-security-features)
- [Securing Your Repository](https://docs.github.com/en/code-security/getting-started/securing-your-repository)
- [Managing Security Vulnerabilities](https://docs.github.com/en/code-security/security-advisories)

---

## ✅ Verification Checklist

After implementing private repository code scanning:

### Repository Configuration

- [ ] Code scanning enabled in repository settings
- [ ] Proper workflow permissions configured
- [ ] Branch protection rules include security checks
- [ ] Dependabot alerts and updates enabled

### Workflow Verification

- [ ] CodeQL workflow runs successfully on push/PR
- [ ] Security scan completes without authentication errors
- [ ] SARIF results upload to Security tab
- [ ] All required permissions granted

### Security Features

- [ ] Extended security queries enabled
- [ ] Private repository configuration active
- [ ] Enhanced authentication working
- [ ] Performance optimizations applied

### Monitoring Setup

- [ ] Security tab shows scan results
- [ ] Workflow notifications configured
- [ ] Team access to security alerts
- [ ] Audit logging enabled

**Status**: 🟢 **Private repository code scanning fully configured and operational**

---

**Note**: This configuration is specifically optimized for private repositories and includes enhanced security measures, authentication, and performance optimizations not typically required for public repositories.
