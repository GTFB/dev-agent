#!/usr/bin/env bun

/**
 * Database-based Configuration Manager for Dev Agent
 * Stores all configuration in SQLite database
 */

import { Database } from "bun:sqlite";
import { join, dirname } from "path";
import { existsSync, readFileSync, mkdirSync } from "fs";

export interface DatabaseConfig {
  path: string;
  type: 'sqlite' | 'postgresql' | 'mysql';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  baseUrl?: string;
}

export interface LLMConfig {
  defaultProvider: string;
  apiKeys: Record<string, string>;
  models: Record<string, string>;
  maxTokens: number;
  temperature: number;
}

export interface ProjectConfig {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  repository: string;
}

export interface AppConfig {
  database: DatabaseConfig;
  github?: GitHubConfig;
  llm: LLMConfig;
  project: ProjectConfig;
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    file?: string;
    console: boolean;
  };
  storage: {
    dataDir: string;
    tempDir: string;
    backupDir: string;
  };
}

export class ConfigManager {
  private db: Database;
  private configPath: string;

    constructor() {
    // DO NOT create DB automatically! Only save the path
    const defaultPath = join(process.cwd(), "database.db");
    let configuredPath: string | undefined;

    // First check environment variable (priority)
    if (process.env.DEV_AGENT_DB_PATH) {
      configuredPath = process.env.DEV_AGENT_DB_PATH;
    } else {
      // Try to read config.json only if ENV is not set
      try {
        const cfgFile = join(process.cwd(), "config.json");
        if (existsSync(cfgFile)) {
          const raw = readFileSync(cfgFile, "utf8");
          const json = JSON.parse(raw);
          const jsonPath = json?.storage?.database?.path;
          if (typeof jsonPath === "string" && jsonPath.length > 0) {
            configuredPath = jsonPath;
          }
        }
      } catch {
        // ignore JSON read errors and fall back
      }
    }

    this.configPath = configuredPath || defaultPath;
    
    // DO NOT create DB here! DB will be created only on explicit initialize() call
    this.db = null as Database | null; // Temporarily null
  }

  /**
   * Database initialization - called only when needed
   */
  initialize(): void {
    if (this.db) return; // Already initialized
    
    // Ensure directory exists for the database file
    try {
      const dirPath = dirname(this.configPath);
      if (dirPath && !existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    } catch {
      // Ignore directory creation errors
    }

    this.db = new Database(this.configPath);
    this.ensureTables();
  }

  /**
   * Ensure configuration tables exist
   */
  private ensureTables(): void {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    // Create config table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'string',
        description TEXT,
        category TEXT NOT NULL,
        required BOOLEAN NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `);

    // Create llm table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS llm (
        provider TEXT PRIMARY KEY NOT NULL,
        api_key TEXT NOT NULL,
        api_base TEXT,
        model TEXT NOT NULL,
        config TEXT,
        is_default BOOLEAN NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `);

    // Initialize default configuration if tables are empty
    this.initializeDefaultConfig();
  }

  /**
   * Initialize default configuration
   */
  private initializeDefaultConfig(): void {
    const configCount = this.db.prepare("SELECT COUNT(*) as count FROM config").get() as { count: number };
    
    if (configCount.count === 0) {
      const defaultConfig = this.getDefaultConfig();
      
      // Insert database config
      this.setConfig('database.path', defaultConfig.database.path, 'string', 'Database file path', 'database');
      this.setConfig('database.type', defaultConfig.database.type, 'string', 'Database type', 'database');
      
      // Insert project config
      this.setConfig('project.name', defaultConfig.project.name, 'string', 'Project name', 'project');
      this.setConfig('project.version', defaultConfig.project.version, 'string', 'Project version', 'project');
      this.setConfig('project.description', defaultConfig.project.description, 'string', 'Project description', 'project');
      this.setConfig('project.author', defaultConfig.project.author, 'string', 'Project author', 'project');
      this.setConfig('project.license', defaultConfig.project.license, 'string', 'Project license', 'project');
      this.setConfig('project.repository', defaultConfig.project.repository, 'string', 'Project repository', 'project');
      
      // Insert logging config
      this.setConfig('logging.level', defaultConfig.logging.level, 'string', 'Logging level', 'logging');
      this.setConfig('logging.console', defaultConfig.logging.console.toString(), 'boolean', 'Console logging enabled', 'logging');
      
      // Insert storage config
      this.setConfig('storage.dataDir', process.cwd(), 'string', 'Data directory (root)', 'storage');
      this.setConfig('storage.backupDir', defaultConfig.storage.backupDir, 'string', 'Backup directory', 'storage');
      
      // Insert LLM config
      this.setConfig('llm.defaultProvider', defaultConfig.llm.defaultProvider, 'string', 'Default LLM provider', 'llm');
      this.setConfig('llm.maxTokens', defaultConfig.llm.maxTokens.toString(), 'number', 'Maximum tokens for LLM', 'llm');
      this.setConfig('llm.temperature', defaultConfig.llm.temperature.toString(), 'number', 'LLM temperature', 'llm');
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
             database: {
         path: process.env.DEV_AGENT_DB_PATH || join(process.cwd(), "database.db"),
         type: "sqlite"
       },
      github: undefined,
      llm: {
        defaultProvider: "openai",
        apiKeys: {},
        models: {
          openai: "gpt-4",
          anthropic: "claude-3-sonnet",
          local: "llama2"
        },
        maxTokens: 4096,
        temperature: 0.7
      },
             project: {
         name: "Dev Agent",
         version: "0.3.0",
         description: "CLI assistant for automating the High-Efficiency Standard Operating Protocol",
         author: "Dev Agent Team",
         license: "MIT",
         repository: "https://github.com/dev-agent/dev-agent"
       },
      logging: {
        level: "info",
        console: true
      },
      storage: {
        dataDir: process.cwd(),
        tempDir: join(process.cwd(), "temp"),
        backupDir: join(process.cwd(), "backups")
      }
    };
  }

  /**
   * Set configuration value
   */
  setConfig(key: string, value: string, type: string = 'string', description?: string, category: string = 'general'): void {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO config (key, value, type, description, category, updated_at)
      VALUES (?, ?, ?, ?, ?, (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))
    `);
    
    stmt.run(key, value, type, description || '', category);
  }

  /**
   * Get configuration value
   */
  getConfig(key: string, defaultValue?: string): string | undefined {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    const stmt = this.db.prepare("SELECT value FROM config WHERE key = ?");
    const result = stmt.get(key) as { value: string } | undefined;
    return result?.value || defaultValue;
  }

  /**
   * Get all configuration for a category
   */
  getConfigByCategory(category: string): Record<string, string> {
    if (!this.db) {
      return {};
    }
    
    const stmt = this.db.prepare("SELECT key, value FROM config WHERE category = ?");
    const results = stmt.all(category) as Array<{ key: string; value: string }>;
    
    const config: Record<string, string> = {};
    results.forEach(row => {
      config[row.key] = row.value;
    });
    
    return config;
  }

  /**
   * Delete configuration
   */
  deleteConfig(key: string): void {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    
    const stmt = this.db.prepare("DELETE FROM config WHERE key = ?");
    stmt.run(key);
  }

  /**
   * Set LLM provider configuration
   */
  setLLMProvider(provider: string, apiKey: string, model: string, apiBase?: string, config?: Record<string, unknown>): void {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO llm (provider, api_key, model, api_base, config, updated_at)
      VALUES (?, ?, ?, ?, ?, (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))
    `);
    
    const configJson = config ? JSON.stringify(config) : null;
    stmt.run(provider, apiKey, model, apiBase || null, configJson);
  }

  /**
   * Get LLM provider configuration
   */
  getLLMProvider(provider: string): { apiKey: string; model: string; apiBase?: string; config?: Record<string, unknown> } | undefined {
    if (!this.db) {
      return undefined;
    }
    
    const stmt = this.db.prepare("SELECT api_key, model, api_base, config FROM llm WHERE provider = ?");
    const result = stmt.get(provider) as { api_key: string; model: string; api_base?: string; config?: string } | undefined;
    
    if (result) {
      return {
        apiKey: result.api_key,
        model: result.model,
        apiBase: result.api_base,
        config: result.config ? JSON.parse(result.config) : undefined
      };
    }
    
    return undefined;
  }

  /**
   * Set default LLM provider
   */
  setDefaultLLMProvider(provider: string): void {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    
    // Clear all default flags
    this.db.exec("UPDATE llm SET is_default = 0");
    
    // Set new default
    const stmt = this.db.prepare("UPDATE llm SET is_default = 1 WHERE provider = ?");
    stmt.run(provider);
  }

  /**
   * Get default LLM provider
   */
  getDefaultLLMProvider(): string | undefined {
    if (!this.db) {
      return undefined;
    }
    
    const stmt = this.db.prepare("SELECT provider FROM llm WHERE is_default = 1");
    const result = stmt.get() as { provider: string } | undefined;
    return result?.provider;
  }

  /**
   * Get all LLM providers
   */
  getAllLLMProviders(): Array<{ provider: string; model: string; isDefault: boolean; status: string }> {
    if (!this.db) {
      return [];
    }
    
    const stmt = this.db.prepare("SELECT provider, model, is_default, status FROM llm ORDER BY is_default DESC, provider");
    const results = stmt.all() as Array<{ provider: string; model: string; is_default: number; status: string }>;
    
    return results.map(row => ({
      provider: row.provider,
      model: row.model,
      isDefault: row.is_default === 1,
      status: row.status
    }));
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig(): DatabaseConfig {
    const config = this.getConfigByCategory('database');
    
         return {
       path: config['database.path'] || join(process.cwd(), "database.db"),
       type: (config['database.type'] as 'sqlite' | 'postgresql' | 'mysql') || 'sqlite'
     };
  }

  /**
   * Get GitHub configuration
   */
  getGitHubConfig(): GitHubConfig | undefined {
    const config = this.getConfigByCategory('github');
    
    if (!config['github.token'] || !config['github.owner'] || !config['github.repo']) {
      return undefined;
    }
    
    return {
      token: config['github.token'],
      owner: config['github.owner'],
      repo: config['github.repo'],
      baseUrl: config['github.baseUrl']
    };
  }

  /**
   * Set GitHub configuration
   */
  setGitHubConfig(config: GitHubConfig): void {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    
    this.setConfig('github.token', config.token, 'string', 'GitHub access token', 'github');
    this.setConfig('github.owner', config.owner, 'string', 'GitHub repository owner', 'github');
    this.setConfig('github.repo', config.repo, 'string', 'GitHub repository name', 'github');
    if (config.baseUrl) {
      this.setConfig('github.baseUrl', config.baseUrl, 'string', 'GitHub API base URL', 'github');
    }
  }

  /**
   * Get project configuration
   */
  getProjectConfig(): ProjectConfig {
    const config = this.getConfigByCategory('project');
    
         return {
       name: config['project.name'] || "Dev Agent",
       version: config['project.version'] || "0.3.0",
       description: config['project.description'] || "CLI assistant for automating the High-Efficiency Standard Operating Protocol",
       author: config['project.author'] || "Dev Agent Team",
       license: config['project.license'] || "MIT",
       repository: config['project.repository'] || "https://github.com/dev-agent/dev-agent"
     };
  }

  /**
   * Get storage configuration
   */
  getStorageConfig(): { dataDir: string; backupDir: string } {
    const config = this.getConfigByCategory('storage');
    
    return {
      dataDir: config['storage.dataDir'] || process.cwd(),
      backupDir: config['storage.backupDir'] || join(process.cwd(), "backups")
    };
  }

  /**
   * Get logging configuration
   */
  getLoggingConfig(): { level: 'debug' | 'info' | 'warn' | 'error'; console: boolean } {
    const config = this.getConfigByCategory('logging');
    
    return {
      level: (config['logging.level'] as 'debug' | 'info' | 'warn' | 'error') || 'info',
      console: config['logging.console'] === 'true' || config['logging.console'] === undefined
    };
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Get configuration statistics
   */
  getStats(): { totalConfigs: number; totalLLMProviders: number; categories: string[] } {
    if (!this.db) {
      return {
        totalConfigs: 0,
        totalLLMProviders: 0,
        categories: []
      };
    }
    
    const configCount = this.db.prepare("SELECT COUNT(*) as count FROM config").get() as { count: number };
    const llmCount = this.db.prepare("SELECT COUNT(*) as count FROM llm").get() as { count: number };
    const categories = this.db.prepare("SELECT DISTINCT category FROM config").all() as Array<{ category: string }>;
    
    return {
      totalConfigs: configCount.count,
      totalLLMProviders: llmCount.count,
      categories: categories.map(c => c.category)
    };
  }
}

// Export singleton instance
export const configManager = new ConfigManager();
