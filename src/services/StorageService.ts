/**
 * Storage Service for Dev Agent
 * 
 * Manages all data operations for goals, configuration, and project data.
 * Provides a unified interface for database operations with automatic
 * initialization and error handling.
 * 
 * @packageDocumentation
 */

import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { DatabaseManager } from "../core/database.js";
import { logger } from "../utils/logger.js";

import { Goal, ProjectConfig, GoalStatus } from "../core/types.js";

/**
 * Storage Service class
 * 
 * Provides methods for managing goals, configuration, and project data
 * with automatic database initialization and transaction support.
 */
export class StorageService {
  private dbManager: DatabaseManager;
  private configPath!: string;
  private dbPath: string;

  constructor(dbPath?: string) {
    // Use passed path or try to load from environment variable
    if (dbPath) {
      this.dbPath = dbPath;
    } else if (process.env.DEV_AGENT_DB_PATH) {
      this.dbPath = process.env.DEV_AGENT_DB_PATH;
    } else {
      // Try to load from config.json
      try {
        const configPath = join(process.cwd(), "config.json");
        if (existsSync(configPath)) {
          const configContent = readFileSync(configPath, "utf8");
          const config = JSON.parse(configContent);
          if (config.storage?.database?.path) {
            this.dbPath = config.storage.database.path;
            console.log(`✅ Database path loaded from config.json: ${this.dbPath} (updated)`);
          } else {
            console.log('📊 No database path in config.json, using in-memory database');
            this.dbPath = ":memory:";
          }
        } else {
          console.log('📊 No config.json found, using in-memory database');
          this.dbPath = ":memory:";
        }
      } catch {
        console.log('📊 Error reading config.json, using in-memory database');
        this.dbPath = ":memory:";
      }
    }

    this.dbManager = new DatabaseManager(this.dbPath);
  }

  /**
   * Initialize storage service
   * 
   * Creates and initializes the database connection. This method must be
   * called before any data operations can be performed.
   * 
   * @throws {Error} If database initialization fails
   */
  async initialize(): Promise<void> {
    try {
      await this.dbManager.initialize();
      logger.info("Storage service initialized");
    } catch (error) {
      logger.error("Failed to initialize storage service", error as Error);
      throw error;
    }
  }

  /**
   * Ensure storage service is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.dbManager.isInitialized()) {
      await this.initialize();
    }
  }

  /**
   * Close storage service
   */
  close(): void {
    this.dbManager.close();
  }

  // Goal operations

  /**
   * Create a new goal
   */
  async createGoal(
    goal: Omit<Goal, "created_at" | "updated_at">,
  ): Promise<void> {
    try {
      await this.ensureInitialized();
      const now = new Date().toISOString();

      this.dbManager.run(
        `
        INSERT INTO goals (id, github_issue_id, title, status, branch_name, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          goal.id,
          goal.github_issue_id ?? null,
          goal.title,
          goal.status,
          goal.branch_name ?? null,
          goal.description ?? null,
          now,
          now,
        ],
      );

      logger.info(`Goal created: ${goal.id} - ${goal.title}`);
    } catch (error) {
      logger.error("Failed to create goal", error as Error);
      throw error;
    }
  }

  /**
   * Get goal by ID
   */
  async getGoal(id: string): Promise<Goal | null> {
    try {
      await this.ensureInitialized();
      
      const result = this.dbManager.get<Goal>("SELECT * FROM goals WHERE id = ?", [
        id,
      ]);
      return result || null;
    } catch (error) {
      logger.error(`Failed to get goal ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * Update goal
   */
  async updateGoal(
    id: string,
    updates: Partial<Omit<Goal, "id" | "created_at">>,
  ): Promise<void> {
    try {
      await this.ensureInitialized();
      
      const now = new Date().toISOString();
      const fields = Object.keys(updates)
        .map((key) => `${key} = ?`)
        .join(", ");
      const values = [...Object.values(updates), now, id];

      this.dbManager.run(
        `
        UPDATE goals 
        SET ${fields}, updated_at = ? 
        WHERE id = ?
      `,
        values,
      );

      logger.info(`Goal updated: ${id}`);
    } catch (error) {
      logger.error(`Failed to update goal ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * List goals by status
   */
  async listGoals(status?: GoalStatus): Promise<Goal[]> {
    try {
      await this.ensureInitialized();
      
      logger.info(`Listing goals${status ? ` with status: ${status}` : ''}`);
      
      let goals: Goal[];
      if (status) {
        goals = this.dbManager.all<Goal>(
          "SELECT * FROM goals WHERE status = ? ORDER BY created_at DESC",
          [status],
        );
      } else {
        goals = this.dbManager.all<Goal>(
          "SELECT * FROM goals ORDER BY created_at DESC",
        );
      }
      
      logger.info(`Found ${goals.length} goals in database`);
      return goals;
    } catch (error) {
      logger.error("Failed to list goals", error as Error);
      throw error;
    }
  }

  /**
   * Delete goal
   */
  async deleteGoal(id: string): Promise<void> {
    try {
      await this.ensureInitialized();
      
      this.dbManager.run("DELETE FROM goals WHERE id = ?", [id]);
      logger.info(`Goal deleted: ${id}`);
    } catch (error) {
      logger.error(`Failed to delete goal ${id}`, error as Error);
      throw error;
    }
  }

  /**
   * Get goal count by status
   */
  async getGoalCount(status?: GoalStatus): Promise<number> {
    try {
      await this.ensureInitialized();
      
      if (status) {
        const result = this.dbManager.get<{ count: number }>(
          "SELECT COUNT(*) as count FROM goals WHERE status = ?",
          [status],
        );
        return result?.count || 0;
      } else {
        const result = this.dbManager.get<{ count: number }>(
          "SELECT COUNT(*) as count FROM goals",
        );
        return result?.count || 0;
      }
    } catch (error) {
      logger.error("Failed to get goal count", error as Error);
      throw error;
    }
  }

  /**
   * Find goal by GitHub issue ID
   */
  async findGoalByGitHubIssue(issueId: number): Promise<Goal | null> {
    try {
      await this.ensureInitialized();
      
      logger.info(`Searching for goal with GitHub issue ID: ${issueId}`);
      
      const result = this.dbManager.get<Goal>(
        "SELECT * FROM goals WHERE github_issue_id = ?",
        [issueId],
      );
      
      if (result) {
        logger.info(`Found goal: ${result.id} for GitHub issue ${issueId}`);
      } else {
        logger.info(`No goal found for GitHub issue ${issueId}`);
      }
      
      return result || null;
    } catch (error) {
      logger.error(
        `Failed to find goal by GitHub issue ${issueId}`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Find goal by branch name
   */
  async findGoalByBranch(branchName: string): Promise<Goal | null> {
    try {
      await this.ensureInitialized();
      
      const result = this.dbManager.get<Goal>(
        "SELECT * FROM goals WHERE branch_name = ?",
        [branchName],
      );
      return result || null;
    } catch (error) {
      logger.error(
        `Failed to find goal by branch ${branchName}`,
        error as Error,
      );
      throw error;
    }
  }

  // Configuration operations

  /**
   * Get configuration value
   */
  async getConfig(key: string): Promise<string | null> {
    try {
      await this.ensureInitialized();
      
      const result = this.dbManager.get<ProjectConfig>(
        "SELECT value FROM config WHERE key = ?",
        [key],
      );
      return result?.value || null;
    } catch (error) {
      logger.error(`Failed to get config ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * Set configuration value
   */
  async setConfig(key: string, value: string, type: string = 'string', description?: string, category: string = 'general'): Promise<void> {
    try {
      await this.ensureInitialized();
      
      this.dbManager.run(
        `
        INSERT OR REPLACE INTO config (key, value, type, description, category) 
        VALUES (?, ?, ?, ?, ?)
      `,
        [key, value, type, description || '', category],
      );

      logger.info(`Config updated: ${key} = ${value}`);
    } catch (error) {
      logger.error(`Failed to set config ${key}`, error as Error);
      throw error;
    }
  }

  /**
   * Get all configuration
   */
  async getAllConfig(): Promise<ProjectConfig[]> {
    try {
      await this.ensureInitialized();
      
      const configs = this.dbManager.all<ProjectConfig>(
        "SELECT * FROM config ORDER BY key",
      );
      return configs;
    } catch (error) {
      logger.error("Failed to get all configuration", error as Error);
      throw error;
    }
  }

  /**
   * Delete configuration
   */
  async deleteConfig(key: string): Promise<void> {
    try {
      await this.ensureInitialized();
      
      this.dbManager.run("DELETE FROM config WHERE key = ?", [key]);
      logger.info(`Config deleted: ${key}`);
    } catch (error) {
      logger.error(`Failed to delete config ${key}`, error as Error);
      throw error;
    }
  }

  // Utility methods

  /**
   * Check if database is initialized
   */
  isInitialized(): boolean {
    return this.dbManager.isInitialized();
  }

  /**
   * Get database path
   */
  getDatabasePath(): string {
    return this.dbManager.getDatabasePath();
  }

  /**
   * Begin transaction
   */
  beginTransaction(): void {
    this.dbManager.beginTransaction();
  }

  /**
   * Commit transaction
   */
  commitTransaction(): void {
    this.dbManager.commitTransaction();
  }

  /**
   * Rollback transaction
   */
  rollbackTransaction(): void {
    this.dbManager.rollbackTransaction();
  }

  /**
   * Check if database has any goals
   */
  async hasGoals(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      
      const result = this.dbManager.get("SELECT 1 FROM goals LIMIT 1");
      return result !== undefined;
    } catch (error) {
      logger.error("Failed to check if database has goals", error as Error);
      return false;
    }
  }
}
