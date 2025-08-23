#!/usr/bin/env bun

/**
 * Language Detection and Translation Service
 * Automatically detects language and translates content to English
 */

export interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  isEnglish: boolean;
  needsTranslation: boolean;
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  success: boolean;
  error?: string;
}

export class LanguageDetectionService {
  private readonly englishPatterns = [
    /\b(the|a|an|and|or|but|in|on|at|to|for|of|with|by)\b/i,
    /\b(is|are|was|were|be|been|being|have|has|had|do|does|did)\b/i,
    /\b(this|that|these|those|it|they|them|their|its)\b/i,
    /\b(function|class|interface|type|const|let|var|import|export)\b/i,
    /\b(if|else|for|while|switch|case|default|return|break|continue)\b/i,
  ];

  // Russian language detection is based on Cyrillic character detection
  // No need for word patterns - Unicode ranges are more reliable

  /**
   * Detect language of the given text
   */
  detectLanguage(text: string): LanguageDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        detectedLanguage: "unknown",
        confidence: 0,
        isEnglish: true,
        needsTranslation: false,
      };
    }

    const englishScore = this.calculateLanguageScore(
      text,
      this.englishPatterns,
    );

    // Additional heuristics
    const hasCyrillic = /[\u0400-\u04FF\u0500-\u052F]/i.test(text);
    const hasLatin = /[a-z]/i.test(text);

    let detectedLanguage = "unknown";
    let confidence = 0;
    let isEnglish = false;
    let needsTranslation = false;

    if (hasCyrillic) {
      detectedLanguage = "russian";
      confidence = 0.9; // High confidence for Cyrillic detection
      isEnglish = false;
      needsTranslation = true;
    } else if (hasLatin && englishScore > 3) {
      detectedLanguage = "english";
      confidence = Math.min(englishScore / 10, 1);
      isEnglish = true;
      needsTranslation = false;
    } else if (englishScore > 0) {
      detectedLanguage = "english";
      confidence = Math.min(englishScore / 10, 1);
      isEnglish = true;
      needsTranslation = false;
    }

    return {
      detectedLanguage,
      confidence,
      isEnglish,
      needsTranslation,
    };
  }

  /**
   * Calculate language score based on pattern matches
   */
  private calculateLanguageScore(text: string, patterns: RegExp[]): number {
    let score = 0;
    const words = text.toLowerCase().split(/\s+/);

    for (const pattern of patterns) {
      for (const word of words) {
        if (pattern.test(word)) {
          score += 1;
        }
      }
    }

    // Bonus for longer texts with consistent patterns
    if (words.length > 10) {
      score += Math.min((score / words.length) * 5, 3);
    }

    return score;
  }

  /**
   * Check if text contains non-English content that needs translation
   */
  needsTranslation(text: string): boolean {
    const detection = this.detectLanguage(text);
    return detection.needsTranslation;
  }

  /**
   * Get translation suggestions for non-English content
   */
  getTranslationSuggestions(text: string): string[] {
    const suggestions: string[] = [];

    if (this.needsTranslation(text)) {
      suggestions.push("⚠️  Content contains non-English text");
      suggestions.push(
        "💡 Consider translating to English for international accessibility",
      );
      suggestions.push(
        "🌍 Use English for all documentation, comments, and user-facing text",
      );
    }

    return suggestions;
  }

  /**
   * Validate content language compliance
   */
  validateLanguageCompliance(text: string): {
    compliant: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (!text || text.trim().length === 0) {
      return { compliant: true, issues, suggestions };
    }

    const detection = this.detectLanguage(text);

    if (detection.needsTranslation) {
      issues.push(
        `Non-English content detected (${detection.detectedLanguage})`,
      );
      suggestions.push("Translate all content to English");
      suggestions.push(
        "Use English for documentation, comments, and user interfaces",
      );
    }

    if (detection.confidence < 0.3) {
      issues.push("Low confidence in language detection");
      suggestions.push("Review content for mixed languages");
      suggestions.push("Ensure consistent language usage");
    }

    return {
      compliant: !detection.needsTranslation,
      issues,
      suggestions,
    };
  }
}
