#!/usr/bin/env bun

/**
 * Configuration Usage Example
 * Demonstrates how to use the new configuration architecture
 */

import { configManager } from "../index.js";
import { logger } from "../../utils/logger.js";

async function demonstrateConfiguration() {
  try {
    logger.info("🚀 Starting configuration demonstration...");

    // 1. Load all configurations
    logger.info("📋 Loading all configurations...");
    const allConfig = await configManager.loadAll();
    logger.info(`✅ Loaded ${Object.keys(allConfig).length} configuration sections`);

    // 2. Access specific configuration types
    logger.info("🔍 Accessing specific configuration types...");
    
    const projectConfig = await configManager.getProjectConfig();
    logger.info(`📁 Project: ${projectConfig.name} v${projectConfig.version}`);
    logger.info(`🐙 GitHub: ${projectConfig.github.owner}/${projectConfig.github.repo}`);
    logger.info(`🌿 Branches: main=${projectConfig.branches.main}, develop=${projectConfig.branches.develop}`);
    logger.info(`🔒 Validation: strict=${projectConfig.validation.strict_language}, auto-translate=${projectConfig.validation.auto_translate}`);
    
    const envConfig = await configManager.getEnvironmentConfig();
    logger.info(`🌍 Environment: ${envConfig.NODE_ENV}`);
    logger.info(`📝 Log Level: ${envConfig.LOG_LEVEL}`);
    
    const dbConfig = await configManager.getDatabaseConfig();
    logger.info(`🗄️  Database: ${dbConfig.type} at ${dbConfig.path}`);

    // 3. Validate configurations
    logger.info("✅ Validating configurations...");
    const validation = await configManager.validateAll();
    if (validation.isValid) {
      logger.info("🎉 All configurations are valid!");
    } else {
      logger.error("❌ Configuration validation failed:", new Error(validation.errors.join(", ")));
    }

    // 4. Demonstrate caching
    logger.info("⚡ Demonstrating caching...");
    const startTime = Date.now();
    await configManager.loadAll(); // Should use cache
    const cacheTime = Date.now() - startTime;
    logger.info(`💨 Cached load took ${cacheTime}ms`);

    // 5. Clear cache and reload
    logger.info("🔄 Clearing cache and reloading...");
    configManager.clearCache();
    const reloadStartTime = Date.now();
    await configManager.loadAll(); // Should reload from sources
    const reloadTime = Date.now() - reloadStartTime;
    logger.info(`🔄 Reload took ${reloadTime}ms`);

    logger.info("🎉 Configuration demonstration completed successfully!");

  } catch (error) {
    logger.error("❌ Configuration demonstration failed", error as Error);
    throw error;
  }
}

// Run the demonstration if this file is executed directly
if (import.meta.main) {
  demonstrateConfiguration()
    .then(() => {
      logger.info("✨ Example completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("💥 Example failed", error);
      process.exit(1);
    });
}

export { demonstrateConfiguration };
