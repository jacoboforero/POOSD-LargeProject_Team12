# 🚀 Backend Setup Guide

Quick setup instructions for the News Briefing Backend API.

## 📋 **Prerequisites**

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** (for cloning the repository)

## 🛠️ **Installation**

### **1. Navigate to Backend Directory**

```bash
cd backend
```

### **2. Install Dependencies**

```bash
npm install
```

### **3. Set Up Environment Variables**

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file (optional)
nano .env
```

### **4. Start the Server**

**Option A: JavaScript Version (Recommended for testing)**

```bash
node schema-integrated-server.js
```

**Option B: TypeScript Version (Requires MongoDB)**

```bash
npm run dev
```

## ✅ **Verify Installation**

### **1. Check Server Status**

```bash
curl http://localhost:3001/health
```

**Expected Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-10-22T22:40:34.603Z"
}
```

### **2. Run Automated Tests**

```bash
npm run test:api
```

**Expected Output:**

```
✅ Health Check
✅ OTP Request
✅ OTP Verify
✅ Get User Profile
✅ Get Usage
✅ Generate Briefing
✅ Get Briefing Status
✅ Get Briefing Details
✅ Error Handling
✅ Rate Limiting
✅ 404 Handling
```

## 🔧 **Environment Configuration**

### **Required Variables**

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Quota Configuration
DAILY_QUOTA_LIMIT=10
MONTHLY_QUOTA_LIMIT=100
```

### **Optional Variables (for TypeScript version)**

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/news-briefing
```

## 🧪 **Quick Test**

### **Test Authentication Flow**

```bash
# 1. Request OTP
curl -X POST http://localhost:3001/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Verify OTP
curl -X POST http://localhost:3001/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'
```

### **Test Authenticated Endpoint**

```bash
# Use the token from step 2
curl -X GET http://localhost:3001/api/me \
  -H "Authorization: Bearer mock-jwt-token"
```

## 🚨 **Troubleshooting**

### **Port Already in Use**

```bash
# Check what's using port 3001
lsof -i :3001

# Kill the process
kill -9 $(lsof -t -i:3001)
```

### **Dependencies Issues**

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### **Database Connection Issues**

```bash
# Use JavaScript version (no database required)
node schema-integrated-server.js
```

### **Permission Issues**

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

## 📁 **File Structure**

```
backend/
├── src/                          # TypeScript source
├── schema-integrated-server.js   # Working JavaScript version
├── test-api.js                   # Test script
├── package.json                  # Dependencies
├── .env                          # Environment variables
├── README.md                     # Main documentation
├── API_DOCUMENTATION.md         # API reference
├── SETUP.md                     # This file
└── TESTING.md                   # Testing guide
```

## 🎯 **Next Steps**

1. **Test the API** with Postman or curl
2. **Read the documentation** in README.md
3. **Explore the endpoints** in API_DOCUMENTATION.md
4. **Run comprehensive tests** with TESTING.md

## 📚 **Additional Resources**

- **[Main README](./README.md)** - Complete overview
- **[API Documentation](./API_DOCUMENTATION.md)** - Detailed API reference
- **[Testing Guide](./TESTING.md)** - Comprehensive testing instructions

## 🆘 **Need Help?**

If you encounter issues:

1. **Check the logs** for error messages
2. **Verify environment variables** are set correctly
3. **Test individual endpoints** with curl
4. **Review the documentation** for correct usage
5. **Check the troubleshooting section** above

**Happy coding!** 🚀
