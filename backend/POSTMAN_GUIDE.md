# 📮 Postman Testing Guide

Complete guide for testing the News Briefing API with Postman.

## 🚀 **Quick Start**

1. **Start the server** (see [SETUP.md](./SETUP.md))
2. **Open Postman**
3. **Follow the testing flow** below
4. **Use the provided examples** for each endpoint

---

## 📋 **Testing Flow**

### **Step 1: Health Check**

- **Method:** `GET`
- **URL:** `http://localhost:3001/health`
- **Headers:** None
- **Expected:** `{"status":"ok","timestamp":"..."}`

### **Step 2: Request OTP**

- **Method:** `POST`
- **URL:** `http://localhost:3001/api/auth/otp/request`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "email": "test@example.com"
}
```

- **Expected:** `{"success":true}`

### **Step 3: Verify OTP**

- **Method:** `POST`
- **URL:** `http://localhost:3001/api/auth/otp/verify`
- **Headers:** `Content-Type: application/json`
- **Body:**

```json
{
  "email": "test@example.com",
  "code": "123456"
}
```

- **Expected:** JWT token and user object
- **Save the token for authenticated requests!**

### **Step 4: Test User Profile**

- **Method:** `GET`
- **URL:** `http://localhost:3001/api/me`
- **Headers:** `Authorization: Bearer mock-jwt-token`
- **Expected:** User profile object

### **Step 5: Test Usage Stats**

- **Method:** `GET`
- **URL:** `http://localhost:3001/api/me/usage`
- **Headers:** `Authorization: Bearer mock-jwt-token`
- **Expected:** Usage statistics

### **Step 6: Generate Briefing**

- **Method:** `POST`
- **URL:** `http://localhost:3001/api/briefings/generate`
- **Headers:**
  - `Authorization: Bearer mock-jwt-token`
  - `Content-Type: application/json`
- **Body:**

```json
{
  "topics": ["technology", "AI"],
  "interests": ["machine learning"],
  "jobIndustry": "tech",
  "demographic": "professional"
}
```

- **Expected:** `{"briefingId":"some-uuid"}`
- **Save the briefingId for next steps!**

### **Step 7: Check Briefing Status**

- **Method:** `GET`
- **URL:** `http://localhost:3001/api/briefings/{briefingId}/status`
- **Headers:** `Authorization: Bearer mock-jwt-token`
- **Note:** Replace `{briefingId}` with the ID from step 6
- **Expected:** Status object

### **Step 8: Get Briefing Details**

- **Method:** `GET`
- **URL:** `http://localhost:3001/api/briefings/{briefingId}`
- **Headers:** `Authorization: Bearer mock-jwt-token`
- **Note:** Replace `{briefingId}` with the ID from step 6
- **Expected:** Full briefing with articles

---

## 📝 **Postman Collection Setup**

### **Create a New Collection**

1. **Open Postman**
2. **Click "New" → "Collection"**
3. **Name it:** "News Briefing API"
4. **Add description:** "Complete API testing for News Briefing Backend"

### **Environment Variables**

1. **Click "Environments" → "New Environment"**
2. **Name:** "News Briefing Local"
3. **Add variables:**
   - `base_url`: `http://localhost:3001`
   - `jwt_token`: `mock-jwt-token`
   - `briefing_id`: (will be set dynamically)

### **Request Templates**

#### **1. Health Check**

```
GET {{base_url}}/health
```

#### **2. Request OTP**

```
POST {{base_url}}/api/auth/otp/request
Content-Type: application/json

{
  "email": "test@example.com"
}
```

#### **3. Verify OTP**

```
POST {{base_url}}/api/auth/otp/verify
Content-Type: application/json

{
  "email": "test@example.com",
  "code": "123456"
}
```

#### **4. Get User Profile**

```
GET {{base_url}}/api/me
Authorization: Bearer {{jwt_token}}
```

#### **5. Get User Usage**

```
GET {{base_url}}/api/me/usage
Authorization: Bearer {{jwt_token}}
```

#### **6. Generate Briefing**

```
POST {{base_url}}/api/briefings/generate
Authorization: Bearer {{jwt_token}}
Content-Type: application/json

{
  "topics": ["technology", "AI"],
  "interests": ["machine learning"],
  "jobIndustry": "tech",
  "demographic": "professional"
}
```

#### **7. Get Briefing Status**

```
GET {{base_url}}/api/briefings/{{briefing_id}}/status
Authorization: Bearer {{jwt_token}}
```

#### **8. Get Briefing Details**

```
GET {{base_url}}/api/briefings/{{briefing_id}}
Authorization: Bearer {{jwt_token}}
```

---

## 🔧 **Advanced Postman Features**

### **Pre-request Scripts**

Add this to the "Generate Briefing" request to automatically set the briefing ID:

```javascript
// This will run before the request
console.log("Generating briefing...");
```

### **Tests Scripts**

Add this to the "Generate Briefing" request to automatically save the briefing ID:

```javascript
// This will run after the request
if (pm.response.code === 200) {
  const response = pm.response.json();
  pm.environment.set("briefing_id", response.briefingId);
  console.log("Briefing ID saved:", response.briefingId);
}
```

### **Collection Runner**

1. **Click "Runner" in Postman**
2. **Select your collection**
3. **Set iterations:** 1
4. **Click "Start"**
5. **Watch all requests execute automatically**

---

## 📊 **Test Data Examples**

### **Minimal Briefing Request**

```json
{
  "topics": ["news"]
}
```

### **Technology Briefing**

```json
{
  "topics": ["technology", "AI"],
  "interests": ["machine learning", "data science"],
  "jobIndustry": "tech",
  "demographic": "professional"
}
```

### **Business Briefing**

```json
{
  "topics": ["business", "finance"],
  "interests": ["startups", "investment"],
  "jobIndustry": "finance",
  "demographic": "executive"
}
```

### **Science Briefing**

```json
{
  "topics": ["science", "research"],
  "interests": ["climate change", "space"],
  "jobIndustry": "academia",
  "demographic": "researcher"
}
```

---

## 🧪 **Testing Scenarios**

### **Scenario 1: Complete User Flow**

1. Health check
2. Request OTP
3. Verify OTP
4. Get user profile
5. Get usage stats
6. Generate briefing
7. Check briefing status
8. Get briefing details

### **Scenario 2: Error Handling**

1. Test invalid email format
2. Test wrong OTP code
3. Test missing authorization
4. Test invalid briefing ID
5. Test rate limiting

### **Scenario 3: Rate Limiting**

1. Send 100+ requests quickly
2. Check rate limit headers
3. Verify 429 status code
4. Wait for reset and retry

---

## 🔍 **Response Validation**

### **Health Check Response**

```json
{
  "status": "ok",
  "timestamp": "2025-10-22T22:40:34.603Z"
}
```

### **OTP Request Response**

```json
{
  "success": true
}
```

### **OTP Verify Response**

```json
{
  "token": "mock-jwt-token",
  "user": {
    "_id": "mock-user-id",
    "email": "test@example.com",
    "emailVerified": true,
    "preferences": {
      "topics": [],
      "interests": [],
      "jobIndustry": "",
      "demographic": ""
    },
    "timezone": "UTC",
    "notificationPrefs": {
      "email": true,
      "push": false,
      "frequency": "daily"
    },
    "createdAt": "2025-10-22T22:40:43.520Z",
    "updatedAt": "2025-10-22T22:40:43.520Z"
  }
}
```

### **Briefing Generation Response**

```json
{
  "briefingId": "eec102de-121b-4f9f-8747-7c7de2be1000"
}
```

### **Briefing Status Response**

```json
{
  "_id": "eec102de-121b-4f9f-8747-7c7de2be1000",
  "status": "done",
  "createdAt": "2025-10-22T22:40:46.960Z",
  "updatedAt": "2025-10-22T22:40:46.960Z"
}
```

---

## 🚨 **Common Issues**

### **Server Not Running**

- **Error:** Connection refused
- **Solution:** Start server with `node schema-integrated-server.js`

### **CORS Issues**

- **Error:** CORS policy blocks request
- **Solution:** Check `FRONTEND_URL` environment variable

### **Authentication Issues**

- **Error:** 401 Unauthorized
- **Solution:** Use `mock-jwt-token` or get fresh token from OTP flow

### **JSON Parsing Errors**

- **Error:** SyntaxError in JSON
- **Solution:** Check Content-Type header is `application/json`

### **Rate Limiting**

- **Error:** 429 Too Many Requests
- **Solution:** Wait 15 minutes or restart server

---

## 📚 **Additional Resources**

- **[Main README](./README.md)** - Complete overview
- **[API Documentation](./API_DOCUMENTATION.md)** - Detailed API reference
- **[Setup Guide](./SETUP.md)** - Installation instructions
- **[Testing Guide](./TESTING.md)** - Comprehensive testing

---

## 🎉 **Success Indicators**

- ✅ **Health check** returns 200 OK
- ✅ **OTP request** returns success
- ✅ **OTP verify** returns JWT token
- ✅ **User profile** returns user data
- ✅ **Usage stats** returns quota info
- ✅ **Briefing generation** returns briefing ID
- ✅ **Briefing status** shows processing status
- ✅ **Briefing details** returns complete briefing

**Happy testing!** 🚀
