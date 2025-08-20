#!/usr/bin/env bun

/**
 * Project Structure Validator
 * Ensures that files are in correct directories according to project organization
 */

import { existsSync } from "fs";
import { join } from "path";
import { logger } from "../utils/logger.js";

interface StructureRule {
  path: string;
  description: string;
  required: boolean;
  forbidden?: boolean;
}

const PROJECT_STRUCTURE_RULES: StructureRule[] = [
  // Configuration files should be in config/
  {
    path: "config/.dev-agent.json",
    description: "Project configuration file",
    required: true
  },
  {
    path: "config/.env",
    description: "Environment variables (optional)",
    required: false
  },

  // Database files should be in data/
  {
    path: "data/.dev-agent.db",
    description: "Main database file",
    required: false
  },
  {
    path: "data/backups",
    description: "Backup files directory",
    required: false
  },
  {
    path: "data/temp",
    description: "Temporary files directory",
    required: false
  },

  // Source code should be in src/
  {
    path: "src",
    description: "Source code directory",
    required: true
  },

  // TypeScript configuration should be in root
  {
    path: "tsconfig.json",
    description: "TypeScript configuration",
    required: true
  },

  // Forbidden files in root
  {
    path: "dev-agent.db",
    description: "Database file in root (FORBIDDEN)",
    required: false,
    forbidden: true
  },
  {
    path: ".dev-agent.db",
    description: "Database file in root (FORBIDDEN)",
    required: false,
    forbidden: true
  },
  {
    path: ".dev-agent.json",
    description: "Config file in root (FORBIDDEN)",
    required: false,
    forbidden: true
  },
  {
    path: ".env",
    description: "Environment file in root (FORBIDDEN)",
    required: false,
    forbidden: true
  }
];

export function validateProjectStructure(): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const rootDir = process.cwd();

  logger.info("🔍 Validating project structure...");

  for (const rule of PROJECT_STRUCTURE_RULES) {
    const fullPath = join(rootDir, rule.path);
    const exists = existsSync(fullPath);

    if (rule.forbidden && exists) {
      errors.push(`❌ ${rule.description}: ${rule.path} should not exist in root directory`);
    } else if (rule.required && !exists) {
      errors.push(`❌ ${rule.description}: ${rule.path} is required but not found`);
    } else if (!rule.required && !rule.forbidden && exists) {
      logger.info(`✅ ${rule.description}: ${rule.path}`);
    } else if (!rule.required && !rule.forbidden && !exists) {
      warnings.push(`⚠️  ${rule.description}: ${rule.path} not found (optional)`);
    }
  }

  // Check for any database files in root
  const forbiddenDbFiles = [
    "dev-agent.db",
    ".dev-agent.db",
    "dev-agent.db-wal",
    ".dev-agent.db-wal",
    "dev-agent.db-shm",
    ".dev-agent.db-shm"
  ];

  for (const file of forbiddenDbFiles) {
    const fullPath = join(rootDir, file);
    if (existsSync(fullPath)) {
      errors.push(`❌ Database file in root directory: ${file} (should be in data/)`);
    }
  }

  // Check for logs directory (should be created automatically, not in repo)
  const logsPath = join(rootDir, "logs");
  if (existsSync(logsPath)) {
    logger.info("ℹ️  Logs directory exists (will be created automatically)");
  }

  const isValid = errors.length === 0;

  if (isValid) {
    logger.info("🎉 Project structure is valid!");
  } else {
    logger.error("❌ Project structure validation failed!");
    errors.forEach(error => logger.error(error));
  }

  if (warnings.length > 0) {
    logger.warn("⚠️  Warnings:");
    warnings.forEach(warning => logger.warn(warning));
  }

  return { isValid, errors, warnings };
}

// Run validation if this file is executed directly
if (import.meta.main) {
  const result = validateProjectStructure();
  
  if (result.isValid) {
    logger.info("✨ Structure validation completed successfully");
    process.exit(0);
  } else {
    logger.error("💥 Structure validation failed");
    process.exit(1);
  }
}


