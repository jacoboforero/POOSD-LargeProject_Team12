#!/bin/bash

# Server setup script for news briefing app
# Run this script ONCE on your server to set up the environment

set -e

echo "🔧 Setting up server for news briefing app..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
echo "📦 Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2 process manager..."
sudo npm install -g pm2

# Install Git if not already installed
echo "📦 Installing Git..."
sudo apt install -y git

# Create app directory
echo "📁 Creating application directory..."
mkdir -p /home/$USER/news-briefing-app
cd /home/$USER/news-briefing-app

# Clone the repository (replace with your actual repo URL)
echo "📥 Cloning repository..."
# git clone https://github.com/yourusername/your-repo.git .

# Set up environment variables
echo "🔐 Setting up environment variables..."
cat > .env << EOF
# Server Configuration
PORT=3001
NODE_ENV=production

# Frontend URL for CORS (update with your actual domain)
FRONTEND_URL=https://your-domain.com

# JWT Configuration
JWT_SECRET=33333bf9a79f0b4f40068983210508e3e76416b47c867a8b166df1aa6fbfa9813e9c15c892fc38d0c32db80c2a7371390fa1e465f5a5c4b2bfc9d4731de6edf6
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Database Configuration 
MONGODB_URI=mongodb+srv://root:root@main.amakhgx.mongodb.net/news-briefing?retryWrites=true&w=majority&appName=Main

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
EOF

echo "✅ Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Add your external API keys to the .env file (OpenAI, News API, Resend)"
echo "2. Update FRONTEND_URL with your actual domain"
echo "3. Clone your repository: git clone <your-repo-url> ."
echo "4. Install dependencies: cd backend && npm install"
echo "5. Start the application: pm2 start dist/index.js --name news-briefing-api"
echo "6. Save PM2 configuration: pm2 save"
echo "7. Set up PM2 to start on boot: pm2 startup"
