#!/usr/bin/env bun

/**
 * Project Configuration Provider
 * Loads configuration from config/.dev-agent.json file
 */

import { join } from "path";
import { logger } from "../../utils/logger.js";
import { ProjectConfig } from "../types.js";
import { ConfigValidator } from "../validators/ConfigValidator.js";

/**
 * Loads configuration from config.json file
 */
export class ProjectConfigProvider {
  private configPath: string;

  constructor() {
    this.configPath = join(process.cwd(), "config.json");
  }

  async load(): Promise<ProjectConfig | null> {
    try {
      // Check if config file exists
      if (!await Bun.file(this.configPath).exists()) {
        logger.warn("Config file not found, using defaults");
        return null;
      }

      // Read and parse config file
      const configContent = await Bun.file(this.configPath).text();
      const config = JSON.parse(configContent);

      // Validate configuration with ZOD
      const validation = ConfigValidator.validate(config);
      if (!validation.success) {
        logger.error("❌ Configuration validation failed:");
        logger.error(ConfigValidator.formatErrors(validation.errors));
        throw new Error("Invalid configuration file");
      }

      // Convert validated config to ProjectConfig
      const projectConfig: ProjectConfig = {
        source: 'project',
        priority: 100,
        github: {
          owner: validation.data.github.owner,
          repo: validation.data.github.repo
        },
        branches: {
          main: validation.data.branches.main,
          develop: validation.data.branches.develop,
          feature_prefix: validation.data.branches.feature_prefix,
          release_prefix: validation.data.branches.release_prefix
        },
        goals: {
          default_status: validation.data.goals.default_status,
          id_pattern: validation.data.goals.id_pattern
        },
        workflow: {
          auto_sync: validation.data.workflow.auto_sync,
          sync_interval: validation.data.workflow.sync_interval
        },
        validation: {
          strict_language: validation.data.validation.strict_language,
          auto_translate: validation.data.validation.auto_translate
        },
        storage: {
          database: {
            path: validation.data.storage.database.path
          },
          config: {
            path: validation.data.storage.config.path
          },
          logs: {
            path: validation.data.storage.logs.path
          }
        }
      };

      logger.info("Project configuration loaded from config.json");
      return projectConfig;

    } catch (error) {
      logger.error("Failed to load project configuration", error as Error);
      return null;
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
