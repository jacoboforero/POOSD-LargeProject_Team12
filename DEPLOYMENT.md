# Deployment Guide

Automated deployment to DigitalOcean via GitHub Actions.

## Overview

- **Server:** DigitalOcean Droplet (Ubuntu)
- **Server IP:** `129.212.183.227`
- **API Port:** `3001`
- **Process Manager:** PM2
- **CI/CD:** GitHub Actions

## Architecture

```
GitHub Push → GitHub Actions → SSH to Server → Build → PM2 Restart
```

Every push to `main` automatically deploys to production.

---

## Initial Server Setup (One-Time)

### 1. Provision Server

Create a DigitalOcean Droplet:

- Ubuntu 22.04 LTS
- Basic plan ($6/month minimum)
- SSH key authentication

### 2. Setup SSH Access

```bash
# On your local machine
ssh-keygen -t ed25519 -C "deployment@newsbrief"

# Copy public key to server
ssh-copy-id root@129.212.183.227

# Test connection
ssh root@129.212.183.227
```

### 3. Install Dependencies on Server

```bash
# SSH into server
ssh root@129.212.183.227

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Git
apt-get install -y git

# Create application directory
mkdir -p /root/POOSD
cd /root/POOSD

# Clone repository
git clone <your-repo-url> POOSD-LargeProject_Team12
cd POOSD-LargeProject_Team12
```

### 4. Configure Environment

```bash
cd /root/POOSD/POOSD-LargeProject_Team12/backend

# Create .env file
cat > .env << EOF
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-production-secret-here
JWT_EXPIRES_IN=7d
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/news-briefing
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Install dependencies and build
npm install
npm run build

# Start with PM2
pm2 start dist/backend/src/index.js --name news-briefing-api
pm2 save
pm2 startup
```

### 5. Test Deployment

```bash
# Health check
curl http://129.212.183.227:3001/health
```

---

## GitHub Actions Setup

### 1. Configure Repository Secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add:

| Secret Name      | Value             | Description             |
| ---------------- | ----------------- | ----------------------- |
| `SERVER_HOST`    | `129.212.183.227` | DigitalOcean server IP  |
| `SERVER_USER`    | `root`            | SSH username            |
| `SERVER_SSH_KEY` | `<private-key>`   | SSH private key content |

**To get SSH private key:**

```bash
cat ~/.ssh/id_ed25519
```

Copy the entire output including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`

### 2. Workflow Configuration

The workflow is defined in `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Server

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 20
      - Install dependencies
      - Build application
      - SSH to server
      - Pull latest code
      - Install dependencies
      - Build on server
      - Restart PM2
```

**Workflow triggers on:**

- Every push to `main` branch
- Manual trigger via GitHub UI (workflow_dispatch)

---

## Deployment Process

### Automatic Deployment

1. Commit and push changes to `main`:

   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. GitHub Actions automatically:

   - Builds the application
   - SSHs to the server
   - Pulls latest code
   - Rebuilds on server
   - Restarts PM2

3. Monitor deployment:
   - Go to **Actions** tab in GitHub
   - Click on the latest workflow run
   - View logs for each step

### Manual Deployment

If you need to deploy manually:

```bash
# SSH to server
ssh root@129.212.183.227

# Navigate to project
cd /root/POOSD/POOSD-LargeProject_Team12

# Pull latest changes
git pull origin main

# Build and restart
cd backend
npm install
npm run build
pm2 restart news-briefing-api
```

---

## Monitoring

### Check Application Status

```bash
# SSH to server
ssh root@129.212.183.227

# Check PM2 status
pm2 status

# View logs
pm2 logs news-briefing-api

# Real-time monitoring
pm2 monit
```

### Check API Health

```bash
# From anywhere
curl http://129.212.183.227:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "version": "1.0.3",
  "environment": "production",
  "timestamp": "2025-10-23T12:00:00.000Z"
}
```

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs news-briefing-api
pm2 logs news-briefing-api --lines 100

# Restart
pm2 restart news-briefing-api

# Stop
pm2 stop news-briefing-api

# Delete from PM2
pm2 delete news-briefing-api

# Save PM2 process list
pm2 save
```

---

## Troubleshooting

### Deployment Failed

**Check GitHub Actions logs:**

1. Go to **Actions** tab
2. Click failed workflow
3. Expand failing step to see error

**Common issues:**

**SSH connection failed:**

- Verify `SERVER_SSH_KEY` secret is correct
- Test SSH manually: `ssh root@129.212.183.227`
- Check server is running

**Build failed:**

- Check for TypeScript errors locally first
- Run `npm run build` locally to test
- Check Node.js version (needs 20+)

**PM2 restart failed:**

- SSH to server and check logs: `pm2 logs`
- Manually restart: `pm2 restart news-briefing-api`
- If process doesn't exist: `pm2 start dist/backend/src/index.js --name news-briefing-api`

### Application Not Starting

```bash
# SSH to server
ssh root@129.212.183.227

# Check PM2 logs
pm2 logs news-briefing-api --lines 50

# Common issues:
# 1. MongoDB connection failed - check MONGODB_URI in .env
# 2. Port already in use - check PORT in .env
# 3. Missing environment variables - verify .env file
```

### API Returns Errors

```bash
# Check server logs
pm2 logs news-briefing-api

# Check MongoDB connection
# Look for "MongoDB connected successfully" in logs

# Restart application
pm2 restart news-briefing-api
```

### Environment Variables

```bash
# View current environment on server
ssh root@129.212.183.227
cd /root/POOSD/POOSD-LargeProject_Team12/backend
cat .env

# Update environment
nano .env
# Make changes, then restart:
pm2 restart news-briefing-api
```

---

## Rollback

To rollback to a previous version:

```bash
# SSH to server
ssh root@129.212.183.227
cd /root/POOSD/POOSD-LargeProject_Team12

# Find commit hash to rollback to
git log --oneline -n 10

# Checkout previous commit
git checkout <commit-hash>

# Rebuild and restart
cd backend
npm install
npm run build
pm2 restart news-briefing-api
```

---

## Security Best Practices

1. **Never commit `.env` files**

   - Use `.env.example` for templates
   - Store secrets in GitHub Secrets

2. **Rotate SSH keys** regularly

   - Update `SERVER_SSH_KEY` secret when rotating

3. **Use strong JWT secrets**

   - Generate with: `openssl rand -base64 64`

4. **Keep dependencies updated**

   - Run `npm audit` regularly
   - Update vulnerable packages

5. **Monitor logs** for suspicious activity
   - Check `pm2 logs` regularly
   - Set up alerts for errors

---

## Production Checklist

Before deploying to production:

- [ ] `.env` has production values (MongoDB URI, JWT secret)
- [ ] MongoDB Atlas IP whitelist includes server IP
- [ ] GitHub Secrets are configured correctly
- [ ] SSH key is properly set up
- [ ] PM2 is running and configured for auto-restart
- [ ] Server has adequate resources (RAM, disk space)
- [ ] Health endpoint returns 200 OK
- [ ] Test all API endpoints manually

---

## Support

**API not responding:**

- Check health: `curl http://129.212.183.227:3001/health`
- Check PM2: `pm2 status`
- Check logs: `pm2 logs`

**Deployment failing:**

- Check GitHub Actions logs
- Test build locally: `npm run build`
- Verify SSH access: `ssh root@129.212.183.227`

**Need to update environment:**

- SSH to server
- Edit `/root/POOSD/POOSD-LargeProject_Team12/backend/.env`
- Restart: `pm2 restart news-briefing-api`
