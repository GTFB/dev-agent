#!/usr/bin/env bun

/**
 * LLM Translation Service
 * Uses AI/LLM for real translation instead of i18n dictionaries
 */

export interface LLMTranslationRequest {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
}

export interface LLMTranslationResponse {
  success: boolean;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  error?: string;
  model?: string;
}

export interface LLMProvider {
  name: "openai" | "gemini" | "anthropic" | "custom";
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelayMs: number;
  backoffMultiplier: number;
}

export class LLMTranslationService {
  private provider?: LLMProvider;
  private defaultModel: string = "gpt-3.5-turbo";
  private configManager?: {
    getRetryConfig(): RetryConfig | undefined;
    setRetryConfig(config: RetryConfig): Promise<void>;
  };
  private retryConfig: RetryConfig = {
    maxRetries: 2,
    retryDelayMs: 20000, // 20 seconds
    backoffMultiplier: 1.5,
  };

  constructor(provider?: LLMProvider) {
    this.provider = provider;
  }

  /**
   * Set config manager for persistent storage
   */
  setConfigManager(configManager: {
    getRetryConfig(): RetryConfig | undefined;
    setRetryConfig(config: RetryConfig): Promise<void>;
  }): void {
    this.configManager = configManager;

    // Load retry config from persistent storage
    this.loadRetryConfig();
  }

  /**
   * Load retry configuration from config manager
   */
  private loadRetryConfig(): void {
    if (this.configManager) {
      const savedConfig = this.configManager.getRetryConfig();
      if (savedConfig) {
        this.retryConfig = savedConfig;
        console.log(
          "📋 Loaded retry configuration from persistent storage:",
          savedConfig,
        );
      }
    }
  }

  /**
   * Set retry configuration
   */
  async setRetryConfig(config: Partial<RetryConfig>): Promise<void> {
    this.retryConfig = { ...this.retryConfig, ...config };

    // Save to persistent storage
    if (this.configManager) {
      try {
        await this.configManager.setRetryConfig(this.retryConfig);
        console.log("💾 Retry configuration saved to persistent storage");
      } catch (error) {
        console.warn("Failed to save retry configuration:", error);
      }
    }
  }

  /**
   * Get retry configuration
   */
  getRetryConfig(): RetryConfig {
    return { ...this.retryConfig };
  }

  /**
   * Translate text using LLM with retry logic and provider fallback
   */
  async translate(
    request: LLMTranslationRequest,
  ): Promise<LLMTranslationResponse> {
    try {
      if (!this.provider?.apiKey) {
        return this.fallbackTranslation(request);
      }

      const prompt = this.buildTranslationPrompt(request);

      // Try with current provider with retries
      const response = await this.translateWithRetry(prompt);

      if (response.success && response.translatedText) {
        return {
          success: true,
          originalText: request.text,
          translatedText: response.translatedText,
          sourceLanguage: request.sourceLanguage,
          targetLanguage: request.targetLanguage,
          confidence: 0.9,
          model: this.provider.model || this.defaultModel,
        };
      } else {
        // Try alternative providers if available
        const alternativeResponse = await this.tryAlternativeProviders(prompt);
        if (alternativeResponse.success && alternativeResponse.translatedText) {
          return {
            success: true,
            originalText: request.text,
            translatedText: alternativeResponse.translatedText,
            sourceLanguage: request.sourceLanguage,
            targetLanguage: request.targetLanguage,
            confidence: 0.8, // Slightly lower confidence for alternative provider
            model: alternativeResponse.model || "alternative",
          };
        }

        return this.fallbackTranslation(request);
      }
    } catch (error) {
      console.warn("LLM translation failed, using fallback:", error);
      return this.fallbackTranslation(request);
    }
  }

  /**
   * Build translation prompt for LLM
   */
  private buildTranslationPrompt(request: LLMTranslationRequest): string {
    const context = request.context ? `Context: ${request.context}\n` : "";

    return `You are a professional translator. Translate the following text from ${request.sourceLanguage} to ${request.targetLanguage}.

${context}Rules:
- Maintain the original meaning and tone
- Keep technical terms accurate
- Preserve formatting and structure
- Return ONLY the translated text, nothing else

Text to translate:
"${request.text}"

Translated text:`;
  }

  /**
   * Translate with retry logic for rate limits
   */
  private async translateWithRetry(
    prompt: string,
  ): Promise<{ success: boolean; translatedText?: string; model?: string }> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await this.callLLM(prompt);
        if (response.success) {
          return response;
        }
      } catch (error) {
        lastError = error as Error;

        // Check if it's a rate limit error that we should retry
        if (
          this.shouldRetry(error as Error) &&
          attempt < this.retryConfig.maxRetries
        ) {
          const delay =
            this.retryConfig.retryDelayMs *
            Math.pow(this.retryConfig.backoffMultiplier, attempt);
          console.log(
            `Rate limit hit, retrying in ${delay / 1000} seconds... (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1})`,
          );
          await this.sleep(delay);
          continue;
        }

        // Don't retry for other errors
        break;
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error("Translation failed after all retry attempts");
  }

  /**
   * Try alternative providers if current one fails
   */
  private async tryAlternativeProviders(
    prompt: string,
  ): Promise<{ success: boolean; translatedText?: string; model?: string }> {
    if (!this.configManager) {
      return { success: false };
    }

    const allProviders = this.configManager.getAllProviders();
    const currentProviderName = this.provider?.name;

    // Try other providers in order of preference
    const providerOrder = ["gemini", "openai", "anthropic"];

    for (const providerName of providerOrder) {
      if (providerName === currentProviderName || !allProviders[providerName]) {
        continue;
      }

      const alternativeProvider = allProviders[providerName];
      console.log(`Trying alternative provider: ${providerName}`);

      try {
        const response = await this.callLLMWithProvider(
          prompt,
          alternativeProvider,
        );
        if (response.success) {
          console.log(
            `Successfully used alternative provider: ${providerName}`,
          );
          return response;
        }
      } catch (error) {
        console.warn(`Alternative provider ${providerName} failed:`, error);
        continue;
      }
    }

    return { success: false };
  }

  /**
   * Check if error should trigger a retry
   */
  private shouldRetry(error: Error): boolean {
    const errorMessage = error.message.toLowerCase();
    return (
      errorMessage.includes("429") || // Too Many Requests
      errorMessage.includes("rate limit") ||
      errorMessage.includes("quota exceeded") ||
      errorMessage.includes("too many requests")
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Call LLM API with specific provider
   */
  private async callLLMWithProvider(
    prompt: string,
    provider: LLMProvider,
  ): Promise<{ success: boolean; translatedText?: string; model?: string }> {
    const originalProvider = this.provider;
    this.provider = provider;

    try {
      const response = await this.callLLM(prompt);
      return response;
    } finally {
      this.provider = originalProvider;
    }
  }

  /**
   * Call LLM API based on provider
   */
  private async callLLM(
    prompt: string,
  ): Promise<{ success: boolean; translatedText?: string }> {
    if (!this.provider) {
      return { success: false };
    }

    try {
      switch (this.provider.name) {
        case "openai":
          return await this.callOpenAI(prompt);
        case "gemini":
          return await this.callGemini(prompt);
        case "anthropic":
          return await this.callAnthropic(prompt);
        case "custom":
          return await this.callCustom(prompt);
        default:
          return { success: false };
      }
    } catch (error) {
      console.error("LLM API call failed:", error);
      return { success: false };
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    prompt: string,
  ): Promise<{ success: boolean; translatedText?: string }> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.provider!.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.provider!.model || "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.choices?.[0]?.message?.content?.trim();

    return {
      success: !!translatedText,
      translatedText,
    };
  }

  /**
   * Call Gemini API
   */
  private async callGemini(
    prompt: string,
  ): Promise<{ success: boolean; translatedText?: string }> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.provider!.model || "gemini-pro"}:generateContent?key=${this.provider!.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    return {
      success: !!translatedText,
      translatedText,
    };
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(
    prompt: string,
  ): Promise<{ success: boolean; translatedText?: string }> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.provider!.apiKey}`,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.provider!.model || "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.content?.[0]?.text?.trim();

    return {
      success: !!translatedText,
      translatedText,
    };
  }

  /**
   * Call custom API
   */
  private async callCustom(
    prompt: string,
  ): Promise<{ success: boolean; translatedText?: string }> {
    if (!this.provider!.baseUrl) {
      throw new Error("Custom API requires baseUrl");
    }

    const response = await fetch(this.provider!.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.provider!.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        model: this.provider!.model,
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedText = data.text || data.response || data.content;

    return {
      success: !!translatedText,
      translatedText,
    };
  }

  /**
   * Fallback translation when LLM is not available
   */
  private fallbackTranslation(
    request: LLMTranslationRequest,
  ): LLMTranslationResponse {
    // Simple fallback - just mark as needing translation
    return {
      success: false,
      originalText: request.text,
      translatedText: request.text,
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      confidence: 0,
      error:
        "LLM translation not available. Please configure a provider or translate manually.",
      model: "fallback",
    };
  }

  /**
   * Set provider configuration
   */
  setProvider(provider: LLMProvider): void {
    this.provider = provider;
  }

  /**
   * Set API key for existing provider
   */
  setApiKey(apiKey: string): void {
    if (this.provider) {
      this.provider.apiKey = apiKey;
    }
  }

  /**
   * Set model for existing provider
   */
  setModel(model: string): void {
    if (this.provider) {
      this.provider.model = model;
    }
  }

  /**
   * Check if LLM is available
   */
  isAvailable(): boolean {
    return !!this.provider?.apiKey;
  }

  /**
   * Get current provider info
   */
  getProviderInfo(): {
    name: string;
    model?: string;
    hasApiKey: boolean;
  } | null {
    if (!this.provider) return null;

    return {
      name: this.provider.name,
      model: this.provider.model,
      hasApiKey: !!this.provider.apiKey,
    };
  }
}
