/**
 * Core types for Dev Agent system
 * 
 * All types follow the AID (Atomic ID) system with typed prefixes for
 * consistent identification across the system. Each entity type has a
 * specific prefix and status management.
 * 
 * @packageDocumentation
 */

/**
 * Goal status enumeration
 */
export type GoalStatus = "todo" | "in_progress" | "done" | "archived";

/**
 * Document status enumeration
 */
export type DocumentStatus = "draft" | "review" | "approved" | "archived";

/**
 * File status enumeration
 */
export type FileStatus = "active" | "deprecated" | "archived";

/**
 * API endpoint status enumeration
 */
export type ApiEndpointStatus = "active" | "deprecated" | "planned";

/**
 * Script status enumeration
 */
export type ScriptStatus = "active" | "deprecated" | "testing";

/**
 * Prompt status enumeration
 */
export type PromptStatus = "active" | "testing" | "archived";

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
 * Project document entity with AID prefix 'd-' for Documents
 */
export interface ProjectDocument {
  /** Unique AID identifier with 'd-' prefix */
  id: string;
  /** Document title */
  title: string;
  /** Document type (architecture, api, deployment, user-guide, etc.) */
  type: string;
  /** Document content (markdown, text, or structured data) */
  content: string;
  /** File path relative to project root (optional) */
  file_path?: string;
  /** Document status */
  status: DocumentStatus;
  /** Associated goal ID (optional) */
  goal_id?: string;
  /** Document tags for categorization */
  tags?: string[];
  /** Creation timestamp */
  created_at: string;
  updated_at: string;
  /** Version number for document history */
  version: number;
}

/**
 * Project file entity with AID prefix 'f-' for Files
 */
export interface ProjectFile {
  /** Unique AID identifier with 'f-' prefix */
  id: string;
  /** File name */
  name: string;
  /** File path relative to project root */
  file_path: string;
  /** File type (source, config, asset, script, etc.) */
  file_type: string;
  /** File extension */
  extension?: string;
  /** File size in bytes */
  size_bytes?: number;
  /** File hash for change detection */
  file_hash?: string;
  /** Associated goal ID (optional) */
  goal_id?: string;
  /** File status */
  status: FileStatus;
  /** Creation timestamp */
  created_at: string;
  updated_at: string;
}

/**
 * Project API endpoint entity with AID prefix 'a-' for API
 */
export interface ProjectApiEndpoint {
  /** Unique AID identifier with 'a-' prefix */
  id: string;
  /** HTTP method (GET, POST, PUT, DELETE, etc.) */
  method: string;
  /** API endpoint path */
  path: string;
  /** Endpoint title/name */
  title: string;
  /** Endpoint description */
  description?: string;
  /** Request parameters (JSON schema) */
  request_params?: string;
  /** Response schema (JSON schema) */
  response_schema?: string;
  /** Associated goal ID (optional) */
  goal_id?: string;
  /** API version */
  api_version: string;
  /** Endpoint status */
  status: ApiEndpointStatus;
  /** Creation timestamp */
  created_at: string;
  updated_at: string;
}

/**
 * Project script entity with AID prefix 's-' for Scripts
 */
export interface ProjectScript {
  /** Unique AID identifier with 's-' prefix */
  id: string;
  /** Script name */
  name: string;
  /** Script description */
  description?: string;
  /** Script type (build, deploy, test, utility, etc.) */
  script_type: string;
  /** Script content or file path */
  content?: string;
  /** Script language (bash, python, node, etc.) */
  language?: string;
  /** Execution command */
  command?: string;
  /** Associated goal ID (optional) */
  goal_id?: string;
  /** Script status */
  status: ScriptStatus;
  /** Creation timestamp */
  created_at: string;
  updated_at: string;
}

/**
 * Project prompt entity with AID prefix 'p-' for Prompts
 */
export interface ProjectPrompt {
  /** Unique AID identifier with 'p-' prefix */
  id: string;
  /** Prompt name/title */
  name: string;
  /** Prompt description */
  description?: string;
  /** Prompt category (code-review, testing, documentation, etc.) */
  category: string;
  /** Prompt template content */
  template: string;
  /** Prompt variables (JSON schema) */
  variables?: string;
  /** Associated goal ID (optional) */
  goal_id?: string;
  /** Prompt status */
  status: PromptStatus;
  /** Creation timestamp */
  created_at: string;
  updated_at: string;
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
  data?: unknown;
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
