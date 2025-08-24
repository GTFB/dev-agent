#!/usr/bin/env bun

/**
 * Language Check Script for Git Hooks
 * Automatically checks language compliance in staged files
 * Also pre-installs configurations in database on first run
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Database } from 'bun:sqlite';

// File extensions to check
const TEXT_EXTENSIONS = [
  '.md', '.txt', '.js', '.ts', '.jsx', '.tsx', '.vue', '.py', '.java', '.cpp', '.c',
  '.h', '.hpp', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala'
];

// Files to ignore
const IGNORE_FILES = [
  'node_modules', '.git', 'build', 'coverage', '.next', '.nuxt',
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lock'
];

// Database path - use environment variable or skip database operations
const DB_PATH = process.env.DEV_AGENT_DB_PATH || path.join(process.cwd(), 'data', '.dev-agent.db');

/**
 * Pre-install configurations in database
 */
function preInstallConfigs(): void {
  try {
    // Skip database operations if no custom path is configured
    if (!process.env.DEV_AGENT_DB_PATH) {
      console.log('📊 No custom database path configured, skipping config pre-installation');
      return;
    }

    if (!fs.existsSync(DB_PATH)) {
      console.log('📊 Database not found, skipping config pre-installation');
      return;
    }

    const db = new Database(DB_PATH);
    
    // Check if configs already exist
    const configCount = db.prepare("SELECT COUNT(*) as count FROM config").get() as { count: number };
    
    if (configCount.count === 0) {
      console.log('⚙️  Pre-installing configurations in database...');
      
      // Create config table if it doesn't exist
      db.exec(`
        CREATE TABLE IF NOT EXISTS config (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'string',
          description TEXT,
          category TEXT NOT NULL,
          required BOOLEAN NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        )
      `);

      // Create llm table if it doesn't exist
      db.exec(`
        CREATE TABLE IF NOT EXISTS llm (
          provider TEXT PRIMARY KEY NOT NULL,
          api_key TEXT NOT NULL,
          api_base TEXT,
          model TEXT NOT NULL,
          config TEXT,
          is_default BOOLEAN NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'active',
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        )
      `);

      // Insert default configurations
      const defaultConfigs = [
        // Database config
        ['database.path', DB_PATH, 'string', 'Database file path', 'database'],
        ['database.type', 'sqlite', 'string', 'Database type', 'database'],
        
        // Project config
        ['project.name', 'Dev Agent', 'string', 'Project name', 'project'],
        ['project.version', '2.0.0', 'string', 'Project version', 'project'],
        ['project.description', 'CLI assistant for automating the High-Efficiency Standard Operating Protocol', 'string', 'Project description', 'project'],
        ['project.author', 'Dev Agent Team', 'string', 'Project author', 'project'],
        ['project.license', 'MIT', 'string', 'Project license', 'project'],
        ['project.repository', 'https://github.com/dev-agent/dev-agent', 'string', 'Project repository', 'project'],
        
        // Logging config
        ['logging.level', 'info', 'string', 'Logging level', 'logging'],
        ['logging.console', 'true', 'boolean', 'Console logging enabled', 'logging'],
        
        // Storage config - changed to root directory
        ['storage.dataDir', process.cwd(), 'string', 'Data directory', 'storage'],
        ['storage.backupDir', path.join(process.cwd(), 'backups'), 'string', 'Backup directory', 'storage'],
        
        // LLM config
        ['llm.defaultProvider', 'openai', 'string', 'Default LLM provider', 'llm'],
        ['llm.maxTokens', '4096', 'number', 'Maximum tokens for LLM', 'llm'],
        ['llm.temperature', '0.7', 'number', 'LLM temperature', 'llm']
      ];

      const insertStmt = db.prepare(`
        INSERT OR REPLACE INTO config (key, value, type, description, category, updated_at)
        VALUES (?, ?, ?, ?, ?, (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')))
      `);

      for (const config of defaultConfigs) {
        insertStmt.run(...config);
      }

      console.log('✅ Configurations pre-installed successfully');
    }
    
    db.close();
  } catch (error) {
    console.warn('⚠️  Failed to pre-install configurations:', error);
  }
}

function isTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.includes(ext);
}

function shouldIgnoreFile(filePath: string): boolean {
  return IGNORE_FILES.some(ignore => filePath.includes(ignore));
}

function getStagedFiles(): string[] {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    console.log('No staged files or not a git repository');
    return [];
  }
}

interface LanguageCheckResult {
  file: string;
  hasRussian: boolean;
  russianCount?: number;
  totalChars?: number;
  russianPercentage?: string;
  lines?: Array<{
    lineNumber: number;
    content: string;
    hasRussian: boolean;
  }>;
  error?: string;
}

function checkFileLanguage(filePath: string): LanguageCheckResult {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Simple Russian character detection using Unicode ranges
    const russianChars = content.match(/[\u0400-\u04FF\u0500-\u052F]/gi);
    if (russianChars) {
      const russianCount = russianChars.length;
      const totalChars = content.replace(/\s/g, '').length;
      const russianPercentage = (russianCount / totalChars * 100).toFixed(1);
      
      return {
        file: filePath,
        hasRussian: true,
        russianCount,
        totalChars,
        russianPercentage,
        lines: content.split('\n').map((line, index) => ({
          lineNumber: index + 1,
          content: line,
          hasRussian: /[\u0400-\u04FF\u0500-\u052F]/i.test(line)
        })).filter(line => line.hasRussian)
      };
    }
    
    return {
      file: filePath,
      hasRussian: false
    };
  } catch (error) {
    return {
      file: filePath,
      hasRussian: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function main(): number {
  console.log('🔍 Checking language compliance in staged files...\n');
  
  // Pre-install configurations on first run
  preInstallConfigs();
  
  const stagedFiles = getStagedFiles();
  if (stagedFiles.length === 0) {
    console.log('✅ No staged files to check');
    return 0;
  }
  
  const textFiles = stagedFiles.filter(file => isTextFile(file) && !shouldIgnoreFile(file));
  if (textFiles.length === 0) {
    console.log('✅ No text files to check');
    return 0;
  }
  
  console.log(`📁 Found ${textFiles.length} text files to check:\n`);
  
  const results = textFiles.map(checkFileLanguage);
  const filesWithRussian = results.filter(result => result.hasRussian);
  
  if (filesWithRussian.length === 0) {
    console.log('✅ All files pass language compliance check');
    return 0;
  }
  
  console.log('🚨 Files with Russian text detected:\n');
  
  filesWithRussian.forEach(result => {
    console.log(`📄 ${result.file}`);
    if (result.russianCount && result.totalChars && result.russianPercentage) {
      console.log(`   Russian characters: ${result.russianCount}/${result.totalChars} (${result.russianPercentage}%)`);
    }
    
    if (result.lines && result.lines.length > 0) {
      console.log('   Lines with Russian text:');
      result.lines.slice(0, 5).forEach(line => {
        console.log(`     ${line.lineNumber}: ${line.content.trim()}`);
      });
      if (result.lines.length > 5) {
        console.log(`     ... and ${result.lines.length - 5} more lines`);
      }
    }
    console.log('');
  });
  
  console.log('💡 Recommendations:');
  console.log('   - Translate all Russian text to English');
  console.log('   - Use English for documentation, comments, and user interfaces');
  console.log('   - Consider using Dev Agent language validation middleware');
  console.log('');
  
  console.log('❌ Language compliance check failed');
  console.log('   Commit blocked. Please fix language issues before committing.');
  
  return 1;
}

// Run the script
const exitCode = main();
process.exit(exitCode);
