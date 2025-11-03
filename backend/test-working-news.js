/**
 * Test News API with working search terms
 */

require('dotenv').config();
const axios = require('axios');

async function testWorkingNewsAPI() {
  console.log('🧪 Testing News API with working search terms...\n');
  
  try {
    const apiKey = process.env.NEWS_API_KEY;
    
    // Try different search terms and time ranges
    const searches = [
      { q: 'bitcoin', hours: 24 },
      { q: 'tesla', hours: 24 },
      { q: 'apple', hours: 24 },
      { q: 'news', hours: 1 }, // Very recent
      { q: 'breaking', hours: 1 },
    ];
    
    for (const search of searches) {
      console.log(`📰 Searching for "${search.q}" in last ${search.hours} hours...`);
      
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: search.q,
          apiKey: apiKey,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: 3,
          from: new Date(Date.now() - search.hours * 60 * 60 * 1000).toISOString(),
        },
        timeout: 10000,
      });
      
      const articles = response.data.articles || [];
      console.log(`   Found ${articles.length} articles`);
      
      if (articles.length > 0) {
        console.log(`   Sample: ${articles[0].title}`);
        console.log(`   Source: ${articles[0].source?.name}`);
        break; // Found articles, stop searching
      }
    }
    
    // If no articles found, try without date restriction
    console.log('\n📰 Trying without date restriction...');
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'technology',
        apiKey: apiKey,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 3,
      },
      timeout: 10000,
    });
    
    const articles = response.data.articles || [];
    console.log(`   Found ${articles.length} articles`);
    
    if (articles.length > 0) {
      console.log('\n📄 Sample articles:');
      articles.forEach((article, index) => {
        console.log(`\n${index + 1}. ${article.title}`);
        console.log(`   Source: ${article.source?.name}`);
        console.log(`   URL: ${article.url}`);
        console.log(`   Published: ${article.publishedAt}`);
      });
    }
    
    console.log('\n🎉 News API test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testWorkingNewsAPI();

