/**
 * GitHub Service for Dev Agent
 * Handles all GitHub API operations for syncing issues, milestones, and statuses
 */

import { Octokit } from "@octokit/rest";
import { StorageService } from "./StorageService.js";
import { Goal, GitHubConfig } from "../core/types.js";
import { logger } from "../utils/logger.js";

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
  async initialize(config: GitHubConfig, token?: string): Promise<void> {
    try {
      this.config = config;

      // Get token from environment or parameter
      const authToken = token || process.env.GITHUB_TOKEN || config.token;

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
        `GitHub service initialized for ${config.owner}/${config.repo}`,
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
   * Fetch all issues from GitHub repository
   */
  async fetchIssues(
    state: "open" | "closed" | "all" = "open",
  ): Promise<GitHubIssue[]> {
    if (!this.octokit || !this.config) {
      throw new Error("GitHub service not initialized");
    }

    try {
      logger.info(`Fetching ${state} issues from GitHub...`);

      const issues: GitHubIssue[] = [];
      let page = 1;
      const perPage = 100;

      while (true) {
        const { data } = await this.octokit.rest.issues.listForRepo({
          owner: this.config.owner,
          repo: this.config.repo,
          state,
          per_page: perPage,
          page,
          sort: "updated",
          direction: "desc",
        });

        if (data.length === 0) break;

        // Filter out pull requests (GitHub API returns both issues and PRs)
        const filteredIssues = data
          .filter((issue) => !issue.pull_request)
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

      logger.success(`Fetched ${issues.length} issues from GitHub`);
      return issues;
    } catch (error) {
      logger.error("Failed to fetch issues from GitHub", error as Error);
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

      while (true) {
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

      // According to HARD ALGORITHM: only fetch issues with "Todo" milestone
      const issues = await this.fetchTodoIssues();

      for (const issue of issues) {
        try {
          // Check if goal already exists for this issue
          const existingGoal = await this.storage.findGoalByGitHubIssue(
            issue.number,
          );

          if (existingGoal) {
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
              logger.debug(
                `Updated goal ${existingGoal.id} from issue #${issue.number}`,
              );
            }
          } else {
            // Create new goal from issue
            const goalId = this.generateGoalIdFromIssue(issue);

            await this.storage.createGoal({
              id: goalId,
              title: issue.title,
              description: issue.body,
              status: "todo",
              github_issue_id: issue.number,
            });

            result.created++;
            logger.debug(`Created goal ${goalId} from issue #${issue.number}`);
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
  private generateGoalIdFromIssue(issue: GitHubIssue): string {
    // Use a simple approach for now - we can enhance this later
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let result = "g-";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Sync goal status changes back to GitHub
   */
  async syncGoalStatusToGitHub(goal: Goal): Promise<void> {
    if (!goal.github_issue_id) {
      logger.debug(`Goal ${goal.id} has no GitHub issue associated`);
      return;
    }

    try {
      // Map goal status to GitHub milestone
      const milestoneMap: Record<string, string> = {
        todo: "Todo",
        in_progress: "In Progress",
        done: "Done",
        archived: "Done",
      };

      const milestoneTitle = milestoneMap[goal.status];
      if (milestoneTitle) {
        await this.updateIssueMilestone(goal.github_issue_id, milestoneTitle);
      }

      // Close issue if goal is done or archived
      if (goal.status === "done" || goal.status === "archived") {
        await this.updateIssueState(goal.github_issue_id, "closed");
      } else {
        await this.updateIssueState(goal.github_issue_id, "open");
      }

      logger.success(
        `Synced goal ${goal.id} status to GitHub issue #${goal.github_issue_id}`,
      );
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
