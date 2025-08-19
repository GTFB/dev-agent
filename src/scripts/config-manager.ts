#!/usr/bin/env bun

/**
 * Configuration Management Script
 * Allows viewing and updating configuration settings
 */

import { configManager } from "../config/config.js";
import { DatabaseManager } from "../core/database.js";

interface CommandOptions {
  action: 'show' | 'set' | 'init' | 'validate' | 'reset';
  key?: string;
  value?: string;
}

async function showConfig() {
  const config = configManager.getConfig();
  console.log("🔧 Current Configuration:");
  console.log(JSON.stringify(config, null, 2));
}

async function setConfig(key: string, value: string) {
  try {
    // Parse the key path (e.g., "database.path" -> ["database", "path"])
    const keys = key.split('.');
    const config = configManager.getConfig();
    
    // Navigate to the nested property
    let current: any = config;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    // Set the value
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
    
    // Save the configuration
    await configManager.updateConfig(config);
    console.log(`✅ Set ${key} = ${value}`);
    
  } catch (error) {
    console.error(`❌ Failed to set ${key}:`, error);
  }
}

async function initDatabase() {
  try {
    console.log("🚀 Initializing database...");
    const dbManager = new DatabaseManager();
    await dbManager.initialize();
    
    const stats = dbManager.getStats();
    console.log(`✅ Database initialized with ${stats.tables.length} tables`);
    
    dbManager.close();
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
  }
}

async function validateConfig() {
  const errors = configManager.validate();
  if (errors.length === 0) {
    console.log("✅ Configuration is valid");
  } else {
    console.error("❌ Configuration errors:");
    errors.forEach(error => console.error(`   - ${error}`));
  }
}

async function resetConfig() {
  try {
    // Reset to defaults
    await configManager.updateConfig(configManager.getConfig());
    console.log("✅ Configuration reset to defaults");
  } catch (error) {
    console.error("❌ Failed to reset configuration:", error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("🔧 Dev Agent Configuration Manager");
    console.log("\nUsage:");
    console.log("  bun run config-manager.ts show                    - Show current configuration");
    console.log("  bun run config-manager.ts set <key> <value>       - Set configuration value");
    console.log("  bun run config-manager.ts init                    - Initialize database");
    console.log("  bun run config-manager.ts validate                - Validate configuration");
    console.log("  bun run config-manager.ts reset                   - Reset to defaults");
    console.log("\nExamples:");
    console.log("  bun run config-manager.ts set database.path ./custom/path.db");
    console.log("  bun run config-manager.ts set llm.defaultProvider anthropic");
    return;
  }
  
  const options: CommandOptions = {
    action: args[0] as any
  };
  
  if (args[0] === 'set' && args.length >= 3) {
    options.key = args[1];
    options.value = args[2];
  }
  
  try {
    // Load configuration first
    await configManager.load();
    
    switch (options.action) {
      case 'show':
        await showConfig();
        break;
      case 'set':
        if (options.key && options.value) {
          await setConfig(options.key, options.value);
        } else {
          console.error("❌ Key and value required for 'set' action");
        }
        break;
      case 'init':
        await initDatabase();
        break;
      case 'validate':
        await validateConfig();
        break;
      case 'reset':
        await resetConfig();
        break;
      default:
        console.error(`❌ Unknown action: ${options.action}`);
        process.exit(1);
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}
