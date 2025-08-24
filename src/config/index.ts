#!/usr/bin/env bun

/**
 * Configuration Module Exports
 * Central export point for all configuration-related functionality
 */

// Core types and interfaces
export * from "./types.js";

// Main configuration manager
export { ConfigurationManager, configManager } from "./ConfigurationManager.js";

// Configuration providers
export { ProjectConfigProvider } from "./providers/ProjectConfigProvider.js";
export { EnvironmentConfigProvider } from "./providers/EnvironmentConfigProvider.js";
export { DatabaseConfigProvider } from "./providers/DatabaseConfigProvider.js";

// Legacy exports for backward compatibility
export { ConfigManager } from "./config.js";
export { LLMConfigManager } from "./llm-config.js";
