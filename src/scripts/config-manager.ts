#!/usr/bin/env bun

/**
 * Configuration Manager CLI
 * Manages Dev Agent configuration via command line
 */

import { configManager } from "../config/config.js";
import { DatabaseManager } from "../core/database.js";

interface CommandOptions {
  action: 'show' | 'set' | 'init' | 'validate' | 'reset';
  key?: string;
  value?: string;
}

async function showConfig() {
  try {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping config show');
      return;
    }

    console.log("📋 Current Configuration:");
    console.log("=".repeat(50));
  
    // Show database config
    const dbConfig = configManager.getDatabaseConfig();
    console.log("📊 Database Configuration:");
    console.log(`   Type: ${dbConfig.type}`);
    console.log(`   Path: ${dbConfig.path}\n`);
    
    // Show project config
    const projectConfig = configManager.getProjectConfig();
    console.log("📁 Project Configuration:");
    console.log(`   Name: ${projectConfig.name}`);
    console.log(`   Version: ${projectConfig.version}`);
    console.log(`   Description: ${projectConfig.description}`);
    console.log(`   Author: ${projectConfig.author}`);
    console.log(`   License: ${projectConfig.license}`);
    console.log(`   Repository: ${projectConfig.repository}\n`);
    
    // Show GitHub config
    const githubConfig = configManager.getGitHubConfig();
    if (githubConfig) {
      console.log("🐙 GitHub Configuration:");
      console.log(`   Owner: ${githubConfig.owner}`);
      console.log(`   Repository: ${githubConfig.repo}`);
      if (githubConfig.baseUrl) {
        console.log(`   Base URL: ${githubConfig.baseUrl}`);
      }
      console.log("");
    } else {
      console.log("🐙 GitHub Configuration: Not configured\n");
    }
    
    // Show LLM config
    const llmProviders = configManager.getAllLLMProviders();
    console.log("🤖 LLM Configuration:");
    if (llmProviders.length > 0) {
      llmProviders.forEach(provider => {
        const status = provider.isDefault ? ' (default)' : '';
        console.log(`   ${provider.provider}: ${provider.model}${status}`);
      });
    } else {
      console.log("   No LLM providers configured");
    }
    console.log("");
    
    // Show logging config
    const loggingConfig = configManager.getLoggingConfig();
    console.log("📝 Logging Configuration:");
    console.log(`   Level: ${loggingConfig.level}`);
    console.log(`   Console: ${loggingConfig.console ? 'enabled' : 'disabled'}\n`);
    
    // Show storage config
    const storageConfig = configManager.getStorageConfig();
    console.log("💾 Storage Configuration:");
    console.log(`   Data Directory: ${storageConfig.dataDir}`);
    console.log(`   Backup Directory: ${storageConfig.backupDir}\n`);
    
    // Show configuration statistics
    const stats = configManager.getStats();
    console.log("📈 Configuration Statistics:");
    console.log(`   Total Configurations: ${stats.totalConfigs}`);
    console.log(`   LLM Providers: ${stats.totalLLMProviders}`);
    console.log(`   Categories: ${stats.categories.join(', ')}`);
  } catch (error) {
    console.error("❌ Failed to show configuration:", error);
  }
}

async function setConfig(key: string, value: string) {
  try {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping config set');
      return;
    }

    console.log(`🔧 Setting configuration: ${key} = ${value}`);
    
    // Determine category from key
    const category = key.split('.')[0];
    
    // Set the configuration
    configManager.setConfig(key, value, 'string', `Set via CLI`, category);
    
    console.log(`✅ Set ${key} = ${value}`);
    
    // Show updated configuration
    const currentValue = configManager.getConfig(key);
    console.log(`📋 Current value: ${currentValue}`);
    
  } catch (error) {
    console.error("❌ Failed to set configuration:", error);
  }
}

async function initDatabase() {
  try {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping database initialization');
      return;
    }

    console.log("🗄️  Initializing database...");
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
  try {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping config validation');
      return;
    }

    console.log("🔍 Validating configuration...");
    // Get configuration statistics
    const stats = configManager.getStats();
    
    if (stats.totalConfigs > 0) {
      console.log("✅ Configuration is valid");
      console.log(`📊 Total configurations: ${stats.totalConfigs}`);
      console.log(`🤖 LLM providers: ${stats.totalLLMProviders}`);
      console.log(`📂 Categories: ${stats.categories.join(', ')}`);
    } else {
      console.log("⚠️  No configurations found");
    }
  } catch (error) {
    console.error("❌ Configuration validation failed:", error);
  }
}

async function resetConfig() {
  try {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping config reset');
      return;
    }

    console.log("🔄 Resetting configuration to defaults...");
    
    // Re-initialize default configuration
    const newConfigManager = new (await import("../config/config.js")).ConfigManager();
    
    console.log("✅ Configuration reset to defaults");
    
    // Show new configuration
    const stats = newConfigManager.getStats();
    console.log(`📊 Total configurations: ${stats.totalConfigs}`);
    
    newConfigManager.close();
  } catch (error) {
    console.error("❌ Failed to reset configuration:", error);
  }
}

async function main() {
  try {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping config manager operations');
      return;
    }

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
      action: args[0] as 'show' | 'set' | 'init' | 'validate' | 'reset'
    };
  
    if (args[0] === 'set' && args.length >= 3) {
      options.key = args[1];
      options.value = args[2];
    }
  
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
  } finally {
    // Only close if database was initialized
    if (process.env.DEV_AGENT_DB_PATH) {
      configManager.close();
    }
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}
