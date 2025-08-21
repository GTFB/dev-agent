#!/usr/bin/env bun

/**
 * Storage Initialization Script
 * Creates external storage directories as configured in .dev-agent.json
 */

import { join } from "path";
import { logger } from "../src/utils/logger.js";

async function initializeStorage(): Promise<void> {
  try {
    // Read configuration
    const configFile = join(process.cwd(), ".dev-agent.json");
    const configContent = await Bun.file(configFile).text();
    const config = JSON.parse(configContent);

    if (!config.storage) {
      throw new Error("Storage configuration not found in .dev-agent.json");
    }

    const storagePath = config.storage;
    logger.info(`Initializing external storage at: ${storagePath}`);

    // Create storage directories
    const directories = [
      storagePath,
      join(storagePath, "database"),
      join(storagePath, "logs"),
      join(storagePath, "config"),
      join(storagePath, "backups")
    ];

    for (const dir of directories) {
      try {
        await Bun.write(join(dir, ".gitkeep"), "");
        logger.info(`Created directory: ${dir}`);
      } catch {
        logger.warn(`Directory might already exist: ${dir}`);
      }
    }

    logger.info("✅ External storage initialized successfully!");
    logger.info(`📁 Storage location: ${storagePath}`);
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
