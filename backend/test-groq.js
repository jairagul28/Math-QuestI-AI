const dotenv = require('dotenv');
const path = require('path');

// 1. Load environment configuration from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

const groqService = require('./services/groqService');

async function testGroqIntegration() {
  console.log('======================================================');
  console.log('🤖 TESTING GROQ API INTEGRATION (MathQuest AI Backend)');
  console.log('======================================================');

  // Verify key presence without exposing it
  const hasKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  const modelName = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

  console.log('Configuration Check:');
  console.log(`  • GROQ_API_KEY Present: ${hasKey ? 'YES (Key securely loaded, never displayed)' : 'NO'}`);
  console.log(`  • Configured Model:     ${modelName}`);
  console.log(`  • Service Configured:   ${groqService.isConfigured() ? 'YES' : 'NO'}`);

  if (!hasKey) {
    console.error('\n❌ Error: GROQ_API_KEY is missing or empty in backend/.env.');
    process.exit(1);
  }

  // 2. Prepare test prompt: "What is 12 + 8?"
  const messages = [
    {
      role: 'user',
      content: 'What is 12 + 8?',
    },
  ];

  console.log('\nSending test request to Groq API...');
  console.log('  Prompt: "What is 12 + 8?"');

  const startTime = Date.now();

  try {
    const response = await groqService.generateCompletion({
      messages,
      temperature: 0.2,
      maxTokens: 1000,
    });

    const duration = Date.now() - startTime;

    console.log(`\n✅ Groq API responded successfully in ${duration}ms!`);
    console.log(`Response content: "${response.trim()}"`);

    // 3. Verify response contains 20
    const contains20 = response.includes('20');
    console.log('\nAnswer Verification:');
    if (contains20) {
      console.log('  ✅ [PASS] The Groq API response successfully contains "20".');
    } else {
      console.warn('  ⚠️ [WARN] Response received, but "20" was not detected verbatim.');
    }

    // 4. Check for authentication, model availability, or rate-limit errors
    console.log('\nDiagnostic Checks:');
    console.log('  • Authentication Error:       None (API key authenticated successfully)');
    console.log(`  • Model Availability Error:   None (Model "${modelName}" is active and responded)`);
    console.log('  • Rate-Limit Error:           None (Request fulfilled within rate limits)');
    console.log('======================================================\n');
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`\n❌ Groq API Call Failed after ${duration}ms:`);

    let errorMsg = error.message || 'Unknown error';
    if (process.env.GROQ_API_KEY) {
      errorMsg = errorMsg.replaceAll(process.env.GROQ_API_KEY, '[REDACTED_API_KEY]');
    }

    console.error(`  Error Message: ${errorMsg}`);

    if (error.status === 401 || error.statusCode === 401 || errorMsg.includes('401') || errorMsg.toLowerCase().includes('invalid api key')) {
      console.error('  Diagnosis: Authentication Error — The GROQ_API_KEY provided is invalid.');
    } else if (error.status === 404 || error.statusCode === 404 || errorMsg.toLowerCase().includes('model') || errorMsg.toLowerCase().includes('not found')) {
      console.error(`  Diagnosis: Model Availability Error — Model "${modelName}" is unavailable.`);
    } else if (error.status === 429 || error.statusCode === 429 || errorMsg.toLowerCase().includes('rate limit')) {
      console.error('  Diagnosis: Rate Limit Error — Exceeded rate or token quota.');
    } else {
      console.error('  Diagnosis: Network or Service Exception.');
    }

    console.log('======================================================\n');
    process.exit(1);
  }
}

testGroqIntegration();

