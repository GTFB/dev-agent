#!/usr/bin/env bun

/**
 * Storage Initialization Script
 * Creates external storage directories as configured in config.json
 */

import { join } from "path";
import { logger } from "../src/utils/logger.js";
import { ConfigValidator } from "../src/config/validators/ConfigValidator.js";

async function initializeStorage(): Promise<void> {
  try {
    // Read configuration
    const configFile = join(process.cwd(), "config.json");
    const configContent = await Bun.file(configFile).text();
    const config = JSON.parse(configContent);

    // Validate configuration with ZOD
    const validation = ConfigValidator.validate(config);
    if (!validation.success) {
      logger.error("❌ Configuration validation failed:");
      console.error(ConfigValidator.formatErrors(validation.errors));
      process.exit(1);
    }

    if (!validation.data.storage) {
      throw new Error("Storage configuration not found in config.json");
    }

    const storageConfig = validation.data.storage;
    logger.info(`Initializing external storage...`);

    // Create storage directories from config
    const directories = [
      storageConfig.database?.path,
      storageConfig.config?.path,
      storageConfig.logs?.path
    ].filter(Boolean); // Remove undefined values

    for (const dir of directories) {
      if (dir) {
        try {
          // Create parent directory if it doesn't exist
          const parentDir = join(dir, "..");
          await Bun.write(join(parentDir, ".gitkeep"), "");
          logger.info(`Created directory: ${parentDir}`);
        } catch {
          logger.warn(`Directory might already exist: ${dir}`);
        }
      }
    }

    logger.info("✅ External storage initialized successfully!");
    logger.info("💡 You can now safely delete the local 'data/' folder");

  } catch (error) {
    logger.error("Failed to initialize storage", error as Error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  initializeStorage();
}
