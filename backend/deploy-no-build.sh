#!/bin/bash

# Deployment script for automated deployment (build is done in GitHub Actions)
# This script skips building and just installs dependencies and restarts
# Updated to avoid OOM issues on low-memory servers
# Test deployment - verifying file exists on server

set -e

echo "🚀 Starting deployment (no build step)..."

# Go directly to backend directory
# NOTE: Files are already copied by GitHub Actions via SCP
cd /root/POOSD/POOSD-LargeProject_Team12/backend

echo "📦 Installing production dependencies..."
npm ci --omit=dev

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

