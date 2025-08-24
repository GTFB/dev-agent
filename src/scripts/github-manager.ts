#!/usr/bin/env bun

/**
 * GitHub Configuration Management Script
 * Manages GitHub repository settings, tokens, and branch configuration
 */

import { Database } from 'bun:sqlite';
import { join } from 'path';
import { existsSync } from 'fs';

// Database path - use environment variable or skip database operations
const DB_PATH = process.env.DEV_AGENT_DB_PATH || join(process.cwd(), 'data', '.dev-agent.db');

interface GitHubConfig {
  owner: string;
  repo: string;
  token: string;
  baseUrl?: string;
  apiVersion?: string;
}

interface BranchConfig {
  main: string;
  develop: string;
  featurePrefix: string;
  releasePrefix: string;
  hotfixPrefix: string;
}

class GitHubManager {
  private db: Database | null = null;

  constructor() {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping GitHub manager initialization');
      return;
    }

    if (!existsSync(DB_PATH)) {
      console.log('📊 Database not found, skipping GitHub manager initialization');
      return;
    }

    this.db = new Database(DB_PATH);
    this.ensureTables();
  }

  private ensureTables(): void {
    if (!this.db) return;
    
    // Ensure config table exists
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'string' CHECK(type IN ('string', 'number', 'boolean', 'json')),
        description TEXT,
        category TEXT NOT NULL,
        required BOOLEAN NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `);
  }

  setGitHubConfig(config: GitHubConfig): void {
    if (!this.db) return;
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO config (key, value, type, description, category, required, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))
    `);

    // Set GitHub configuration
    stmt.run('github.owner', config.owner, 'string', 'GitHub repository owner', 'github', 1);
    stmt.run('github.repo', config.repo, 'string', 'GitHub repository name', 'github', 1);
    stmt.run('github.token', config.token, 'string', 'GitHub personal access token', 'github', 1);
    
    if (config.baseUrl) {
      stmt.run('github.baseUrl', config.baseUrl, 'string', 'GitHub API base URL', 'github', 0);
    }
    
    if (config.apiVersion) {
      stmt.run('github.apiVersion', config.apiVersion, 'string', 'GitHub API version', 'github', 0);
    }

    console.log(`✅ GitHub configuration updated for ${config.owner}/${config.repo}`);
  }

  setBranchConfig(branches: BranchConfig): void {
    if (!this.db) return;
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO config (key, value, type, description, category, required, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))
    `);

    stmt.run('branches.main', branches.main, 'string', 'Main branch name', 'branches', 1);
    stmt.run('branches.develop', branches.develop, 'string', 'Development branch name', 'branches', 1);
    stmt.run('branches.featurePrefix', branches.featurePrefix, 'string', 'Feature branch prefix', 'branches', 1);
    stmt.run('branches.releasePrefix', branches.releasePrefix, 'string', 'Release branch prefix', 'branches', 1);
    stmt.run('branches.hotfixPrefix', branches.hotfixPrefix, 'string', 'Hotfix branch prefix', 'branches', 1);

    console.log(`✅ Branch configuration updated`);
  }

  setGoalConfig(goals: {
    defaultStatus: string;
    idPattern: string;
    autoCreateBranches: boolean;
    autoSyncIssues: boolean;
  }): void {
    if (!this.db) return;
    
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO config (key, value, type, description, category, required, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))
    `);

    stmt.run('goals.defaultStatus', goals.defaultStatus, 'string', 'Default goal status', 'goals', 1);
    stmt.run('goals.idPattern', goals.idPattern, 'string', 'Goal ID pattern', 'goals', 1);
    stmt.run('goals.autoCreateBranches', goals.autoCreateBranches.toString(), 'boolean', 'Auto-create branches for goals', 'goals', 1);
    stmt.run('goals.autoSyncIssues', goals.autoSyncIssues.toString(), 'boolean', 'Auto-sync with GitHub issues', 'goals', 1);

    console.log(`✅ Goal configuration updated`);
  }

  getGitHubConfig(): GitHubConfig | null {
    if (!this.db) return null;
    
    const stmt = this.db.prepare("SELECT key, value FROM config WHERE category = 'github'");
    const results = stmt.all() as Array<{ key: string; value: string }>;
    
    if (results.length === 0) {
      return null;
    }

    const config: Record<string, string> = {};
    results.forEach(row => {
      const key = row.key.replace('github.', '');
      config[key] = row.value;
    });

    // Validate required fields before casting
    if (!config.owner || !config.repo || !config.token) {
      return null;
    }

    return config as unknown as GitHubConfig;
  }

  getBranchConfig(): BranchConfig | null {
    if (!this.db) return null;
    
    const stmt = this.db.prepare("SELECT key, value FROM config WHERE category = 'branches'");
    const results = stmt.all() as Array<{ key: string; value: string }>;
    
    if (results.length === 0) {
      return null;
    }

    const config: Record<string, string> = {};
    results.forEach(row => {
      const key = row.key.replace('branches.', '');
      config[key] = row.value;
    });

    // Validate required fields before casting
    if (!config.main || !config.develop || !config.featurePrefix || !config.releasePrefix || !config.hotfixPrefix) {
      return null;
    }

    return config as unknown as BranchConfig;
  }

  getGoalConfig(): Record<string, string> | null {
    if (!this.db) return null;
    
    const stmt = this.db.prepare("SELECT key, value FROM config WHERE category = 'goals'");
    const results = stmt.all() as Array<{ key: string; value: string }>;
    
    if (results.length === 0) {
      return null;
    }

    const config: Record<string, string> = {};
    results.forEach(row => {
      const key = row.key.replace('goals.', '');
      config[key] = row.value;
    });

    return config;
  }

  showConfig(): void {
    console.log("🐙 GitHub Configuration");
    console.log("=======================");
    
    const github = this.getGitHubConfig();
    if (github) {
      console.log(`\n📁 Repository: ${github.owner}/${github.repo}`);
      console.log(`🔑 Token: ${github.token ? '✅ Set' : '❌ Missing'}`);
      if (github.baseUrl) console.log(`🌐 Base URL: ${github.baseUrl}`);
      if (github.apiVersion) console.log(`📡 API Version: ${github.apiVersion}`);
    } else {
      console.log("\n❌ No GitHub configuration found");
    }

    const branches = this.getBranchConfig();
    if (branches) {
      console.log(`\n🌿 Branch Configuration:`);
      console.log(`   Main: ${branches.main}`);
      console.log(`   Develop: ${branches.develop}`);
      console.log(`   Feature Prefix: ${branches.featurePrefix}`);
      console.log(`   Release Prefix: ${branches.releasePrefix}`);
      console.log(`   Hotfix Prefix: ${branches.hotfixPrefix}`);
    }

    const goals = this.getGoalConfig();
    if (goals) {
      console.log(`\n🎯 Goal Configuration:`);
      console.log(`   Default Status: ${goals.defaultStatus}`);
      console.log(`   ID Pattern: ${goals.idPattern}`);
      console.log(`   Auto-create Branches: ${goals.autoCreateBranches}`);
      console.log(`   Auto-sync Issues: ${goals.autoSyncIssues}`);
    }
  }

  testConnection(): void {
    const config = this.getGitHubConfig();
    if (!config || !config.token) {
      console.log("❌ GitHub configuration not found or incomplete");
      return;
    }

    console.log("🧪 Testing GitHub connection...");
    console.log(`   Repository: ${config.owner}/${config.repo}`);
    console.log(`   Token: ${config.token ? '✅ Set' : '❌ Missing'}`);
    
    // Here you could add actual GitHub API testing
    console.log("   ⚠️  API testing not implemented yet");
    console.log("   💡 Use 'github test' command when implemented");
  }

  removeConfig(): void {
    if (!this.db) return;
    
    const stmt = this.db.prepare("DELETE FROM config WHERE category IN ('github', 'branches', 'goals')");
    const result = stmt.run();
    
    console.log(`✅ Removed ${result.changes} configuration entries`);
  }

  close(): void {
    this.db?.close();
  }
}

function showHelp(): void {
  console.log(`
🐙 GitHub Configuration Management

Usage: bun run src/scripts/github-manager.ts <command> [options]

Commands:
  setup <owner> <repo> <token> [options]    Setup GitHub configuration
  branches <main> <develop> <feature> <release> <hotfix>  Configure branch naming
  goals <status> <pattern> [options]        Configure goal settings
  show                                        Show current configuration
  test                                        Test GitHub connection
  remove                                      Remove all GitHub configuration
  help                                        Show this help

Examples:
  # Setup basic GitHub configuration
  bun run src/scripts/github-manager.ts setup myuser myrepo ghp_...

  # Setup with custom GitHub Enterprise
  bun run src/scripts/github-manager.ts setup myuser myrepo ghp_... --baseUrl https://github.company.com

  # Configure branch naming
  bun run src/scripts/github-manager.ts branches main develop feature release hotfix

  # Configure goal settings
  bun run src/scripts/github-manager.ts goals todo "^g-[a-z0-9]{6}$" --autoCreateBranches --autoSyncIssues

  # Show current configuration
  bun run src/scripts/github-manager.ts show

  # Test connection
  bun run src/scripts/github-manager.ts test

  # Remove configuration
  bun run src/scripts/github-manager.ts remove

Options:
  --baseUrl <url>           Custom GitHub API base URL
  --apiVersion <version>    GitHub API version (default: v3)
  --autoCreateBranches      Auto-create branches for goals
  --autoSyncIssues          Auto-sync with GitHub issues
`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    showHelp();
    return;
  }

  const manager = new GitHubManager();
  
  try {
    const command = args[0];
    
    switch (command) {
      case 'setup': {
        if (args.length < 4) {
          console.log("❌ Usage: setup <owner> <repo> <token> [options]");
          return;
        }
        
        const [, owner, repo, token, ...options] = args;
        const config: GitHubConfig = { owner, repo, token };
        
        for (let i = 0; i < options.length; i += 2) {
          if (options[i] === '--baseUrl') {
            config.baseUrl = options[i + 1];
          } else if (options[i] === '--apiVersion') {
            config.apiVersion = options[i + 1];
          }
        }
        
        manager.setGitHubConfig(config);
        break;
      }
      
      case 'branches': {
        if (args.length < 6) {
          console.log("❌ Usage: branches <main> <develop> <feature> <release> <hotfix>");
          return;
        }
        
        const branches: BranchConfig = {
          main: args[1],
          develop: args[2],
          featurePrefix: args[3],
          releasePrefix: args[4],
          hotfixPrefix: args[5]
        };
        
        manager.setBranchConfig(branches);
        break;
      }
      
      case 'goals': {
        if (args.length < 3) {
          console.log("❌ Usage: goals <status> <pattern> [options]");
          return;
        }
        
        const goals = {
          defaultStatus: args[1],
          idPattern: args[2],
          autoCreateBranches: args.includes('--autoCreateBranches'),
          autoSyncIssues: args.includes('--autoSyncIssues')
        };
        
        manager.setGoalConfig(goals);
        break;
      }
      
      case 'show':
        manager.showConfig();
        break;
      
      case 'test':
        manager.testConnection();
        break;
      
      case 'remove':
        manager.removeConfig();
        break;
      
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
