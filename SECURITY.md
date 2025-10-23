# Security Guide

Security best practices and guidelines for the News Briefing application.

## 🔐 Credential Management

### Development

**Never commit sensitive credentials:**

- Use `.env` files (already in `.gitignore`)
- Use `backend/.env.example` as a template
- Store real values only in local `.env` file

```bash
# Setup local environment
cd backend
cp .env.example .env
nano .env  # Edit with your credentials
```

### Production

**Store secrets securely:**

1. **On Server:**

   ```bash
   # SSH to server
   ssh root@129.212.183.227
   cd /root/POOSD/POOSD-LargeProject_Team12/backend
   nano .env  # Add production credentials
   ```

2. **In GitHub Secrets:**
   - Go to repository Settings → Secrets → Actions
   - Add: `SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`
   - Never log secrets in Actions workflows

### Required Secrets

**Development:**

- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Token signing key

**Production (additional):**

- Strong `JWT_SECRET` (64+ character random string)
- MongoDB Atlas with IP whitelisting
- Strong database password

**Future:**

- `OPENAI_API_KEY`
- `NEWS_API_KEY`
- `RESEND_API_KEY`

---

## 🛡️ Authentication Security

### OTP System

**Current implementation:**

- 6-digit random codes
- Bcrypt hashing (10 rounds)
- 10-minute expiration
- Maximum 5 attempts
- Rate limiting per IP

**Best practices:**

- OTPs are single-use
- Throttle after failed attempts
- Monitor for brute force attacks

### JWT Tokens

**Configuration:**

- 7-day expiration (configurable)
- HS256 algorithm
- Signed with `JWT_SECRET`

**Security measures:**

- Never expose `JWT_SECRET`
- Rotate secrets periodically
- Use strong random secrets (64+ chars)
- Tokens are stateless (no server session)

**Generate strong secret:**

```bash
openssl rand -base64 64
```

---

## 🚨 Rate Limiting

**Current limits:**

- Per-IP: 100 requests / 15 minutes
- Per-User: 200 requests / 15 minutes
- Briefing generation: 3 / day

**Customize in `.env`:**

```bash
RATE_LIMIT_WINDOW_MS=900000     # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
DAILY_QUOTA_LIMIT=3
```

---

## 🔒 Security Headers

Implemented via Helmet middleware:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HTTPS)

**CORS configured for:**

- Development: `http://localhost:3000`
- Production: Configure `FRONTEND_URL` in `.env`

---

## 📋 Security Checklist

### Before Committing

- [ ] No `.env` files staged
- [ ] No hardcoded credentials
- [ ] No API keys in code
- [ ] No database URLs in comments
- [ ] Sensitive data in environment variables only

### Before Deploying

- [ ] Strong `JWT_SECRET` set (64+ chars)
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Strong database password
- [ ] GitHub Secrets properly configured
- [ ] `.env` file on server has production values
- [ ] SSH keys are secure and rotated

### Regular Maintenance

- [ ] Rotate `JWT_SECRET` periodically (invalidates all tokens)
- [ ] Update dependencies (`npm audit`)
- [ ] Monitor rate limiting alerts
- [ ] Review server logs for suspicious activity
- [ ] Rotate SSH keys every 90 days

---

## 🚫 What NOT to Do

❌ **Never:**

- Commit `.env` files
- Hardcode credentials in code
- Log sensitive data (passwords, tokens, secrets)
- Expose secrets in error messages
- Share credentials via chat/email
- Use weak JWT secrets (`"secret"`, `"123456"`)
- Disable security middleware in production

✅ **Always:**

- Use environment variables for secrets
- Use `.env.example` for templates
- Rotate credentials after exposure
- Use strong random secrets
- Enable all security middleware
- Keep dependencies updated

---

## 🔍 Checking for Exposed Credentials

```bash
# Search for potential credential patterns
grep -r "mongodb+srv://" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "JWT_SECRET" . --exclude-dir=node_modules --exclude-dir=.git
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git
```

**Use tools:**

- `git-secrets` - Prevent credential commits
- `npm audit` - Check for vulnerabilities
- GitHub secret scanning (automatic)

---

## 🆘 If Credentials Are Exposed

### Immediate Actions

1. **Change credentials immediately:**

   - Rotate MongoDB password
   - Generate new `JWT_SECRET` (invalidates all tokens)
   - Rotate API keys

2. **Update everywhere:**

   - Server `.env` file
   - GitHub Secrets
   - Local development `.env`

3. **Restart application:**

   ```bash
   pm2 restart news-briefing-api
   ```

4. **Notify team** if credentials were public

### Prevent Future Exposure

- Review `.gitignore` includes `.env`
- Setup `git-secrets` pre-commit hooks
- Enable GitHub secret scanning alerts
- Regular security audits

---

## 📚 Best Practices Summary

### Environment Variables

✅ **Good:**

```typescript
const secret = process.env.JWT_SECRET;
const dbUri = process.env.MONGODB_URI;
```

❌ **Bad:**

```typescript
const secret = "my-secret-key";
const dbUri = "mongodb+srv://user:pass@...";
```

### Documentation

✅ **Good:**

```bash
# .env.example
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key-here
```

❌ **Bad:**

```bash
# Documentation or README - NEVER include real credentials
MONGODB_URI=mongodb+srv://realuser:realpass@cluster.mongodb.net/database
JWT_SECRET=actual-secret-key-do-not-commit
```

### Git Practices

✅ **Good:**

```bash
git add backend/.env.example
git add backend/src/
git commit -m "Add environment template"
```

❌ **Bad:**

```bash
git add backend/.env
git commit -m "Add configuration"
```

---

## 📖 Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

## 🆘 Questions?

**Security concerns:**

- Review this guide
- Check server logs for anomalies
- Test authentication flow
- Verify rate limiting is working

**Need help:**

1. Check documentation in this repo
2. Review error messages and logs
3. Verify environment configuration
4. Test endpoints with curl

**Remember:** Security is everyone's responsibility. When in doubt, ask before committing or deploying!
