#!/usr/bin/env bun

/**
 * LLM Configuration Manager
 * Stores and manages LLM provider configurations including API keys
 */

import { LLMProvider } from "../services/LLMTranslationService.js";
import { promises as fs } from "fs";
import { join } from "path";

export interface LLMConfig {
  providers: {
    [name: string]: LLMProvider;
  };
  defaultProvider?: string;
  retryConfig?: {
    maxRetries: number;
    retryDelayMs: number;
    backoffMultiplier: number;
  };
}

export class LLMConfigManager {
  private configPath: string;
  private config: LLMConfig;

  constructor() {
    this.configPath = join(process.cwd(), ".llm-config.json");
    this.config = { providers: {} };
  }

  /**
   * Load configuration from file
   */
  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.configPath, "utf-8");
      this.config = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is invalid, use default config
      this.config = { providers: {} };
    }
  }

  /**
   * Save configuration to file
   */
  async save(): Promise<void> {
    try {
      await fs.writeFile(
        this.configPath,
        JSON.stringify(this.config, null, 2),
        "utf-8",
      );
    } catch (error) {
      console.error("Failed to save LLM config:", error);
    }
  }

  /**
   * Add or update a provider
   */
  async setProvider(name: string, provider: LLMProvider): Promise<void> {
    // Load current config to preserve other providers
    await this.load();

    // Add or update the specific provider
    this.config.providers[name] = provider;
    await this.save();
  }

  /**
   * Get a provider by name
   */
  getProvider(name: string): LLMProvider | undefined {
    return this.config.providers[name];
  }

  /**
   * Get all providers
   */
  getAllProviders(): { [name: string]: LLMProvider } {
    return { ...this.config.providers };
  }

  /**
   * Remove a provider
   */
  async removeProvider(name: string): Promise<void> {
    delete this.config.providers[name];
    if (this.config.defaultProvider === name) {
      this.config.defaultProvider = undefined;
    }
    await this.save();
  }

  /**
   * Set default provider
   */
  async setDefaultProvider(name: string): Promise<void> {
    if (this.config.providers[name]) {
      this.config.defaultProvider = name;
      await this.save();
    }
  }

  /**
   * Get default provider
   */
  getDefaultProvider(): LLMProvider | undefined {
    if (this.config.defaultProvider) {
      return this.config.providers[this.config.defaultProvider];
    }
    return undefined;
  }

  /**
   * Check if provider exists
   */
  hasProvider(name: string): boolean {
    return name in this.config.providers;
  }

  /**
   * Get provider names
   */
  getProviderNames(): string[] {
    return Object.keys(this.config.providers);
  }

  /**
   * Validate provider configuration
   */
  validateProvider(provider: LLMProvider): string[] {
    const errors: string[] = [];

    if (!provider.name) {
      errors.push("Provider name is required");
    }

    if (!provider.apiKey) {
      errors.push("API key is required");
    }

    if (provider.name === "custom" && !provider.baseUrl) {
      errors.push("Custom provider requires baseUrl");
    }

    return errors;
  }

  /**
   * Get configuration file path
   */
  getConfigPath(): string {
    return this.configPath;
  }

  /**
   * Set retry configuration
   */
  async setRetryConfig(retryConfig: {
    maxRetries: number;
    retryDelayMs: number;
    backoffMultiplier: number;
  }): Promise<void> {
    await this.load();
    this.config.retryConfig = retryConfig;
    await this.save();
  }

  /**
   * Get retry configuration
   */
  getRetryConfig(): {
    maxRetries: number;
    retryDelayMs: number;
    backoffMultiplier: number;
  } | null {
    return this.config.retryConfig || null;
  }
}
