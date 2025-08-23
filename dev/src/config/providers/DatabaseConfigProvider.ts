#!/usr/bin/env bun

/**
 * Loads database configuration from config.json
 */

import { join } from "path";
import { logger } from "../../utils/logger.js";
import { DatabaseConfig } from "../types.js";
import { ConfigValidator } from "../validators/ConfigValidator.js";

/**
 * Loads database configuration from config.json
 */
export class DatabaseConfigProvider {
  private configPath: string;

  constructor() {
    this.configPath = join(process.cwd(), "config.json");
  }

  async load(): Promise<DatabaseConfig | null> {
    try {
      // Check if config file exists
      if (!await Bun.file(this.configPath).exists()) {
        logger.warn("Config file not found, using defaults");
        return null;
      }

      // Read and parse config file
      const configContent = await Bun.file(this.configPath).text();
      const config = JSON.parse(configContent);

      // Validate configuration with ZOD
      const validation = ConfigValidator.validate(config);
      if (!validation.success) {
        logger.error("❌ Configuration validation failed:");
        logger.error(ConfigValidator.formatErrors(validation.errors));
        throw new Error("Invalid configuration file");
      }

      if (!validation.data.storage?.database?.path) {
        throw new Error("Database path not configured in config.json");
      }

      const databaseConfig: DatabaseConfig = {
        source: 'project',
        priority: 100,
        path: validation.data.storage.database.path
      };

      logger.info("Database configuration loaded from config.json");
      return databaseConfig;

    } catch (error) {
      logger.error("Failed to load database configuration from config.json", error as Error);
      throw new Error("Database configuration is required. Please create config.json with storage.database.path");
    }
  }

  validate(config: DatabaseConfig): boolean {
    try {
      if (!config.path || !config.type) {
        return false;
      }
      
      // Ensure database path is in data/ directory
      if (!config.path.includes("data")) {
        logger.warn("Database path should be in data/ directory for better organization");
        return false;
      }
      
      if (config.type === 'sqlite') {
        return true; // SQLite only needs path
      }
      
      // For other databases, validate required fields
      if (['postgresql', 'mysql'].includes(config.type)) {
        if (!config.host || !config.port || !config.database) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }

  getPriority(): number {
    return 300;
  }

  getSource(): string {
    return 'database';
  }

  /**
   * Get database connection string
   */
  getConnectionString(): string {
    const config = this.config;
    if (!config) {
      throw new Error("Configuration not loaded");
    }

    switch (config.type) {
      case 'sqlite':
        return `sqlite:${config.path}`;
      case 'postgresql':
        return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}${config.ssl ? '?sslmode=require' : ''}`;
      case 'mysql':
        return `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }

  /**
   * Check if database is SQLite
   */
  isSQLite(): boolean {
    return this.config?.type === 'sqlite';
  }

  /**
   * Get database file path (for SQLite)
   */
  getDatabasePath(): string {
    if (!this.isSQLite()) {
      throw new Error("Database path is only available for SQLite databases");
    }
    return this.config!.path;
  }

  /**
   * Validate database path is in correct directory
   */
  validateDatabasePath(path: string): boolean {
    return path.includes("data") && !path.includes("dev-agent.db") || path.includes("data/.dev-agent.db");
  }
}
