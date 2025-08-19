/**
 * Workflow Service for Dev Agent
 * Orchestrates the High-Efficiency Standard Operating Protocol
 */

import { StorageService } from "./StorageService.js";
import { GitService } from "./GitService.js";
import { GitHubService } from "./GitHubService.js";
import { ValidationService } from "./ValidationService.js";
import {
  Goal,
  GoalStatus,
  CommandResult,
  WorkflowContext,
} from "../core/types.js";
import { generateGoalId } from "../core/aid-generator.js";
import { logger } from "../utils/logger.js";

/**
 * Workflow Service class
 */
export class WorkflowService {
  private storage: StorageService;
  private git: GitService;
  private github: GitHubService;
  private validation: ValidationService;
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

      // Update develop branch
      await this.git.checkoutBranch("develop");
      await this.git.pull("origin", "develop");

      // Create feature branch
      const branchName = this.generateFeatureBranchName(goal);
      await this.git.createBranch(branchName);

      // Update goal status
      await this.storage.updateGoal(goalId, {
        status: "in_progress",
        branch_name: branchName,
      });

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
    const sanitizedTitle = goal.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30);

    return `${featurePrefix}/${goal.id}-${sanitizedTitle}`;
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

      logger.success(`Goal ${goalId} marked as completed`);
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
      await this.git.checkoutBranch("develop");

      // Update goal status
      await this.storage.updateGoal(goalId, {
        status: "todo",
        branch_name: undefined,
      });

      logger.success(`Stopped working on goal ${goalId}`);
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
      const goalId = generateGoalId(title);

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

      await this.storage.setConfig(key, value);

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

      // Get GitHub configuration
      const owner = await this.storage.getConfig("github.owner");
      const repo = await this.storage.getConfig("github.repo");

      if (!owner || !repo) {
        return {
          success: false,
          message:
            "GitHub repository not configured. Please set github.owner and github.repo",
          error: "Missing GitHub configuration",
        };
      }

      const config = {
        owner,
        repo,
        token,
      };

      await this.github.initialize(config, token);

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
}
