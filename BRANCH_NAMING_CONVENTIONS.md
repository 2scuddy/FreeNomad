# Branch Naming Conventions & Workflow Guidelines

This document defines the standardized branch naming conventions and workflow guidelines for the FreeNomad project to ensure consistency, clarity, and efficient collaboration.

## 📋 Table of Contents

- [Branch Naming Conventions](#branch-naming-conventions)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Workflow Examples](#workflow-examples)
- [Automation Rules](#automation-rules)
- [Best Practices](#best-practices)

## 🌳 Branch Naming Conventions

### Main Branches

#### Protected Branches

- `main` - Production-ready code
- `staging` - Preview/testing environment
- `develop` - Development integration branch

### Supporting Branches

#### Feature Branches

**Pattern:** `feature/[ticket-id]-[short-description]`

**Examples:**

```
feature/AUTH-123-user-login
feature/DASH-456-analytics-dashboard
feature/API-789-rate-limiting
feature/UI-101-dark-mode
feature/PERF-202-image-optimization
```

**Rules:**

- Use lowercase with hyphens
- Include ticket/issue ID when available
- Keep description short but descriptive
- Maximum 50 characters total
- No special characters except hyphens

#### Bug Fix Branches

**Pattern:** `bugfix/[ticket-id]-[short-description]`

**Examples:**

```
bugfix/BUG-123-login-redirect
bugfix/BUG-456-memory-leak
bugfix/BUG-789-validation-error
bugfix/ISSUE-101-mobile-layout
```

#### Hotfix Branches

**Pattern:** `hotfix/[severity]-[short-description]`

**Examples:**

```
hotfix/critical-security-vulnerability
hotfix/p0-payment-failure
hotfix/urgent-data-corruption
hotfix/emergency-api-timeout
```

**Severity Levels:**

- `critical` - System down, security breach
- `p0` - Major functionality broken
- `urgent` - High impact, immediate fix needed
- `emergency` - Business-critical issue

#### Release Branches

**Pattern:** `release/v[major].[minor].[patch]`

**Examples:**

```
release/v1.2.0
release/v2.0.0
release/v1.3.1
```

#### Chore/Maintenance Branches

**Pattern:** `chore/[category]-[description]`

**Examples:**

```
chore/deps-update-react
chore/config-eslint-rules
chore/docs-api-documentation
chore/ci-github-actions
chore/refactor-auth-service
```

**Categories:**

- `deps` - Dependency updates
- `config` - Configuration changes
- `docs` - Documentation updates
- `ci` - CI/CD improvements
- `refactor` - Code refactoring
- `test` - Test improvements
- `perf` - Performance optimizations

#### Experimental Branches

**Pattern:** `experiment/[description]`

**Examples:**

```
experiment/new-ui-framework
experiment/alternative-auth
experiment/performance-optimization
```

### Branch Naming Rules

#### ✅ Do's

- Use lowercase letters
- Use hyphens to separate words
- Include ticket/issue numbers
- Keep names descriptive but concise
- Use consistent prefixes
- Follow the established patterns

#### ❌ Don'ts

- Use spaces or special characters
- Use camelCase or PascalCase
- Create overly long names (>50 chars)
- Use generic names like `fix` or `update`
- Include personal names
- Use abbreviations that aren't clear

## 📝 Commit Message Guidelines

### Conventional Commits Format

**Pattern:** `<type>[optional scope]: <description>`

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `build` - Build system changes
- `revert` - Reverting previous commits

### Examples

```bash
# Features
feat: add user authentication system
feat(auth): implement OAuth2 integration
feat(ui): add dark mode toggle

# Bug fixes
fix: resolve login redirect issue
fix(api): handle null response in user service
fix(mobile): correct responsive layout on iOS

# Documentation
docs: update API documentation
docs(readme): add installation instructions

# Refactoring
refactor: optimize database queries
refactor(auth): simplify token validation logic

# Performance
perf: improve image loading performance
perf(api): add response caching

# Tests
test: add unit tests for auth service
test(e2e): add login workflow tests

# Chores
chore: update dependencies
chore(ci): improve GitHub Actions workflow
```

### Commit Message Rules

#### Structure

- **Subject line:** 50 characters or less
- **Body:** Wrap at 72 characters (optional)
- **Footer:** Reference issues/tickets (optional)

#### Format

```
type(scope): subject line

Optional body explaining what and why vs. how.
Can be multiple paragraphs.

Closes #123
Fixes #456
Resolves #789
```

#### Examples with Body

```
feat(auth): implement two-factor authentication

Add support for TOTP-based 2FA using authenticator apps.
Includes QR code generation and backup codes.

- Add TOTP service with secret generation
- Implement QR code component
- Add backup code management
- Update user settings UI

Closes #AUTH-123
```

## 🔄 Pull Request Guidelines

### PR Title Format

**Pattern:** `[Type] Brief description`

**Examples:**

```
[Feature] Add user authentication system
[Bug Fix] Resolve login redirect issue
[Hotfix] Fix critical payment processing error
[Chore] Update React to v18
[Docs] Update API documentation
```

### PR Labels

#### Type Labels

- `feature` - New functionality
- `bugfix` - Bug fixes
- `hotfix` - Critical fixes
- `enhancement` - Improvements to existing features
- `documentation` - Documentation changes
- `refactor` - Code refactoring
- `performance` - Performance improvements
- `security` - Security-related changes

#### Priority Labels

- `priority: critical` - Must be addressed immediately
- `priority: high` - Should be addressed soon
- `priority: medium` - Normal priority
- `priority: low` - Can be addressed later

#### Size Labels

- `size: xs` - Very small change (<10 lines)
- `size: s` - Small change (10-50 lines)
- `size: m` - Medium change (50-200 lines)
- `size: l` - Large change (200-500 lines)
- `size: xl` - Very large change (>500 lines)

#### Status Labels

- `status: draft` - Work in progress
- `status: ready-for-review` - Ready for code review
- `status: needs-changes` - Changes requested
- `status: approved` - Approved and ready to merge
- `status: blocked` - Blocked by dependencies

## 🔄 Workflow Examples

### Feature Development Workflow

```bash
# 1. Start from develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/AUTH-123-user-login

# 3. Develop with regular commits
git add .
git commit -m "feat(auth): add login form component"
git commit -m "feat(auth): implement login validation"
git commit -m "test(auth): add login form tests"

# 4. Push and create PR
git push origin feature/AUTH-123-user-login
# Create PR: feature/AUTH-123-user-login → develop

# 5. After approval and merge, cleanup
git checkout develop
git pull origin develop
git branch -d feature/AUTH-123-user-login
```

### Bug Fix Workflow

```bash
# 1. Start from develop (or main for hotfixes)
git checkout develop
git pull origin develop

# 2. Create bugfix branch
git checkout -b bugfix/BUG-456-login-redirect

# 3. Fix the bug
git add .
git commit -m "fix(auth): resolve login redirect issue"
git commit -m "test(auth): add regression test for redirect"

# 4. Push and create PR
git push origin bugfix/BUG-456-login-redirect
# Create PR: bugfix/BUG-456-login-redirect → develop
```

### Hotfix Workflow

```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create hotfix branch
git checkout -b hotfix/critical-payment-failure

# 3. Implement fix
git add .
git commit -m "fix(payment): resolve critical payment processing error"

# 4. Push and create PR to main
git push origin hotfix/critical-payment-failure
# Create PR: hotfix/critical-payment-failure → main

# 5. After merge to main, back-merge to develop
git checkout develop
git pull origin develop
git merge main
git push origin develop
```

### Release Workflow

```bash
# 1. Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# 2. Prepare release (version bumps, changelog)
git add .
git commit -m "chore(release): prepare v1.2.0"

# 3. Push and create PR to staging
git push origin release/v1.2.0
# Create PR: release/v1.2.0 → staging

# 4. After staging testing, merge to main
# Create PR: staging → main

# 5. Tag the release
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

## 🤖 Automation Rules

### Branch Protection Rules

#### Main Branch

- Require PR reviews (2 approvals)
- Require status checks
- Require up-to-date branches
- No force pushes
- No deletions

#### Staging Branch

- Require PR reviews (1 approval)
- Require status checks
- No force pushes

#### Develop Branch

- Require PR reviews (1 approval)
- Require status checks
- Allow force pushes (for maintainers)

### Automated Actions

#### On Feature Branch Creation

- Auto-assign labels based on branch name
- Auto-assign to project board
- Run initial CI checks

#### On PR Creation

- Auto-assign reviewers based on CODEOWNERS
- Auto-add size labels based on changes
- Run full test suite
- Deploy preview environment

#### On PR Merge

- Auto-delete feature branch
- Update project board
- Trigger deployment pipeline
- Send notifications

### Branch Naming Validation

```yaml
# GitHub Action to validate branch names
name: Validate Branch Name
on:
  pull_request:
    types: [opened, edited]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Validate branch name
        run: |
          branch="${{ github.head_ref }}"
          if [[ ! $branch =~ ^(feature|bugfix|hotfix|release|chore|experiment)/[a-z0-9-]+$ ]]; then
            echo "Invalid branch name: $branch"
            echo "Please follow naming conventions: type/description"
            exit 1
          fi
```

## 📚 Best Practices

### Branch Management

#### ✅ Do's

- Keep branches focused and small
- Delete merged branches promptly
- Rebase feature branches regularly
- Use descriptive branch names
- Follow the naming conventions
- Create PRs early for feedback

#### ❌ Don'ts

- Create long-lived feature branches
- Mix unrelated changes in one branch
- Use generic branch names
- Force push to shared branches
- Merge without code review
- Leave stale branches

### Commit Practices

#### ✅ Do's

- Make atomic commits
- Write clear commit messages
- Commit frequently
- Use conventional commit format
- Reference issues in commits
- Keep commits focused

#### ❌ Don'ts

- Make huge commits
- Use vague commit messages
- Commit broken code
- Mix formatting with logic changes
- Commit sensitive information
- Use "WIP" commits in main branches

### Code Review

#### ✅ Do's

- Review code thoroughly
- Provide constructive feedback
- Test the changes locally
- Check for security issues
- Verify test coverage
- Approve only when confident

#### ❌ Don'ts

- Rubber stamp approvals
- Ignore failing tests
- Skip security review
- Approve without understanding
- Be overly critical
- Delay reviews unnecessarily

## 🔧 Tools and Automation

### Git Hooks

#### Pre-commit Hook

```bash
#!/bin/sh
# Validate commit message format
commit_regex='^(feat|fix|docs|style|refactor|perf|test|chore|ci|build|revert)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo "Use: type(scope): description"
    exit 1
fi
```

#### Pre-push Hook

```bash
#!/bin/sh
# Prevent pushing to main/staging directly
protected_branches="main staging"
current_branch=$(git symbolic-ref HEAD | sed 's!refs/heads/!!')

if echo "$protected_branches" | grep -q "$current_branch"; then
    echo "Direct push to $current_branch is not allowed!"
    echo "Please create a pull request."
    exit 1
fi
```

### GitHub Actions

#### Branch Name Validation

```yaml
name: Branch Name Check
on:
  pull_request:
    types: [opened]

jobs:
  check-branch-name:
    runs-on: ubuntu-latest
    steps:
      - name: Check branch name
        run: |
          branch="${{ github.head_ref }}"
          pattern="^(feature|bugfix|hotfix|release|chore|experiment)/[a-z0-9-]+$"
          if [[ ! $branch =~ $pattern ]]; then
            echo "❌ Invalid branch name: $branch"
            echo "✅ Valid format: type/description (e.g., feature/user-auth)"
            exit 1
          fi
          echo "✅ Branch name is valid: $branch"
```

#### Auto-labeling

```yaml
name: Auto Label
on:
  pull_request:
    types: [opened]

jobs:
  label:
    runs-on: ubuntu-latest
    steps:
      - name: Add labels based on branch
        uses: actions/github-script@v6
        with:
          script: |
            const branch = context.payload.pull_request.head.ref;
            const labels = [];

            if (branch.startsWith('feature/')) labels.push('feature');
            if (branch.startsWith('bugfix/')) labels.push('bugfix');
            if (branch.startsWith('hotfix/')) labels.push('hotfix');
            if (branch.startsWith('chore/')) labels.push('chore');

            if (labels.length > 0) {
              await github.rest.issues.addLabels({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.payload.pull_request.number,
                labels: labels
              });
            }
```

---

## 📖 Quick Reference

### Branch Naming Cheat Sheet

| Type       | Pattern                    | Example                         |
| ---------- | -------------------------- | ------------------------------- |
| Feature    | `feature/[id]-[desc]`      | `feature/AUTH-123-user-login`   |
| Bug Fix    | `bugfix/[id]-[desc]`       | `bugfix/BUG-456-redirect-issue` |
| Hotfix     | `hotfix/[severity]-[desc]` | `hotfix/critical-payment-error` |
| Release    | `release/v[version]`       | `release/v1.2.0`                |
| Chore      | `chore/[category]-[desc]`  | `chore/deps-update-react`       |
| Experiment | `experiment/[desc]`        | `experiment/new-ui-framework`   |

### Commit Type Cheat Sheet

| Type       | Description      | Example                             |
| ---------- | ---------------- | ----------------------------------- |
| `feat`     | New feature      | `feat: add user authentication`     |
| `fix`      | Bug fix          | `fix: resolve login redirect issue` |
| `docs`     | Documentation    | `docs: update API documentation`    |
| `style`    | Code style       | `style: fix linting errors`         |
| `refactor` | Code refactoring | `refactor: optimize auth service`   |
| `perf`     | Performance      | `perf: improve image loading`       |
| `test`     | Tests            | `test: add login form tests`        |
| `chore`    | Maintenance      | `chore: update dependencies`        |

### Workflow Cheat Sheet

1. **Feature:** `develop` → `feature/xxx` → PR → `develop`
2. **Bug Fix:** `develop` → `bugfix/xxx` → PR → `develop`
3. **Hotfix:** `main` → `hotfix/xxx` → PR → `main` → back-merge to `develop`
4. **Release:** `develop` → `staging` → `main` → tag

---

**📚 Additional Resources:**

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Semantic Versioning](https://semver.org/)
