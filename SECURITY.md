# 🔒 Security Guide

## ⚠️ CREDENTIAL EXPOSURE INCIDENT

**Date**: October 22, 2025  
**Issue**: MongoDB URI and JWT secret were accidentally committed to the repository  
**Status**: ✅ RESOLVED

## 🚨 Immediate Actions Taken

1. **✅ Removed credentials** from all documentation files
2. **✅ Added .gitignore** to prevent future credential commits
3. **✅ Created .env.example** for secure credential management
4. **✅ Updated deployment scripts** with placeholder values

## 🔧 What Was Exposed

- **MongoDB URI**: `mongodb+srv://root:root@main.amakhgx.mongodb.net/...`
- **JWT Secret**: `33333bf9a79f0b4f40068983210508e3e76416b47c867a8b166df1aa6fbfa9813e9c15c892fc38d0c32db80c2a7371390fa1e465f5a5c4b2bfc9d4731de6edf6`

## 🛡️ Security Measures Implemented

### 1. Credential Removal

- Replaced real credentials with placeholders in all files
- Updated documentation to use secure examples
- Added proper .gitignore to prevent future exposure

### 2. Secure Development Practices

- **Never commit .env files** - they're now in .gitignore
- **Use .env.example** for sharing environment variable structure
- **Store real credentials** in GitHub Secrets for deployment
- **Use environment variables** in production

### 3. Git History Cleanup

If you need to completely remove credentials from Git history:

```bash
# Run the cleanup script (WARNING: Rewrites history)
./scripts/clean-git-history.sh

# Or manually with git filter-branch
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch scripts/setup-server.sh DEPLOYMENT.md' \
--prune-empty --tag-name-filter cat -- --all
```

## 🔐 Secure Credential Management

### For Development:

```bash
# Copy the example file
cp .env.example .env

# Edit with your real credentials (NEVER commit this file)
nano .env
```

### For Production:

1. **GitHub Secrets** (for automated deployment):

   - `MONGODB_URI`
   - `JWT_SECRET`
   - `OPENAI_API_KEY`
   - `NEWS_API_KEY`
   - `RESEND_API_KEY`

2. **Server Environment** (for manual deployment):
   ```bash
   # On your server, create .env with real values
   nano /home/user/news-briefing-app/.env
   ```

## 🚨 If Credentials Are Exposed Again

### Immediate Response:

1. **Change the credentials immediately**

   - Change MongoDB password
   - Generate new JWT secret
   - Rotate API keys if possible

2. **Remove from repository**

   ```bash
   git rm --cached .env
   git commit -m "Remove exposed credentials"
   ```

3. **Clean Git history** (if needed)

   ```bash
   ./scripts/clean-git-history.sh
   ```

4. **Force push** (coordinate with team)
   ```bash
   git push --force-with-lease origin main
   ```

## 📋 Security Checklist

### ✅ Before Committing:

- [ ] No `.env` files in staging area
- [ ] No hardcoded credentials in code
- [ ] No API keys in comments
- [ ] No database URLs in documentation
- [ ] All sensitive data in environment variables

### ✅ For Deployment:

- [ ] Use GitHub Secrets for CI/CD
- [ ] Use server environment variables for production
- [ ] Never log credentials
- [ ] Use secure credential management tools

## 🔍 Monitoring

### Check for Exposed Credentials:

```bash
# Search for potential credential patterns
grep -r "mongodb+srv://" . --exclude-dir=node_modules
grep -r "sk-" . --exclude-dir=node_modules
grep -r "password" . --exclude-dir=node_modules
```

### Regular Security Audits:

- Review commits before pushing
- Use tools like `git-secrets` to prevent credential commits
- Regular credential rotation
- Monitor for exposed credentials in public repos

## 📚 Best Practices

### 1. Environment Variables

```bash
# ✅ Good
const mongoUri = process.env.MONGODB_URI;

# ❌ Bad
const mongoUri = "mongodb+srv://user:pass@cluster.net/db";
```

### 2. Documentation

```bash
# ✅ Good
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# ❌ Bad
MONGODB_URI=mongodb+srv://root:root@main.amakhgx.mongodb.net/news-briefing
```

### 3. Git Practices

```bash
# ✅ Good
git add .env.example
git commit -m "Add environment template"

# ❌ Bad
git add .env
git commit -m "Add environment variables"
```

## 🆘 Emergency Contacts

If credentials are exposed:

1. **Immediately change** all exposed credentials
2. **Notify team** about the exposure
3. **Review access logs** for unauthorized access
4. **Update security measures** to prevent recurrence

## 📖 Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Environment Variables Security](https://12factor.net/config)
- [Git Secrets Prevention](https://github.com/awslabs/git-secrets)

---

**Remember**: Security is everyone's responsibility. When in doubt, ask before committing sensitive data!
