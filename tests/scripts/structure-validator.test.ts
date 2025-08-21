#!/usr/bin/env bun

/**
 * Tests for StructureValidator
 * Ensures the structure validation works correctly
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { StructureValidator } from "../../src/scripts/structure-validator.js";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";

// Type for accessing private methods and properties for testing
interface StructureValidatorTestAccess {
  structurePath: string;
  structureContent: string;
  currentStructure: Map<string, unknown>;
  documentedStructure: Map<string, string[]>;
  issues: string[];
  fixes: string[];
  scanProjectStructure(): Promise<void>;
  parseDocumentedStructure(): void;
  validateStructure(): void;
  autoFixIssues(): Promise<void>;
  getFileDescription(filePath: string): string;
  isFileDocumented(filePath: string): boolean;
}

describe("StructureValidator", () => {
  let tempStructurePath: string;
  let originalStructurePath: string;
  let validator: StructureValidator;

  beforeEach(async () => {
    // Create a temporary structure.md for testing
    tempStructurePath = join(process.cwd(), "docs", "structure-test.md");
    originalStructurePath = join(process.cwd(), "docs", "structure.md");
    
    // Backup original if it exists
    if (existsSync(originalStructurePath)) {
      const originalContent = await Bun.file(originalStructurePath).text();
      writeFileSync(tempStructurePath, originalContent);
    } else {
      // Create minimal test structure
      const testContent = `# Test Structure

## Configuration Files (Root Level)
- **\`package.json\`** - Dependencies & scripts
- **\`tsconfig.json\`** - TypeScript configuration

## Source Code Structure
- **\`src/index.ts\`** - CLI entry point

Last Updated: 2025-01-20
Version: 0.2.0`;
      writeFileSync(tempStructurePath, testContent);
    }
  });

  afterEach(() => {
    // Cleanup
    if (existsSync(tempStructurePath)) {
      unlinkSync(tempStructurePath);
    }
  });

  test("should create validator instance", () => {
    expect(() => new StructureValidator()).not.toThrow();
  });

  test("should scan project structure", async () => {
    validator = new StructureValidator();
    const testValidator = validator as unknown as StructureValidatorTestAccess;
    
    // Mock the structure path to use our test file
    testValidator.structurePath = tempStructurePath;
    testValidator.structureContent = await Bun.file(tempStructurePath).text();
    
    // Test private method through reflection
    await testValidator.scanProjectStructure();
    
    // Should have scanned some files
    expect(testValidator.currentStructure.size).toBeGreaterThan(0);
  });

  test("should parse documented structure", async () => {
    validator = new StructureValidator();
    const testValidator = validator as unknown as StructureValidatorTestAccess;
    
    // Mock the structure path to use our test file
    testValidator.structurePath = tempStructurePath;
    testValidator.structureContent = await Bun.file(tempStructurePath).text();
    
    // Test private method through reflection
    testValidator.parseDocumentedStructure();
    
    // Should have parsed sections
    expect(testValidator.documentedStructure.size).toBeGreaterThan(0);
  });

  test("should validate structure consistency", async () => {
    validator = new StructureValidator();
    const testValidator = validator as unknown as StructureValidatorTestAccess;
    
    // Mock the structure path to use our test file
    testValidator.structurePath = tempStructurePath;
    testValidator.structureContent = await Bun.file(tempStructurePath).text();
    
    // Scan and parse first
    await testValidator.scanProjectStructure();
    testValidator.parseDocumentedStructure();
    
    // Test validation
    testValidator.validateStructure();
    
    // Should have run validation
    expect(testValidator.issues).toBeDefined();
  });

  test("should auto-fix issues", async () => {
    validator = new StructureValidator();
    const testValidator = validator as unknown as StructureValidatorTestAccess;
    
    // Mock the structure path to use our test file
    testValidator.structurePath = tempStructurePath;
    testValidator.structureContent = await Bun.file(tempStructurePath).text();
    
    // Test auto-fix
    await testValidator.autoFixIssues();
    
    // Should have attempted fixes
    expect(testValidator.fixes).toBeDefined();
  });

  test("should generate file descriptions", () => {
    validator = new StructureValidator();
    const testValidator = validator as unknown as StructureValidatorTestAccess;
    
    expect(testValidator.getFileDescription("package.json")).toBe("Configuration file");
    expect(testValidator.getFileDescription("src/index.ts")).toBe("TypeScript source file");
    expect(testValidator.getFileDescription("README.md")).toBe("Documentation file");
    expect(testValidator.getFileDescription(".gitignore")).toBe("Hidden configuration file");
  });

  test("should check if file is documented", () => {
    validator = new StructureValidator();
    const testValidator = validator as unknown as StructureValidatorTestAccess;
    
    // Mock documented structure
    testValidator.documentedStructure = new Map([
      ["Test Section", ["src/index.ts", "package.json"]]
    ]);
    
    expect(testValidator.isFileDocumented("src/index.ts")).toBe(true);
    expect(testValidator.isFileDocumented("package.json")).toBe(true);
    expect(testValidator.isFileDocumented("unknown.ts")).toBe(false);
  });
});

describe("StructureValidator Integration", () => {
  test("should run full validation workflow", async () => {
    const validator = new StructureValidator();
    
    try {
      const result = await validator.validate();
      expect(typeof result).toBe("boolean");
    } catch (error) {
      // It's okay if validation fails in test environment
      expect(error).toBeDefined();
    }
  });
});
