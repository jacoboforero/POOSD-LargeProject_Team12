#!/bin/bash

# Test script for local development
echo "🧪 Testing API locally..."

# Set environment variables for local testing
export API_BASE_URL="http://localhost:3001"
export TEST_EMAIL="test@example.com"
export TEST_TIMEOUT="30000"
export VERBOSE="true"

# Check if server is running
echo "🔍 Checking if server is running..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start it with: npm run dev"
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
