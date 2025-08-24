/**
 * Database Manager for Dev Agent
 * 
 * Handles SQLite database operations, migrations, and connection management.
 * Provides a high-level interface for database operations with automatic
 * migration handling and error recovery.
 * 
 * @packageDocumentation
 */

import { Database } from "bun:sqlite";
import { logger } from "../utils/logger.js";

import { getMigrationVersions, getMigrationSQL } from "./schema.js";

/**
 * Database Manager class
 * 
 * Manages SQLite database connections, migrations, and provides methods
 * for executing SQL statements with proper error handling.
 */
export class DatabaseManager {
  private dbPath: string;
  private db: Database | null = null;

  constructor(dbPath?: string) {
    // Use passed path or try to load from config.json first
    let finalPath = dbPath;
    
    if (!finalPath) {
      try {
        const { readFileSync, existsSync } = require("fs");
        if (existsSync('config.json')) {
          const config = JSON.parse(readFileSync('config.json', 'utf8'));
          if (config.storage?.database?.path) {
            finalPath = config.storage.database.path;
          }
        }
      } catch {
        // Don't fall back to configManager to avoid database initialization
        // Just use in-memory as default
      }
    }
    
    // Ensure we always have a valid path
    if (!finalPath) {
      finalPath = ":memory:"; // Default to in-memory database
    }
    
    this.dbPath = finalPath;
    logger.info(`DatabaseManager initialized with path: ${this.dbPath}`);
  }

  /**
   * Initialize database
   */
  async initialize(): Promise<void> {
    try {
      // Only create directories for file-based databases, not in-memory
      if (!this.dbPath.startsWith(':') && this.dbPath.includes('/')) {
        const dir = this.dbPath.substring(0, this.dbPath.lastIndexOf('/'));
        if (dir) {
          try {
            await Bun.write(dir + '/.gitkeep', '');
          } catch {
            // Directory might already exist, continue
          }
        }
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
  run(sql: string, params: (string | number | boolean | null | Uint8Array)[] = []): void {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    this.db.prepare(sql).run(...params);
  }

  /**
   * Get single row
   */
  get<T>(sql: string, params: (string | number | boolean | null | Uint8Array)[] = []): T | undefined {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.prepare(sql).get(...params) as T | undefined;
  }

  /**
   * Get multiple rows
   */
  all<T>(sql: string, params: (string | number | boolean | null | Uint8Array)[] = []): T[] {
    if (!this.db) {
      throw new Error("Database not initialized");
    }
    return this.db.prepare(sql).all(...params) as T[];
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
  getTableSchema(tableName: string): Array<Record<string, unknown>> {
    if (!this.db) return [];
    
    try {
      return this.db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<Record<string, unknown>>;
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

    // For in-memory databases, we can't backup to file
    if (this.dbPath === ":memory:" || this.dbPath.startsWith(":memory:")) {
      logger.warn("Cannot backup in-memory database to file");
      return;
    }

    try {
      // Close current connection temporarily
      this.db.close();
      
      // Copy the database file
      const sourceFile = Bun.file(this.dbPath);
      const sourceBuffer = await sourceFile.arrayBuffer();
      await Bun.write(backupPath, sourceBuffer);
      
      // Reopen the database
      this.db = new Database(this.dbPath);
      
      logger.info(`Database backed up to ${backupPath}`);
    } catch (error) {
      // Reopen the database even if backup failed
      if (!this.db || this.db === null) {
        this.db = new Database(this.dbPath);
      }
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