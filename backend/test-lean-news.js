/**
 * Test the lean News API integration
 */

require('dotenv').config();

async function testLeanNewsIntegration() {
  console.log('🧪 Testing Lean News API Integration...\n');
  
  try {
    // Test NewsService instantiation
    console.log('1️⃣ Testing NewsService...');
    const { NewsService } = require('./dist/backend/src/services/newsService');
    const newsService = new NewsService();
    console.log('   ✅ NewsService created successfully');
    
    // Test BriefingService integration
    console.log('\n2️⃣ Testing BriefingService integration...');
    const { BriefingService } = require('./dist/backend/src/services/briefingService');
    const briefingService = new BriefingService();
    console.log('   ✅ BriefingService with NewsService created');
    
    console.log('\n🎉 Lean integration test passed!');
    console.log('\n📝 To test with real data:');
    console.log('   1. Get API key from https://newsapi.org/');
    console.log('   2. Update NEWS_API_KEY in .env');
    console.log('   3. Test briefing generation in Postman');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLeanNewsIntegration();
