#!/usr/bin/env bun

/**
 * Database Configuration Provider
 * Loads configuration from database or provides defaults
 */

import { DatabaseConfig, ConfigurationProvider } from "../types.js";
import { logger } from "../../utils/logger.js";
import { join } from "path";

export class DatabaseConfigProvider implements ConfigurationProvider<DatabaseConfig> {
  private config: DatabaseConfig | null = null;

  async load(): Promise<DatabaseConfig> {
    if (this.config) {
      return this.config;
    }

    // Load configuration from .dev-agent.json
    let dbPath: string;
    
    try {
      const configFile = join(process.cwd(), ".dev-agent.json");
      const configContent = await Bun.file(configFile).text();
      const config = JSON.parse(configContent);
      
      if (config.storage && config.storage.database && config.storage.database.path) {
        dbPath = config.storage.database.path;
        logger.info(`Database path loaded from config: ${dbPath}`);
      } else {
        throw new Error("Database path not configured in .dev-agent.json");
      }
    } catch (error) {
      logger.error("Failed to load database configuration from .dev-agent.json", error as Error);
      throw new Error("Database configuration is required. Please create .dev-agent.json with storage.database.path");
    }

    // Validate that we're not trying to create database in project root
    if (dbPath.includes(process.cwd()) && !dbPath.includes("storage")) {
      throw new Error("Database must be created in external storage, not in project directory");
    }

    this.config = {
      source: 'database',
      priority: 300,
      path: dbPath,
      type: 'sqlite',
    };

    logger.info("Database configuration loaded from external storage");
    return this.config;
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
