/**
 * Database Manager for Dev Agent
 * Handles SQLite database operations and migrations
 */

import { Database } from "bun:sqlite";
import { logger } from "../utils/logger.js";
import { configManager } from "../config/config.js";
import { SCHEMA_MIGRATIONS, getMigrationVersions, getMigrationSQL } from "./schema.js";

/**
 * Database Manager class
 */
export class DatabaseManager {
  private dbPath: string;
  private db: Database | null = null;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || configManager.getDatabaseConfig().path;
  }

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    try {
      // Ensure parent directory exists
      const dir = this.dbPath.substring(0, this.dbPath.lastIndexOf('/'));
      if (dir) {
        await Bun.write(dir + '/.gitkeep', '');
      }

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
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY NOT NULL,
        applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );
    `);

    // Get applied migrations
    const appliedMigrations = this.db
      .prepare("SELECT version FROM schema_migrations ORDER BY version")
      .all() as { version: string }[];

    const appliedVersions = appliedMigrations.map((m) => m.version);
    const pendingVersions = getMigrationVersions().filter(
      (v) => !appliedVersions.includes(v)
    );

    // Apply pending migrations
    for (const version of pendingVersions) {
      try {
        const sql = getMigrationSQL(version);
        if (sql) {
          this.db.exec(sql);
          
          // Record migration
          this.db
            .prepare("INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)")
            .run(version, new Date().toISOString());
          
          logger.info(`Applied migration ${version}`);
        }
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

  /**
   * Get database instance
   */
  getDatabase(): Database | null {
    return this.db;
  }

  /**
   * Check if table exists
   */
  tableExists(tableName: string): boolean {
    if (!this.db) return false;
    
    try {
      const result = this.db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
      ).get(tableName) as { name: string } | undefined;
      
      return !!result;
    } catch {
      return false;
    }
  }

  /**
   * Get table schema
   */
  getTableSchema(tableName: string): any[] {
    if (!this.db) return [];
    
    try {
      return this.db.prepare(`PRAGMA table_info(${tableName})`).all() as any[];
    } catch {
      return [];
    }
  }

  /**
   * Backup database
   */
  async backup(backupPath: string): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    try {
      const backupDb = new Database(backupPath);
      this.db.backup(backupDb);
      backupDb.close();
      logger.info(`Database backed up to ${backupPath}`);
    } catch (error) {
      logger.error("Failed to backup database", error as Error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  getStats(): { tables: string[]; size: number } {
    if (!this.db) {
      return { tables: [], size: 0 };
    }

    try {
      const tables = this.db.prepare(
        "SELECT name FROM sqlite_master WHERE type='table'"
      ).all() as { name: string }[];
      
      const tableNames = tables.map(t => t.name);
      const size = Bun.file(this.dbPath).size || 0;
      
      return { tables: tableNames, size };
    } catch {
      return { tables: [], size: 0 };
    }
  }
}