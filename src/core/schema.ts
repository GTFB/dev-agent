/**
 * Database schema for Dev Agent
 * Uses SQLite with native bun:sqlite driver
 *
 * This schema stores both Dev Agent data and project entities
 * creating a unified project management system
 */

/**
 * SQL statements for creating database tables
 */
export const SCHEMA_MIGRATIONS = {
  "001": `
    -- Goals table - stores all project goals
    CREATE TABLE IF NOT EXISTS goals (
      -- Unique AID identifier with 'g-' prefix for goals
      id TEXT PRIMARY KEY NOT NULL CHECK(id LIKE 'g-%'),
      
      -- Associated GitHub Issue number (optional)
      github_issue_id INTEGER UNIQUE,
      
      -- Goal title
      title TEXT NOT NULL,
      
      -- Current goal status
      status TEXT NOT NULL DEFAULT 'todo' CHECK(status IN ('todo', 'in_progress', 'done', 'archived')),
      
      -- Associated Git branch name
      branch_name TEXT,
      
      -- Goal description (can be GitHub Issue body)
      description TEXT,
      
      -- Creation timestamp in ISO 8601 format (UTC)
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      
      -- Last update timestamp
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      
      -- Completion timestamp
      completed_at TEXT
    );

    -- Index for fast status-based queries
    CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
    
    -- Index for GitHub Issue lookups
    CREATE INDEX IF NOT EXISTS idx_goals_github_issue ON goals(github_issue_id);
    
    -- Index for branch name lookups
    CREATE INDEX IF NOT EXISTS idx_goals_branch ON goals(branch_name);
  `,

  "002": `
    -- Project configuration table
    CREATE TABLE IF NOT EXISTS project_config (
      -- Configuration key
      key TEXT PRIMARY KEY NOT NULL,
      
      -- Configuration value
      value TEXT
    );
  `,

  "003": `
    -- Schema migrations tracking table
    CREATE TABLE IF NOT EXISTS schema_migrations (
      -- Migration version
      version TEXT PRIMARY KEY NOT NULL,
      
      -- When migration was applied
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `,

  "004": `
    -- Project documents table - stores all project documentation
    CREATE TABLE IF NOT EXISTS project_documents (
      -- Unique AID identifier with 'd-' prefix for documents
      id TEXT PRIMARY KEY NOT NULL CHECK(id LIKE 'd-%'),
      
      -- Document title
      title TEXT NOT NULL,
      
      -- Document type (architecture, api, deployment, user-guide, etc.)
      type TEXT NOT NULL,
      
      -- Document content (markdown, text, or structured data)
      content TEXT NOT NULL,
      
      -- File path relative to project root (optional)
      file_path TEXT,
      
      -- Document status (draft, review, approved, archived)
      status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'review', 'approved', 'archived')),
      
      -- Associated goal ID (optional)
      goal_id TEXT REFERENCES goals(id),
      
      -- Document tags for categorization
      tags TEXT, -- JSON array of tags
      
      -- Creation timestamp
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      
      -- Last update timestamp
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      
      -- Version number for document history
      version INTEGER NOT NULL DEFAULT 1
    );

    -- Indexes for documents
    CREATE INDEX IF NOT EXISTS idx_documents_type ON project_documents(type);
    CREATE INDEX IF NOT EXISTS idx_documents_status ON project_documents(status);
    CREATE INDEX IF NOT EXISTS idx_documents_goal ON project_documents(goal_id);
    CREATE INDEX IF NOT EXISTS idx_documents_tags ON project_documents(tags);
  `,

  "005": `
    -- Project files table - stores project source files and assets
    CREATE TABLE IF NOT EXISTS project_files (
      -- Unique AID identifier with 'f-' prefix for files
      id TEXT PRIMARY KEY NOT NULL CHECK(id LIKE 'f-%'),
      
      -- File name
      name TEXT NOT NULL,
      
      -- File path relative to project root
      file_path TEXT NOT NULL UNIQUE,
      
      -- File type (source, config, asset, script, etc.)
      file_type TEXT NOT NULL,
      
      -- File extension
      extension TEXT,
      
      -- File size in bytes
      size_bytes INTEGER,
      
      -- File hash for change detection
      file_hash TEXT,
      
      -- Associated goal ID (optional)
      goal_id TEXT REFERENCES goals(id),
      
      -- File status (active, deprecated, archived)
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'deprecated', 'archived')),
      
      -- Creation timestamp
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      
      -- Last update timestamp
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Indexes for files
    CREATE INDEX IF NOT EXISTS idx_files_path ON project_files(file_path);
    CREATE INDEX IF NOT EXISTS idx_files_type ON project_files(file_type);
    CREATE INDEX IF NOT EXISTS idx_files_goal ON project_files(goal_id);
    CREATE INDEX IF NOT EXISTS idx_files_status ON project_files(status);
  `,

  "006": `
    -- Project API endpoints table - stores API documentation and specifications
    CREATE TABLE IF NOT EXISTS project_api_endpoints (
      -- Unique AID identifier with 'a-' prefix for API endpoints
      id TEXT PRIMARY KEY NOT NULL CHECK(id LIKE 'a-%'),
      
      -- HTTP method (GET, POST, PUT, DELETE, etc.)
      method TEXT NOT NULL,
      
      -- API endpoint path
      path TEXT NOT NULL,
      
      -- Endpoint title/name
      title TEXT NOT NULL,
      
      -- Endpoint description
      description TEXT,
      
      -- Request parameters (JSON schema)
      request_params TEXT,
      
      -- Response schema (JSON schema)
      response_schema TEXT,
      
      -- Associated goal ID (optional)
      goal_id TEXT REFERENCES goals(id),
      
      -- API version
      api_version TEXT DEFAULT 'v1',
      
      -- Endpoint status (active, deprecated, planned)
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'deprecated', 'planned')),
      
      -- Creation timestamp
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      
      -- Last update timestamp
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Indexes for API endpoints
    CREATE INDEX IF NOT EXISTS idx_api_method ON project_api_endpoints(method);
    CREATE INDEX IF NOT EXISTS idx_api_path ON project_api_endpoints(path);
    CREATE INDEX IF NOT EXISTS idx_api_version ON project_api_endpoints(api_version);
    CREATE INDEX IF NOT EXISTS idx_api_status ON project_api_endpoints(status);
    CREATE INDEX IF NOT EXISTS idx_api_goal ON project_api_endpoints(goal_id);
  `,

  "007": `
    -- Project scripts table - stores project automation scripts
    CREATE TABLE IF NOT EXISTS project_scripts (
      -- Unique AID identifier with 's-' prefix for scripts
      id TEXT PRIMARY KEY NOT NULL CHECK(id LIKE 's-%'),
      
      -- Script name
      name TEXT NOT NULL,
      
      -- Script description
      description TEXT,
      
      -- Script type (build, deploy, test, utility, etc.)
      script_type TEXT NOT NULL,
      
      -- Script content or file path
      content TEXT,
      
      -- Script language (bash, python, node, etc.)
      language TEXT,
      
      -- Execution command
      command TEXT,
      
      -- Associated goal ID (optional)
      goal_id TEXT REFERENCES goals(id),
      
      -- Script status (active, deprecated, testing)
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'deprecated', 'testing')),
      
      -- Creation timestamp
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      
      -- Last update timestamp
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Indexes for scripts
    CREATE INDEX IF NOT EXISTS idx_scripts_type ON project_scripts(script_type);
    CREATE INDEX IF NOT EXISTS idx_scripts_language ON project_scripts(language);
    CREATE INDEX IF NOT EXISTS idx_scripts_status ON project_scripts(status);
    CREATE INDEX IF NOT EXISTS idx_scripts_goal ON project_scripts(goal_id);
  `,

  "008": `
    -- Project prompts table - stores AI prompt templates
    CREATE TABLE IF NOT EXISTS project_prompts (
      -- Unique AID identifier with 'p-' prefix for prompts
      id TEXT PRIMARY KEY NOT NULL CHECK(id LIKE 'p-%'),
      
      -- Prompt name/title
      name TEXT NOT NULL,
      
      -- Prompt description
      description TEXT,
      
      -- Prompt category (code-review, testing, documentation, etc.)
      category TEXT NOT NULL,
      
      -- Prompt template content
      template TEXT NOT NULL,
      
      -- Prompt variables (JSON schema)
      variables TEXT,
      
      -- Associated goal ID (optional)
      goal_id TEXT REFERENCES goals(id),
      
      -- Prompt status (active, testing, archived)
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'testing', 'archived')),
      
      -- Creation timestamp
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      
      -- Last update timestamp
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Indexes for prompts
    CREATE INDEX IF NOT EXISTS idx_prompts_category ON project_prompts(category);
    CREATE INDEX IF NOT EXISTS idx_prompts_status ON project_prompts(status);
    CREATE INDEX IF NOT EXISTS idx_prompts_goal ON project_prompts(goal_id);
  `,
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
