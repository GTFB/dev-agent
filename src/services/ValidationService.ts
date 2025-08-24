/**
 * Validation Service for Dev Agent
 * Provides business logic validation for goals and project consistency
 */

import { Goal, GoalStatus } from "../core/types.js";
import { StorageService } from "./StorageService.js";
import { GitService } from "./GitService.js";
import { logger } from "../utils/logger.js";

export interface ValidationRule {
  name: string;
  description: string;
  validate: (
    goal: Goal,
    context: ValidationContext,
  ) => Promise<ValidationResult>;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  severity: "error" | "warning" | "info";
  suggestion?: string;
}

export interface ValidationContext {
  allGoals: Goal[];
  currentBranch?: string;
  hasUncommittedChanges?: boolean;
  projectType?: string;
  storageService: StorageService;
  gitService: GitService;
}

/**
 * Validation Service class
 */
export class ValidationService {
  private storage: StorageService;
  private git: GitService;
  private rules: ValidationRule[] = [];

  constructor(storage: StorageService, git: GitService) {
    this.storage = storage;
    this.git = git;
    this.initializeRules();
  }

  /**
   * Initialize validation rules
   */
  private initializeRules(): void {
    this.rules = [
      {
        name: "unique-title",
        description: "Goal titles should be unique",
        validate: this.validateUniqueTitle.bind(this),
      },
      {
        name: "title-format",
        description: "Goal titles should follow proper format",
        validate: this.validateTitleFormat.bind(this),
      },
      {
        name: "status-transition",
        description: "Goal status transitions should be logical",
        validate: this.validateStatusTransition.bind(this),
      },
      {
        name: "branch-consistency",
        description: "Goals with branches should have consistent states",
        validate: this.validateBranchConsistency.bind(this),
      },
      {
        name: "in-progress-limit",
        description: "Limit number of goals in progress",
        validate: this.validateInProgressLimit.bind(this),
      },
      {
        name: "github-consistency",
        description: "GitHub issues should be consistent with goals",
        validate: this.validateGitHubConsistency.bind(this),
      },
      {
        name: "description-quality",
        description: "Goal descriptions should be meaningful",
        validate: this.validateDescriptionQuality.bind(this),
      },
    ];
  }

  /**
   * Validate a goal against all rules
   */
  async validateGoal(
    goal: Goal,
    options: { strict?: boolean } = {},
  ): Promise<ValidationResult[]> {
    try {
      const context = await this.buildValidationContext();
      const results: ValidationResult[] = [];

      for (const rule of this.rules) {
        try {
          const result = await rule.validate(goal, context);
          results.push(result);

          // In strict mode, stop on first error
          if (options.strict && !result.valid && result.severity === "error") {
            break;
          }
        } catch (error) {
          logger.error(`Validation rule ${rule.name} failed`, error as Error);
          results.push({
            valid: false,
            message: `Validation rule ${rule.name} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            severity: "error",
          });
        }
      }

      return results;
    } catch (error) {
      logger.error("Failed to validate goal", error as Error);
      throw error;
    }
  }

  /**
   * Validate goal creation
   */
  async validateGoalCreation(
    goal: Omit<Goal, "created_at" | "updated_at">,
  ): Promise<ValidationResult[]> {
    const tempGoal: Goal = {
      ...goal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return this.validateGoal(tempGoal);
  }

  /**
   * Validate goal status change
   */
  async validateStatusChange(
    goalId: string,
    newStatus: GoalStatus,
  ): Promise<ValidationResult[]> {
    try {
      const goal = await this.storage.getGoal(goalId);
      if (!goal) {
        return [
          {
            valid: false,
            message: `Goal ${goalId} not found`,
            severity: "error",
          },
        ];
      }

      const updatedGoal = { ...goal, status: newStatus };
      return this.validateGoal(updatedGoal);
    } catch (error) {
      logger.error("Failed to validate status change", error as Error);
      throw error;
    }
  }

  /**
   * Build validation context
   */
  private async buildValidationContext(): Promise<ValidationContext> {
    const allGoals = await this.storage.listGoals();

    let currentBranch: string | undefined;
    let hasUncommittedChanges: boolean | undefined;

    try {
      currentBranch = await this.git.getCurrentBranch();
      hasUncommittedChanges = !(await this.git.isWorkingDirectoryClean());
    } catch (error) {
      // Git operations might fail, that's OK
      logger.debug(
        "Git operations failed during validation context building",
        error as Error,
      );
    }

    return {
      allGoals,
      currentBranch,
      hasUncommittedChanges,
      storageService: this.storage,
      gitService: this.git,
    };
  }

  // Validation Rules Implementation

  /**
   * Validate unique title
   */
  private async validateUniqueTitle(
    goal: Goal,
  ): Promise<ValidationResult> {
    // Title should be unique among all goals
    const allGoals = await this.storage.listGoals();
    const duplicateTitle = allGoals.find(
      (g) => g.id !== goal.id && g.title.toLowerCase() === goal.title.toLowerCase(),
    );

    if (duplicateTitle) {
      return {
        valid: false,
        message: `Goal title "${goal.title}" already exists`,
        severity: "error",
        suggestion: "Use a unique title or check existing goals",
      };
    }

    return {
      valid: true,
      message: "Goal title is unique",
      severity: "info",
    };
  }

  /**
   * Validate goal title format
   */
  private async validateTitleFormat(
    goal: Goal,
  ): Promise<ValidationResult> {
    // Title should not be empty and should be descriptive
    if (!goal.title || goal.title.trim().length === 0) {
      return {
        valid: false,
        message: "Goal title cannot be empty",
        severity: "error",
        suggestion: "Provide a descriptive title for the goal",
      };
    }

    if (goal.title.length < 3) {
      return {
        valid: false,
        message: "Goal title is too short",
        severity: "warning",
        suggestion: "Use a more descriptive title (at least 3 characters)",
      };
    }

    if (goal.title.length > 100) {
      return {
        valid: false,
        message: "Goal title is too long",
        severity: "warning",
        suggestion: "Keep title concise (under 100 characters)",
      };
    }

    return {
      valid: true,
      message: "Goal title format is valid",
      severity: "info",
    };
  }

  /**
   * Validate goal status transitions
   */
  private async validateStatusTransition(
    goal: Goal,
  ): Promise<ValidationResult> {
    // Status transitions should be logical
    const validTransitions: Record<GoalStatus, GoalStatus[]> = {
      todo: ["in_progress"],
      in_progress: ["done", "todo"],
      done: ["archived"],
      archived: [],
    };

    // For now, we'll just check if the current status is valid
    // In a real implementation, you'd check the previous status
    if (!Object.keys(validTransitions).includes(goal.status)) {
      return {
        valid: false,
        message: `Invalid goal status: ${goal.status}`,
        severity: "error",
        suggestion: "Use one of: todo, in_progress, done, archived",
      };
    }

    return {
      valid: true,
      message: "Goal status is valid",
      severity: "info",
    };
  }

  /**
   * Validate branch consistency
   */
  private async validateBranchConsistency(
    goal: Goal,
  ): Promise<ValidationResult> {
    // Goals with branches should have consistent states
    if (goal.branch_name && goal.status === "todo") {
      return {
        valid: false,
        message: "Goal with branch should not be in 'todo' status",
        severity: "warning",
        suggestion: "Update status to 'in_progress' or remove branch name",
      };
    }

    if (!goal.branch_name && goal.status === "in_progress") {
      return {
        valid: false,
        message: "Goal in progress should have a branch name",
        severity: "warning",
        suggestion: "Create a feature branch for this goal",
      };
    }

    return {
      valid: true,
      message: "Branch consistency is valid",
      severity: "info",
    };
  }

  /**
   * Validate in-progress limit
   */
  private async validateInProgressLimit(
    goal: Goal,
    context: ValidationContext,
  ): Promise<ValidationResult> {
    // Limit number of goals in progress
    if (goal.status === "in_progress") {
      const inProgressCount = context.allGoals.filter(
        (g) => g.status === "in_progress",
      ).length;

      if (inProgressCount > 3) {
        return {
          valid: false,
          message: "Too many goals in progress",
          severity: "warning",
          suggestion: "Complete or pause some goals before starting new ones",
        };
      }
    }

    return {
      valid: true,
      message: "In-progress limit is acceptable",
      severity: "info",
    };
  }

  /**
   * Validate GitHub consistency
   */
  private async validateGitHubConsistency(
    goal: Goal,
  ): Promise<ValidationResult> {
    // If goal has GitHub issue, check for duplicates
    if (goal.github_issue_id) {
      const allGoals = await this.storage.listGoals();
      const duplicates = allGoals.filter(
        (g) => g.id !== goal.id && g.github_issue_id === goal.github_issue_id,
      );

      if (duplicates.length > 0) {
        return {
          valid: false,
          message: `GitHub issue #${goal.github_issue_id} is already linked to goal ${duplicates[0].id}`,
          severity: "error",
          suggestion: "Each GitHub issue should be linked to only one goal",
        };
      }
    }

    return { valid: true, severity: "info" };
  }

  /**
   * Validate description quality
   */
  private async validateDescriptionQuality(
    goal: Goal,
  ): Promise<ValidationResult> {
    if (!goal.description || goal.description.trim().length === 0) {
      return {
        valid: true,
        message: "Goal has no description",
        severity: "warning",
        suggestion:
          "Consider adding a description to clarify the goal requirements",
      };
    }

    const description = goal.description.trim();

    // Check for very short descriptions
    if (description.length < 10) {
      return {
        valid: true,
        message: "Goal description is very short",
        severity: "warning",
        suggestion: "Provide more details about what needs to be accomplished",
      };
    }

    // Check for acceptance criteria
    const hasAcceptanceCriteria =
      description.toLowerCase().includes("acceptance criteria") ||
      description.includes("- [ ]") ||
      description.includes("* [ ]") ||
      description.includes("1.") ||
      description.toLowerCase().includes("should");

    if (!hasAcceptanceCriteria && description.length > 50) {
      return {
        valid: true,
        message: "Goal description lacks clear acceptance criteria",
        severity: "info",
        suggestion: "Consider adding acceptance criteria or a checklist",
      };
    }

    return { valid: true, severity: "info" };
  }

  /**
   * Get summary of validation results
   */
  static summarizeResults(results: ValidationResult[]): {
    valid: boolean;
    errors: ValidationResult[];
    warnings: ValidationResult[];
    info: ValidationResult[];
  } {
    const errors = results.filter((r) => !r.valid && r.severity === "error");
    const warnings = results.filter((r) => r.severity === "warning");
    const info = results.filter((r) => r.severity === "info");

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info,
    };
  }
}
