/**
 * Debug News API response
 */

require('dotenv').config();
const axios = require('axios');

async function debugNewsAPI() {
  console.log('🔍 Debugging News API...\n');
  
  try {
    const apiKey = process.env.NEWS_API_KEY;
    console.log('API Key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT FOUND');
    
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'technology',
        apiKey: apiKey,
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: 5,
        from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      timeout: 10000,
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

debugNewsAPI();

