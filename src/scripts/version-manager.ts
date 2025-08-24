#!/usr/bin/env bun

/**
 * Version Manager for Dev Agent
 * Automates version updates across all project files
 */

import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { execSync } from "child_process";
import { logger } from "../utils/logger.js";

interface VersionInfo {
  current: string;
  next: string;
  type: 'major' | 'minor' | 'patch';
}

interface PreReleaseInfo {
  type: 'alpha' | 'beta' | 'rc';
  number: number;
}



class VersionManager {
  private readonly projectRoot: string;
  private readonly configPath: string;
  private readonly readmePath: string;
  private readonly changelogPath: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.configPath = join(this.projectRoot, "config.json");
    this.readmePath = join(this.projectRoot, "README.md");
    this.changelogPath = join(this.projectRoot, "docs", "CHANGELOG.md");
  }

  /**
   * Parse semantic version and determine next version
   */
  private parseVersion(version: string): VersionInfo {
    const [major, minor, patch] = version.split('.').map(Number);
    const current = `${major}.${minor}.${patch}`;
    
    return {
      current,
      next: `${major}.${minor}.${patch + 1}`,
      type: 'patch'
    };
  }

  /**
   * Parse pre-release version
   */
  private parsePreRelease(version: string): PreReleaseInfo | null {
    const match = version.match(/(\d+\.\d+\.\d+)-(\w+)\.(\d+)/);
    if (!match) return null;
    
    return {
      type: match[2] as 'alpha' | 'beta' | 'rc',
      number: parseInt(match[3])
    };
  }

  /**
   * Calculate next version by type
   */
  private calculateNextVersion(version: string, type: 'major' | 'minor' | 'patch'): string {
    const [major, minor, patch] = version.split('.').map(Number);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
        return `${major}.${minor}.${patch + 1}`;
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  /**
   * Create pre-release version
   */
  private createPreReleaseVersion(baseVersion: string, preReleaseType: 'alpha' | 'beta' | 'rc'): string {
    const preRelease = this.parsePreRelease(baseVersion);
    
    if (preRelease && preRelease.type === preReleaseType) {
      // Increment existing pre-release
      return `${baseVersion.split('-')[0]}-${preReleaseType}.${preRelease.number + 1}`;
    } else {
      // Create new pre-release
      return `${baseVersion}-${preReleaseType}.1`;
    }
  }

  /**
   * Update version in config.json
   */
  private async updateConfigVersion(newVersion: string): Promise<void> {
    try {
      const configContent = await readFile(this.configPath, "utf-8");
      const config = JSON.parse(configContent);
      
      config.version = newVersion;
      config.last_updated = new Date().toISOString();
      
      await writeFile(this.configPath, JSON.stringify(config, null, 2));
      logger.info(`✅ Updated version in config.json to ${newVersion}`);
    } catch (error) {
      logger.error("Failed to update config version:", error as Error);
      throw error;
    }
  }

  /**
   * Update version in README.md
   */
  private async updateReadmeVersion(newVersion: string): Promise<void> {
    try {
      const readmeContent = await readFile(this.readmePath, "utf-8");
      
      // Update version badge
      const updatedContent = readmeContent
        .replace(
          /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-\d+\.\d+\.\d+/g,
          `![Version](https://img.shields.io/badge/version-${newVersion}`
        )
        .replace(
          /version-\d+\.\d+\.\d+/g,
          `version-${newVersion}`
        );
      
      await writeFile(this.readmePath, updatedContent);
      logger.info(`✅ Updated version in README.md to ${newVersion}`);
    } catch (error) {
      logger.error("Failed to update README version:", error as Error);
      throw error;
    }
  }

  /**
   * Update or create CHANGELOG.md
   */
  private async updateChangelog(newVersion: string, type: 'major' | 'minor' | 'patch', isPreRelease: boolean = false): Promise<void> {
    try {
      let changelogContent = "";
      
      if (existsSync(this.changelogPath)) {
        changelogContent = await readFile(this.changelogPath, "utf-8");
      }

      const today = new Date().toISOString().split('T')[0];
      const versionHeader = `## [${newVersion}] - ${today}`;
      
      let releaseNotes = "";
      if (isPreRelease) {
        const preReleaseType = newVersion.includes('alpha') ? 'alpha' : 
                              newVersion.includes('beta') ? 'beta' : 'rc';
        releaseNotes = `
### 🧪 Pre-Release (${preReleaseType.toUpperCase()})
- This is a pre-release version for testing
- Features may be incomplete or unstable
- Please report any issues found

### 🔧 Improvements
- Pre-release testing and validation
- Bug fixes and stability improvements
`;
      } else {
        switch (type) {
          case 'major':
            releaseNotes = `
### 🚀 Major Changes
- Breaking changes and major new features

### 🔧 Improvements
- Performance improvements and optimizations

### 🐛 Bug Fixes
- Bug fixes and stability improvements
`;
            break;
          case 'minor':
            releaseNotes = `
### ✨ New Features
- New functionality and capabilities

### 🔧 Improvements
- Performance improvements and optimizations

### 🐛 Bug Fixes
- Bug fixes and stability improvements
`;
            break;
          case 'patch':
            releaseNotes = `
### 🐛 Bug Fixes
- Bug fixes and stability improvements

### 🔧 Improvements
- Minor improvements and optimizations
`;
            break;
        }
      }

      const newChangelog = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

${versionHeader}${releaseNotes}

${changelogContent}`;

      await writeFile(this.changelogPath, newChangelog);
      logger.info(`✅ Updated CHANGELOG.md with version ${newVersion}`);
    } catch (error) {
      logger.error("Failed to update CHANGELOG:", error as Error);
      throw error;
    }
  }

  /**
   * Update version in database (if exists)
   */
  private async updateDatabaseVersion(newVersion: string): Promise<void> {
    try {
      // This would update the version in the database
      // For now, we'll just log it
      logger.info(`ℹ️  Database version should be updated to ${newVersion} (requires database connection)`);
    } catch (error) {
      logger.warn("Could not update database version:", error as Error);
    }
  }

  /**
   * Create release branch
   */
  private async createReleaseBranch(newVersion: string): Promise<void> {
    try {
      const branchName = `release/v${newVersion}`;
      
      // Check if we're on develop branch
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (currentBranch !== 'develop') {
        logger.warn(`⚠️  Current branch is ${currentBranch}, should be on 'develop' for release`);
        logger.info(`Please checkout develop branch first: git checkout develop`);
        return;
      }

      // Create and checkout release branch
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
      logger.info(`✅ Created and checked out release branch: ${branchName}`);
      
      // Stage all version changes
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "chore: prepare release v${newVersion}"`, { stdio: 'inherit' });
      logger.info(`✅ Committed version changes for v${newVersion}`);
      
    } catch (error) {
      logger.error("Failed to create release branch:", error as Error);
      throw error;
    }
  }

  /**
   * Main method to bump version
   */
  async bumpVersion(type: 'major' | 'minor' | 'patch' = 'patch'): Promise<void> {
    try {
      logger.info(`🚀 Starting version bump to ${type}...`);
      
      // Read current version from config
      const configContent = await readFile(this.configPath, "utf-8");
      const config = JSON.parse(configContent);
      const currentVersion = config.version;
      
      // Calculate new version
      const newVersion = this.calculateNextVersion(currentVersion, type);
      
      logger.info(`📈 Bumping version from ${currentVersion} to ${newVersion}`);
      
      // Update all files
      await this.updateConfigVersion(newVersion);
      await this.updateReadmeVersion(newVersion);
      await this.updateChangelog(newVersion, type);
      await this.updateDatabaseVersion(newVersion);
      
      // Create release branch
      await this.createReleaseBranch(newVersion);
      
      logger.info(`🎉 Version ${newVersion} prepared successfully!`);
      logger.info(`📝 Next steps:`);
      logger.info(`   1. Review changes in release branch`);
      logger.info(`   2. Create Pull Request to main`);
      logger.info(`   3. Merge and create tag v${newVersion}`);
      
    } catch (error) {
      logger.error("Version bump failed:", error as Error);
      throw error;
    }
  }

  /**
   * Create pre-release version
   */
  async createPreRelease(type: 'alpha' | 'beta' | 'rc'): Promise<void> {
    try {
      logger.info(`🧪 Creating ${type} pre-release...`);
      
      // Read current version from config
      const configContent = await readFile(this.configPath, "utf-8");
      const config = JSON.parse(configContent);
      const currentVersion = config.version;
      
      // Create pre-release version
      const newVersion = this.createPreReleaseVersion(currentVersion, type);
      
      logger.info(`📈 Creating ${type} pre-release: ${currentVersion} → ${newVersion}`);
      
      // Update all files
      await this.updateConfigVersion(newVersion);
      await this.updateReadmeVersion(newVersion);
      await this.updateChangelog(newVersion, 'patch', true);
      await this.updateDatabaseVersion(newVersion);
      
      // Create pre-release branch
      const branchName = `pre-release/${type}-v${newVersion}`;
      execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
      logger.info(`✅ Created and checked out pre-release branch: ${branchName}`);
      
      // Stage all version changes
      execSync('git add .', { stdio: 'inherit' });
      execSync(`git commit -m "chore: prepare ${type} pre-release v${newVersion}"`, { stdio: 'inherit' });
      logger.info(`✅ Committed pre-release changes for v${newVersion}`);
      
      logger.info(`🎉 ${type.toUpperCase()} pre-release ${newVersion} prepared successfully!`);
      logger.info(`📝 Next steps:`);
      logger.info(`   1. Test the pre-release thoroughly`);
      logger.info(`   2. Push branch: git push origin ${branchName}`);
      logger.info(`   3. Create Pull Request for testing`);
      
          } catch (error) {
        logger.error("Pre-release creation failed:", error as Error);
        // Re-throw for proper error handling
        throw error;
      }
  }

  /**
   * Show current version info
   */
  async showVersionInfo(): Promise<void> {
    try {
      const configContent = await readFile(this.configPath, "utf-8");
      const config = JSON.parse(configContent);
      
      logger.info(`📋 Version Information:`);
      logger.info(`   Current Version: ${config.version}`);
      logger.info(`   Project: ${config.name}`);
      logger.info(`   Last Updated: ${config.last_updated || 'Not specified'}`);
      
      // Check if it's a pre-release
      const preRelease = this.parsePreRelease(config.version);
      if (preRelease) {
        logger.info(`   Pre-Release: ${preRelease.type.toUpperCase()} ${preRelease.number}`);
        logger.info(`   ⚠️  This is a pre-release version for testing`);
      }
      
      // Show git status
      try {
        const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
        if (gitStatus.trim()) {
          logger.info(`   Git Status: Has uncommitted changes`);
        } else {
          logger.info(`   Git Status: Clean working directory`);
        }
      } catch {
        logger.warn("Could not check git status");
      }
      
    } catch (error) {
      logger.error("Failed to show version info:", error as Error);
      // Log error for debugging
    }
  }
}

// CLI interface
async function main() {
  const versionManager = new VersionManager();
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    await versionManager.showVersionInfo();
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'bump': {
      const type = args[1] as 'major' | 'minor' | 'patch' || 'patch';
      await versionManager.bumpVersion(type);
      break;
    }
      
    case 'pre-release': {
      const preReleaseType = args[1] as 'alpha' | 'beta' | 'rc';
      if (!preReleaseType) {
        logger.error("Pre-release type required: alpha, beta, or rc");
        process.exit(1);
      }
      await versionManager.createPreRelease(preReleaseType);
      break;
    }
      
    case 'info':
      await versionManager.showVersionInfo();
      break;
      
    case 'help':
      console.log(`
Version Manager for Dev Agent

Usage:
  bun run src/scripts/version-manager.ts [command] [options]

Commands:
  bump [type]           Bump version (major|minor|patch, default: patch)
  pre-release [type]    Create pre-release (alpha|beta|rc)
  info                  Show current version information
  help                  Show this help message

Examples:
  bun run src/scripts/version-manager.ts bump patch
  bun run src/scripts/version-manager.ts bump minor
  bun run src/scripts/version-manager.ts bump major
  bun run src/scripts/version-manager.ts pre-release alpha
  bun run src/scripts/version-manager.ts pre-release beta
  bun run src/scripts/version-manager.ts pre-release rc
  bun run src/scripts/version-manager.ts info
`);
      break;
      
    default:
      logger.error(`Unknown command: ${command}`);
      logger.info("Use 'help' command to see available options");
      process.exit(1);
  }
}

// Run if executed directly
if (import.meta.main) {
  main().catch(error => {
    logger.error("Script failed:", error);
    process.exit(1);
  });
}

export { VersionManager };
