/**
 * GitHub Service for Dev Agent
 * Handles all GitHub API operations for syncing issues, milestones, and statuses
 */

import { Octokit } from "@octokit/rest";
import { StorageService } from "./StorageService.js";
import { Goal, GitHubConfig } from "../core/types.js";
import { logger } from "../utils/logger.js";
import { getEnv } from "../utils/env-loader.js";

export interface GitHubIssue {
  number: number;
  title: string;
  body?: string;
  state: "open" | "closed";
  milestone?: {
    id: number;
    title: string;
    state: "open" | "closed";
  };
  labels: Array<{
    name: string;
    color: string;
  }>;
  assignee?: {
    login: string;
  };
  created_at: string;
  updated_at: string;
}

export interface GitHubMilestone {
  id: number;
  title: string;
  description?: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
}

interface GitHubAPIIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  pull_request?: unknown;
  labels: Array<{ name: string }>;
  assignees: Array<{ login: string }>;
  milestone?: { title: string } | null;
}

/**
 * GitHub Service class for API operations
 */
export class GitHubService {
  private octokit: Octokit | null = null;
  private config: GitHubConfig | null = null;
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  /**
   * Initialize GitHub client with configuration
   */
  async initialize(config?: GitHubConfig, token?: string): Promise<void> {
    try {
      // Use configuration passed from WorkflowService (which reads from config.json)
      if (!config?.owner || !config?.repo) {
        throw new Error("GitHub repository configuration not provided. Please check config.json file");
      }

      this.config = {
        owner: config.owner,
        repo: config.repo,
        token: token || getEnv("GITHUB_TOKEN") || config?.token || "",
      };

      // Get token from environment or parameter
      const authToken = token || getEnv("GITHUB_TOKEN") || config?.token;

      if (!authToken) {
        logger.warn(
          "GitHub token not provided. GitHub integration will be limited.",
        );
        return;
      }

      this.octokit = new Octokit({
        auth: authToken,
        userAgent: "dev-agent/2.0.0",
      });

      // Test the connection
      await this.validateConnection();

      logger.info(
        `GitHub service initialized for ${this.config.owner}/${this.config.repo}`,
      );
    } catch (error) {
      logger.error("Failed to initialize GitHub service", error as Error);
      throw error;
    }
  }

  /**
   * Validate GitHub connection and repository access
   */
  private async validateConnection(): Promise<void> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub service not initialized");
    }

    try {
      // Test API access
      const { data: user } = await this.octokit.rest.users.getAuthenticated();
      logger.debug(`Authenticated as GitHub user: ${user.login}`);

      // Test repository access
      const { data: repo } = await this.octokit.rest.repos.get({
        owner: this.config.owner,
        repo: this.config.repo,
      });

      logger.debug(`Repository access confirmed: ${repo.full_name}`);
    } catch (error) {
      throw new Error(
        `GitHub connection validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Fetch all issues from GitHub
   */
  async fetchAllIssues(): Promise<GitHubIssue[]> {
    if (!this.config?.owner || !this.config?.repo) {
      throw new Error("GitHub configuration not found");
    }

    const issues: GitHubIssue[] = [];
    let page = 1;
    const perPage = 100;

    try {
      for (let i = 0; i < 10; i++) { // Limit to 10 pages to prevent infinite loops
        const response = await fetch(
          `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/issues?state=all&page=${page}&per_page=${perPage}`,
          {
            headers: {
              Authorization: `token ${this.config.token}`,
              "User-Agent": "DevAgent/1.0",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Filter out pull requests and map to GitHubIssue interface
        const pageIssues = (data as GitHubAPIIssue[])
          .filter((item) => !item.pull_request)
          .map((item) => ({
            id: item.id,
            number: item.number,
            title: item.title,
            body: item.body || "",
            state: item.state as "open" | "closed",
            created_at: item.created_at,
            updated_at: item.updated_at,
            closed_at: item.closed_at,
            labels: item.labels.map((label) => ({ name: label.name, color: "#000000" })),
            assignees: item.assignees.map((assignee) => ({ login: assignee.login })),
            milestone: item.milestone ? {
              id: 0, // We don't have the actual ID from the API
              title: item.milestone.title,
              state: "open" as const
            } : undefined,
          }));

        issues.push(...pageIssues);

        // If we got fewer issues than perPage, we've reached the end
        if (pageIssues.length < perPage) {
          break;
        }

        page++;
      }

      return issues;
    } catch (error) {
      logger.error("Failed to fetch GitHub issues", error as Error);
      throw error;
    }
  }

  /**
   * Fetch only TODO issues from GitHub repository
   * According to the HARD ALGORITHM: only fetch issues with "Todo" milestone
   */
  async fetchTodoIssues(): Promise<GitHubIssue[]> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub service not initialized");
    }

    try {
      logger.info("Fetching only TODO issues from GitHub (with 'Todo' milestone)...");

      const issues: GitHubIssue[] = [];
      let page = 1;
      const perPage = 100;

      const maxPages = 10; // Prevent infinite loops
      while (page <= maxPages) {
        const { data } = await this.octokit.rest.issues.listForRepo({
          owner: this.config.owner,
          repo: this.config.repo,
          state: "open",
          per_page: perPage,
          page,
          sort: "updated",
          direction: "desc",
        });

        if (data.length === 0) break;

        // Filter out pull requests and only include issues with "Todo" milestone
        const filteredIssues = data
          .filter((issue) => !issue.pull_request)
          .filter((issue) => {
            // Only include issues with "Todo" milestone
            return issue.milestone && 
                   issue.milestone.title.toLowerCase() === "todo" &&
                   issue.milestone.state === "open";
          })
          .map((issue) => ({
            number: issue.number,
            title: issue.title,
            body: issue.body || undefined,
            state: issue.state as "open" | "closed",
            milestone: issue.milestone
              ? {
                  id: issue.milestone.id,
                  title: issue.milestone.title,
                  state: issue.milestone.state as "open" | "closed",
                }
              : undefined,
            labels: issue.labels.map((label) => ({
              name: typeof label === "string" ? label : label.name || "",
              color: typeof label === "string" ? "" : label.color || "",
            })),
            assignee: issue.assignee
              ? {
                  login: issue.assignee.login,
                }
              : undefined,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
          }));

        issues.push(...filteredIssues);

        if (data.length < perPage) break;
        page++;
      }

      logger.success(`Fetched ${issues.length} TODO issues from GitHub (with 'Todo' milestone)`);
      return issues;
    } catch (error) {
      logger.error("Failed to fetch TODO issues from GitHub", error as Error);
      throw error;
    }
  }

  /**
   * Fetch all milestones from GitHub repository
   */
  async fetchMilestones(
    state: "open" | "closed" | "all" = "open",
  ): Promise<GitHubMilestone[]> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub service not initialized");
    }

    try {
      logger.info(`Fetching ${state} milestones from GitHub...`);

      const { data } = await this.octokit.rest.issues.listMilestones({
        owner: this.config.owner,
        repo: this.config.repo,
        state,
        sort: "due_on",
        direction: "desc",
      });

      const milestones = data.map((milestone) => ({
        id: milestone.id,
        title: milestone.title,
        description: milestone.description || undefined,
        state: milestone.state as "open" | "closed",
        created_at: milestone.created_at,
        updated_at: milestone.updated_at,
      }));

      logger.success(`Fetched ${milestones.length} milestones from GitHub`);
      return milestones;
    } catch (error) {
      logger.error("Failed to fetch milestones from GitHub", error as Error);
      throw error;
    }
  }

  /**
   * Update issue milestone
   */
  async updateIssueMilestone(
    issueNumber: number,
    milestoneTitle: string,
  ): Promise<void> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub service not initialized");
    }

    try {
      // First, find the milestone by title
      const milestones = await this.fetchMilestones("all");
      const milestone = milestones.find((m) => m.title === milestoneTitle);

      if (!milestone) {
        throw new Error(`Milestone "${milestoneTitle}" not found`);
      }

      // Update the issue milestone
      await this.octokit.rest.issues.update({
        owner: this.config.owner,
        repo: this.config.repo,
        issue_number: issueNumber,
        milestone: milestone.id,
      });

      logger.success(
        `Updated issue #${issueNumber} milestone to "${milestoneTitle}"`,
      );
    } catch (error) {
      logger.error(
        `Failed to update issue #${issueNumber} milestone`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Update issue state (open/closed)
   */
  async updateIssueState(
    issueNumber: number,
    state: "open" | "closed",
  ): Promise<void> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub service not initialized");
    }

    try {
      await this.octokit.rest.issues.update({
        owner: this.config.owner,
        repo: this.config.repo,
        issue_number: issueNumber,
        state,
      });

      logger.success(`Updated issue #${issueNumber} state to "${state}"`);
    } catch (error) {
      logger.error(
        `Failed to update issue #${issueNumber} state`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Sync GitHub issues to local goals
   * According to the HARD ALGORITHM: only sync issues with "Todo" milestone
   */
  async syncIssuesToGoals(): Promise<{
    created: number;
    updated: number;
    errors: string[];
  }> {
    const result = { created: 0, updated: 0, errors: [] as string[] };

    try {
      logger.info("Starting GitHub issues sync...");

      // HARD ALGORITHM: Only fetch issues with "Todo" milestone
      const issues = await this.fetchTodoIssues();

      for (const issue of issues) {
        try {
          logger.info(`Processing issue #${issue.number}: "${issue.title}"`);
          
          // Check if goal already exists for this issue
          const existingGoal = await this.storage.findGoalByGitHubIssue(
            issue.number,
          );

          if (existingGoal) {
            logger.info(`Found existing goal ${existingGoal.id} for issue #${issue.number}`);
            // Update existing goal
            const shouldUpdate =
              existingGoal.title !== issue.title ||
              existingGoal.description !== issue.body;

            if (shouldUpdate) {
              await this.storage.updateGoal(existingGoal.id, {
                title: issue.title,
                description: issue.body,
                updated_at: new Date().toISOString(),
              });
              result.updated++;
              logger.info(
                `Updated goal ${existingGoal.id} from issue #${issue.number}`,
              );
            } else {
              logger.info(`Goal ${existingGoal.id} is up to date, no update needed`);
            }
          } else {
            logger.info(`No existing goal found for issue #${issue.number}, creating new one...`);
            // Create new goal from issue
            const goalId = this.generateGoalIdFromIssue();

            await this.storage.createGoal({
              id: goalId,
              title: issue.title,
              description: issue.body,
              status: "todo",
              github_issue_id: issue.number,
              branch_name: undefined, // Will be set when work begins
            });

            result.created++;
            logger.info(`Created goal ${goalId} from issue #${issue.number}`);
          }
        } catch (error) {
          const errorMsg = `Failed to sync issue #${issue.number}: ${error instanceof Error ? error.message : "Unknown error"}`;
          result.errors.push(errorMsg);
          logger.error(errorMsg, error as Error);
        }
      }

      logger.success(
        `GitHub sync completed: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors`,
      );
      return result;
    } catch (error) {
      logger.error("Failed to sync GitHub issues", error as Error);
      throw error;
    }
  }

  /**
   * Generate goal ID from GitHub issue
   */
  private generateGoalIdFromIssue(): string {
    // Generate consistent ID based on issue number and timestamp
    const timestamp = Date.now().toString(36);
    const issueHash = Math.abs(this.hashCode(`issue-${Date.now()}`)).toString(36);
    return `g-${timestamp.slice(-3)}${issueHash.slice(0, 3)}`;
  }

  /**
   * Simple hash function for consistent ID generation
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * Map goal status to GitHub issue state
   */
  private mapGoalStatusToGitHubStatus(goalStatus: string): "open" | "closed" {
    switch (goalStatus) {
      case "done":
      case "archived":
        return "closed";
      case "todo":
      case "in_progress":
      default:
        return "open";
    }
  }

  /**
   * Create milestone for goal
   */
  async createMilestoneForGoal(goal: Goal): Promise<void> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub service not configured");
    }

    if (!goal.github_issue_id) {
      logger.warn(`Goal ${goal.id} has no GitHub issue ID, skipping milestone creation`);
      return;
    }

    try {
      // Check if milestone already exists
      const existingMilestones = await this.fetchMilestones("all");
      const milestoneTitle = this.generateMilestoneTitle(goal);
      
      let milestone = existingMilestones.find(m => m.title === milestoneTitle);
      
      if (!milestone) {
        // Create new milestone
        const { data } = await this.octokit.rest.issues.createMilestone({
          owner: this.config.owner,
          repo: this.config.repo,
          title: milestoneTitle,
          description: `Standard milestone for ${milestoneTitle.toLowerCase()} tasks`,
          state: goal.status === "done" ? "closed" : "open",
        });
        
        milestone = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          state: data.state as "open" | "closed",
          created_at: data.created_at,
          updated_at: data.updated_at,
        };
        
        logger.info(`Created milestone "${milestoneTitle}" for goal ${goal.id}`);
      }

      // Assign milestone to the issue
      await this.octokit.rest.issues.update({
        owner: this.config.owner,
        repo: this.config.repo,
        issue_number: goal.github_issue_id,
        milestone: milestone.id,
      });

      logger.info(`Assigned milestone "${milestoneTitle}" to issue #${goal.github_issue_id}`);
    } catch (error) {
      logger.error(`Failed to create/assign milestone for goal ${goal.id}`, error as Error);
      throw error;
    }
  }

  /**
   * Generate milestone title based on goal status
   */
  private generateMilestoneTitle(goal: Goal): string {
    switch (goal.status) {
      case "in_progress":
        return "In Progress";
      case "done":
        return "Done";
      case "archived":
        return "Archived";
      default:
        return "Todo";
    }
  }

  /**
   * Update milestone state based on goal status
   */
  async updateMilestoneState(goal: Goal): Promise<void> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub service not configured");
    }

    if (!goal.github_issue_id) {
      return;
    }

    try {
      const milestones = await this.fetchMilestones("all");
      const milestone = milestones.find(m => m.title.includes(goal.title));

      if (milestone) {
        const newState = goal.status === "done" ? "closed" : "open";
        
        if (milestone.state !== newState) {
          await this.octokit.rest.issues.updateMilestone({
            owner: this.config.owner,
            repo: this.config.repo,
            milestone_number: milestone.id,
            state: newState,
          });
          
          logger.info(`Updated milestone "${milestone.title}" to ${newState} state`);
        }
      }
    } catch (error) {
      logger.error(`Failed to update milestone state for goal ${goal.id}`, error as Error);
      // Don't throw error for milestone updates as they're not critical
    }
  }

  /**
   * Check if pull request is merged and close goal if needed
   */
  async checkPullRequestStatus(goal: Goal): Promise<void> {
    if (!this.octokit || !this.config || !goal.branch_name) {
      return;
    }

    try {
      // Get pull requests for the branch
      const { data: pullRequests } = await this.octokit.rest.pulls.list({
        owner: this.config.owner,
        repo: this.config.repo,
        state: "all",
        head: `${this.config.owner}:${goal.branch_name}`,
      });

      // Check if any PR was merged
      const mergedPR = pullRequests.find(pr => pr.merged_at);
      
      if (mergedPR && goal.status !== "done") {
        logger.info(`Pull request for goal ${goal.id} was merged, marking as done`);
        
        // This will trigger a callback to update the goal status
        // The actual status update should be handled by the calling service
        throw new Error("PULL_REQUEST_MERGED");
      }
    } catch (error) {
      if (error instanceof Error && error.message === "PULL_REQUEST_MERGED") {
        throw error; // Re-throw to be handled by caller
      }
      logger.error(`Failed to check pull request status for goal ${goal.id}`, error as Error);
      // Don't throw error for PR status checks as they're not critical
    }
  }

  /**
   * Sync goal status to GitHub
   */
  async syncGoalStatusToGitHub(goal: Goal): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error("GitHub service not configured");
    }

    if (!this.config?.owner || !this.config?.repo) {
      throw new Error("GitHub configuration incomplete");
    }

    try {
      if (goal.github_issue_id) {
        // Update issue status based on goal status
        const issueStatus = this.mapGoalStatusToGitHubStatus(goal.status);
        
        await this.octokit!.issues.update({
          owner: this.config.owner,
          repo: this.config.repo,
          issue_number: goal.github_issue_id,
          state: issueStatus,
        });

        logger.info(`Updated GitHub issue ${goal.github_issue_id} to ${issueStatus}`);

        // Create/update milestone for the goal
        await this.createMilestoneForGoal(goal);
        
        // Update milestone state if needed
        await this.updateMilestoneState(goal);

        // If goal is completed, add a comment to the issue
        if (goal.status === "done") {
          await this.octokit!.issues.createComment({
            owner: this.config.owner,
            repo: this.config.repo,
            issue_number: goal.github_issue_id,
            body: `✅ **Goal Completed**: This issue has been marked as completed by Dev Agent.\n\n**Goal ID**: ${goal.id}\n**Completed At**: ${new Date().toISOString()}\n\nThe feature branch has been merged and cleaned up.`
          });
          logger.info(`Added completion comment to GitHub issue ${goal.github_issue_id}`);
        }
      }
    } catch (error) {
      logger.error(`Failed to sync goal ${goal.id} to GitHub`, error as Error);
      throw error;
    }
  }

  /**
   * Check if GitHub service is properly configured
   */
  isConfigured(): boolean {
    return this.octokit !== null && this.config !== null;
  }

  /**
   * Get current GitHub configuration
   */
  getConfig(): GitHubConfig | null {
    return this.config;
  }
}
