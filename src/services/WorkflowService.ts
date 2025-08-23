/**
 * Workflow Service for Dev Agent
 * Orchestrates the High-Efficiency Standard Operating Protocol
 */

import { StorageService } from "./StorageService.js";
import { GitService } from "./GitService.js";
import { GitHubService } from "./GitHubService.js";
import { ValidationService } from "./ValidationService.js";
import { AIDService } from "./AIDService.js";
import { ProjectConfigService } from "./ProjectConfigService.js";
import {
  Goal,
  GoalStatus,
  CommandResult,
  WorkflowContext,
} from "../core/types.js";
import { logger } from "../utils/logger.js";
import { getEnv } from "../utils/env-loader.js";

/**
 * Workflow Service class
 */
export class WorkflowService {
  private storage: StorageService;
  private git: GitService;
  private github: GitHubService;
  private validation: ValidationService;
  private aid: AIDService;
  private projectConfig: ProjectConfigService;
  private context: WorkflowContext;

  constructor(
    storage: StorageService,
    git: GitService,
    context: WorkflowContext,
  ) {
    this.storage = storage;
    this.git = git;
    this.github = new GitHubService(storage);
    this.validation = new ValidationService(storage, git);
    this.aid = new AIDService(storage);
    this.projectConfig = new ProjectConfigService();
    this.context = context;
  }

  /**
   * Initialize project with Dev Agent
   */
  async initializeProject(): Promise<CommandResult> {
    try {
      logger.info("Initializing Dev Agent project");

      // Check if Git repository exists
      if (!(await this.git.isGitRepository())) {
        return {
          success: false,
          message:
            'Current directory is not a Git repository. Please run "git init" first.',
          error: "Not a Git repository",
        };
      }

      // Initialize storage
      await this.storage.initialize();

      // Set default configuration
      await this.setDefaultConfiguration();

      logger.success("Project initialized successfully");
      return {
        success: true,
        message: "Dev Agent project initialized successfully",
      };
    } catch (error) {
      logger.error("Failed to initialize project", error as Error);
      return {
        success: false,
        message: "Failed to initialize project",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Set default configuration values
   */
  private async setDefaultConfiguration(): Promise<void> {
    const defaultConfig = {
      "github.owner": "",
      "github.repo": "",
      "branches.main": "main",
      "branches.develop": "develop",
      "branches.feature_prefix": "feature",
      "branches.release_prefix": "release",
      "goals.default_status": "todo",
      "goals.id_pattern": "^g-[a-z0-9]{6}$",
    };

    for (const [key, value] of Object.entries(defaultConfig)) {
      await this.storage.setConfig(key, value);
    }
  }

  /**
   * Start working on a goal
   */
  async startGoal(goalId: string): Promise<CommandResult> {
    try {
      logger.info(`Starting goal: ${goalId}`);

      // Validate goal ID format
      if (!goalId.match(/^g-[a-z0-9]{6}$/)) {
        return {
          success: false,
          message: "Invalid goal ID format. Expected format: g-xxxxxx",
          error: "Invalid goal ID format",
        };
      }

      // Get goal from storage
      const goal = await this.storage.getGoal(goalId);
      if (!goal) {
        return {
          success: false,
          message: `Goal ${goalId} not found`,
          error: "Goal not found",
        };
      }

      if (goal.status !== "todo") {
        return {
          success: false,
          message: `Goal ${goalId} is not in 'todo' status. Current status: ${goal.status}`,
          error: "Invalid goal status",
        };
      }

      // Check if working directory is clean
      if (!(await this.git.isWorkingDirectoryClean())) {
        return {
          success: false,
          message:
            "Working directory is not clean. Please commit or stash your changes first.",
          error: "Working directory not clean",
        };
      }

      // Get current branch and ensure we're on develop
      const currentBranch = await this.git.getCurrentBranch();
      const developBranch = this.context.config.branches.develop;
      
      if (currentBranch !== developBranch) {
        // Switch to develop branch
        await this.git.checkoutBranch(developBranch);
        logger.info(`Switched to ${developBranch} branch`);
      }
      
      // Pull latest changes from develop
      await this.git.pull("origin", developBranch);
      logger.info(`Updated ${developBranch} branch with latest changes`);

      // Create feature branch
      const branchName = this.generateFeatureBranchName(goal);
      await this.git.createBranch(branchName);
      logger.info(`Created feature branch: ${branchName}`);

      // Update goal status
      await this.storage.updateGoal(goalId, {
        status: "in_progress",
        branch_name: branchName,
      });

      // Sync to GitHub if configured
      try {
        if (this.github.isConfigured()) {
          await this.github.syncGoalStatusToGitHub(goal);
          logger.info(`Synced goal ${goalId} status to GitHub`);
        }
      } catch (error) {
        logger.warn(`Failed to sync goal ${goalId} to GitHub`, error as Error);
        // Don't fail the goal start if GitHub sync fails
      }

      logger.success(
        `Started working on goal ${goalId} in branch ${branchName}`,
      );
      return {
        success: true,
        message: `Started working on goal ${goalId}`,
        data: {
          goalId,
          branchName,
          status: "in_progress",
        },
      };
    } catch (error) {
      logger.error(`Failed to start goal ${goalId}`, error as Error);
      return {
        success: false,
        message: `Failed to start goal ${goalId}`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Generate feature branch name for goal
   */
  private generateFeatureBranchName(goal: Goal): string {
    const featurePrefix = this.context.config.branches.feature_prefix;
    // Use only the goal ID for branch naming, not the title
    return `${featurePrefix}/${goal.id}`;
  }

  /**
   * Complete a goal
   */
  async completeGoal(goalId: string): Promise<CommandResult> {
    try {
      logger.info(`Completing goal: ${goalId}`);

      // Get goal from storage
      const goal = await this.storage.getGoal(goalId);
      if (!goal) {
        return {
          success: false,
          message: `Goal ${goalId} not found`,
          error: "Goal not found",
        };
      }

      if (goal.status !== "in_progress") {
        return {
          success: false,
          message: `Goal ${goalId} is not in 'in_progress' status. Current status: ${goal.status}`,
          error: "Invalid goal status",
        };
      }

      // Check if we're on the correct branch
      const currentBranch = await this.git.getCurrentBranch();
      if (currentBranch !== goal.branch_name) {
        return {
          success: false,
          message: `You must be on branch ${goal.branch_name} to complete goal ${goalId}. Current branch: ${currentBranch}`,
          error: "Wrong branch",
        };
      }

      // Update goal status
      await this.storage.updateGoal(goalId, {
        status: "done",
        completed_at: new Date().toISOString(),
      });

      // Switch back to develop branch
      const developBranch = this.context.config.branches.develop;
      await this.git.checkoutBranch(developBranch);
      logger.info(`Switched back to ${developBranch} branch`);

      // Delete the feature branch locally
      try {
        await this.git.deleteBranch(goal.branch_name!);
        logger.info(`Deleted local feature branch: ${goal.branch_name}`);
      } catch (error) {
        logger.warn(`Failed to delete local feature branch: ${goal.branch_name}`, error as Error);
      }

      // Clear branch name from goal
      await this.storage.updateGoal(goalId, {
        branch_name: undefined,
      });

      // Get updated goal for GitHub sync
      const updatedGoal = await this.storage.getGoal(goalId);
      
      // Sync to GitHub if configured
      try {
        if (this.github.isConfigured() && updatedGoal) {
          await this.github.syncGoalStatusToGitHub(updatedGoal);
          logger.info(`Synced goal ${goalId} status to GitHub`);
        }
      } catch (error) {
        logger.warn(`Failed to sync goal ${goalId} to GitHub`, error as Error);
        // Don't fail the goal completion if GitHub sync fails
      }

      logger.success(`Goal ${goalId} marked as completed and feature branch cleaned up`);
      return {
        success: true,
        message: `Goal ${goalId} completed successfully`,
        data: {
          goalId,
          status: "done",
          completedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      logger.error(`Failed to complete goal ${goalId}`, error as Error);
      return {
        success: false,
        message: `Failed to complete goal ${goalId}`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Stop working on a goal
   */
  async stopGoal(goalId: string): Promise<CommandResult> {
    try {
      logger.info(`Stopping work on goal: ${goalId}`);

      // Get goal from storage
      const goal = await this.storage.getGoal(goalId);
      if (!goal) {
        return {
          success: false,
          message: `Goal ${goalId} not found`,
          error: "Goal not found",
        };
      }

      if (goal.status !== "in_progress") {
        return {
          success: false,
          message: `Goal ${goalId} is not in 'in_progress' status. Current status: ${goal.status}`,
          error: "Invalid goal status",
        };
      }

      // Switch back to develop branch
      const developBranch = this.context.config.branches.develop;
      await this.git.checkoutBranch(developBranch);
      logger.info(`Switched back to ${developBranch} branch`);

      // Delete the feature branch locally
      if (goal.branch_name) {
        try {
          await this.git.deleteBranch(goal.branch_name);
          logger.info(`Deleted local feature branch: ${goal.branch_name}`);
        } catch (error) {
          logger.warn(`Failed to delete local feature branch: ${goal.branch_name}`, error as Error);
        }
      }

      // Update goal status
      await this.storage.updateGoal(goalId, {
        status: "todo",
        branch_name: undefined,
      });

      // Get updated goal for GitHub sync
      const updatedGoal = await this.storage.getGoal(goalId);
      
      // Sync to GitHub if configured
      try {
        if (this.github.isConfigured() && updatedGoal) {
          await this.github.syncGoalStatusToGitHub(updatedGoal);
          logger.info(`Synced goal ${goalId} status to GitHub`);
        }
      } catch (error) {
        logger.warn(`Failed to sync goal ${goalId} to GitHub`, error as Error);
        // Don't fail the goal stop if GitHub sync fails
      }

      logger.success(`Stopped working on goal ${goalId} and cleaned up feature branch`);
      return {
        success: true,
        message: `Stopped working on goal ${goalId}`,
        data: {
          goalId,
          status: "todo",
        },
      };
    } catch (error) {
      logger.error(`Failed to stop goal ${goalId}`, error as Error);
      return {
        success: false,
        message: `Failed to stop goal ${goalId}`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * List all goals
   */
  async listGoals(status?: GoalStatus): Promise<CommandResult> {
    try {
      logger.info("Listing goals");

      const goals = await this.storage.listGoals(status);
      const counts = await this.getGoalCounts();

      logger.success(`Found ${goals.length} goals`);
      return {
        success: true,
        message: `Found ${goals.length} goals`,
        data: {
          goals,
          counts,
        },
      };
    } catch (error) {
      logger.error("Failed to list goals", error as Error);
      return {
        success: false,
        message: "Failed to list goals",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Cleanup completed goals and their branches
   * This method automatically removes feature branches for completed goals
   */
  async cleanupCompletedGoals(): Promise<CommandResult> {
    try {
      logger.info("Cleaning up completed goals and their branches");

      // Get all completed goals
      const completedGoals = await this.storage.listGoals("done");
      let cleanedCount = 0;
      const errors: string[] = [];

      for (const goal of completedGoals) {
        if (goal.branch_name) {
          try {
            // Try to delete remote branch if it exists
            try {
              await this.git.deleteRemoteBranch("origin", goal.branch_name);
              logger.info(`Deleted remote branch: ${goal.branch_name}`);
            } catch {
              // Branch might not exist remotely, which is fine
              logger.debug(`Remote branch ${goal.branch_name} not found or already deleted`);
            }

            // Clear branch name from goal
            await this.storage.updateGoal(goal.id, {
              branch_name: undefined,
            });

            cleanedCount++;
            logger.info(`Cleaned up goal ${goal.id}: ${goal.title}`);
          } catch {
            const errorMsg = `Failed to cleanup goal ${goal.id}`;
            errors.push(errorMsg);
            logger.error(errorMsg);
          }
        }
      }

      if (errors.length > 0) {
        logger.warn(`Cleanup completed with ${errors.length} errors`);
        return {
          success: true,
          message: `Cleanup completed: ${cleanedCount} goals cleaned up, ${errors.length} errors`,
          data: { cleanedCount, errors },
        };
      }

      logger.success(`Successfully cleaned up ${cleanedCount} completed goals`);
      return {
        success: true,
        message: `Successfully cleaned up ${cleanedCount} completed goals`,
        data: { cleanedCount },
      };
    } catch (error) {
      logger.error("Failed to cleanup completed goals", error as Error);
      return {
        success: false,
        message: "Failed to cleanup completed goals",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get goal counts by status
   */
  private async getGoalCounts(): Promise<Record<GoalStatus, number>> {
    const counts: Record<GoalStatus, number> = {
      todo: 0,
      in_progress: 0,
      done: 0,
      archived: 0,
    };

    for (const status of Object.keys(counts) as GoalStatus[]) {
      counts[status] = await this.storage.getGoalCount(status);
    }

    return counts;
  }

  /**
   * Create a new goal
   */
  async createGoal(
    title: string,
    description?: string,
  ): Promise<CommandResult> {
    try {
      logger.info(`Creating new goal: ${title}`);

      // Generate unique goal ID
      const goalId = await this.aid.generateUniqueGoalId();

      // Validate goal before creation
      const validationResults = await this.validation.validateGoalCreation({
        id: goalId,
        title,
        description,
        status: "todo",
      });

      const summary = ValidationService.summarizeResults(validationResults);

      // Check for validation errors
      if (!summary.valid) {
        const errorMessages = summary.errors.map((e) => e.message).join("; ");
        return {
          success: false,
          message: `Goal validation failed: ${errorMessages}`,
          error: "Validation failed",
          data: { validationResults },
        };
      }

      // Create goal in storage
      await this.storage.createGoal({
        id: goalId,
        title,
        description,
        status: "todo",
      });

      logger.success(`Created goal ${goalId}: ${title}`);

      // Include validation warnings in response
      const warningMessages = summary.warnings.map((w) => w.message);
      let message = "Goal created successfully";
      if (warningMessages.length > 0) {
        message += ` (${warningMessages.length} warning${warningMessages.length > 1 ? "s" : ""})`;
      }

      return {
        success: true,
        message,
        data: {
          goalId,
          title,
          status: "todo",
          validationResults:
            summary.warnings.length > 0 ? validationResults : undefined,
        },
      };
    } catch (error) {
      logger.error("Failed to create goal", error as Error);
      return {
        success: false,
        message: "Failed to create goal",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Set configuration value
   */
  async setConfiguration(key: string, value: string): Promise<CommandResult> {
    try {
      logger.info(`Setting configuration: ${key} = ${value}`);

      // Extract category from key (e.g., github.owner -> github)
      const category = key.split('.')[0] || 'general';
      await this.storage.setConfig(key, value, 'string', `Configuration for ${key}`, category);

      logger.success(`Configuration updated: ${key} = ${value}`);
      return {
        success: true,
        message: `Configuration updated: ${key} = ${value}`,
      };
    } catch (error) {
      logger.error(`Failed to set configuration ${key}`, error as Error);
      return {
        success: false,
        message: `Failed to set configuration ${key}`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get configuration value
   */
  async getConfiguration(key: string): Promise<CommandResult> {
    try {
      logger.info(`Getting configuration: ${key}`);

      const value = await this.storage.getConfig(key);

      if (value === null) {
        return {
          success: false,
          message: `Configuration key '${key}' not found`,
          error: "Configuration not found",
        };
      }

      logger.success(`Configuration retrieved: ${key} = ${value}`);
      return {
        success: true,
        message: `Configuration value: ${value}`,
        data: {
          key,
          value,
        },
      };
    } catch (error) {
      logger.error(`Failed to get configuration ${key}`, error as Error);
      return {
        success: false,
        message: `Failed to get configuration ${key}`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get all configuration
   */
  async getAllConfiguration(): Promise<CommandResult> {
    try {
      logger.info("Getting all configuration");

      const config = await this.storage.getAllConfig();

      logger.success(
        `Retrieved ${Object.keys(config).length} configuration items`,
      );
      return {
        success: true,
        message: `Retrieved ${Object.keys(config).length} configuration items`,
        data: config,
      };
    } catch (error) {
      logger.error("Failed to get all configuration", error as Error);
      return {
        success: false,
        message: "Failed to get all configuration",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Initialize GitHub integration
   */
  async initializeGitHub(token?: string): Promise<CommandResult> {
    try {
      logger.info("Initializing GitHub integration");

      // Get GitHub configuration from project config file
      const { owner, repo } = await this.projectConfig.getGitHubConfig();

      if (!owner || !repo) {
        return {
          success: false,
          message:
            "GitHub repository not configured. Please check config.json file",
          error: "Missing GitHub configuration",
        };
      }

      // Get token from parameter, environment, or storage
      const authToken = token || getEnv("GITHUB_TOKEN") || await this.storage.getConfig("github.token");

      if (!authToken) {
        return {
          success: false,
          message: "GitHub token not provided. Please set GITHUB_TOKEN in your .env file",
          error: "Missing GitHub token",
        };
      }

      const config = {
        owner,
        repo,
        token: authToken,
      };

      await this.github.initialize(config, authToken);

      logger.success("GitHub integration initialized successfully");
      return {
        success: true,
        message: "GitHub integration initialized successfully",
      };
    } catch (error) {
      logger.error("Failed to initialize GitHub integration", error as Error);
      return {
        success: false,
        message: "Failed to initialize GitHub integration",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Sync issues from GitHub to local goals
   */
  async syncFromGitHub(token?: string): Promise<CommandResult> {
    try {
      logger.info("Syncing issues from GitHub");

      // Initialize GitHub if not already done
      if (!this.github.isConfigured()) {
        const initResult = await this.initializeGitHub(token);
        if (!initResult.success) {
          return initResult;
        }
      }

      const result = await this.github.syncIssuesToGoals();

      logger.success(
        `GitHub sync completed: ${result.created} created, ${result.updated} updated`,
      );
      return {
        success: true,
        message: `Sync completed: ${result.created} goals created, ${result.updated} updated`,
        data: result,
      };
    } catch (error) {
      logger.error("Failed to sync from GitHub", error as Error);
      return {
        success: false,
        message: "Failed to sync from GitHub",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Sync goal status to GitHub
   */
  async syncGoalToGitHub(
    goalId: string,
    token?: string,
  ): Promise<CommandResult> {
    try {
      logger.info(`Syncing goal ${goalId} to GitHub`);

      // Initialize GitHub if not already done
      if (!this.github.isConfigured()) {
        const initResult = await this.initializeGitHub(token);
        if (!initResult.success) {
          return initResult;
        }
      }

      // Get the goal
      const goal = await this.storage.getGoal(goalId);
      if (!goal) {
        return {
          success: false,
          message: `Goal ${goalId} not found`,
          error: "Goal not found",
        };
      }

      await this.github.syncGoalStatusToGitHub(goal);

      logger.success(`Goal ${goalId} synced to GitHub successfully`);
      return {
        success: true,
        message: `Goal ${goalId} synced to GitHub successfully`,
      };
    } catch (error) {
      logger.error(`Failed to sync goal ${goalId} to GitHub`, error as Error);
      return {
        success: false,
        message: `Failed to sync goal ${goalId} to GitHub`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Check pull request status and update goal if merged
   */
  async checkPullRequestStatus(goalId: string): Promise<CommandResult> {
    try {
      logger.info(`Checking pull request status for goal: ${goalId}`);

      const goal = await this.storage.getGoal(goalId);
      if (!goal) {
        return {
          success: false,
          message: `Goal ${goalId} not found`,
          error: "Goal not found",
        };
      }

      if (!goal.branch_name) {
        return {
          success: false,
          message: `Goal ${goalId} has no associated branch`,
          error: "No branch associated",
        };
      }

      try {
        await this.github.checkPullRequestStatus(goal);
        
        // If we get here, the PR was merged
        logger.info(`Pull request for goal ${goalId} was merged, updating status to done`);
        
        // Update goal status to done
        await this.storage.updateGoal(goalId, {
          status: "done",
          completed_at: new Date().toISOString(),
        });

        // Sync to GitHub
        const updatedGoal = await this.storage.getGoal(goalId);
        if (updatedGoal && this.github.isConfigured()) {
          await this.github.syncGoalStatusToGitHub(updatedGoal);
        }

        return {
          success: true,
          message: `Goal ${goalId} marked as done after pull request merge`,
          data: {
            goalId,
            status: "done",
            completedAt: new Date().toISOString(),
          },
        };
      } catch (error) {
        if (error instanceof Error && error.message === "PULL_REQUEST_MERGED") {
          // This is expected when PR is merged
          return {
            success: true,
            message: `Pull request for goal ${goalId} was merged`,
            data: {
              goalId,
              status: "merged",
            },
          };
        }
        throw error;
      }
    } catch (error) {
      logger.error(`Failed to check pull request status for goal ${goalId}`, error as Error);
      return {
        success: false,
        message: `Failed to check pull request status for goal ${goalId}`,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
