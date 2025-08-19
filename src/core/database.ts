/**
 * Database Manager for Dev Agent
 * Handles SQLite database operations and migrations
 */

import { Database } from "bun:sqlite";
import { logger } from "../utils/logger.js";

/**
 * Extended migration interface for internal use
 */
interface InternalMigration {
  version: string;
  description: string;
  up: string;
  down: string;
}

/**
 * Database schema migrations
 */
const SCHEMA_MIGRATIONS: InternalMigration[] = [
  {
    version: "1",
    description: "Initial schema",
    up: `
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        github_issue_id INTEGER,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'todo',
        branch_name TEXT,
        description TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS project_config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
      CREATE INDEX IF NOT EXISTS idx_goals_github_issue ON goals(github_issue_id);
      CREATE INDEX IF NOT EXISTS idx_goals_branch ON goals(branch_name);
    `,
    down: `
      DROP TABLE IF EXISTS goals;
      DROP TABLE IF EXISTS project_config;
    `,
  },
];

/**
 * Get migration versions
 */
function getMigrationVersions(): string[] {
  return SCHEMA_MIGRATIONS.map((m) => m.version).sort((a, b) => parseInt(a) - parseInt(b));
}

/**
 * Get migration SQL
 */
function getMigrationSQL(version: string): string {
  const migration = SCHEMA_MIGRATIONS.find((m) => m.version === version);
  if (!migration) {
    throw new Error(`Migration version ${version} not found`);
  }
  return migration.up;
}

/**
 * Database Manager class
 */
export class DatabaseManager {
  private dbPath: string;
  private db: Database | null = null;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    try {
      this.db = new Database(this.dbPath);
      
      // Run migrations
      await this.runMigrations();
      
      logger.info("Database initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize database", error as Error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) return;

    // Create migrations table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );
    `);

    // Get applied migrations
    const appliedMigrations = this.db
      .prepare("SELECT version FROM migrations ORDER BY version")
      .all() as { version: number }[];

    const appliedVersions = appliedMigrations.map((m) => m.version);
    const pendingVersions = getMigrationVersions().filter(
      (v) => !appliedVersions.includes(parseInt(v)),
    );

    // Apply pending migrations
    for (const version of pendingVersions) {
      try {
        const sql = getMigrationSQL(version);
        this.db.exec(sql);
        
        // Record migration
        this.db
          .prepare("INSERT INTO migrations (version, applied_at) VALUES (?, ?)")
          .run(parseInt(version), new Date().toISOString());
        
        logger.info(`Applied migration ${version}`);
      } catch (error) {
        logger.error(`Failed to apply migration ${version}`, error as Error);
        throw error;
      }
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.db !== null;
  }

  /**
   * Execute SQL statement
   */
  run(sql: string, params: unknown[] = []): void {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    this.db.prepare(sql).run(...(params as unknown[]));
  }

  /**
   * Get single row
   */
  get<T>(sql: string, params: unknown[] = []): T | undefined {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.prepare(sql).get(...(params as unknown[])) as T | undefined;
  }

  /**
   * Get multiple rows
   */
  all<T>(sql: string, params: unknown[] = []): T[] {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.prepare(sql).all(...(params as unknown[])) as T[];
  }

  /**
   * Begin transaction
   */
  beginTransaction(): void {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    this.db.exec("BEGIN TRANSACTION");
  }

  /**
   * Commit transaction
   */
  commitTransaction(): void {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    this.db.exec("COMMIT");
  }

  /**
   * Rollback transaction
   */
  rollbackTransaction(): void {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    this.db.exec("ROLLBACK");
  }

  /**
   * Get database path
   */
  getDatabasePath(): string {
    return this.dbPath;
  }
}