#!/usr/bin/env bun

/**
 * Language Validation Middleware
 * Automatically validates and translates content when saving
 */

import { LanguageDetectionService } from "../services/LanguageDetectionService.js";
import { AutoTranslationService } from "../services/AutoTranslationService.js";
import { logger } from "../utils/logger.js";

export interface ValidationContext {
  entityType: "goal" | "document" | "comment" | "file" | "config";
  fieldName: string;
  content: string;
  autoTranslate?: boolean;
  strictMode?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  originalContent: string;
  translatedContent?: string;
  issues: string[];
  suggestions: string[];
  warnings: string[];
  needsTranslation: boolean;
  detectedLanguage: string;
  confidence: number;
}

export interface GoalData {
  title?: string;
  description?: string;
  [key: string]: unknown;
}

export interface DocumentData {
  title?: string;
  content?: string;
  [key: string]: unknown;
}

export interface TranslationMap {
  [originalContent: string]: string;
}

export class LanguageValidationMiddleware {
  private languageService: LanguageDetectionService;
  private translationService: AutoTranslationService;

  constructor() {
    this.languageService = new LanguageDetectionService();
    this.translationService = new AutoTranslationService();
  }

  /**
   * Initialize translation service with configuration
   */
  private async initializeTranslationService(): Promise<void> {
    try {
      await this.translationService.initializeConfig();
    } catch (error) {
      logger.warn("Failed to initialize translation service config:", error);
    }
  }

  /**
   * Validate content before saving to database
   */
  async validateBeforeSave(
    context: ValidationContext,
  ): Promise<ValidationResult> {
    const {
      entityType,
      fieldName,
      content,
      autoTranslate = true,
      strictMode = false,
    } = context;

    logger.info(`Validating language for ${entityType}.${fieldName}`);

    // Initialize translation service if needed
    await this.initializeTranslationService();

    try {
      // Detect language
      const detection = this.languageService.detectLanguage(content);

      // Validate compliance
      const compliance =
        this.languageService.validateLanguageCompliance(content);

      const result: ValidationResult = {
        valid: compliance.compliant,
        originalContent: content,
        issues: compliance.issues,
        suggestions: compliance.suggestions,
        warnings: [],
        needsTranslation: detection.needsTranslation,
        detectedLanguage: detection.detectedLanguage,
        confidence: detection.confidence,
      };

      // Auto-translate if enabled and needed
      if (autoTranslate && detection.needsTranslation) {
        try {
          const translation = await this.translationService.autoTranslate({
            text: content,
            sourceLanguage: detection.detectedLanguage,
            targetLanguage: "english",
            context: `${entityType}.${fieldName}`,
          });

          if (translation.success) {
            result.translatedContent = translation.translatedText;
            result.suggestions.push(
              "✅ Content automatically translated to English",
            );
            result.valid = true; // Translation successful
          } else {
            result.warnings.push(
              "⚠️  Auto-translation failed, manual review required",
            );
            if (strictMode) {
              result.valid = false;
            }
          }
        } catch (error) {
          logger.error("Translation failed", error as Error);
          result.warnings.push("⚠️  Translation service unavailable");
          if (strictMode) {
            result.valid = false;
          }
        }
      }

      // Log validation results
      if (result.issues.length > 0) {
        logger.warn(
          `Language validation issues in ${entityType}.${fieldName}:`,
          result.issues,
        );
      }

      if (result.needsTranslation && !result.translatedContent) {
        logger.warn(`Content needs translation: ${entityType}.${fieldName}`);
      }

      return result;
    } catch (error) {
      logger.error("Language validation failed", error as Error);

      return {
        valid: false,
        originalContent: content,
        issues: ["Language validation service error"],
        suggestions: ["Check system configuration"],
        warnings: ["Validation service unavailable"],
        needsTranslation: false,
        detectedLanguage: "unknown",
        confidence: 0,
      };
    }
  }

  /**
   * Validate file content before saving
   */
  async validateFileContent(
    filePath: string,
    content: string,
  ): Promise<ValidationResult> {
    const context: ValidationContext = {
      entityType: "file",
      fieldName: "content",
      content,
      autoTranslate: true,
      strictMode: false,
    };

    return this.validateBeforeSave(context);
  }

  /**
   * Validate goal content before saving
   */
  async validateGoalContent(goalData: GoalData): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Validate title
    if (goalData.title) {
      const titleResult = await this.validateBeforeSave({
        entityType: "goal",
        fieldName: "title",
        content: goalData.title,
        autoTranslate: true,
        strictMode: true,
      });
      results.push(titleResult);
    }

    // Validate description
    if (goalData.description) {
      const descResult = await this.validateBeforeSave({
        entityType: "goal",
        fieldName: "description",
        content: goalData.description,
        autoTranslate: true,
        strictMode: false,
      });
      results.push(descResult);
    }

    return results;
  }

  /**
   * Validate document content before saving
   */
  async validateDocumentContent(docData: DocumentData): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Validate title
    if (docData.title) {
      const titleResult = await this.validateBeforeSave({
        entityType: "document",
        fieldName: "title",
        content: docData.title,
        autoTranslate: true,
        strictMode: true,
      });
      results.push(titleResult);
    }

    // Validate content
    if (docData.content) {
      const contentResult = await this.validateBeforeSave({
        entityType: "document",
        fieldName: "content",
        content: docData.content,
        autoTranslate: true,
        strictMode: false,
      });
      results.push(contentResult);
    }

    return results;
  }

  /**
   * Get validation summary for multiple results
   */
  getValidationSummary(results: ValidationResult[]): {
    overallValid: boolean;
    totalIssues: number;
    totalWarnings: number;
    needsTranslation: number;
    suggestions: string[];
  } {
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const totalWarnings = results.reduce(
      (sum, r) => sum + r.warnings.length,
      0,
    );
    const needsTranslation = results.filter((r) => r.needsTranslation).length;

    const allSuggestions = results.flatMap((r) => r.suggestions);
    const uniqueSuggestions = [...new Set(allSuggestions)];

    return {
      overallValid: results.every((r) => r.valid),
      totalIssues,
      totalWarnings,
      needsTranslation,
      suggestions: uniqueSuggestions,
    };
  }

  /**
   * Apply translations to content if available
   */
  applyTranslations(results: ValidationResult[]): TranslationMap {
    const translations: TranslationMap = {};

    for (const result of results) {
      if (
        result.translatedContent &&
        result.translatedContent !== result.originalContent
      ) {
        translations[`${result.originalContent}`] = result.translatedContent;
      }
    }

    return translations;
  }
}
