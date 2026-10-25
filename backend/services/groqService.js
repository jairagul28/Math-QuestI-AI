const Groq = require('groq-sdk');

class GroqService {
  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
    this.client = null;
    this.initClient();
  }

  initClient() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

    if (this.apiKey && this.apiKey.trim() !== '') {
      try {
        this.client = new Groq({
          apiKey: this.apiKey,
          timeout: 25000, // 25s timeout
          maxRetries: 2,
        });
        console.log(`[GroqService] Initialized Groq client with model: ${this.model}`);
      } catch (err) {
        console.warn(`[GroqService] Initialization error: ${err.message}`);
        this.client = null;
      }
    } else {
      console.warn('[GroqService] Warning: GROQ_API_KEY is not configured in environment. AI generation calls will be mocked or deferred.');
      this.client = null;
    }
  }

  isConfigured() {
    if (!this.client && process.env.GROQ_API_KEY) {
      this.initClient();
    }
    return Boolean(this.client && this.apiKey);
  }

  getModel() {
    return this.model;
  }

  /**
   * Complete a chat completion request with structured JSON response support.
   * Prepared for Phase 2 implementation.
   *
   * @param {Object} options
   * @param {Array<{role: string, content: string}>} options.messages
   * @param {boolean} [options.jsonMode=false]
   * @param {number} [options.temperature=0.7]
   * @param {number} [options.maxTokens=1500]
   * @returns {Promise<any>}
   */
  async generateCompletion({ messages, jsonMode = false, temperature = 0.7, maxTokens = 1500 }) {
    if (!this.isConfigured()) {
      throw new Error(
        'Groq API is not configured. Please supply a valid GROQ_API_KEY in backend/.env'
      );
    }

    try {
      const requestOptions = {
        model: this.model,
        messages,
        temperature,
        max_tokens: maxTokens,
      };

      if (jsonMode) {
        requestOptions.response_format = { type: 'json_object' };
      }

      const response = await this.client.chat.completions.create(requestOptions);
      const content = response.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Groq returned an empty response.');
      }

      if (jsonMode) {
        try {
          return JSON.parse(content);
        } catch (parseError) {
          throw new Error(`Failed to parse Groq response as JSON: ${parseError.message}`);
        }
      }

      return content;
    } catch (error) {
      console.error('[GroqService] API Call failed:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new GroqService();

