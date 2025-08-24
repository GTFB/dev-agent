#!/usr/bin/env bun

/**
 * LLM Configuration Manager
 * Manages LLM provider configurations using database storage
 */

import { configManager } from "./config.js";

export interface LLMProviderConfig {
  provider: string;
  apiKey: string;
  apiBase?: string;
  model: string;
  config?: Record<string, unknown>;
  isDefault: boolean;
  status: 'active' | 'inactive' | 'testing';
}

export class LLMConfigManager {
  /**
   * Add or update LLM provider
   */
  addProvider(provider: string, apiKey: string, model: string, apiBase?: string, config?: Record<string, unknown>): void {
    configManager.setLLMProvider(provider, apiKey, model, apiBase, config);
  }

  /**
   * Remove LLM provider
   */
  removeProvider(provider: string): void {
    // Note: This would need to be implemented in ConfigManager
    // For now, we'll mark it as inactive
    this.updateProviderStatus(provider, 'inactive');
  }

  /**
   * Update provider status
   */
  updateProviderStatus(provider: string, status: 'active' | 'inactive' | 'testing'): void {
    // This would need to be implemented in ConfigManager
    // For now, we'll use a direct database approach
    const db = (configManager as unknown as { db: { prepare: (sql: string) => { run: (...args: unknown[]) => void } } }).db;
    if (db) {
      const stmt = db.prepare("UPDATE llm SET status = ? WHERE provider = ?");
      stmt.run(status, provider);
    }
  }

  /**
   * Set default LLM provider
   */
  setDefaultProvider(provider: string): void {
    configManager.setDefaultLLMProvider(provider);
  }

  /**
   * Get default LLM provider
   */
  getDefaultProvider(): string | undefined {
    return configManager.getDefaultLLMProvider();
  }

  /**
   * Get provider configuration
   */
  getProvider(provider: string): LLMProviderConfig | undefined {
    const config = configManager.getLLMProvider(provider);
    if (!config) return undefined;

    return {
      provider,
      apiKey: config.apiKey,
      apiBase: config.apiBase,
      model: config.model,
      config: config.config,
      isDefault: provider === configManager.getDefaultLLMProvider(),
      status: 'active' // Default status
    };
  }

  /**
   * Get all providers
   */
  getAllProviders(): LLMProviderConfig[] {
    return configManager.getAllLLMProviders().map(p => ({
      provider: p.provider,
      apiKey: '', // Don't expose API keys in list
      model: p.model,
      isDefault: p.isDefault,
      status: p.status as 'active' | 'inactive' | 'testing'
    }));
  }

  /**
   * Test provider connection
   */
  async testProvider(provider: string): Promise<boolean> {
    const config = this.getProvider(provider);
    if (!config) return false;

    try {
      // Basic validation - in real implementation, you'd make an API call
      if (!config.apiKey || !config.model) return false;
      
      // For now, just return true if we have the basic config
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get configuration summary
   */
  getConfigSummary(): {
    totalProviders: number;
    activeProviders: number;
    defaultProvider?: string;
    providers: string[];
  } {
    const providers = this.getAllProviders();
    const activeProviders = providers.filter(p => p.status === 'active');
    const defaultProvider = this.getDefaultProvider();

    return {
      totalProviders: providers.length,
      activeProviders: activeProviders.length,
      defaultProvider,
      providers: providers.map(p => p.provider)
    };
  }

  /**
   * Validate provider configuration
   */
  validateProvider(provider: string): string[] {
    const errors: string[] = [];
    const config = this.getProvider(provider);

    if (!config) {
      errors.push(`Provider '${provider}' not found`);
      return errors;
    }

    if (!config.apiKey) {
      errors.push(`API key is required for provider '${provider}'`);
    }

    if (!config.model) {
      errors.push(`Model is required for provider '${provider}'`);
    }

    return errors;
  }

  /**
   * Get retry configuration for provider
   */
  getRetryConfig(): {
    maxRetries: number;
    retryDelay: number;
    backoffMultiplier: number;
  } {
    // Default retry configuration
    return {
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      backoffMultiplier: 2
    };
  }

  /**
   * Update retry configuration for provider
   */
  updateRetryConfig(provider: string, config: {
    maxRetries?: number;
    retryDelay?: number;
    backoffMultiplier?: number;
  }): void {
    const currentConfig = this.getProvider(provider);
    if (!currentConfig) return;

    const newConfig = {
      ...currentConfig.config,
      retry: {
        ...this.getRetryConfig(provider),
        ...config
      }
    };

    // Update the provider with new config
    this.addProvider(
      provider,
      currentConfig.apiKey,
      currentConfig.model,
      currentConfig.apiBase,
      newConfig
    );
  }
}

// Export singleton instance
export const llmConfigManager = new LLMConfigManager();
