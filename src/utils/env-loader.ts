#!/usr/bin/env bun

/**
 * Environment variables loader for Dev Agent
 * Loads configuration from database.env file
 */

import { readFileSync, existsSync } from "fs";

/**
 * Load environment variables from database.env file
 */
export function loadDatabaseConfig(): void {
  const configFile = "G:\\Common\\Altrp\\dev-agent\\.env";
  
  if (!existsSync(configFile)) {
    console.log("ℹ️  Configuration file not found, using default settings");
    return;
  }

  try {
    const content = readFileSync(configFile, "utf8");
    const lines = content.split("\n");
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith("#") || !trimmedLine.includes("=")) {
        continue;
      }
      
      const [key, value] = trimmedLine.split("=", 2);
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
    
    console.log("✅ Database configuration loaded");
  } catch (error) {
    console.error("❌ Error loading configuration:", error);
  }
}

/**
 * Get database path from environment or default
 */
export function getDatabasePath(): string {
  return process.env.DEV_AGENT_DB_PATH || "./database.db";
}

/**
 * Check if custom database path is configured
 */
export function hasCustomDatabasePath(): boolean {
  return !!process.env.DEV_AGENT_DB_PATH;
}

// Backward-compatible helpers expected by other modules
export interface EnvironmentConfig {
  GITHUB_TOKEN?: string;
  OPENAI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  NODE_ENV?: string;
  LOG_LEVEL?: string;
}

export function getEnv(key: keyof EnvironmentConfig): string | undefined {
  return process.env[key as string];
}

export function getRequiredEnv(key: keyof EnvironmentConfig): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Required environment variable ${String(key)} is not set`);
  }
  return value;
}

export function hasEnv(key: keyof EnvironmentConfig): boolean {
  return !!getEnv(key);
}

export function getAllEnv(): EnvironmentConfig {
  return {
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    NODE_ENV: process.env.NODE_ENV || "development",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
  };
}

export function loadEnvironment(): EnvironmentConfig {
  // Load DB config first (if present)
  loadDatabaseConfig();
  return getAllEnv();
}