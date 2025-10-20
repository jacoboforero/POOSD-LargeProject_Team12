#!/bin/bash

# Test script for production (Digital Ocean)
echo "🧪 Testing API in production..."

# Check if API_BASE_URL is set
if [ -z "$API_BASE_URL" ]; then
    echo "❌ API_BASE_URL environment variable is required"
    echo "Usage: API_BASE_URL=https://your-domain.com ./scripts/test-production.sh"
    exit 1
fi

# Set default environment variables for production testing
export TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
export TEST_TIMEOUT="${TEST_TIMEOUT:-30000}"
export VERBOSE="${VERBOSE:-true}"

echo "🌍 Testing against: $API_BASE_URL"

# Check if server is accessible
echo "🔍 Checking if server is accessible..."
if curl -s "$API_BASE_URL/health" > /dev/null; then
    echo "✅ Server is accessible"
else
    echo "❌ Server is not accessible at $API_BASE_URL"
    echo "Please check:"
    echo "  - Server is running"
    echo "  - URL is correct"
    echo "  - Firewall allows connections"
    echo "  - SSL certificate is valid (if using HTTPS)"
    exit 1
fi

# Run the tests
echo "🚀 Running API tests..."
node test-api.js

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed!"
    exit 1
fi
