#!/usr/bin/env bun

/**
 * Environment Variables Loader
 * Loads configuration from .env file and provides typed access
 */

import { config } from "dotenv";
import { join } from "path";

// Load .env file from project root
config({ path: join(process.cwd(), ".env") });

export interface EnvironmentConfig {
  // GitHub Configuration (SECRETS)
  GITHUB_TOKEN?: string;
  
  // LLM Configuration (SECRETS)
  OPENAI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  
  // Application Configuration (ENVIRONMENT)
  NODE_ENV?: string;
  LOG_LEVEL?: string;
}

/**
 * Get environment variable with type safety
 */
export function getEnv(key: keyof EnvironmentConfig): string | undefined {
  return process.env[key];
}

/**
 * Get required environment variable (throws if missing)
 */
export function getRequiredEnv(key: keyof EnvironmentConfig): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Check if environment variable is set
 */
export function hasEnv(key: keyof EnvironmentConfig): boolean {
  return !!getEnv(key);
}

/**
 * Get all environment variables
 */
export function getAllEnv(): EnvironmentConfig {
  return {
    GITHUB_TOKEN: getEnv("GITHUB_TOKEN"),
    OPENAI_API_KEY: getEnv("OPENAI_API_KEY"),
    GOOGLE_API_KEY: getEnv("GOOGLE_API_KEY"),
    NODE_ENV: getEnv("NODE_ENV") || "development",
    LOG_LEVEL: getEnv("LOG_LEVEL") || "info",
  };
}

/**
 * Validate required environment variables
 */
export function validateEnv(): string[] {
  const errors: string[] = [];
  
  // Only validate critical secrets that are absolutely required
  // Project rules (GITHUB_OWNER, GITHUB_REPO) should come from .dev-agent.json
  // and are not required in .env for local development
  
  // Note: GITHUB_TOKEN is optional for local development without GitHub integration
  // It will be required only when actually using GitHub features
  
  return errors;
}

/**
 * Load and validate environment
 */
export function loadEnvironment(): EnvironmentConfig {
  const config = getAllEnv();
  const errors = validateEnv();
  
  if (errors.length > 0) {
    console.warn("⚠️  Environment validation warnings:");
    errors.forEach(error => console.warn(`   - ${error}`));
  }
  
  return config;
}