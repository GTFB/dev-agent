/**
 * Database schema for Dev Agent
 * Uses SQLite with native bun:sqlite driver
 */

/**
 * SQL statements for creating database tables
 */
export const SCHEMA_MIGRATIONS = {
  '001': `
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

  '002': `
    -- Project configuration table
    CREATE TABLE IF NOT EXISTS project_config (
      -- Configuration key
      key TEXT PRIMARY KEY NOT NULL,
      
      -- Configuration value
      value TEXT
    );
  `,

  '003': `
    -- Schema migrations tracking table
    CREATE TABLE IF NOT EXISTS schema_migrations (
      -- Migration version
      version TEXT PRIMARY KEY NOT NULL,
      
      -- When migration was applied
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
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
