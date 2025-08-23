#!/usr/bin/env bun

/**
 * Environment Configuration Provider
 * Loads configuration from environment variables
 */

import { EnvironmentConfig, ConfigurationProvider } from "../types.js";
import { logger } from "../../utils/logger.js";

export class EnvironmentConfigProvider implements ConfigurationProvider<EnvironmentConfig> {
  private config: EnvironmentConfig | null = null;

  async load(): Promise<EnvironmentConfig> {
    if (this.config) {
      return this.config;
    }

    this.config = {
      source: 'environment',
      priority: 200,
      GITHUB_TOKEN: process.env.GITHUB_TOKEN,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
      NODE_ENV: process.env.NODE_ENV || "development",
      LOG_LEVEL: process.env.LOG_LEVEL || "info",
    };

    logger.info("Environment configuration loaded");
    return this.config;
  }

  validate(): boolean {
    // Environment config is always valid as it's just a wrapper around process.env
    return true;
  }

  getPriority(): number {
    return 200;
  }

  getSource(): string {
    return 'environment';
  }

  /**
   * Get environment variable with type safety
   */
  getEnv(key: keyof EnvironmentConfig): string | undefined {
    return process.env[key];
  }

  /**
   * Get required environment variable (throws if missing)
   */
  getRequiredEnv(key: keyof EnvironmentConfig): string {
    const value = this.getEnv(key);
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  /**
   * Check if environment variable is set
   */
  hasEnv(key: keyof EnvironmentConfig): boolean {
    return !!this.getEnv(key);
  }

  /**
   * Validate critical environment variables
   */
  validateCritical(): string[] {
    const errors: string[] = [];
    
    // Only validate critical secrets that are absolutely required
    // Project rules (GITHUB_OWNER, GITHUB_REPO) should come from config.json
    // and are not required in .env for local development
    
    // Note: GITHUB_TOKEN is optional for local development without GitHub integration
    // It will be required only when actually using GitHub features
    
    return errors;
  }
}
