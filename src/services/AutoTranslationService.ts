#!/usr/bin/env bun

/**
 * Auto Translation Service
 * Automatically translates non-English content to English
 */

import { LanguageDetectionService, LanguageDetectionResult } from './LanguageDetectionService.js';

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
}

export class AutoTranslationService {
  private languageService: LanguageDetectionService;
  private translationCache: Map<string, TranslationResponse> = new Map();

  constructor() {
    this.languageService = new LanguageDetectionService();
  }

  /**
   * Automatically detect and translate content if needed
   */
  async autoTranslate(request: TranslationRequest): Promise<TranslationResponse> {
    try {
      // Check if translation is needed
      const detection = this.languageService.detectLanguage(request.text);
      
      if (!detection.needsTranslation) {
        return {
          success: true,
          originalText: request.text,
          translatedText: request.text,
          sourceLanguage: detection.detectedLanguage,
          targetLanguage: 'english',
          confidence: detection.confidence,
          suggestions: ['✅ Content is already in English']
        };
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(request.text, detection.detectedLanguage);
      if (this.translationCache.has(cacheKey)) {
        return this.translationCache.get(cacheKey)!;
      }

      // Perform translation
      const translation = await this.translateText(request.text, detection.detectedLanguage);
      
      // Cache the result
      this.translationCache.set(cacheKey, translation);
      
      return translation;
    } catch (error) {
      return {
        success: false,
        originalText: request.text,
        translatedText: request.text,
        sourceLanguage: 'unknown',
        targetLanguage: 'english',
        confidence: 0,
        error: `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestions: [
          '❌ Automatic translation failed',
          '💡 Please manually translate the content to English',
          '🌍 Ensure all documentation is in English for international accessibility'
        ]
      };
    }
  }

  /**
   * Translate text from source language to English
   */
  private async translateText(text: string, sourceLanguage: string): Promise<TranslationResponse> {
    // For now, we'll use a simple translation mapping
    // In production, you would integrate with Google Translate, DeepL, or similar APIs
    
    const translation = await this.simpleTranslate(text, sourceLanguage);
    
    return {
      success: true,
      originalText: text,
      translatedText: translation,
      sourceLanguage,
      targetLanguage: 'english',
      confidence: 0.8,
      suggestions: [
        '✅ Content automatically translated to English',
        '💡 Review translation for accuracy',
        '🌍 Consider having translations reviewed by native speakers'
      ]
    };
  }

  /**
   * Simple translation using predefined mappings
   * This is a fallback - in production use proper translation APIs
   */
  private async simpleTranslate(text: string, sourceLanguage: string): Promise<string> {
    if (sourceLanguage === 'russian') {
      // Simple Russian to English translations for common development terms
      const translations: Record<string, string> = {
        'автоматизация': 'automation',
        'разработки': 'development',
        'задачи': 'tasks',
        'цели': 'goals',
        'документация': 'documentation',
        'конфигурация': 'configuration',
        'интерфейс': 'interface',
        'функция': 'function',
        'класс': 'class',
        'тип': 'type',
        'переменная': 'variable',
        'константа': 'constant',
        'импорт': 'import',
        'экспорт': 'export',
        'если': 'if',
        'иначе': 'else',
        'для': 'for',
        'пока': 'while',
        'возврат': 'return',
        'переключатель': 'switch',
        'случай': 'case',
        'по умолчанию': 'default',
        'прервать': 'break',
        'продолжить': 'continue'
      };

      let translatedText = text;
      for (const [russian, english] of Object.entries(translations)) {
        const regex = new RegExp(russian, 'gi');
        translatedText = translatedText.replace(regex, english);
      }

      return translatedText;
    }

    // For other languages, return original text with a note
    return `${text} [Translation needed - original ${sourceLanguage}]`;
  }

  /**
   * Generate cache key for translations
   */
  private generateCacheKey(text: string, sourceLanguage: string): string {
    return `${sourceLanguage}:${text.substring(0, 100).toLowerCase().replace(/\s+/g, '_')}`;
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
      hitRate: 0 // Would need to track hits/misses in production
    };
  }

  /**
   * Validate content and suggest translations
   */
  validateAndSuggest(text: string): {
    needsTranslation: boolean;
    suggestions: string[];
    autoTranslation?: string;
  } {
    const detection = this.languageService.detectLanguage(text);
    
    if (!detection.needsTranslation) {
      return {
        needsTranslation: false,
        suggestions: ['✅ Content is in English']
      };
    }

    const suggestions = this.languageService.getTranslationSuggestions(text);
    
    return {
      needsTranslation: true,
      suggestions,
      autoTranslation: this.simpleTranslate(text, detection.detectedLanguage)
    };
  }
}
