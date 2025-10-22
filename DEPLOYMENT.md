# 🚀 Deployment Guide

This guide explains how to set up automated deployment for the news briefing app.

## 📋 Prerequisites

- GitHub repository with your code
- DigitalOcean Droplet (Ubuntu server)
- SSH access to your server
- GitHub repository secrets configured

## 🔧 Server Setup (One-time)

### 1. Connect to your server

```bash
ssh root@your-server-ip
```

### 2. Run the setup script

```bash
# Download and run the setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/your-repo/main/scripts/setup-server.sh | bash
```

### 3. Configure your environment

```bash
# Edit the .env file with your actual values
nano /home/$USER/news-briefing-app/.env
```

### 4. Clone your repository

```bash
cd /home/$USER/news-briefing-app
git clone https://github.com/yourusername/your-repo.git .
```

### 5. Install dependencies and start the app

```bash
cd backend
npm install
npm run build
pm2 start dist/index.js --name news-briefing-api
pm2 save
pm2 startup  # Follow the instructions to enable auto-start
```

## 🔐 GitHub Secrets Configuration

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

| Secret Name      | Description                       | Example                                  |
| ---------------- | --------------------------------- | ---------------------------------------- |
| `SERVER_HOST`    | Your server IP address            | `123.456.789.0`                          |
| `SERVER_USER`    | SSH username                      | `root` or `ubuntu`                       |
| `SERVER_SSH_KEY` | Private SSH key for server access | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

### How to get your SSH key:

```bash
# On your local machine, generate SSH key if you don't have one
ssh-keygen -t ed25519 -C "your-email@example.com"

# Copy the public key to your server
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@your-server-ip

# Copy the private key content for GitHub secrets
cat ~/.ssh/id_ed25519
```

## 🚀 How Deployment Works

### Development Workflow:

1. **Develop locally** on your feature branch
2. **Test locally** with `npm run dev`
3. **Push to GitHub** - creates a pull request
4. **Merge to main** - triggers automatic deployment
5. **GitHub Actions** automatically deploys to your server

### What happens during deployment:

1. GitHub Actions checks out your code
2. Installs dependencies
3. Builds the application
4. Connects to your server via SSH
5. Pulls latest changes
6. Installs production dependencies
7. Builds the application
8. Restarts the app with PM2

## 📊 Monitoring

### Check application status:

```bash
pm2 status
pm2 logs news-briefing-api
pm2 monit
```

### View deployment logs:

- Go to your GitHub repository
- Click on **Actions** tab
- Click on the latest deployment run
- View the logs for any issues

## 🔄 Manual Deployment

If you need to deploy manually:

```bash
# On your server
cd /home/$USER/news-briefing-app
./scripts/deploy.sh
```

## 🛠️ Troubleshooting

### Common issues:

1. **SSH connection fails**

   - Check your SSH key is correct in GitHub secrets
   - Verify server IP and username
   - Test SSH connection manually

2. **Build fails**

   - Check Node.js version on server (should be 20+)
   - Verify all dependencies are installed
   - Check for TypeScript compilation errors

3. **PM2 issues**
   - Check PM2 is installed: `pm2 --version`
   - Restart PM2: `pm2 restart news-briefing-api`
   - Check logs: `pm2 logs news-briefing-api`

### Health check:

```bash
# Test if your app is running
curl http://129.212.183.227:3001/health
```

## 📝 Environment Variables

Make sure these are set in your server's `.env` file:

```bash
# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL for CORS (update with your actual domain)
FRONTEND_URL=https://your-domain.com

# JWT Configuration
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/news-briefing?retryWrites=true&w=majority&appName=Main

# Quota Configuration
DAILY_QUOTA_LIMIT=10
MONTHLY_QUOTA_LIMIT=100

# Production-specific settings
API_BASE_URL=129.212.183.227

# External APIs (add your actual keys)
OPENAI_API_KEY=sk-...
NEWS_API_KEY=your-news-api-key
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-resend-key
```

## 🎯 Next Steps

1. Set up your server using the setup script
2. Configure GitHub secrets
3. Push your code to trigger the first deployment
4. Monitor the deployment in GitHub Actions
5. Test your deployed application

Your automated deployment pipeline is now ready! 🎉
