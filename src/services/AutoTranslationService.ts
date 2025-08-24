#!/usr/bin/env bun

/**
 * Auto Translation Service
 * Automatically translates non-English content to English
 */

import {
  LanguageDetectionService,
} from "./LanguageDetectionService.js";
import { LLMTranslationService, LLMProvider } from "./LLMTranslationService.js";
import { LLMConfigManager } from "../config/llm-config.js";

export interface TranslationRequest {
  text: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  context?: string;
}

export interface TranslationResponse {
  success: boolean;
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  confidence: number;
  error?: string;
  suggestions?: string[];
  model?: string;
}

export class AutoTranslationService {
  private languageService: LanguageDetectionService;
  private _llmService: LLMTranslationService;
  private translationCache: Map<string, TranslationResponse> = new Map();
  private configManager: LLMConfigManager;

  /**
   * Get LLM service instance
   */
  get llmService(): LLMTranslationService {
    return this._llmService;
  }

  constructor(provider?: LLMProvider) {
    this.languageService = new LanguageDetectionService();
    this._llmService = new LLMTranslationService(provider);
    this.configManager = new LLMConfigManager();
    // Note: initializeConfig is called asynchronously,
    // but we don't wait for it in constructor
  }

  /**
   * Initialize configuration
   */
  async initializeConfig(): Promise<void> {
    // If no provider was passed, try to load default from config
    if (!this._llmService.isAvailable()) {
      const defaultProvider = this.configManager.getDefaultProvider();
      if (defaultProvider) {
        this._llmService.setProvider(defaultProvider);
      }
    }

    // Set config manager in LLM service
    this._llmService.setConfigManager(this.configManager);
  }

  /**
   * Automatically detect and translate content if needed
   */
  async autoTranslate(
    request: TranslationRequest,
  ): Promise<TranslationResponse> {
    try {
      // Check if translation is needed
      const detection = this.languageService.detectLanguage(request.text);

      if (!detection.needsTranslation) {
        return {
          success: true,
          originalText: request.text,
          translatedText: request.text,
          sourceLanguage: detection.detectedLanguage,
          targetLanguage: "english",
          confidence: detection.confidence,
          suggestions: ["✅ Content is already in English"],
        };
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(
        request.text,
        detection.detectedLanguage,
      );
      if (this.translationCache.has(cacheKey)) {
        return this.translationCache.get(cacheKey)!;
      }

      // Perform translation
      const translation = await this.translateText(
        request.text,
        detection.detectedLanguage,
      );

      // Cache the result
      this.translationCache.set(cacheKey, translation);

      return translation;
    } catch (error) {
      return {
        success: false,
        originalText: request.text,
        translatedText: request.text,
        sourceLanguage: "unknown",
        targetLanguage: "english",
        confidence: 0,
        error: `Translation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        suggestions: [
          "❌ Automatic translation failed",
          "💡 Please manually translate the content to English",
          "🌍 Ensure all documentation is in English for international accessibility",
        ],
      };
    }
  }

  /**
   * Translate text from source language to English using LLM
   */
  private async translateText(
    text: string,
    sourceLanguage: string,
  ): Promise<TranslationResponse> {
    try {
      const llmResponse = await this._llmService.translate({
        text,
        sourceLanguage,
        targetLanguage: "english",
        context: "software development documentation",
      });

      if (llmResponse.success) {
        return {
          success: true,
          originalText: text,
          translatedText: llmResponse.translatedText,
          sourceLanguage,
          targetLanguage: "english",
          confidence: llmResponse.confidence,
          model: llmResponse.model,
          suggestions: [
            "✅ Content automatically translated to English via LLM",
            "💡 Review translation for accuracy",
            "🌍 Translation powered by AI for professional quality",
          ],
        };
      } else {
        return {
          success: false,
          originalText: text,
          translatedText: text,
          sourceLanguage,
          targetLanguage: "english",
          confidence: 0,
          error: llmResponse.error || "LLM translation failed",
          suggestions: [
            "❌ Automatic translation failed",
            "💡 Please manually translate the content to English",
            "🌍 Ensure all documentation is in English for international accessibility",
          ],
        };
      }
    } catch (error) {
      return {
        success: false,
        originalText: text,
        translatedText: text,
        sourceLanguage,
        targetLanguage: "english",
        confidence: 0,
        error: `Translation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        suggestions: [
          "❌ Translation service error",
          "💡 Please manually translate the content to English",
          "🌍 Ensure all documentation is in English for international accessibility",
        ],
      };
    }
  }

  /**
   * Set LLM provider for translation service
   */
  async setProvider(provider: LLMProvider): Promise<void> {
    this._llmService.setProvider(provider);

    // Save to config (this will add/update the provider, not replace all)
    const providerName = provider.name;
    await this.configManager.setProvider(providerName, provider);

    // Set as default if it's the first provider
    if (this.configManager.getProviderNames().length === 1) {
      await this.configManager.setDefaultProvider(providerName);
    }
  }

  /**
   * Set API key for existing provider
   */
  async setApiKey(apiKey: string): Promise<void> {
    this._llmService.setApiKey(apiKey);

    // Update in config
    const providerInfo = this._llmService.getProviderInfo();
    if (providerInfo) {
      const provider = this.configManager.getProvider(providerInfo.name);
      if (provider) {
        provider.apiKey = apiKey;
        await this.configManager.setProvider(providerInfo.name, provider);
      }
    }
  }

  /**
   * Check if LLM translation is available
   */
  isLLMAvailable(): boolean {
    return this._llmService.isAvailable();
  }

  /**
   * Get current provider info
   */
  getProviderInfo() {
    return this._llmService.getProviderInfo();
  }

  /**
   * Get all configured providers
   */
  async getAllProviders(): Promise<{ [name: string]: LLMProvider }> {
    return this.configManager.getAllProviders();
  }

  /**
   * Remove a provider
   */
  async removeProvider(name: string): Promise<void> {
    await this.configManager.removeProvider(name);

    // If this was the current provider, clear it
    const currentProvider = this._llmService.getProviderInfo();
    if (currentProvider?.name === name) {
      this._llmService.setProvider(undefined);
    }
  }

  /**
   * Set default provider
   */
  async setDefaultProvider(name: string): Promise<void> {
    await this.configManager.setDefaultProvider(name);

    // Load the default provider
    const provider = this.configManager.getProvider(name);
    if (provider) {
      this._llmService.setProvider(provider);
    }
  }

  /**
   * Get configuration file path
   */
  getConfigPath(): string {
    return this.configManager.getConfigPath();
  }

  /**
   * Generate cache key for translations
   */
  private generateCacheKey(text: string, sourceLanguage: string): string {
    return `${sourceLanguage}:${text.substring(0, 100).toLowerCase().replace(/\s+/g, "_")}`;
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.translationCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.translationCache.size,
      hitRate: 0, // Would need to track hits/misses in production
    };
  }

  /**
   * Validate content and suggest translations
   */
  async validateAndSuggest(text: string): Promise<{
    needsTranslation: boolean;
    suggestions: string[];
    autoTranslation?: string;
  }> {
    const detection = this.languageService.detectLanguage(text);

    if (!detection.needsTranslation) {
      return {
        needsTranslation: false,
        suggestions: ["✅ Content is in English"],
      };
    }

    const suggestions = this.languageService.getTranslationSuggestions(text);

    // Try to get LLM translation
    if (this.isLLMAvailable()) {
      try {
        const translation = await this._llmService.translate({
          text,
          sourceLanguage: detection.detectedLanguage,
          targetLanguage: "english",
          context: "content validation",
        });

        if (translation.success) {
          return {
            needsTranslation: true,
            suggestions,
            autoTranslation: translation.translatedText,
          };
        }
      } catch (error) {
        console.warn("LLM translation failed during validation:", error);
      }
    }

    return {
      needsTranslation: true,
      suggestions,
      autoTranslation: undefined,
    };
  }
}
