#!/bin/bash

# Simple deployment script - run this on the server after pushing changes

set -e

echo "🚀 Starting deployment..."

cd /root/POOSD/POOSD-LargeProject_Team12/backend

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm ci

echo "🔨 Building application..."
npm run build

echo "🔄 Restarting PM2 process..."
pm2 restart news-briefing-api || pm2 start ecosystem.config.js

echo "💾 Saving PM2 configuration..."
pm2 save

echo "✅ Deployment complete!"
pm2 status

