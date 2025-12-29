# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Toy Marketplace India seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do Not Publicly Disclose

Please do not publicly disclose the vulnerability until we have had a chance to address it.

### 2. Report the Vulnerability

Send an email to **security@toymarketplace.in** with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

### 4. Disclosure Policy

Once the vulnerability is fixed:
- We will notify you
- We will credit you (if desired)
- We will publish a security advisory

## Security Measures

### Authentication & Authorization
- JWT-based authentication
- Bcrypt password hashing (10 rounds)
- Role-based access control (RBAC)
- Session management
- Rate limiting (100 requests/15 minutes)

### Data Protection
- HTTPS/TLS encryption
- Database encryption at rest
- Secure password storage
- Input validation & sanitization
- SQL injection prevention
- XSS protection

### API Security
- CORS configuration
- Security headers (CSP, HSTS, X-Frame-Options)
- Request size limits (10MB)
- Rate limiting per endpoint
- API key rotation

### Infrastructure Security
- Kubernetes secrets management
- Environment variable encryption
- Regular security updates
- Automated vulnerability scanning
- DDoS protection

### Monitoring & Logging
- Error tracking (Sentry)
- Activity logging
- Audit trails
- Real-time alerts
- Security event monitoring

## Best Practices for Users

### For Buyers & Sellers
- Use strong, unique passwords
- Enable two-factor authentication (when available)
- Don't share your account credentials
- Be cautious of phishing attempts
- Report suspicious activity

### For Developers
- Keep dependencies updated
- Follow secure coding practices
- Use environment variables for secrets
- Implement proper error handling
- Conduct security reviews

## Known Security Considerations

### Payment Security
- PCI DSS compliant (via Razorpay)
- No credit card data stored
- Secure payment gateway integration
- Transaction encryption

### Data Privacy
- GDPR compliant
- User data encryption
- Right to deletion
- Data export capability
- Privacy policy compliance

### Third-Party Services
- Razorpay (Payments)
- Cloudinary (Images)
- Resend (Email)
- MSG91 (SMS)
- Sentry (Error tracking)

All third-party services are vetted for security compliance.

## Security Updates

We regularly update our dependencies and infrastructure:
- Weekly dependency updates
- Monthly security audits
- Quarterly penetration testing
- Annual security review

## Contact

For security concerns:
- Email: security@toymarketplace.in
- Emergency: +91-XXXX-XXXXXX

For general inquiries:
- Email: support@toymarketplace.in
- Website: https://toymarketplace.in

## Acknowledgments

We appreciate the security research community and will acknowledge researchers who responsibly disclose vulnerabilities.

---

**Last Updated**: December 26, 2024
