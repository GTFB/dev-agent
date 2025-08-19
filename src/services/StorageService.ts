/**
 * Storage Service for Dev Agent
 * Manages all data operations for tasks and configuration
 */

import { DatabaseManager } from "../core/database.js";
import { Goal, ProjectConfig, GoalStatus } from "../core/types.js";
import { logger } from "../utils/logger.js";

/**
 * Storage Service class
 */
export class StorageService {
  private db: DatabaseManager;
  private initialized: boolean = false;

  constructor(dbPath: string = ".dev-agent.db") {
    this.db = new DatabaseManager(dbPath);
  }

  /**
   * Initialize storage service
   */
  async initialize(): Promise<void> {
    try {
      await this.db.initialize();
      this.initialized = true;
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
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Close storage service
   */
  close(): void {
    this.db.close();
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

      this.db.run(
        `
        INSERT INTO goals (id, github_issue_id, title, status, branch_name, description, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
        [
          goal.id,
          goal.github_issue_id,
          goal.title,
          goal.status,
          goal.branch_name,
          goal.description,
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
      const result = this.db.get<Goal>("SELECT * FROM goals WHERE id = ?", [
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

      this.db.run(
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
      if (status) {
        return this.db.all<Goal>(
          "SELECT * FROM goals WHERE status = ? ORDER BY created_at DESC",
          [status],
        );
      }
      return this.db.all<Goal>(
        "SELECT * FROM goals ORDER BY created_at DESC",
      );
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
      this.db.run("DELETE FROM goals WHERE id = ?", [id]);
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
      if (status) {
        const result = this.db.get<{ count: number }>(
          "SELECT COUNT(*) as count FROM goals WHERE status = ?",
          [status],
        );
        return result?.count || 0;
      } else {
        const result = this.db.get<{ count: number }>(
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
      const result = this.db.get<Goal>(
        "SELECT * FROM goals WHERE github_issue_id = ?",
        [issueId],
      );
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
      const result = this.db.get<Goal>(
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
      const result = this.db.get<ProjectConfig>(
        "SELECT value FROM project_config WHERE key = ?",
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
  async setConfig(key: string, value: string): Promise<void> {
    try {
      await this.ensureInitialized();
      this.db.run(
        `
        INSERT OR REPLACE INTO project_config (key, value) 
        VALUES (?, ?)
      `,
        [key, value],
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
      const configs = this.db.all<ProjectConfig>(
        "SELECT * FROM project_config ORDER BY key",
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
      this.db.run("DELETE FROM project_config WHERE key = ?", [key]);
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
    try {
      // Try to query a simple table to check if DB is ready
      this.db.get("SELECT 1 FROM goals LIMIT 1");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get database path
   */
  getDatabasePath(): string {
    return this.db.getDatabasePath();
  }

  /**
   * Begin transaction
   */
  beginTransaction(): void {
    this.db.beginTransaction();
  }

  /**
   * Commit transaction
   */
  commitTransaction(): void {
    this.db.commitTransaction();
  }

  /**
   * Rollback transaction
   */
  rollbackTransaction(): void {
    this.db.rollbackTransaction();
  }

  /**
   * Check if database has any goals
   */
  async hasGoals(): Promise<boolean> {
    try {
      await this.ensureInitialized();
      const result = this.db.get("SELECT 1 FROM goals LIMIT 1");
      return result !== undefined;
    } catch (error) {
      logger.error("Failed to check if database has goals", error as Error);
      return false;
    }
  }
}
