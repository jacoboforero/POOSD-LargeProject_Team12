/**
 * Test real News API with actual API key
 */

require('dotenv').config();

async function testRealNewsAPI() {
  console.log('🧪 Testing Real News API...\n');
  
  try {
    const { NewsService } = require('./dist/backend/src/services/newsService');
    const newsService = new NewsService();
    
    console.log('📰 Fetching real articles...');
    const articles = await newsService.fetchArticles(['technology', 'AI'], ['machine learning']);
    
    console.log(`✅ Successfully fetched ${articles.length} articles:`);
    
    articles.slice(0, 3).forEach((article, index) => {
      console.log(`\n${index + 1}. ${article.title}`);
      console.log(`   Source: ${article.source.name}`);
      console.log(`   URL: ${article.url}`);
      console.log(`   Published: ${article.publishedAt.toISOString()}`);
    });
    
    if (articles.length > 3) {
      console.log(`\n... and ${articles.length - 3} more articles`);
    }
    
    console.log('\n🎉 Real News API test successful!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRealNewsAPI();

