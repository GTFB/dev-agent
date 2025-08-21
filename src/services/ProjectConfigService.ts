#!/usr/bin/env bun

/**
 * Project Configuration Service
 * Reads project rules and configuration from config.json file
 * This follows the "Protocol as Code" principle
 */

import { readFile } from "fs/promises";
import { join } from "path";
import { logger } from "../utils/logger.js";

export interface ProjectConfig {
  name: string;
  version: string;
  description: string;
  
  github: {
    owner: string;
    repo: string;
    description: string;
  };
  
  branches: {
    main: string;
    develop: string;
    feature_prefix: string;
    release_prefix: string;
    description: string;
  };
  
  goals: {
    default_status: string;
    id_pattern: string;
    description: string;
  };
  
  workflow: {
    auto_sync: boolean;
    sync_interval: number;
    description: string;
  };
  
  validation: {
    strict_language: boolean;
    auto_translate: boolean;
    description: string;
  };
  
  metadata: {
    created: string;
    last_updated: string;
    schema_version: string;
    description: string;
  };
}

/**
 * Project Configuration Service class
 */
export class ProjectConfigService {
  private config: ProjectConfig | null = null;
  private configPath: string;

  constructor() {
    this.configPath = join(process.cwd(), "config.json");
  }

  /**
   * Load project configuration from config.json
   */
  async loadConfig(): Promise<ProjectConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const configContent = await readFile(this.configPath, "utf-8");
      this.config = JSON.parse(configContent) as ProjectConfig;
      
      logger.info("Project configuration loaded from config.json");
      return this.config;
    } catch (error) {
      logger.error("Failed to load project configuration", error as Error);
      throw new Error(`Failed to load project configuration from ${this.configPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get GitHub configuration
   */
  async getGitHubConfig(): Promise<{ owner: string; repo: string }> {
    const config = await this.loadConfig();
    return {
      owner: config.github.owner,
      repo: config.github.repo,
    };
  }

  /**
   * Get branch configuration
   */
  async getBranchConfig(): Promise<{
    main: string;
    develop: string;
    feature_prefix: string;
    release_prefix: string;
  }> {
    const config = await this.loadConfig();
    return {
      main: config.branches.main,
      develop: config.branches.develop,
      feature_prefix: config.branches.feature_prefix,
      release_prefix: config.branches.release_prefix,
    };
  }

  /**
   * Get goals configuration
   */
  async getGoalsConfig(): Promise<{
    default_status: string;
    id_pattern: string;
  }> {
    const config = await this.loadConfig();
    return {
      default_status: config.goals.default_status,
      id_pattern: config.goals.id_pattern,
    };
  }

  /**
   * Get workflow configuration
   */
  async getWorkflowConfig(): Promise<{
    auto_sync: boolean;
    sync_interval: number;
  }> {
    const config = await this.loadConfig();
    return {
      auto_sync: config.workflow.auto_sync,
      sync_interval: config.workflow.sync_interval,
    };
  }

  /**
   * Get validation configuration
   */
  async getValidationConfig(): Promise<{
    strict_language: boolean;
    auto_translate: boolean;
  }> {
    const config = await this.loadConfig();
    return {
      strict_language: config.validation.strict_language,
      auto_translate: config.validation.auto_translate,
    };
  }

  /**
   * Get full project configuration
   */
  async getFullConfig(): Promise<ProjectConfig> {
    return await this.loadConfig();
  }

  /**
   * Check if configuration is loaded
   */
  isLoaded(): boolean {
    return this.config !== null;
  }

  /**
   * Get configuration file path
   */
  getConfigPath(): string {
    return this.configPath;
  }
}
