/**
 * Git Service for Dev Agent
 * Manages all Git operations using simple-git
 */

import simpleGit, { SimpleGit, SimpleGitOptions } from "simple-git";
import { logger } from "../utils/logger.js";

/**
 * Git Service class
 */
export class GitService {
  private git: SimpleGit;
  private cwd: string;

  constructor(cwd: string = process.cwd()) {
    this.cwd = cwd;

    const options: SimpleGitOptions = {
      baseDir: cwd,
      binary: "git",
      maxConcurrentProcesses: 1,
    };

    this.git = simpleGit(options);
  }

  /**
   * Check if current directory is a Git repository
   */
  async isGitRepository(): Promise<boolean> {
    try {
      await this.git.checkIsRepo();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current branch name
   */
  async getCurrentBranch(): Promise<string> {
    try {
      const branch = await this.git.branch();
      return branch.current;
    } catch (error) {
      logger.error("Failed to get current branch", error as Error);
      throw error;
    }
  }

  /**
   * Get all branches
   */
  async getBranches(): Promise<string[]> {
    try {
      const branches = await this.git.branch();
      return branches.all;
    } catch (error) {
      logger.error("Failed to get branches", error as Error);
      throw error;
    }
  }

  /**
   * Check if branch exists
   */
  async branchExists(branchName: string): Promise<boolean> {
    try {
      const branches = await this.git.branch();
      return branches.all.includes(branchName);
    } catch (error) {
      logger.error(
        `Failed to check if branch ${branchName} exists`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Create and checkout new branch
   */
  async createBranch(branchName: string): Promise<void> {
    try {
      // First create the branch from current HEAD
      await this.git.branch([branchName]);
      // Then checkout the new branch
      await this.git.checkout(branchName);
      logger.info(`Created and checked out branch: ${branchName}`);
    } catch (error) {
      logger.error(`Failed to create branch ${branchName}`, error as Error);
      throw error;
    }
  }

  /**
   * Checkout existing branch
   */
  async checkoutBranch(branchName: string): Promise<void> {
    try {
      await this.git.checkout(branchName);
      logger.info(`Checked out branch: ${branchName}`);
    } catch (error) {
      logger.error(`Failed to checkout branch ${branchName}`, error as Error);
      throw error;
    }
  }

  /**
   * Pull latest changes from remote
   */
  async pull(
    remote: string = "origin",
    branch: string = "develop",
  ): Promise<void> {
    try {
      await this.git.pull(remote, branch);
      logger.info(`Pulled latest changes from ${remote}/${branch}`);
    } catch (error) {
      logger.error(`Failed to pull from ${remote}/${branch}`, error as Error);
      throw error;
    }
  }

  /**
   * Push branch to remote
   */
  async push(remote: string = "origin", branch?: string): Promise<void> {
    try {
      if (branch) {
        await this.git.push(remote, branch);
        logger.info(`Pushed branch ${branch} to ${remote}`);
      } else {
        await this.git.push();
        logger.info("Pushed current branch to remote");
      }
    } catch (error) {
      logger.error("Failed to push branch", error as Error);
      throw error;
    }
  }

  /**
   * Force push with lease (safer than --force)
   */
  async forcePushWithLease(
    remote: string = "origin",
    branch?: string,
  ): Promise<void> {
    try {
      if (branch) {
        await this.git.push(remote, branch, ["--force-with-lease"]);
        logger.info(`Force pushed branch ${branch} to ${remote} with lease`);
      } else {
        await this.git.push(remote, undefined, ["--force-with-lease"]);
        logger.info("Force pushed current branch with lease");
      }
    } catch (error) {
      logger.error("Failed to force push with lease", error as Error);
      throw error;
    }
  }

  /**
   * Get status of working directory
   */
  async getStatus(): Promise<{
    files: string[];
    ahead: number;
    behind: number;
  }> {
    try {
      const status = await this.git.status();
      return {
        files: status.files.map((f) => f.path),
        ahead: status.ahead,
        behind: status.behind,
      };
    } catch (error) {
      logger.error("Failed to get Git status", error as Error);
      throw error;
    }
  }

  /**
   * Check if working directory is clean
   */
  async isWorkingDirectoryClean(): Promise<boolean> {
    try {
      const status = await this.git.status();
      return status.files.length === 0;
    } catch (error) {
      logger.error("Failed to check working directory status", error as Error);
      throw error;
    }
  }

  /**
   * Add files to staging area
   */
  async add(files: string[]): Promise<void> {
    try {
      await this.git.add(files);
      logger.info(`Added files to staging: ${files.join(", ")}`);
    } catch (error) {
      logger.error("Failed to add files to staging", error as Error);
      throw error;
    }
  }

  /**
   * Commit staged changes
   */
  async commit(message: string): Promise<void> {
    try {
      await this.git.commit(message);
      logger.info(`Committed changes: ${message}`);
    } catch (error) {
      logger.error("Failed to commit changes", error as Error);
      throw error;
    }
  }

  /**
   * Get commit history
   */
  async getCommitHistory(branch?: string, limit: number = 10): Promise<Array<{ hash: string; message: string; author: string; date: string }>> {
    try {
      const options = ["--oneline", `-${limit}`];
      if (branch) {
        options.unshift(branch);
      }

      const log = await this.git.log(options);
      return log.all;
    } catch (error) {
      logger.error("Failed to get commit history", error as Error);
      throw error;
    }
  }

  /**
   * Get latest commit hash
   */
  async getLatestCommitHash(): Promise<string> {
    try {
      const log = await this.git.log(["-1", "--format=%H"]);
      return log.latest?.hash || "";
    } catch (error) {
      logger.error("Failed to get latest commit hash", error as Error);
      throw error;
    }
  }

  /**
   * Get latest commit message
   */
  async getLatestCommitMessage(): Promise<string> {
    try {
      const log = await this.git.log(["-1", "--format=%s"]);
      return log.latest?.message || "";
    } catch (error) {
      logger.error("Failed to get latest commit message", error as Error);
      throw error;
    }
  }

  /**
   * Create tag
   */
  async createTag(tagName: string, message?: string): Promise<void> {
    try {
      if (message) {
        await this.git.addAnnotatedTag(tagName, message);
        logger.info(`Created annotated tag: ${tagName} - ${message}`);
      } else {
        await this.git.addTag(tagName);
        logger.info(`Created lightweight tag: ${tagName}`);
      }
    } catch (error) {
      logger.error(`Failed to create tag ${tagName}`, error as Error);
      throw error;
    }
  }

  /**
   * Push tags to remote
   */
  async pushTags(remote: string = "origin"): Promise<void> {
    try {
      await this.git.pushTags(remote);
      logger.info(`Pushed tags to ${remote}`);
    } catch (error) {
      logger.error("Failed to push tags", error as Error);
      throw error;
    }
  }

  /**
   * Merge branch into current branch
   */
  async merge(branchName: string, options: string[] = []): Promise<void> {
    try {
      await this.git.merge(options, branchName);
      logger.info(`Merged branch ${branchName} into current branch`);
    } catch (error) {
      logger.error(`Failed to merge branch ${branchName}`, error as Error);
      throw error;
    }
  }

  /**
   * Delete branch
   */
  async deleteBranch(
    branchName: string,
    force: boolean = false,
  ): Promise<void> {
    try {
      if (force) {
        await this.git.deleteLocalBranch(branchName, true);
        logger.info(`Force deleted local branch: ${branchName}`);
      } else {
        await this.git.deleteLocalBranch(branchName);
        logger.info(`Deleted local branch: ${branchName}`);
      }
    } catch (error) {
      logger.error(`Failed to delete branch ${branchName}`, error as Error);
      throw error;
    }
  }

  /**
   * Delete remote branch
   */
  async deleteRemoteBranch(remote: string, branchName: string): Promise<void> {
    try {
      await this.git.push(remote, `:${branchName}`);
      logger.info(`Deleted remote branch: ${remote}/${branchName}`);
    } catch (error) {
      logger.error(`Failed to delete remote branch ${remote}/${branchName}`, error as Error);
      throw error;
    }
  }

  /**
   * Get remote URL
   */
  async getRemoteUrl(remote: string = "origin"): Promise<string> {
    try {
      const remotes = await this.git.getRemotes(true);
      const origin = remotes.find((r) => r.name === remote);
      return origin?.refs?.push || "";
    } catch (error) {
      logger.error(`Failed to get remote URL for ${remote}`, error as Error);
      throw error;
    }
  }

  /**
   * Get working directory path
   */
  getWorkingDirectory(): string {
    return this.cwd;
  }
}
