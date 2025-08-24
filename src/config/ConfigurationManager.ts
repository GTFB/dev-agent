#!/usr/bin/env bun

/**
 * Configuration Manager
 * Orchestrates all configuration providers and provides unified access
 */

import { AppConfig, BaseConfig, ConfigurationProvider } from "./types.js";
import { ProjectConfigProvider } from "./providers/ProjectConfigProvider.js";
import { EnvironmentConfigProvider } from "./providers/EnvironmentConfigProvider.js";
import { DatabaseConfigProvider } from "./providers/DatabaseConfigProvider.js";
import { logger } from "../utils/logger.js";
import { join } from "path";

export class ConfigurationManager {
  private static instance: ConfigurationManager;
  private providers: Map<string, ConfigurationProvider<BaseConfig>> = new Map();
  private configCache: Map<string, BaseConfig> = new Map();
  private initialized = false;

  private constructor() {
    this.registerDefaultProviders();
  }

  static getInstance(): ConfigurationManager {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }

  /**
   * Register default configuration providers
   */
  private registerDefaultProviders(): void {
    this.registerProvider('project', new ProjectConfigProvider());
    this.registerProvider('environment', new EnvironmentConfigProvider());
    this.registerProvider('database', new DatabaseConfigProvider());
  }

  /**
   * Register a configuration provider
   */
  registerProvider<T extends BaseConfig>(name: string, provider: ConfigurationProvider<T>): void {
    this.providers.set(name, provider);
    logger.info(`Configuration provider '${name}' registered`);
  }

  /**
   * Get a specific configuration provider
   */
  getProvider<T extends BaseConfig>(name: string): ConfigurationProvider<T> | undefined {
    return this.providers.get(name) as ConfigurationProvider<T>;
  }

  /**
   * Validate project structure and prevent file creation in wrong locations
   */
  private validateProjectStructure(): void {
    const rootDir = process.cwd();
    
    // Check for database files in root directory
    const forbiddenFiles = [
      join(rootDir, "dev-agent.db"),
      join(rootDir, ".dev-agent.db"),
      join(rootDir, "dev-agent.db-wal"),
      join(rootDir, ".dev-agent.db-wal"),
      join(rootDir, "dev-agent.db-shm"),
      join(rootDir, ".dev-agent.db-shm")
    ];

    for (const file of forbiddenFiles) {
      try {
        const fs = require('fs');
        if (fs.existsSync(file)) {
          logger.warn(`⚠️  Found database file in root directory: ${file}`);
          logger.warn("   This file should be in data/ directory for better organization");
        }
      } catch {
        // Ignore errors during validation
      }
    }
  }

  /**
   * Load all configurations and merge them
   */
  async loadAll(): Promise<AppConfig> {
    if (this.initialized) {
      return this.getMergedConfig();
    }

    // Validate project structure before loading
    this.validateProjectStructure();

    logger.info("Loading all configuration providers...");

    // Load all providers
    const loadPromises = Array.from(this.providers.entries()).map(async ([name, provider]) => {
      try {
        const config = await provider.load();
        this.configCache.set(name, config);
        logger.info(`Configuration '${name}' loaded successfully`);
        return config;
      } catch (error) {
        logger.error(`Failed to load configuration '${name}'`, error as Error);
        throw error;
      }
    });

    await Promise.all(loadPromises);
    this.initialized = true;

    logger.info("All configurations loaded successfully");
    return this.getMergedConfig();
  }

  /**
   * Get merged configuration from all providers
   */
  private getMergedConfig(): AppConfig {
    const project = this.configCache.get('project');
    const environment = this.configCache.get('environment');
    const database = this.configCache.get('database');

    if (!project || !environment || !database) {
      throw new Error("Not all required configurations are loaded");
    }

    // For now, return a basic merged config
    // In the future, this could be more sophisticated merging
    return {
      project,
      environment,
      database,
      llm: {
        source: 'database',
        priority: 300,
        defaultProvider: 'openai',
        apiKeys: {},
        models: {},
        maxTokens: 4000,
        temperature: 0.7,
      },
      github: undefined, // Will be loaded from database when needed
      storage: {
        source: 'database',
        priority: 300,
        dataDir: './data',
        tempDir: './data/temp',
        backupDir: './data/backups',
      },
      logging: {
        source: 'database',
        priority: 300,
        level: 'info',
        console: true,
      },
    };
  }

  /**
   * Get configuration by type
   */
  async getConfig<T extends BaseConfig>(type: string): Promise<T> {
    if (!this.initialized) {
      await this.loadAll();
    }

    const config = this.configCache.get(type);
    if (!config) {
      throw new Error(`Configuration type '${type}' not found`);
    }

    return config as T;
  }

  /**
   * Get project configuration
   */
  async getProjectConfig() {
    return this.getConfig('project');
  }

  /**
   * Get environment configuration
   */
  async getEnvironmentConfig() {
    return this.getConfig('environment');
  }

  /**
   * Get database configuration
   */
  async getDatabaseConfig() {
    return this.getConfig('database');
  }

  /**
   * Validate all configurations
   */
  async validateAll(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const [name, provider] of this.providers) {
      try {
        const config = this.configCache.get(name);
        if (config && !provider.validate(config)) {
          errors.push(`Configuration '${name}' validation failed`);
        }
      } catch (error) {
        errors.push(`Configuration '${name}' validation error: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Clear configuration cache
   */
  clearCache(): void {
    this.configCache.clear();
    this.initialized = false;
    logger.info("Configuration cache cleared");
  }

  /**
   * Reload all configurations
   */
  async reload(): Promise<AppConfig> {
    this.clearCache();
    return this.loadAll();
  }
}

// Export singleton instance
export const configManager = ConfigurationManager.getInstance();
