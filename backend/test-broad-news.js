/**
 * Test News API with broader search terms
 */

require('dotenv').config();

async function testBroadNewsAPI() {
  console.log('🧪 Testing News API with broader search...\n');
  
  try {
    const { NewsService } = require('./dist/backend/src/services/newsService');
    const newsService = new NewsService();
    
    // Test with very broad terms
    console.log('📰 Testing with broad terms: "news"');
    const articles1 = await newsService.fetchArticles(['news'], []);
    console.log(`   Found ${articles1.length} articles`);
    
    // Test with technology
    console.log('\n📰 Testing with "technology"');
    const articles2 = await newsService.fetchArticles(['technology'], []);
    console.log(`   Found ${articles2.length} articles`);
    
    // Test with business
    console.log('\n📰 Testing with "business"');
    const articles3 = await newsService.fetchArticles(['business'], []);
    console.log(`   Found ${articles3.length} articles`);
    
    // Show first article if any found
    const allArticles = [...articles1, ...articles2, ...articles3];
    if (allArticles.length > 0) {
      console.log('\n📄 Sample article:');
      const sample = allArticles[0];
      console.log(`   Title: ${sample.title}`);
      console.log(`   Source: ${sample.source.name}`);
      console.log(`   URL: ${sample.url}`);
    }
    
    console.log('\n🎉 News API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testBroadNewsAPI();

