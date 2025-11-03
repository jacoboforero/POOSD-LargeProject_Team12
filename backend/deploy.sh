#!/bin/bash

# Simple deployment script - run this on the server after pushing changes
# Deployment tested and working - 2024

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
# Check if process exists
if pm2 list | grep -q "news-briefing-api"; then
  echo "   Process exists, restarting..."
  pm2 restart news-briefing-api
else
  echo "   Process not found, starting..."
  pm2 start ecosystem.config.js
fi

echo "⏳ Waiting for process to start..."
sleep 3

echo "🔍 Verifying process status..."
pm2 status

# Check if process is actually running
if pm2 list | grep "news-briefing-api" | grep -q "online"; then
  echo "✅ Process is online!"
else
  echo "⚠️  WARNING: Process may not be running correctly!"
  echo "📋 Recent logs:"
  pm2 logs news-briefing-api --lines 10 --nostream || true
fi

echo "💾 Saving PM2 configuration..."
pm2 save

echo "✅ Deployment complete!"

