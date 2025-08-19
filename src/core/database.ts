/**
 * Database module for Dev Agent
 * Handles SQLite connection and schema migrations
 */

import { Database } from 'bun:sqlite';
import { Task, ProjectConfig, SchemaMigration } from './types.js';
import { SCHEMA_MIGRATIONS, getMigrationVersions, getMigrationSQL } from './schema.js';

/**
 * Database manager class
 */
export class DatabaseManager {
  private db: Database;
  private dbPath: string;

  constructor(dbPath: string = '.dev-agent.db') {
    this.dbPath = dbPath;
    // Don't create database connection until initialize() is called
    this.db = null as any;
  }

  /**
   * Initialize database with schema
   */
  async initialize(): Promise<void> {
    try {
      // Create database connection in current working directory
      this.db = new Database(this.dbPath);
      this.db.run('PRAGMA foreign_keys = ON');
      this.db.run('PRAGMA journal_mode = WAL');
      
      // Run all pending migrations
      await this.runMigrations();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Run pending database migrations
   */
  private async runMigrations(): Promise<void> {
    // Create migrations table if it doesn't exist
    this.db.run(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY NOT NULL,
        applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `);

    // Get applied migrations
    const appliedMigrations = this.db.query<SchemaMigration>(
      'SELECT version FROM schema_migrations ORDER BY version'
    ).all();

    const appliedVersions = new Set(appliedMigrations.map(m => m.version));
    const allVersions = getMigrationVersions();

    // Run pending migrations
    for (const version of allVersions) {
      if (!appliedVersions.has(version)) {
        await this.runMigration(version);
      }
    }
  }

  /**
   * Run a specific migration
   */
  private async runMigration(version: string): Promise<void> {
    const sql = getMigrationSQL(version);
    if (!sql) {
      throw new Error(`Migration ${version} not found`);
    }

    try {
      // Execute migration SQL
      this.db.run(sql);
      
      // Record migration as applied
      this.db.run(
        'INSERT INTO schema_migrations (version) VALUES (?)',
        [version]
      );

      console.log(`Applied migration ${version}`);
    } catch (error) {
      console.error(`Failed to apply migration ${version}:`, error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null as any;
    }
  }

  /**
   * Get database instance (for direct queries)
   */
  getDatabase(): Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Execute a query with parameters
   */
  query<T>(sql: string, params: any[] = []): T[] {
    try {
      const db = this.getDatabase();
      const stmt = db.prepare(sql);
      return stmt.all(params) as T[];
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }

  /**
   * Execute a single statement
   */
  run(sql: string, params: any[] = []): void {
    try {
      const db = this.getDatabase();
      const stmt = db.prepare(sql);
      stmt.run(params);
    } catch (error) {
      console.error('Statement execution failed:', error);
      throw error;
    }
  }

  /**
   * Get a single row
   */
  get<T>(sql: string, params: any[] = []): T | undefined {
    try {
      const db = this.getDatabase();
      const stmt = db.prepare(sql);
      return stmt.get(params) as T | undefined;
    } catch (error) {
      console.error('Get query failed:', error);
      throw error;
    }
  }

  /**
   * Begin a transaction
   */
  beginTransaction(): void {
    const db = this.getDatabase();
    db.run('BEGIN TRANSACTION');
  }

  /**
   * Commit a transaction
   */
  commitTransaction(): void {
    const db = this.getDatabase();
    db.run('COMMIT');
  }

  /**
   * Rollback a transaction
   */
  rollbackTransaction(): void {
    const db = this.getDatabase();
    db.run('ROLLBACK');
  }
}
