require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'http://localhost:3002';
const TEST_EMAIL = `brieftest${Date.now()}@example.com`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFullBriefingFlow() {
  console.log('🧪 END-TO-END BRIEFING GENERATION TEST\n');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Register user
    console.log('📝 STEP 1: Registering user...');
    console.log(`   Email: ${TEST_EMAIL}\n`);
    
    await axios.post(`${BASE_URL}/api/auth/register`, {
      email: TEST_EMAIL,
      topics: ['technology', 'AI'],
      interests: ['machine learning', 'startups'],
      jobIndustry: 'tech',
      demographic: 'professional'
    });
    
    console.log('✅ User registered, waiting for OTP...\n');
    await sleep(3000);

    // Get fresh OTP from logs - find registration block with our email
    const logContent = fs.readFileSync('/tmp/test-server.log', 'utf8');
    
    // Split by registration blocks
    const regBlocks = logContent.split('🆕 NEW USER REGISTRATION');
    let otp = null;
    
    // Find the block with our email (most recent first)
    for (let i = regBlocks.length - 1; i >= 0; i--) {
      const block = regBlocks[i];
      if (block.includes(TEST_EMAIL)) {
        // Found our registration, extract OTP
        const otpMatch = block.match(/🔑 OTP Code: (\d{6})/);
        if (otpMatch) {
          otp = otpMatch[1];
          break;
        }
      }
    }

    if (!otp) {
      // Fallback: look for any OTP code near our email in recent lines
      const lines = logContent.split('\n');
      const emailIndex = lines.findIndex(line => line.includes(TEST_EMAIL));
      if (emailIndex >= 0) {
        // Look within 10 lines after email
        for (let i = emailIndex; i < Math.min(emailIndex + 10, lines.length); i++) {
          const otpMatch = lines[i].match(/🔑 OTP Code: (\d{6})/);
          if (otpMatch) {
            otp = otpMatch[1];
            break;
          }
        }
      }
    }

    if (!otp) {
      throw new Error('Could not find OTP for this email. Check server console manually.');
    }

    console.log(`🔐 STEP 2: Verifying OTP (${otp})...`);
    const verifyRes = await axios.post(`${BASE_URL}/api/auth/verify`, {
      email: TEST_EMAIL,
      code: otp
    });
    
    const token = verifyRes.data.token;
    if (!token) {
      throw new Error('No token received');
    }
    console.log('✅ Verified and authenticated!\n');

    // Step 3: Generate briefing
    console.log('📰 STEP 3: Generating briefing...');
    console.log('   Request will use user\'s saved preferences\n');
    
    const generateRes = await axios.post(
      `${BASE_URL}/api/briefings/generate`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const briefingId = generateRes.data.briefingId;
    console.log(`✅ Briefing created! ID: ${briefingId}\n`);

    // Step 4: Poll for completion
    console.log('⏳ STEP 4: Waiting for briefing processing...');
    console.log('   This may take 30-60 seconds (scraping articles + AI summary)\n');
    
    let status = 'queued';
    let attempts = 0;
    const maxAttempts = 90; // 3 minutes max

    while (status !== 'done' && status !== 'error' && attempts < maxAttempts) {
      await sleep(2000);
      attempts++;

      try {
        const statusRes = await axios.get(
          `${BASE_URL}/api/briefings/${briefingId}/status`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const newStatus = statusRes.data.status;
        const progress = statusRes.data.progress || 0;

        if (newStatus !== status) {
          status = newStatus;
          console.log(`   → Status: ${status.toUpperCase()} (${progress}%)`);
        } else if (attempts % 5 === 0) {
          process.stdout.write(`\r   Processing... ${progress}% (${attempts * 2}s)     `);
        }

        if (status === 'done') {
          console.log('\n✅ Briefing completed!\n');
          break;
        }

        if (status === 'error') {
          console.log('\n❌ Briefing failed!');
          console.log('   Reason:', statusRes.data.statusReason);
          return;
        }
      } catch (error) {
        console.log(`\n⚠️  Error checking status: ${error.message}`);
        break;
      }
    }

    if (status !== 'done') {
      console.log('\n⚠️  Timeout or error. Attempting to get briefing anyway...');
    }

    // Step 5: Get complete briefing
    console.log('\n📄 STEP 5: Retrieving complete briefing...\n');
    const briefingRes = await axios.get(
      `${BASE_URL}/api/briefings/${briefingId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const briefing = briefingRes.data;

    // Display full results
    console.log('='.repeat(70));
    console.log('📊 COMPLETE BRIEFING RESULTS');
    console.log('='.repeat(70));

    console.log(`\n📋 Request Parameters:`);
    console.log(`   Topics: ${briefing.request.topics.join(', ')}`);
    console.log(`   Interests: ${briefing.request.interests.join(', ')}`);
    if (briefing.request.jobIndustry) {
      console.log(`   Job Industry: ${briefing.request.jobIndustry}`);
    }
    if (briefing.request.demographic) {
      console.log(`   Demographic: ${briefing.request.demographic}`);
    }

    console.log(`\n📰 ARTICLES (${briefing.articles.length} total):`);
    console.log('-'.repeat(70));
    briefing.articles.forEach((article, i) => {
      console.log(`\n${i + 1}. ${article.title}`);
      console.log(`   Source: ${article.source?.name || article.source || 'Unknown'}`);
      console.log(`   URL: ${article.url}`);
      if (article.publishedAt) {
        console.log(`   Published: ${new Date(article.publishedAt).toLocaleString()}`);
      }
      if (article.content) {
        console.log(`   Content: ${article.content.length} characters`);
        const preview = article.content.substring(0, 200).replace(/\n/g, ' ');
        console.log(`   Preview: ${preview}...`);
      } else if (article.description) {
        console.log(`   Description: ${article.description.substring(0, 150)}...`);
      }
    });

    console.log(`\n🤖 AI-GENERATED SUMMARY:`);
    console.log('-'.repeat(70));
    if (briefing.summary && briefing.summary.sections) {
      briefing.summary.sections.forEach((section, i) => {
        console.log(`\n[${section.category.toUpperCase()}]`);
        console.log(section.text);
      });
      
      console.log(`\n📊 LLM Metadata:`);
      console.log(`   Provider: ${briefing.summary.llm.provider}`);
      console.log(`   Model: ${briefing.summary.llm.model}`);
      console.log(`   Input Tokens: ${briefing.summary.llm.inputTokens.toLocaleString()}`);
      console.log(`   Output Tokens: ${briefing.summary.llm.outputTokens.toLocaleString()}`);
      console.log(`   Total Tokens: ${(briefing.summary.llm.inputTokens + briefing.summary.llm.outputTokens).toLocaleString()}`);
    } else {
      console.log('   (No summary available)');
    }

    if (briefing.summary?.citations && briefing.summary.citations.length > 0) {
      console.log(`\n📚 Citations (${briefing.summary.citations.length}):`);
      briefing.summary.citations.forEach((cite, i) => {
        console.log(`   ${i + 1}. ${cite.title || 'Untitled'}`);
        if (cite.source) console.log(`      Source: ${cite.source}`);
      });
    }

    console.log(`\n⏱️  Processing Timeline:`);
    if (briefing.queuedAt) {
      console.log(`   Queued: ${new Date(briefing.queuedAt).toLocaleString()}`);
    }
    if (briefing.fetchStartedAt) {
      console.log(`   Fetch Started: ${new Date(briefing.fetchStartedAt).toLocaleString()}`);
    }
    if (briefing.summarizeStartedAt) {
      console.log(`   Summarize Started: ${new Date(briefing.summarizeStartedAt).toLocaleString()}`);
    }
    if (briefing.completedAt) {
      console.log(`   Completed: ${new Date(briefing.completedAt).toLocaleString()}`);
    }

    const duration = briefing.completedAt && briefing.queuedAt 
      ? Math.round((new Date(briefing.completedAt) - new Date(briefing.queuedAt)) / 1000)
      : null;
    if (duration) {
      console.log(`   Total Duration: ${duration} seconds`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 END-TO-END TEST COMPLETE!');
    console.log('='.repeat(70));

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data:`, JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`   Error: ${error.message}`);
    }
    if (error.stack) {
      console.error(`   Stack: ${error.stack.split('\n')[1]}`);
    }
    process.exit(1);
  }
}

testFullBriefingFlow();
