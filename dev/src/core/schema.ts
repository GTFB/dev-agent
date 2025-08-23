/**
 * Database schema for Dev Agent
 * Uses SQLite with native bun:sqlite driver
 * 
 * This schema provides a clean, focused structure for:
 * - Configuration management
 * - Goal tracking
 * - LLM provider management
 * - Project structure enforcement
 */

export const SCHEMA_MIGRATIONS = {
  "001": `
    -- Core configuration table - stores all application settings
    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'string' CHECK(type IN ('string', 'number', 'boolean', 'json')),
      description TEXT,
      category TEXT NOT NULL,
      required BOOLEAN NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Indexes for configuration
    CREATE INDEX IF NOT EXISTS idx_config_category ON config(category);
    CREATE INDEX IF NOT EXISTS idx_config_required ON config(required);
  `,

  "002": `
    -- LLM providers table - stores AI service configurations
    CREATE TABLE IF NOT EXISTS llm (
      provider TEXT PRIMARY KEY NOT NULL,
      api_key TEXT NOT NULL,
      api_base TEXT,
      model TEXT NOT NULL,
      config TEXT, -- JSON configuration for advanced settings
      is_default BOOLEAN NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'testing')),
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Indexes for LLM providers
    CREATE INDEX IF NOT EXISTS idx_llm_status ON llm(status);
    CREATE INDEX IF NOT EXISTS idx_llm_default ON llm(is_default);
  `,

  "003": `
    -- Goals table - stores project goals and tasks
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY NOT NULL CHECK(id LIKE 'g-%'),
      github_issue_id INTEGER UNIQUE,
      title TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'done', 'archived')),
      branch_name TEXT,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      completed_at TEXT
    );

    -- Indexes for goals
    CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
    CREATE INDEX IF NOT EXISTS idx_goals_github_issue ON goals(github_issue_id);
    CREATE INDEX IF NOT EXISTS idx_goals_branch ON goals(branch_name);
  `,

  "004": `
    -- Project structure table - enforces immutable file/folder structure
    CREATE TABLE IF NOT EXISTS project_structure (
      path TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('file', 'folder', 'required', 'forbidden')),
      description TEXT,
      pattern TEXT, -- Regex pattern for validation
      required BOOLEAN NOT NULL DEFAULT 0,
      forbidden BOOLEAN NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Indexes for project structure
    CREATE INDEX IF NOT EXISTS idx_structure_type ON project_structure(type);
    CREATE INDEX IF NOT EXISTS idx_structure_required ON project_structure(required);
  `,

  "005": `
    -- Schema migrations tracking table
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `,

  "006": `
    -- Insert default project structure rules
    INSERT OR REPLACE INTO project_structure (path, type, description, required, forbidden) VALUES
    ('src/**/*.ts', 'file', 'TypeScript source files only', 1, 0),
    ('tests/**/*.test.ts', 'file', 'TypeScript test files', 1, 0),
    ('docs/**/*.md', 'file', 'Markdown documentation', 1, 0),
    ('*.js', 'file', 'JavaScript files forbidden', 0, 1),
    ('*.jsx', 'file', 'JSX files forbidden', 0, 1),
    ('scripts/', 'folder', 'Scripts folder forbidden', 0, 1),
    ('temp/', 'folder', 'Temp folder forbidden', 0, 1),
    ('data/', 'folder', 'Data folder forbidden', 0, 1),
    ('node_modules/', 'folder', 'Node modules forbidden', 0, 1),
    ('src/', 'folder', 'Source code folder required', 1, 0),
    ('tests/', 'folder', 'Tests folder required', 1, 0),
    ('docs/', 'folder', 'Documentation folder required', 1, 0);
  `,

  "007": `
    -- Insert default configuration
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('project.name', 'Dev Agent', 'string', 'Project name', 'project', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('project.version', '2.0.0', 'string', 'Project version', 'project', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('project.description', 'CLI assistant for automating the High-Efficiency Standard Operating Protocol', 'string', 'Project description', 'project', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('project.author', 'Dev Agent Team', 'string', 'Project author', 'project', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('project.license', 'MIT', 'string', 'Project license', 'project', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('project.repository', 'https://github.com/dev-agent/dev-agent', 'string', 'Project repository', 'project', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('database.path', 'data/.dev-agent.db', 'string', 'Database file path', 'database', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('database.type', 'sqlite', 'string', 'Database type', 'database', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('storage.dataDir', '.', 'string', 'Data directory (root)', 'storage', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('storage.backupDir', 'backups', 'string', 'Backup directory', 'storage', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('storage.logsDir', 'logs', 'string', 'Logs directory', 'storage', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('logging.level', 'info', 'string', 'Logging level', 'logging', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('logging.console', 'true', 'boolean', 'Console logging enabled', 'logging', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('logging.file', 'true', 'boolean', 'File logging enabled', 'logging', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('llm.defaultProvider', 'gemini', 'string', 'Default LLM provider', 'llm', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('llm.maxTokens', '4096', 'number', 'Maximum tokens for LLM', 'llm', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('llm.temperature', '0.7', 'number', 'LLM temperature', 'llm', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('llm.rateLimitMs', '1000', 'number', 'Delay between requests (ms)', 'llm', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('llm.maxRetries', '3', 'number', 'Maximum retry attempts', 'llm', 1);
    
    INSERT OR REPLACE INTO config (key, value, type, description, category, required) VALUES
    ('llm.timeoutMs', '30000', 'number', 'Request timeout (ms)', 'llm', 1);
  `
};

/**
 * Get all migration versions in order
 */
export function getMigrationVersions(): string[] {
  return Object.keys(SCHEMA_MIGRATIONS).sort();
}

/**
 * Get SQL for specific migration version
 */
export function getMigrationSQL(version: string): string | undefined {
  return SCHEMA_MIGRATIONS[version as keyof typeof SCHEMA_MIGRATIONS];
}
