#!/usr/bin/env bun

import { z } from "zod";

/**
 * Configuration Types and Interfaces
 * Centralized type definitions for all configuration layers
 */

// ZOD Schemas for configuration validation
export const GitHubConfigSchema = z.object({
  owner: z.string().min(1, "GitHub owner cannot be empty"),
  repo: z.string().min(1, "GitHub repository cannot be empty")
});

export const BranchesConfigSchema = z.object({
  main: z.string().min(1, "Main branch name cannot be empty"),
  develop: z.string().min(1, "Develop branch name cannot be empty"),
  feature_prefix: z.string().min(1, "Feature prefix cannot be empty"),
  release_prefix: z.string().min(1, "Release prefix cannot be empty")
});

export const GoalsConfigSchema = z.object({
  default_status: z.string().min(1, "Default status cannot be empty"),
  id_pattern: z.string().min(1, "ID pattern cannot be empty")
});

export const WorkflowConfigSchema = z.object({
  auto_sync: z.boolean(),
  sync_interval: z.number().positive("Sync interval must be positive")
});

export const ValidationConfigSchema = z.object({
  strict_language: z.boolean(),
  auto_translate: z.boolean()
});

export const StorageConfigSchema = z.object({
  database: z.object({
    path: z.string().min(1, "Database path cannot be empty")
  }),
  config: z.object({
    path: z.string().min(1, "Config path cannot be empty")
  }),
  logs: z.object({
    path: z.string().min(1, "Logs path cannot be empty")
  })
});

export const ConfigSchema = z.object({
  name: z.string().min(1, "Project name cannot be empty"),
  version: z.string().min(1, "Version cannot be empty"),
  description: z.string().min(1, "Description cannot be empty"),
  github: GitHubConfigSchema,
  branches: BranchesConfigSchema,
  goals: GoalsConfigSchema,
  workflow: WorkflowConfigSchema,
  validation: ValidationConfigSchema,
  storage: StorageConfigSchema,
  last_updated: z.string().datetime("Last updated must be a valid datetime")
});

// TypeScript types derived from ZOD schemas
export type GitHubConfig = z.infer<typeof GitHubConfigSchema>;
export type BranchesConfig = z.infer<typeof BranchesConfigSchema>;
export type GoalsConfig = z.infer<typeof GoalsConfigSchema>;
export type WorkflowConfig = z.infer<typeof WorkflowConfigSchema>;
export type ValidationConfig = z.infer<typeof ValidationConfigSchema>;
export type StorageConfig = z.infer<typeof StorageConfigSchema>;
export type Config = z.infer<typeof ConfigSchema>;

// Legacy types for backward compatibility
export interface ProjectConfig {
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

export interface EnvironmentConfig {
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

export interface DatabaseConfig {
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

export interface LLMConfig {
  source: 'database';
  priority: 300;
  
  defaultProvider: string;
  apiKeys: Record<string, string>;
  models: Record<string, string>;
  maxTokens: number;
  temperature: number;
}

export interface LoggingConfig {
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
  storage: StorageConfig;
  logging: LoggingConfig;
}

export interface ConfigurationProvider<T> {
  load(): Promise<T>;
  validate(config: T): boolean;
  getPriority(): number;
  getSource(): string;
}

export interface ConfigurationValidator<T> {
  validate(config: T): { isValid: boolean; errors: string[] };
  getSchema(): object;
}
