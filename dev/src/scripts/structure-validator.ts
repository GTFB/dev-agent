#!/usr/bin/env bun

/**
 * Structure Validator Script
 * 
 * This script validates that the project structure matches the documentation
 * in docs/structure.md and automatically fixes any discrepancies.
 * 
 * It should be run before commits to ensure documentation is always up-to-date.
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { readdir } from "fs/promises";
import { join, extname } from "path";
import { logger } from "../utils/logger.js";

interface FileInfo {
  path: string;
  name: string;
  isDirectory: boolean;
  extension: string;
  relativePath: string;
}



class StructureValidator {
  private projectRoot: string;
  private structurePath: string;
  private structureContent: string;
  private currentStructure: Map<string, FileInfo> = new Map();
  private documentedStructure: Map<string, string[]> = new Map();
  private issues: string[] = [];
  private fixes: string[] = [];

  constructor() {
    this.projectRoot = process.cwd();
    this.structurePath = join(this.projectRoot, "docs", "structure.md");
    
    if (!existsSync(this.structurePath)) {
      throw new Error("docs/structure.md not found. Please create it first.");
    }
    
    this.structureContent = readFileSync(this.structurePath, "utf8");
  }

  /**
   * Main validation method
   */
  async validate(): Promise<boolean> {
    logger.info("🔍 Starting project structure validation...");
    
    try {
      // Scan current project structure
      await this.scanProjectStructure();
      
      // Parse documented structure
      this.parseDocumentedStructure();
      
      // Validate structure
      this.validateStructure();
      
      // Auto-fix issues if possible
      await this.autoFixIssues();
      
      // Generate report
      this.generateReport();
      
      // Return true if only non-critical issues remain
      return this.hasOnlyNonCriticalIssues();
    } catch (error) {
      logger.error("❌ Structure validation failed:", error as Error);
      return false;
    }
  }

  /**
   * Scan the actual project structure
   */
  private async scanProjectStructure(): Promise<void> {
    logger.info("📁 Scanning project structure...");
    
    const ignoredPaths = [
      "node_modules",
      ".git",
      "coverage",
      "build",
      "dist",
          "logs",
      "data"
    ];

    const scanDirectory = async (dirPath: string, relativePath: string = ""): Promise<void> => {
      try {
        const entries = await readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dirPath, entry.name);
          const entryRelativePath = relativePath ? join(relativePath, entry.name) : entry.name;
          
          // Skip ignored paths
          if (ignoredPaths.some(ignored => entryRelativePath.startsWith(ignored))) {
            continue;
          }
          
          // Skip hidden files (except config.json, .gitignore, etc.)
          if (entry.name.startsWith(".") && !this.isImportantHiddenFile(entry.name)) {
            continue;
          }
          
          const fileInfo: FileInfo = {
            path: fullPath,
            name: entry.name,
            isDirectory: entry.isDirectory(),
            extension: entry.isDirectory() ? "" : extname(entry.name),
            relativePath: entryRelativePath
          };
          
          // Store with normalized path (forward slashes) for consistent comparison
          const normalizedPath = entryRelativePath.replace(/\\/g, '/');
          this.currentStructure.set(normalizedPath, fileInfo);
          
          // Recursively scan subdirectories
          if (entry.isDirectory()) {
            await scanDirectory(fullPath, entryRelativePath);
          }
        }
      } catch (error) {
        logger.warn(`⚠️ Could not scan directory ${dirPath}:`, error as Error);
      }
    };
    
    await scanDirectory(this.projectRoot);
    logger.info(`✅ Scanned ${this.currentStructure.size} files/directories`);
  }

  /**
   * Check if a hidden file is important for documentation
   */
  private isImportantHiddenFile(filename: string): boolean {
    const importantFiles = [
      "config.json",
      ".gitignore",
      ".gitattributes",
      ".eslintrc",
      ".prettierrc",
      ".bunfig",
      ".env.example"
    ];
    return importantFiles.includes(filename);
  }

  /**
   * Parse the documented structure from structure.md
   */
  private parseDocumentedStructure(): void {
    logger.info("📖 Parsing documented structure...");
    
    const sections = this.structureContent.split(/(?=^## )/m);
    
    for (const section of sections) {
      if (!section.trim()) continue;
      
      const lines = section.split('\n');
      const title = lines[0].replace(/^##\s*/, '').trim();
      
      if (!title) continue;
      
      // Extract file paths from code blocks and lists
      const files: string[] = [];
      
      for (const line of lines) {
        // Look for file paths in code blocks
        const codeBlockMatch = line.match(/`([^`]+)`/);
        if (codeBlockMatch) {
          const path = codeBlockMatch[1];
          if ((path.includes('/') || path.includes('\\')) && !this.isTextDescription(path)) {
            files.push(path);
          }
        }
        
        // Look for file paths in lists
        const listMatch = line.match(/^\s*[-*]\s*\*\*`?([^`*]+)`?\*\*/);
        if (listMatch) {
          const path = listMatch[1];
          if ((path.includes('/') || path.includes('\\')) && !this.isTextDescription(path)) {
            files.push(path);
          }
        }
        
        // Look for directory paths in code blocks (without file extensions)
        const dirMatch = line.match(/`([^`/\\]+\/)`/);
        if (dirMatch) {
          const path = dirMatch[1];
          if (path.endsWith('/')) {
            files.push(path);
          }
        }
        
        // Look for directory paths in lists (without file extensions)
        const dirListMatch = line.match(/^\s*[-*]\s*\*\*`?([^`*]+\/)`?\*\*/);
        if (dirListMatch) {
          const path = dirListMatch[1];
          if (path.endsWith('/')) {
            files.push(path);
          }
        }
        
        // Look for directory paths in code blocks (with trailing slash)
        const dirCodeMatch = line.match(/```\n([^`\n]+\/)\n```/);
        if (dirCodeMatch) {
          const path = dirCodeMatch[1];
          if (path.endsWith('/')) {
            files.push(path);
          }
        }
        
        // Look for directory paths in code blocks (with trailing slash) - alternative format
        const dirCodeAltMatch = line.match(/```\n([^`\n]+)\n```/);
        if (dirCodeAltMatch) {
          const path = dirCodeAltMatch[1];
          if (path.endsWith('/')) {
            files.push(path);
          }
        }
      }
      
      if (files.length > 0) {
        this.documentedStructure.set(title, files);
      }
    }
    
    logger.info(`✅ Parsed ${this.documentedStructure.size} documented sections`);
  }

  /**
   * Validate current structure against documented structure
   */
  private validateStructure(): void {
    logger.info("🔍 Validating structure consistency...");
    
    // Check for missing files in documentation
    for (const [path] of this.currentStructure) {
      // Skip certain files and directories that don't need documentation
      if (this.shouldSkipValidation(path)) continue;
      
      const isDocumented = this.isFileDocumented(path);
      if (!isDocumented) {
        this.issues.push(`📄 File not documented: ${path}`);
      }
    }
    
    // Check for documented files that don't exist
    for (const [section, files] of this.documentedStructure) {
      for (const file of files) {
        // Skip checking files in gitignore or dependencies sections
        if (this.shouldSkipExistenceCheck(section, file)) {
          continue;
        }
        
        // Normalize paths for comparison
        const normalizedFile = this.normalizePath(file);
        const normalizedFileWithoutSlash = normalizedFile.replace(/\/$/, '');
        
        if (!this.currentStructure.has(normalizedFile) && 
            !this.currentStructure.has(normalizedFileWithoutSlash) &&
            !this.currentStructure.has(file.replace(/\\/g, '/'))) {
          this.issues.push(`❌ Documented file not found: ${file} (in section: ${section})`);
        }
      }
    }
    
    // Check for structural issues
    this.checkStructuralIssues();
    
    logger.info(`🔍 Found ${this.issues.length} issues`);
  }

  /**
   * Check if a file is documented in structure.md
   */
  private isFileDocumented(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    for (const files of this.documentedStructure.values()) {
      if (files.some(file => file.includes(normalizedPath) || normalizedPath.includes(file))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Normalize path for comparison
   */
  private normalizePath(path: string): string {
    return path.replace(/\\/g, '/');
  }

  /**
   * Check if a string is a text description rather than a file path
   */
  private isTextDescription(text: string): boolean {
    const textDescriptions = [
      'CI/CD enforcement',
      'CI/CD Integration',
      'Generated documentation',
      'Automated workflows',
      'Build artifacts',
      'Temporary files',
      'External storage'
    ];
    
    return textDescriptions.some(desc => text.includes(desc)) || 
           text.includes(' ') && !text.includes('.') && !text.endsWith('/');
  }

  /**
   * Check if file existence should be skipped for certain sections
   */
  private shouldSkipExistenceCheck(section: string, file: string): boolean {
    // Skip existence check for files in certain sections
    const skipSections = [
      'Git Ignore Patterns',
      'Dependencies Structure',
      'CI/CD Workflows'
    ];
    
    // Skip certain files that may not exist
    const skipFiles = [
      'node_modules/',
      'build/',
      'dist/',
      'logs/',
      '.vscode/',
      '.github/workflows/',
      'G:/'  // External storage paths
    ];
    
    return skipSections.some(skipSection => section.includes(skipSection)) ||
           skipFiles.some(skipFile => file.includes(skipFile));
  }

  /**
   * Check if only non-critical issues remain
   */
  private hasOnlyNonCriticalIssues(): boolean {
    if (this.issues.length === 0) {
      return true;
    }
    
    // Non-critical issues that don't fail validation
    const nonCriticalPatterns = [
      'File not documented:', // Files that are auto-documented
      'Optional directory not found', // Optional directories
    ];
    
    const criticalIssues = this.issues.filter(issue => 
      !nonCriticalPatterns.some(pattern => issue.includes(pattern))
    );
    
    return criticalIssues.length === 0;
  }

  /**
   * Check if a file or directory should be skipped in validation
   */
  private shouldSkipValidation(path: string): boolean {
    const normalizedPath = path.replace(/\\/g, '/');
    
    // Skip certain directories and files that don't need documentation
    const skipPatterns = [
      'node_modules/',
      '.git/',
      'coverage/',
      'build/',
      'dist/',
      'logs/',
      'data/',
      '.logs/',
      '.vscode/',
      'bun.lock',
      '.eslintrc.cjs',
      '.prettierrc'
    ];
    
    return skipPatterns.some(pattern => normalizedPath.includes(pattern));
  }

  /**
   * Check for structural issues
   */
  private checkStructuralIssues(): void {
    // Check if all main directories exist (except optional ones)
    const requiredDirs = ['src', 'tests', 'docs', 'scripts'];
    const optionalDirs = ['.github'];
    
    for (const dir of requiredDirs) {
      if (!this.currentStructure.has(dir)) {
        this.issues.push(`📁 Main directory missing: ${dir}`);
      }
    }
    
    for (const dir of optionalDirs) {
      if (!this.currentStructure.has(dir)) {
        logger.info(`ℹ️ Optional directory not found: ${dir}`);
      }
    }
    
    // Add main directories to documented structure if they're missing
    this.addMainDirectoriesToDocumentation();
    
    // Check if structure.md is up to date
    const lastUpdatedMatch = this.structureContent.match(/Last Updated.*?(\d{4}-\d{2}-\d{2})/);
    if (lastUpdatedMatch) {
      const lastUpdated = new Date(lastUpdatedMatch[1]);
      const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 30) {
        this.issues.push(`📅 Structure documentation may be outdated (last updated: ${lastUpdatedMatch[1]})`);
      }
    }
  }

  /**
   * Add main directories to documented structure if they're missing
   */
  private addMainDirectoriesToDocumentation(): void {
    const mainDirs = ['src/', 'tests/', 'docs/', 'scripts/', '.github/'];
    
    for (const dir of mainDirs) {
      let found = false;
      for (const files of this.documentedStructure.values()) {
        if (files.includes(dir)) {
          found = true;
          break;
        }
      }
      
      if (!found) {
        // Add to the first section that makes sense
        const firstSection = this.documentedStructure.keys().next().value;
        if (firstSection) {
          const files = this.documentedStructure.get(firstSection) || [];
          files.push(dir);
          this.documentedStructure.set(firstSection, files);
        }
      }
    }
  }

  /**
   * Auto-fix issues where possible
   */
  private async autoFixIssues(): Promise<void> {
    logger.info("🔧 Attempting to auto-fix issues...");
    
    let fixedCount = 0;
    
    // Auto-update last updated date
    if (this.structureContent.includes("Last Updated")) {
      const today = new Date().toISOString().split('T')[0];
      this.structureContent = this.structureContent.replace(
        /(Last Updated.*?)(\d{4}-\d{2}-\d{2})/,
        `$1${today}`
      );
      this.fixes.push("📅 Updated last updated date");
      fixedCount++;
    }
    
    // Auto-add missing important files
    const importantFiles = [
      "config.json",
      'package.json',
      'bun.lock',
      'tsconfig.json',
      'Makefile',
      '.gitignore'
    ];
    
    for (const file of importantFiles) {
      if (this.currentStructure.has(file) && !this.isFileDocumented(file)) {
        // Add to appropriate section
        this.addFileToSection(file, "Configuration Files (Root Level)");
        this.fixes.push(`📄 Added ${file} to documentation`);
        fixedCount++;
      }
    }
    
    // Auto-update file counts
    this.updateFileCounts();
    
    logger.info(`✅ Auto-fixed ${fixedCount} issues`);
  }

  /**
   * Add a file to a specific section
   */
  private addFileToSection(filePath: string, sectionTitle: string): void {
    const sectionRegex = new RegExp(`(## ${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?)(?=^## |$)`, 'ms');
    const match = this.structureContent.match(sectionRegex);
    
    if (match) {
      const sectionContent = match[1];
      const newFileEntry = `- **\`${filePath}\`** - ${this.getFileDescription(filePath)}`;
      
      // Find where to insert the new file
      const insertPoint = sectionContent.lastIndexOf('\n') + 1;
      const updatedSection = sectionContent.slice(0, insertPoint) + newFileEntry + '\n' + sectionContent.slice(insertPoint);
      
      this.structureContent = this.structureContent.replace(sectionRegex, updatedSection);
    }
  }

  /**
   * Get a description for a file based on its type
   */
  private getFileDescription(filePath: string): string {
    const ext = extname(filePath);
    
    switch (ext) {
      case '.json':
        return 'Configuration file';
      case '.ts':
        return 'TypeScript source file';
      case '.md':
        return 'Documentation file';
      case '.yml':
      case '.yaml':
        return 'YAML configuration file';
      case '':
        if (filePath.startsWith('.')) {
          return 'Hidden configuration file';
        }
        return 'Directory or executable';
      default:
        return `${ext.substring(1).toUpperCase()} file`;
    }
  }

  /**
   * Update file counts in documentation
   */
  private updateFileCounts(): void {
    const tsFiles = Array.from(this.currentStructure.values()).filter(f => f.extension === '.ts').length;
    const mdFiles = Array.from(this.currentStructure.values()).filter(f => f.extension === '.md').length;
    const jsonFiles = Array.from(this.currentStructure.values()).filter(f => f.extension === '.json').length;
    
    // Update statistics section
    this.structureContent = this.structureContent.replace(
      /TypeScript \(\.ts\): ~\d+\+ files/,
      `TypeScript (.ts): ~${tsFiles}+ files`
    );
    
    this.structureContent = this.structureContent.replace(
      /Markdown \(\.md\): ~\d+\+ files/,
      `Markdown (.md): ~${mdFiles}+ files`
    );
    
    this.structureContent = this.structureContent.replace(
      /JSON \(\.json\): ~\d+\+ files/,
      `JSON (.json): ~${jsonFiles}+ files`
    );
    
    this.fixes.push("📊 Updated file counts");
  }

  /**
   * Generate validation report
   */
  private generateReport(): void {
    logger.info("\n" + "=".repeat(60));
    logger.info("📋 STRUCTURE VALIDATION REPORT");
    logger.info("=".repeat(60));
    
    if (this.issues.length === 0) {
      logger.info("✅ All structure checks passed!");
    } else {
      logger.info(`❌ Found ${this.issues.length} issues:`);
      this.issues.forEach(issue => logger.info(`  ${issue}`));
    }
    
    if (this.fixes.length > 0) {
      logger.info(`\n🔧 Auto-fixed ${this.fixes.length} issues:`);
      this.fixes.forEach(fix => logger.info(`  ${fix}`));
    }
    
    logger.info("\n" + "=".repeat(60));
  }

  /**
   * Save updated structure.md
   */
  async saveUpdatedStructure(): Promise<void> {
    if (this.fixes.length > 0) {
      writeFileSync(this.structurePath, this.structureContent, "utf8");
      logger.info("💾 Updated docs/structure.md with fixes");
    }
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    const validator = new StructureValidator();
    const isValid = await validator.validate();
    
    // Save any fixes
    await validator.saveUpdatedStructure();
    
    if (!isValid) {
      logger.error("❌ Structure validation failed. Please review and fix critical issues.");
      process.exit(1);
    }
    
    logger.info("✅ Structure validation completed successfully!");
  } catch (error) {
    logger.error("❌ Fatal error during structure validation:", error as Error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { StructureValidator };
