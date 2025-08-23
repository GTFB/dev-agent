#!/usr/bin/env bun

/**
 * LLM Provider Management Script
 * Manages LLM providers, API keys, and configuration
 */

import { Database } from 'bun:sqlite';
import { join } from 'path';
import { existsSync } from 'fs';

// Database path - use environment variable or skip database operations
const DB_PATH = process.env.DEV_AGENT_DB_PATH || join(process.cwd(), 'data', '.dev-agent.db');

interface LLMProvider {
  provider: string;
  apiKey: string;
  apiBase?: string;
  model: string;
  config?: Record<string, unknown>;
  isDefault: boolean;
  status: string;
}

class LLMManager {
  private db: Database | null = null;

  constructor() {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping LLM manager initialization');
      return;
    }

    if (!existsSync(DB_PATH)) {
      console.log('📊 Database not found, skipping LLM manager initialization');
      return;
    }

    this.db = new Database(DB_PATH);
    this.ensureTable();
  }

  private ensureTable(): void {
    if (!this.db) {
      console.log('❌ Database not initialized, cannot ensure table.');
      return;
    }
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS llm (
        provider TEXT PRIMARY KEY NOT NULL,
        api_key TEXT NOT NULL,
        api_base TEXT,
        model TEXT NOT NULL,
        config TEXT,
        is_default BOOLEAN NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'testing')),
        rate_limit_ms INTEGER DEFAULT 1000,
        max_retries INTEGER DEFAULT 3,
        timeout_ms INTEGER DEFAULT 30000,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `);
  }

  addProvider(provider: string, apiKey: string, model: string, options: {
    apiBase?: string;
    config?: Record<string, unknown>;
    setAsDefault?: boolean;
  } = {}): void {
    if (!this.db) {
      console.log('❌ Database not initialized, cannot add provider.');
      return;
    }
    const {
      apiBase,
      config,
      setAsDefault = false
    } = options;

    if (setAsDefault) {
      this.db.exec("UPDATE llm SET is_default = 0");
    }

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO llm (
        provider, api_key, api_base, model, config, 
        is_default, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))
    `);

    const configJson = config ? JSON.stringify(config) : null;
    stmt.run(
      provider, apiKey, apiBase || null, model, configJson,
      setAsDefault ? 1 : 0
    );

    console.log(`✅ Added/updated LLM provider: ${provider}`);
    if (setAsDefault) {
      console.log(`   Set as default provider`);
    }
  }

  removeProvider(provider: string): void {
    if (!this.db) {
      console.log('❌ Database not initialized, cannot remove provider.');
      return;
    }
    const stmt = this.db.prepare("DELETE FROM llm WHERE provider = ?");
    const result = stmt.run(provider);
    
    if (result.changes > 0) {
      console.log(`✅ Removed LLM provider: ${provider}`);
    } else {
      console.log(`❌ Provider not found: ${provider}`);
    }
  }

  setDefaultProvider(provider: string): void {
    if (!this.db) {
      console.log('❌ Database not initialized, cannot set default provider.');
      return;
    }
    this.db.exec("UPDATE llm SET is_default = 0");
    const stmt = this.db.prepare("UPDATE llm SET is_default = 1 WHERE provider = ?");
    const result = stmt.run(provider);
    
    if (result.changes > 0) {
      console.log(`✅ Set ${provider} as default LLM provider`);
    } else {
      console.log(`❌ Provider not found: ${provider}`);
    }
  }

  listProviders(): void {
    if (!this.db) {
      console.log('❌ Database not initialized, cannot list providers.');
      return;
    }
    const stmt = this.db.prepare(`
      SELECT provider, model, is_default, status, api_base, created_at
      FROM llm ORDER BY is_default DESC, provider
    `);
    const providers = stmt.all() as Array<{
      provider: string;
      model: string;
      is_default: number;
      status: string;
      api_base: string | null;
      created_at: string;
    }>;

    if (providers.length === 0) {
      console.log("📭 No LLM providers configured");
      return;
    }

    console.log("🤖 LLM Providers:");
    console.log("==================");
    
    providers.forEach(p => {
      const defaultFlag = p.is_default ? "⭐ DEFAULT" : "";
      console.log(`\n${p.provider} ${defaultFlag}`);
      console.log(`   Model: ${p.model}`);
      console.log(`   Status: ${p.status}`);
      if (p.api_base) console.log(`   API Base: ${p.api_base}`);
      console.log(`   Created: ${p.created_at}`);
    });
  }

  testProvider(provider: string): void {
    if (!this.db) {
      console.log('❌ Database not initialized, cannot test provider.');
      return;
    }
    const stmt = this.db.prepare("SELECT * FROM llm WHERE provider = ?");
    const result = stmt.get(provider) as LLMProvider | undefined;
    
    if (!result) {
      console.log(`❌ Provider not found: ${provider}`);
      return;
    }

    console.log(`🧪 Testing provider: ${provider}`);
    console.log(`   API Key: ${result.apiKey ? '✅ Set' : '❌ Missing'}`);
    console.log(`   Model: ${result.model}`);
    console.log(`   Status: ${result.status}`);
    
    // Here you could add actual API testing logic
    console.log(`   ⚠️  API testing not implemented yet`);
  }

  updateProviderConfig(provider: string, updates: Partial<LLMProvider>): void {
    if (!this.db) {
      console.log('❌ Database not initialized, cannot update provider config.');
      return;
    }
    const current = this.db.prepare("SELECT * FROM llm WHERE provider = ?").get(provider) as LLMProvider | undefined;
    if (!current) {
      console.log(`❌ Provider not found: ${provider}`);
      return;
    }

    const fields: string[] = [];
    const values: (string | number | boolean)[] = [];
    
    if (updates.apiKey !== undefined) {
      fields.push("api_key = ?");
      values.push(updates.apiKey);
    }
    if (updates.model !== undefined) {
      fields.push("model = ?");
      values.push(updates.model);
    }
    if (updates.apiBase !== undefined) {
      fields.push("api_base = ?");
      values.push(updates.apiBase);
    }
    if (updates.status !== undefined) {
      fields.push("status = ?");
      values.push(updates.status);
    }

    if (fields.length === 0) {
      console.log(`❌ No updates specified for ${provider}`);
      return;
    }

    fields.push("updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))");
    
    const sql = `UPDATE llm SET ${fields.join(", ")} WHERE provider = ?`;
    const stmt = this.db.prepare(sql);
    stmt.run(...values, provider);
    
    console.log(`✅ Updated provider: ${provider}`);
  }

  close(): void {
    if (this.db) {
      this.db.close();
    }
  }
}

function showHelp(): void {
  console.log(`
🤖 LLM Provider Management

Usage: bun run src/scripts/llm-manager.ts <command> [options]

Commands:
  add <provider> <apiKey> <model> [options]     Add new LLM provider
  remove <provider>                              Remove LLM provider
  list                                           List all providers
  test <provider>                               Test provider configuration
  default <provider>                             Set default provider
  update <provider> [options]                    Update provider configuration

Examples:
  # Add OpenAI provider
  bun run src/scripts/llm-manager.ts add openai sk-... gpt-4 --setAsDefault

  # Add Gemini provider with custom settings
  bun run src/scripts/llm-manager.ts add gemini AIza... gemini-pro --apiBase https://custom-api.com

  # Set default provider
  bun run src/scripts/llm-manager.ts default gemini

  # Update provider settings
  bun run src/scripts/llm-manager.ts update openai --status inactive

  # List all providers
  bun run src/scripts/llm-manager.ts list

  # Test provider
  bun run src/scripts/llm-manager.ts test openai

Options:
  --apiBase <url>        Custom API base URL
  --setAsDefault         Set as default provider
  --status <status>      Provider status (active/inactive/testing)
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    showHelp();
    return;
  }

  const manager = new LLMManager();
  
  try {
    const command = args[0];
    
    switch (command) {
      case 'add': {
        if (args.length < 4) {
          console.log("❌ Usage: add <provider> <apiKey> <model> [options]");
          return;
        }
        
        const [, provider, apiKey, model, ...options] = args;
        const parsedOptions: {
          apiBase?: string;
          setAsDefault?: boolean;
        } = {};
        
        for (let i = 0; i < options.length; i += 2) {
          if (options[i].startsWith('--')) {
            const key = options[i].slice(2);
            const value = options[i + 1];
            
            switch (key) {
              case 'apiBase':
                parsedOptions.apiBase = value;
                break;
              case 'setAsDefault':
                parsedOptions.setAsDefault = value === 'true';
                break;
            }
          }
        }
        
        manager.addProvider(provider, apiKey, model, parsedOptions);
        break;
      }
      
      case 'remove': {
        if (args.length < 2) {
          console.log("❌ Usage: remove <provider>");
          return;
        }
        manager.removeProvider(args[1]);
        break;
      }
      
      case 'list':
        manager.listProviders();
        break;
      
      case 'test': {
        if (args.length < 2) {
          console.log("❌ Usage: test <provider>");
          return;
        }
        manager.testProvider(args[1]);
        break;
      }
      
      case 'default': {
        if (args.length < 2) {
          console.log("❌ Usage: default <provider>");
          return;
        }
        manager.setDefaultProvider(args[1]);
        break;
      }
      
      case 'update': {
        if (args.length < 2) {
          console.log("❌ Usage: update <provider> [options]");
          return;
        }
        
        const provider = args[1];
        const updates: Partial<LLMProvider> = {};
        
        for (let i = 2; i < args.length; i += 2) {
          if (args[i].startsWith('--')) {
            const key = args[i].slice(2);
            const value = args[i + 1];
            
            switch (key) {
              case 'status':
                updates.status = value;
                break;
            }
          }
        }
        
        manager.updateProviderConfig(provider, updates);
        break;
      }
      
      default:
        console.log(`❌ Unknown command: ${command}`);
        showHelp();
    }
  } finally {
    manager.close();
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
