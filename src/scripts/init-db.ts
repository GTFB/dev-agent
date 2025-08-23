#!/usr/bin/env bun

/**
 * Database Initialization Script
 * Creates database and applies all migrations
 */

import { DatabaseManager } from "../core/database.js";
import { configManager } from "../config/config.js";

async function main() {
  try {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping database initialization');
      return;
    }

    console.log("🚀 Initializing Dev Agent Database...");
    
    // Get database configuration
    const dbConfig = configManager.getDatabaseConfig();
    console.log(`📊 Database: ${dbConfig.type} at ${dbConfig.path}`);
    
    // Initialize database with external path
    const dbPath = process.env.DEV_AGENT_DB_PATH || dbConfig.path;
    console.log(`🔧 Using database path: ${dbPath}`);
    const dbManager = new DatabaseManager(dbPath);
    await dbManager.initialize();
    
    // Get database statistics
    const stats = dbManager.getStats();
    console.log(`✅ Database initialized successfully!`);
    console.log(`📈 Tables: ${stats.tables.length}`);
    console.log(`💾 Size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Show available tables
    if (stats.tables.length > 0) {
      console.log("\n📋 Available tables:");
      stats.tables.forEach(table => {
        const schema = dbManager.getTableSchema(table);
        console.log(`   - ${table} (${schema.length} columns)`);
      });
    }
    
    // Show configuration statistics
    const configStats = configManager.getStats();
    console.log(`\n⚙️  Configuration:`);
    console.log(`   - Total configs: ${configStats.totalConfigs}`);
    console.log(`   - LLM providers: ${configStats.totalLLMProviders}`);
    console.log(`   - Categories: ${configStats.categories.join(', ')}`);
    
    // Close database connection
    dbManager.close();
    configManager.close();
    
    console.log("\n🎉 Database setup complete!");
    
  } catch (error) {
    console.error("❌ Failed to initialize database:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}
