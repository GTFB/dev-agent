#!/usr/bin/env bun

/**
 * Configuration Types and Interfaces
 * Centralized type definitions for all configuration layers
 */

export interface BaseConfig {
  readonly source: 'project' | 'environment' | 'database' | 'default';
  readonly priority: number; // Higher number = higher priority
}

export interface ProjectConfig extends BaseConfig {
  source: 'project';
  priority: 100;
  
  name: string;
  version: string;
  description: string;
  
  github: {
    owner: string;
    repo: string;
  };
  
  branches: {
    main: string;
    develop: string;
    feature_prefix: string;
    release_prefix: string;
  };
  
  goals: {
    default_status: string;
    id_pattern: string;
  };
  
  workflow: {
    auto_sync: boolean;
    sync_interval: number;
  };
  
  validation: {
    strict_language: boolean;
    auto_translate: boolean;
  };
}

export interface EnvironmentConfig extends BaseConfig {
  source: 'environment';
  priority: 200;
  
  // GitHub Configuration (SECRETS)
  GITHUB_TOKEN?: string;
  
  // LLM Configuration (SECRETS)
  OPENAI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  
  // Application Configuration (ENVIRONMENT)
  NODE_ENV?: string;
  LOG_LEVEL?: string;
}

export interface DatabaseConfig extends BaseConfig {
  source: 'database';
  priority: 300;
  
  path: string;
  type: 'sqlite' | 'postgresql' | 'mysql';
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

export interface LLMConfig extends BaseConfig {
  source: 'database';
  priority: 300;
  
  defaultProvider: string;
  apiKeys: Record<string, string>;
  models: Record<string, string>;
  maxTokens: number;
  temperature: number;
}

export interface GitHubConfig extends BaseConfig {
  source: 'database';
  priority: 300;
  
  token: string;
  owner: string;
  repo: string;
  baseUrl?: string;
}

export interface StorageConfig extends BaseConfig {
  source: 'database';
  priority: 300;
  
  dataDir: string;
  tempDir: string;
  backupDir: string;
}

export interface LoggingConfig extends BaseConfig {
  source: 'database';
  priority: 300;
  
  level: 'debug' | 'info' | 'warn' | 'error';
  file?: string;
  console: boolean;
}

export interface AppConfig {
  project: ProjectConfig;
  environment: EnvironmentConfig;
  database: DatabaseConfig;
  llm: LLMConfig;
  github?: GitHubConfig;
  storage: StorageConfig;
  logging: LoggingConfig;
}

export interface ConfigurationProvider<T extends BaseConfig> {
  load(): Promise<T>;
  validate(config: T): boolean;
  getPriority(): number;
  getSource(): string;
}

export interface ConfigurationValidator<T extends BaseConfig> {
  validate(config: T): { isValid: boolean; errors: string[] };
  getSchema(): object;
}
