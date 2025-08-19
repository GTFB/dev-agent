/**
 * Core types for Dev Agent system
 * All types follow the AID (Atomic ID) system with typed prefixes
 */

/**
 * Goal status enumeration
 */
export type GoalStatus = 'todo' | 'in_progress' | 'done' | 'archived';

/**
 * Goal entity with AID prefix 'g-' for Goals
 */
export interface Goal {
  /** Unique AID identifier with 'g-' prefix */
  id: string;
  /** Associated GitHub Issue number (optional) */
  github_issue_id?: number;
  /** Goal title */
  title: string;
  /** Current goal status */
  status: GoalStatus;
  /** Associated Git branch name */
  branch_name?: string;
  /** Goal description (can be GitHub Issue body) */
  description?: string;
  /** Creation timestamp in ISO 8601 format */
  created_at: string;
  updated_at: string;
  /** Completion timestamp */
  completed_at?: string;
}

/**
 * Project configuration entity
 */
export interface ProjectConfig {
  /** Configuration key */
  key: string;
  /** Configuration value */
  value: string;
}

/**
 * Database migration record
 */
export interface SchemaMigration {
  /** Migration version */
  version: string;
  /** When migration was applied */
  applied_at: string;
}

/**
 * GitHub repository configuration
 */
export interface GitHubConfig {
  /** Repository owner (organization or username) */
  owner: string;
  /** Repository name */
  repo: string;
  /** GitHub API token (from environment) */
  token?: string;
}

/**
 * Project configuration structure
 */
export interface DevAgentConfig {
  /** GitHub repository settings */
  github: GitHubConfig;
  /** Branch naming conventions */
  branches: {
    /** Main production branch */
    main: string;
    /** Development integration branch */
    develop: string;
    /** Feature branch prefix */
    feature_prefix: string;
    /** Release branch prefix */
    release_prefix: string;
  };
  /** Goal management settings */
  goals: {
    /** Default goal status for new goals */
    default_status: GoalStatus;
    /** Goal ID format validation regex */
    id_pattern: string;
  };
}

/**
 * CLI command result
 */
export interface CommandResult {
  /** Success status */
  success: boolean;
  /** Result message */
  message: string;
  /** Error details if failed */
  error?: string;
  /** Additional data */
  data?: any;
}

/**
 * Workflow execution context
 */
export interface WorkflowContext {
  /** Current working directory */
  cwd: string;
  /** Project configuration */
  config: DevAgentConfig;
  /** Current Git branch */
  currentBranch?: string;
  /** Current goal if any */
  currentGoal?: Goal;
}

/**
 * AID Generator metadata
 */
export interface AIDMetadata {
  /** Entity type prefix */
  prefix: string;
  /** Entity title/name */
  title: string;
  /** Entity type */
  type: string;
  /** Current status */
  status: string;
}
