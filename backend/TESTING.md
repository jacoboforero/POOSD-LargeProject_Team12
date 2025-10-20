# API Testing Guide

This document explains how to test the News Briefing API in different environments.

## Quick Start

### Local Development Testing

```bash
# Start the server
npm run dev

# In another terminal, run tests
npm run test:api:local
```

### Production Testing (Digital Ocean)

```bash
# Set your production URL
export API_BASE_URL="https://your-domain.com"
npm run test:api:prod
```

## Test Scripts Available

| Script                   | Description             | Environment   |
| ------------------------ | ----------------------- | ------------- |
| `npm run test:api`       | Basic test runner       | Configurable  |
| `npm run test:api:local` | Local development tests | Localhost     |
| `npm run test:api:prod`  | Production tests        | Digital Ocean |
| `npm run test:api:ts`    | TypeScript test runner  | Configurable  |

## Environment Configuration

### Local Development

```bash
# .env file
API_BASE_URL=http://localhost:3001
TEST_EMAIL=test@example.com
TEST_TIMEOUT=30000
VERBOSE=true
```

### Production (Digital Ocean)

```bash
# Environment variables
API_BASE_URL=https://your-domain.com
TEST_EMAIL=test@example.com
TEST_TIMEOUT=30000
VERBOSE=true
```

## Test Coverage

The test suite covers:

### ✅ Core Functionality

- **Health Check**: Server status and timestamp
- **CORS Headers**: Cross-origin request handling
- **Request ID**: Unique request tracking
- **Authentication**: OTP request and verification
- **User Endpoints**: Profile and usage data
- **Briefing Endpoints**: Generate, status, and retrieval
- **Error Handling**: 404s and validation errors
- **Rate Limiting**: Request throttling

### 🔧 Test Features

- **Environment Detection**: Automatically detects local vs production
- **Configurable Timeouts**: Adjustable request timeouts
- **Verbose Logging**: Detailed test output
- **Error Reporting**: Comprehensive error details
- **Success Metrics**: Pass/fail statistics

## Manual Testing Examples

### 1. Health Check

```bash
curl -X GET http://localhost:3001/health
```

### 2. OTP Flow

```bash
# Request OTP
curl -X POST http://localhost:3001/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Check console for OTP code, then verify
curl -X POST http://localhost:3001/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "code": "123456"}'
```

### 3. Authenticated Requests

```bash
# Get user profile (replace TOKEN with actual JWT)
curl -X GET http://localhost:3001/api/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Generate briefing
curl -X POST http://localhost:3001/api/briefings/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"topics": ["technology"]}'
```

## Production Deployment Testing

### Digital Ocean Setup

1. **Deploy your application** to Digital Ocean droplet
2. **Configure environment variables** on the server
3. **Set up SSL certificate** (Let's Encrypt recommended)
4. **Configure firewall** to allow HTTP/HTTPS traffic
5. **Test the deployment**:

```bash
# Test production deployment
export API_BASE_URL="https://your-domain.com"
npm run test:api:prod
```

### Production Checklist

- [ ] Server is accessible via HTTPS
- [ ] SSL certificate is valid
- [ ] CORS is configured for your frontend domain
- [ ] Environment variables are set
- [ ] Database is connected (when implemented)
- [ ] Rate limiting is working
- [ ] Health check endpoint responds

## Troubleshooting

### Common Issues

#### Server Not Running

```bash
# Check if server is running
curl http://localhost:3001/health

# Start server if not running
npm run dev
```

#### CORS Issues

- Check `FRONTEND_URL` environment variable
- Ensure frontend domain is whitelisted
- Verify CORS middleware is configured

#### Authentication Failures

- Check JWT secret is set
- Verify token format (Bearer TOKEN)
- Ensure token is not expired

#### Rate Limiting

- Check rate limit configuration
- Verify IP-based limiting
- Test with different IPs if needed

### Debug Mode

```bash
# Enable verbose logging
VERBOSE=true npm run test:api

# Increase timeout for slow connections
TEST_TIMEOUT=60000 npm run test:api
```

## Test Results Interpretation

### Success Indicators

- ✅ **Health Check**: Server responds with status "ok"
- ✅ **CORS**: Headers present in responses
- ✅ **Request ID**: Unique IDs in response headers
- ✅ **Authentication**: OTP endpoints accessible
- ✅ **Endpoints**: All API routes respond
- ✅ **Error Handling**: Proper error codes returned

### Failure Indicators

- ❌ **Connection Refused**: Server not running
- ❌ **Timeout**: Server too slow or unreachable
- ❌ **CORS Errors**: Frontend can't access API
- ❌ **Authentication Errors**: JWT issues
- ❌ **Validation Errors**: Request/response format issues

## Continuous Integration

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm install
      - run: npm run build
      - run: npm start &
      - run: sleep 5
      - run: npm run test:api
```

## Performance Testing

### Load Testing (Optional)

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    flow:
      - get:
          url: "/health"
      - post:
          url: "/api/auth/otp/request"
          json:
            email: "test@example.com"
EOF

# Run load test
artillery run load-test.yml
```

## Security Testing

### Basic Security Checks

- [ ] HTTPS is enforced in production
- [ ] CORS is properly configured
- [ ] Rate limiting is active
- [ ] Input validation is working
- [ ] Error messages don't leak sensitive info
- [ ] JWT tokens are properly validated

## Monitoring

### Health Monitoring

```bash
# Set up monitoring endpoint
curl -X GET https://your-domain.com/health

# Monitor response times
time curl -X GET https://your-domain.com/health
```

### Log Monitoring

- Check server logs for errors
- Monitor rate limiting triggers
- Watch for authentication failures
- Track briefing generation success rates

## Support

If you encounter issues:

1. **Check server logs** for error details
2. **Verify environment variables** are set correctly
3. **Test individual endpoints** with curl
4. **Check network connectivity** between client and server
5. **Review firewall settings** for production deployments

For additional help, refer to the main API documentation or contact the development team.
