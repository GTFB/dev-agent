/**
 * Validation Service for Dev Agent
 * Provides business logic validation for goals and project consistency
 */

import { Goal, GoalStatus } from '../core/types.js';
import { StorageService } from './StorageService.js';
import { GitService } from './GitService.js';
import { logger } from '../utils/logger.js';

export interface ValidationRule {
  name: string;
  description: string;
  validate: (goal: Goal, context: ValidationContext) => Promise<ValidationResult>;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  severity: 'error' | 'warning' | 'info';
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
        name: 'unique-title',
        description: 'Goal titles should be unique',
        validate: this.validateUniqueTitle.bind(this)
      },
      {
        name: 'title-format',
        description: 'Goal titles should follow proper format',
        validate: this.validateTitleFormat.bind(this)
      },
      {
        name: 'status-transition',
        description: 'Goal status transitions should be logical',
        validate: this.validateStatusTransition.bind(this)
      },
      {
        name: 'branch-consistency',
        description: 'Goals with branches should have consistent states',
        validate: this.validateBranchConsistency.bind(this)
      },
      {
        name: 'in-progress-limit',
        description: 'Limit number of goals in progress',
        validate: this.validateInProgressLimit.bind(this)
      },
      {
        name: 'github-consistency',
        description: 'GitHub issues should be consistent with goals',
        validate: this.validateGitHubConsistency.bind(this)
      },
      {
        name: 'description-quality',
        description: 'Goal descriptions should be meaningful',
        validate: this.validateDescriptionQuality.bind(this)
      }
    ];
  }

  /**
   * Validate a goal against all rules
   */
  async validateGoal(goal: Goal, options: { strict?: boolean } = {}): Promise<ValidationResult[]> {
    try {
      const context = await this.buildValidationContext();
      const results: ValidationResult[] = [];

      for (const rule of this.rules) {
        try {
          const result = await rule.validate(goal, context);
          results.push(result);

          // In strict mode, stop on first error
          if (options.strict && !result.valid && result.severity === 'error') {
            break;
          }
        } catch (error) {
          logger.error(`Validation rule ${rule.name} failed`, error as Error);
          results.push({
            valid: false,
            message: `Validation rule ${rule.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            severity: 'error'
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Failed to validate goal', error as Error);
      throw error;
    }
  }

  /**
   * Validate goal creation
   */
  async validateGoalCreation(goal: Omit<Goal, 'created_at' | 'updated_at'>): Promise<ValidationResult[]> {
    const tempGoal: Goal = {
      ...goal,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return this.validateGoal(tempGoal);
  }

  /**
   * Validate goal status change
   */
  async validateStatusChange(goalId: string, newStatus: GoalStatus): Promise<ValidationResult[]> {
    try {
      const goal = await this.storage.getGoal(goalId);
      if (!goal) {
        return [{
          valid: false,
          message: `Goal ${goalId} not found`,
          severity: 'error'
        }];
      }

      const updatedGoal = { ...goal, status: newStatus };
      return this.validateGoal(updatedGoal);
    } catch (error) {
      logger.error('Failed to validate status change', error as Error);
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
      logger.debug('Git operations failed during validation context building', error as Error);
    }

    return {
      allGoals,
      currentBranch,
      hasUncommittedChanges,
      storageService: this.storage,
      gitService: this.git
    };
  }

  // Validation Rules Implementation

  /**
   * Validate unique title
   */
  private async validateUniqueTitle(goal: Goal, context: ValidationContext): Promise<ValidationResult> {
    const duplicates = context.allGoals.filter(g => 
      g.id !== goal.id && 
      g.title.toLowerCase().trim() === goal.title.toLowerCase().trim()
    );

    if (duplicates.length > 0) {
      return {
        valid: false,
        message: `Goal title "${goal.title}" is already used by goal ${duplicates[0].id}`,
        severity: 'error',
        suggestion: 'Choose a unique title or modify the existing goal'
      };
    }

    return { valid: true, severity: 'info' };
  }

  /**
   * Validate title format
   */
  private async validateTitleFormat(goal: Goal, context: ValidationContext): Promise<ValidationResult> {
    const title = goal.title.trim();

    // Check minimum length
    if (title.length < 3) {
      return {
        valid: false,
        message: 'Goal title is too short (minimum 3 characters)',
        severity: 'error',
        suggestion: 'Provide a more descriptive title'
      };
    }

    // Check maximum length
    if (title.length > 100) {
      return {
        valid: false,
        message: 'Goal title is too long (maximum 100 characters)',
        severity: 'error',
        suggestion: 'Shorten the title or move details to description'
      };
    }

    // Check for proper capitalization
    if (title[0] !== title[0].toUpperCase()) {
      return {
        valid: true,
        message: 'Goal title should start with a capital letter',
        severity: 'warning',
        suggestion: 'Consider capitalizing the first letter'
      };
    }

    // Check for action words (verbs)
    const actionWords = ['add', 'implement', 'create', 'fix', 'update', 'remove', 'refactor', 'optimize'];
    const hasActionWord = actionWords.some(word => 
      title.toLowerCase().includes(word)
    );

    if (!hasActionWord) {
      return {
        valid: true,
        message: 'Goal title should contain an action word (add, implement, fix, etc.)',
        severity: 'warning',
        suggestion: 'Start with an action verb to clarify what needs to be done'
      };
    }

    return { valid: true, severity: 'info' };
  }

  /**
   * Validate status transition
   */
  private async validateStatusTransition(goal: Goal, context: ValidationContext): Promise<ValidationResult> {
    // Check if status is valid
    const validStatuses: GoalStatus[] = ['todo', 'in_progress', 'done', 'archived'];
    if (!validStatuses.includes(goal.status)) {
      return {
        valid: false,
        message: `Invalid status "${goal.status}"`,
        severity: 'error',
        suggestion: `Valid statuses: ${validStatuses.join(', ')}`
      };
    }

    // Find previous version of the goal
    const existingGoal = context.allGoals.find(g => g.id === goal.id);
    
    if (!existingGoal) {
      // New goal, check if initial status is valid
      if (goal.status !== 'todo') {
        return {
          valid: false,
          message: 'New goals must start with "todo" status',
          severity: 'error',
          suggestion: 'Set status to "todo" for new goals'
        };
      }
      return { valid: true, severity: 'info' };
    }

    // Only validate transition if status actually changed
    if (existingGoal.status === goal.status) {
      return { valid: true, severity: 'info' };
    }

    const validTransitions: Record<GoalStatus, GoalStatus[]> = {
      'todo': ['in_progress', 'archived'],
      'in_progress': ['done', 'todo', 'archived'],
      'done': ['archived', 'todo'], // Can reopen if needed
      'archived': ['todo'] // Can restore from archive
    };

    const allowedNext = validTransitions[existingGoal.status];
    if (!allowedNext.includes(goal.status)) {
      return {
        valid: false,
        message: `Invalid status transition from "${existingGoal.status}" to "${goal.status}"`,
        severity: 'error',
        suggestion: `Allowed transitions from "${existingGoal.status}": ${allowedNext.join(', ')}`
      };
    }

    return { valid: true, severity: 'info' };
  }

  /**
   * Validate branch consistency
   */
  private async validateBranchConsistency(goal: Goal, context: ValidationContext): Promise<ValidationResult> {
    // If goal has a branch, it should be in progress
    if (goal.branch_name && goal.status !== 'in_progress') {
      return {
        valid: false,
        message: `Goal has branch "${goal.branch_name}" but status is "${goal.status}"`,
        severity: 'error',
        suggestion: 'Goals with branches should be in "in_progress" status'
      };
    }

    // If goal is in progress, it should have a branch
    if (goal.status === 'in_progress' && !goal.branch_name) {
      return {
        valid: true,
        message: 'Goal is in progress but has no associated branch',
        severity: 'warning',
        suggestion: 'Consider creating a feature branch for this goal'
      };
    }

    return { valid: true, severity: 'info' };
  }

  /**
   * Validate in-progress limit
   */
  private async validateInProgressLimit(goal: Goal, context: ValidationContext): Promise<ValidationResult> {
    const inProgressGoals = context.allGoals.filter(g => 
      g.status === 'in_progress' && g.id !== goal.id
    );

    // Recommend limiting work in progress
    const maxInProgress = 3;
    
    if (goal.status === 'in_progress' && inProgressGoals.length >= maxInProgress) {
      return {
        valid: true,
        message: `You have ${inProgressGoals.length} goals in progress. Consider focusing on fewer goals.`,
        severity: 'warning',
        suggestion: 'Complete or pause some goals before starting new ones'
      };
    }

    return { valid: true, severity: 'info' };
  }

  /**
   * Validate GitHub consistency
   */
  private async validateGitHubConsistency(goal: Goal, context: ValidationContext): Promise<ValidationResult> {
    // If goal has GitHub issue, check for duplicates
    if (goal.github_issue_id) {
      const duplicates = context.allGoals.filter(g => 
        g.id !== goal.id && 
        g.github_issue_id === goal.github_issue_id
      );

      if (duplicates.length > 0) {
        return {
          valid: false,
          message: `GitHub issue #${goal.github_issue_id} is already linked to goal ${duplicates[0].id}`,
          severity: 'error',
          suggestion: 'Each GitHub issue should be linked to only one goal'
        };
      }
    }

    return { valid: true, severity: 'info' };
  }

  /**
   * Validate description quality
   */
  private async validateDescriptionQuality(goal: Goal, context: ValidationContext): Promise<ValidationResult> {
    if (!goal.description || goal.description.trim().length === 0) {
      return {
        valid: true,
        message: 'Goal has no description',
        severity: 'warning',
        suggestion: 'Consider adding a description to clarify the goal requirements'
      };
    }

    const description = goal.description.trim();

    // Check for very short descriptions
    if (description.length < 10) {
      return {
        valid: true,
        message: 'Goal description is very short',
        severity: 'warning',
        suggestion: 'Provide more details about what needs to be accomplished'
      };
    }

    // Check for acceptance criteria
    const hasAcceptanceCriteria = description.toLowerCase().includes('acceptance criteria') ||
                                 description.includes('- [ ]') ||
                                 description.includes('* [ ]') ||
                                 description.includes('1.') ||
                                 description.toLowerCase().includes('should');

    if (!hasAcceptanceCriteria && description.length > 50) {
      return {
        valid: true,
        message: 'Goal description lacks clear acceptance criteria',
        severity: 'info',
        suggestion: 'Consider adding acceptance criteria or a checklist'
      };
    }

    return { valid: true, severity: 'info' };
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
    const errors = results.filter(r => !r.valid && r.severity === 'error');
    const warnings = results.filter(r => r.severity === 'warning');
    const info = results.filter(r => r.severity === 'info');

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      info
    };
  }
}
