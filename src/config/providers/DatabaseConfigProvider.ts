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

    // Ensure database is created only in data/ directory
    const dbPath = join(process.cwd(), "data", ".dev-agent.db");
    
    // Validate that we're not trying to create database in root
    if (dbPath.includes("dev-agent.db") && !dbPath.includes("data")) {
      throw new Error("Database must be created in data/ directory, not in root");
    }

    // For now, provide default SQLite configuration
    // In the future, this could load from database or other sources
    this.config = {
      source: 'database',
      priority: 300,
      path: dbPath,
      type: 'sqlite',
    };

    logger.info("Database configuration loaded (default SQLite)");
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
