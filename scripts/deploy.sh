#!/bin/bash

# Deployment script for news briefing app
# This script runs on the server to deploy the application

set -e  # Exit on any error

echo "🚀 Starting deployment..."

# Navigate to app directory
cd /home/$USER/news-briefing-app

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install/update dependencies
echo "📦 Installing dependencies..."
cd backend
npm ci --production

# Build the application
echo "🔨 Building application..."
npm run build

# Restart the application with PM2
echo "🔄 Restarting application..."
pm2 restart news-briefing-api || pm2 start dist/index.js --name news-briefing-api

# Save PM2 configuration
pm2 save

echo "✅ Deployment completed successfully!"
echo "📊 Application status:"
pm2 status
echo ""
echo "🌐 Health check:"
echo "curl http://129.212.183.227:3001/health"
