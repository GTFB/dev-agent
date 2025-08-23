#!/usr/bin/env bun

import { ConfigSchema, Config } from "../types.js";
import { logger } from "../../utils/logger.js";

/**
 * Configuration Validator
 * Validates config.json using ZOD schemas
 */
export class ConfigValidator {
  /**
   * Validate configuration object
   */
  static validate(config: unknown): { success: true; data: Config } | { success: false; errors: string[] } {
    try {
      const result = ConfigSchema.safeParse(config);
      
      if (result.success) {
        logger.info("✅ Configuration validation passed");
        return { success: true, data: result.data };
      } else {
        const errors = result.error.issues && result.error.issues.length > 0 
          ? result.error.issues.map(err => {
              try {
                // Handle cases where err.path might be undefined, null, or not an array
                if (!err.path || !Array.isArray(err.path)) {
                  return `unknown: ${err.message}`;
                }
                // Handle cases where map() might throw an error
                let pathElements: string[];
                try {
                  pathElements = err.path.map(p => String(p));
                } catch {
                  return `unknown: ${err.message}`;
                }
                // Handle cases where join() might throw an error
                let path: string;
                try {
                  path = pathElements.join('.');
                } catch {
                  return `unknown: ${err.message}`;
                }
                return `${path}: ${err.message}`;
              } catch {
                // Fallback if path processing fails
                return `unknown: ${err.message}`;
              }
            })
          : [`Validation failed: ${result.error.message}`];
        
        logger.error("❌ Configuration validation failed");
        return { success: false, errors };
      }
    } catch (error) {
      logger.error("❌ Configuration validation error", error as Error);
      return { 
        success: false, 
        errors: [`Validation error: ${(error as Error).message}`] 
      };
    }
  }

  /**
   * Validate configuration file
   */
  static async validateFile(configPath: string): Promise<{ success: true; data: Config } | { success: false; errors: string[] }> {
    try {
      const configContent = await Bun.file(configPath).text();
      const config = JSON.parse(configContent);
      return this.validate(config);
    } catch (error) {
      logger.error("❌ Failed to read or parse config file", error as Error);
      return { 
        success: false, 
        errors: [`File error: ${(error as Error).message}`] 
      };
    }
  }

  /**
   * Get validation errors as formatted string
   */
  static formatErrors(errors: string[]): string {
    return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
  }
}
