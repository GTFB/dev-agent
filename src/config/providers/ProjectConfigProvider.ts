#!/usr/bin/env bun

/**
 * Project Configuration Provider
 * Loads configuration from config/.dev-agent.json file
 */

import { readFile } from "fs/promises";
import { join } from "path";
import { ProjectConfig, ConfigurationProvider } from "../types.js";
import { logger } from "../../utils/logger.js";

export class ProjectConfigProvider implements ConfigurationProvider<ProjectConfig> {
  private config: ProjectConfig | null = null;
  private readonly configPath: string;

  constructor() {
    this.configPath = join(process.cwd(), "config", ".dev-agent.json");
  }

  async load(): Promise<ProjectConfig> {
    if (this.config) {
      return this.config;
    }

    try {
      const configContent = await readFile(this.configPath, "utf-8");
      this.config = JSON.parse(configContent) as ProjectConfig;
      
      // Add metadata
      this.config.source = 'project';
      this.config.priority = 100;
      
      logger.info("Project configuration loaded from config/.dev-agent.json");
      return this.config;
    } catch (error) {
      logger.error("Failed to load project configuration", error as Error);
      throw new Error(`Failed to load project configuration from ${this.configPath}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  validate(config: ProjectConfig): boolean {
    try {
      // Basic validation
      if (!config.name || !config.version || !config.description) {
        return false;
      }
      
      if (!config.github?.owner || !config.github?.repo) {
        return false;
      }
      
      if (!config.branches?.main || !config.branches?.develop) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  getPriority(): number {
    return 100;
  }

  getSource(): string {
    return 'project';
  }
}
