# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| 1.1.x   | :white_check_mark: |
| < 1.1   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it to us through one of the following methods:

### GitHub Security Advisories (Preferred)

1. Go to the [Security tab](../../security) of this repository
2. Click "Report a vulnerability"
3. Fill out the security advisory form with details about the vulnerability

### Email

Alternatively, you can email security issues to: [security@freenomad.com](mailto:security@freenomad.com)

### What to Include

When reporting a vulnerability, please include:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes or mitigations
- Your contact information for follow-up questions

## Response Timeline

- **Initial Response**: Within 48 hours of receiving the report
- **Assessment**: Within 5 business days, we'll provide an initial assessment
- **Fix Timeline**: Critical vulnerabilities will be patched within 7 days, others within 30 days
- **Disclosure**: We follow responsible disclosure practices

## Security Measures

Our application implements several security measures:

### Authentication & Authorization

- NextAuth.js with secure session management
- Role-based access control (RBAC)
- Password hashing with bcrypt
- JWT tokens with 30-day expiry

### Data Protection

- Environment variable protection
- Database connection security
- Input validation with Zod schemas
- CORS configuration

### Infrastructure Security

- Automated security scanning with Trivy
- Dependency vulnerability monitoring
- Code scanning with CodeQL
- Regular security audits

### API Security

- Rate limiting (100 requests per 15 minutes)
- Request logging and monitoring
- Input sanitization
- Error handling without information disclosure

## Security Best Practices for Contributors

### Code Security

- Never commit secrets, API keys, or passwords
- Use environment variables for sensitive configuration
- Validate all user inputs
- Follow secure coding practices
- Run security linting tools before submitting PRs

### Dependencies

- Keep dependencies up to date
- Review security advisories for used packages
- Use `npm audit` to check for vulnerabilities
- Prefer well-maintained packages with good security records

### Database Security

- Use parameterized queries (Prisma handles this)
- Implement proper access controls
- Avoid exposing sensitive data in logs
- Use connection pooling and proper timeouts

## Automated Security Scanning

Our CI/CD pipeline includes:

- **CodeQL Analysis**: Static code analysis for security vulnerabilities
- **Trivy Scanning**: Container and filesystem vulnerability scanning
- **Dependency Auditing**: Regular checks for vulnerable dependencies
- **SARIF Upload**: Security findings are uploaded to GitHub Security tab

## Security Updates

Security updates will be:

1. **Documented** in the [CHANGELOG.md](../CHANGELOG.md)
2. **Tagged** with appropriate version numbers
3. **Announced** through GitHub releases
4. **Applied** to all supported versions when applicable

## Contact

For general security questions or concerns, please contact:

- **Security Team**: [security@freenomad.com](mailto:security@freenomad.com)
- **Project Maintainer**: [maintainer@freenomad.com](mailto:maintainer@freenomad.com)

---

**Note**: This security policy is subject to updates. Please check back regularly for the latest information.
