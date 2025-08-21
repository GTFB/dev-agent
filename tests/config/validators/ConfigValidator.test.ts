#!/usr/bin/env bun

import { describe, test, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { writeFileSync, unlinkSync, existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { ConfigValidator } from "../../../src/config/validators/ConfigValidator.js";
import { logger } from "../../../src/utils/logger.js";
import type { Config } from "../../../src/config/types.js";
import { ConfigSchema } from "../../../src/config/types.js";

// Mock logger
const loggerSpy = {
  info: spyOn(logger, "info"),
  error: spyOn(logger, "error")
};

// Helper to create test config
const createValidConfig = (overrides: Partial<Config> = {}): Config => ({
  name: "test-project",
  version: "1.0.0",
  description: "Test project description",
  github: {
    owner: "test-owner",
    repo: "test-repo"
  },
  branches: {
    main: "main",
    develop: "develop",
    feature_prefix: "feature/",
    release_prefix: "release/"
  },
  goals: {
    default_status: "todo",
    id_pattern: "g-{random}"
  },
  workflow: {
    auto_sync: true,
    sync_interval: 300
  },
  validation: {
    strict_language: true,
    auto_translate: false
  },
  storage: {
    database: {
      path: "./data/test.db"
    },
    config: {
      path: "./data/config"
    },
    logs: {
      path: "./data/logs"
    }
  },
  last_updated: "2025-08-21T22:00:00.000Z",
  ...overrides
});

// Test directories and files
const testDir = "./test-config-validator";
const testConfigPath = join(testDir, "test-config.json");

describe("ConfigValidator", () => {
  beforeEach(() => {
    // Reset logger spies
    loggerSpy.info.mockClear();
    loggerSpy.error.mockClear();
    
    // Create test directory
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Cleanup test files
    if (existsSync(testConfigPath)) {
      unlinkSync(testConfigPath);
    }
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("validate method", () => {
    test("should validate correct configuration successfully", () => {
      const validConfig = createValidConfig();
      
      const result = ConfigValidator.validate(validConfig);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validConfig);
        expect(result.data.name).toBe("test-project");
        expect(result.data.version).toBe("1.0.0");
        expect(result.data.github.owner).toBe("test-owner");
      }
      expect(loggerSpy.info).toHaveBeenCalledWith("✅ Configuration validation passed");
    });

    test("should reject configuration with missing required fields", () => {
      const invalidConfig = {
        name: "test-project"
        // Missing all other required fields
      };
      
      const result = ConfigValidator.validate(invalidConfig);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(error => error.includes("version:"))).toBe(true);
        expect(result.errors.some(error => error.includes("description:"))).toBe(true);
        expect(result.errors.length).toBeGreaterThan(5);
      }
      expect(loggerSpy.error).toHaveBeenCalledWith("❌ Configuration validation failed");
    });

    test("should reject configuration with empty string fields", () => {
      const invalidConfig = createValidConfig({
        name: "",
        version: "",
        description: ""
      });
      
      const result = ConfigValidator.validate(invalidConfig);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("name: Project name cannot be empty");
        expect(result.errors).toContain("version: Version cannot be empty");
        expect(result.errors).toContain("description: Description cannot be empty");
      }
    });

    test("should reject configuration with invalid github config", () => {
      const invalidConfig = createValidConfig({
        github: {
          owner: "",
          repo: ""
        }
      });
      
      const result = ConfigValidator.validate(invalidConfig);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("github.owner: GitHub owner cannot be empty");
        expect(result.errors).toContain("github.repo: GitHub repository cannot be empty");
      }
    });

    test("should reject configuration with invalid branches config", () => {
      const invalidConfig = createValidConfig({
        branches: {
          main: "",
          develop: "",
          feature_prefix: "",
          release_prefix: ""
        }
      });
      
      const result = ConfigValidator.validate(invalidConfig);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("branches.main: Main branch name cannot be empty");
        expect(result.errors).toContain("branches.develop: Develop branch name cannot be empty");
        expect(result.errors).toContain("branches.feature_prefix: Feature prefix cannot be empty");
        expect(result.errors).toContain("branches.release_prefix: Release prefix cannot be empty");
      }
    });

    test("should reject configuration with invalid goals config", () => {
      const invalidConfig = createValidConfig({
        goals: {
          default_status: "",
          id_pattern: ""
        }
      });
      
      const result = ConfigValidator.validate(invalidConfig);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("goals.default_status: Default status cannot be empty");
        expect(result.errors).toContain("goals.id_pattern: ID pattern cannot be empty");
      }
    });

    test("should reject configuration with invalid workflow config", () => {
      const invalidConfig = createValidConfig({
        workflow: {
          auto_sync: "not-boolean" as never,
          sync_interval: -1
        }
      });
      
      const result = ConfigValidator.validate(invalidConfig);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(error => error.includes("workflow.auto_sync"))).toBe(true);
        expect(result.errors).toContain("workflow.sync_interval: Sync interval must be positive");
      }
    });

    test("should reject configuration with invalid storage config", () => {
      const invalidConfig = createValidConfig({
        storage: {
          database: { path: "" },
          config: { path: "" },
          logs: { path: "" }
        }
      });
      
      const result = ConfigValidator.validate(invalidConfig);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("storage.database.path: Database path cannot be empty");
        expect(result.errors).toContain("storage.config.path: Config path cannot be empty");
        expect(result.errors).toContain("storage.logs.path: Logs path cannot be empty");
      }
    });

    test("should reject configuration with invalid datetime format", () => {
      const invalidConfig = createValidConfig({
        last_updated: "invalid-date"
      });
      
      const result = ConfigValidator.validate(invalidConfig);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("last_updated: Last updated must be a valid datetime");
      }
    });

    test("should reject configuration with wrong data types", () => {
      const invalidConfig = {
        name: 123, // Should be string
        version: true, // Should be string
        description: [], // Should be string
        github: "not-object", // Should be object
        branches: null, // Should be object
        goals: undefined, // Should be object
        workflow: {
          auto_sync: "yes", // Should be boolean
          sync_interval: "300" // Should be number
        },
        validation: {
          strict_language: "true", // Should be boolean
          auto_translate: 1 // Should be boolean
        },
        storage: {
          database: "not-object" // Should be object
        },
        last_updated: 1234567890 // Should be string
      };
      
      const result = ConfigValidator.validate(invalidConfig);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(10);
        // Check that type errors are present
        expect(result.errors.some(error => error.includes("Invalid input") || error.includes("Expected"))).toBe(true);
      }
    });

    test("should handle null input", () => {
      const result = ConfigValidator.validate(null);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    test("should handle undefined input", () => {
      const result = ConfigValidator.validate(undefined);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    test("should handle empty object input", () => {
      const result = ConfigValidator.validate({});
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.some(error => error.includes("name:"))).toBe(true);
        expect(result.errors.some(error => error.includes("version:"))).toBe(true);
        expect(result.errors.length).toBeGreaterThan(8);
      }
    });

    test("should handle array input", () => {
      const result = ConfigValidator.validate([]);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    test("should handle primitive string input", () => {
      const result = ConfigValidator.validate("not-an-object");
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    test("should handle validation with errors array fallback", () => {
      // Create a scenario where result.error.issues might be undefined
      const result = ConfigValidator.validate({ invalid: "structure" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(Array.isArray(result.errors)).toBe(true);
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    test("should handle exception during validation", () => {
      // Mock ConfigSchema.safeParse to throw an exception
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockImplementation(() => {
        throw new Error("Mock ZOD exception");
      });
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("Validation error: Mock ZOD exception");
      }
      expect(loggerSpy.error).toHaveBeenCalledWith(
        "❌ Configuration validation error", 
        expect.any(Error)
      );
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with missing issues array", () => {
      // Mock ConfigSchema.safeParse to return result without issues
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Validation failed",
          issues: undefined // Simulate missing issues array
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("Validation failed: Validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with empty issues array", () => {
      // Mock ConfigSchema.safeParse to return result with empty issues array
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Validation failed",
          issues: [] // Simulate empty issues array
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // When issues array is empty, it should fall back to the error message
        // The logic is: issues?.map(...) || [`Validation failed: ${result.error.message}`]
        // Since issues is an empty array, map returns empty array, which is falsy, so fallback is used
        expect(result.errors).toContain("Validation failed: Validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with issues containing empty path array", () => {
      // Mock ConfigSchema.safeParse to return result with issues containing empty path array
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Validation failed",
          issues: [
            {
              path: [], // Simulate empty path array
              message: "Field is required"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain(": Field is required");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with issues containing mixed path types", () => {
      // Mock ConfigSchema.safeParse to return result with mixed path types
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Validation failed",
          issues: [
            {
              path: ["github", "owner"], // String path
              message: "Owner is required"
            },
            {
              path: [0, "name"], // Numeric path
              message: "Name is required"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("github.owner: Owner is required");
        expect(result.errors).toContain("0.name: Name is required");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with complex nested path structures", () => {
      // Mock ConfigSchema.safeParse to return result with complex nested paths
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Validation failed",
          issues: [
            {
              path: ["workflow", "auto_sync", "enabled"], // Deep nested path
              message: "Auto sync enabled must be boolean"
            },
            {
              path: ["storage", "database", "path"], // Storage path
              message: "Database path is required"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("workflow.auto_sync.enabled: Auto sync enabled must be boolean");
        expect(result.errors).toContain("storage.database.path: Database path is required");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with various error message formats", () => {
      // Mock ConfigSchema.safeParse to return result with various error message formats
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Multiple validation errors",
          issues: [
            {
              path: ["name"],
              message: "String must contain at least 1 character(s)"
            },
            {
              path: ["version"],
              message: "Invalid version format"
            },
            {
              path: ["github", "owner"],
              message: "Required"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("name: String must contain at least 1 character(s)");
        expect(result.errors).toContain("version: Invalid version format");
        expect(result.errors).toContain("github.owner: Required");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with array index paths", () => {
      // Mock ConfigSchema.safeParse to return result with array index paths
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Array validation failed",
          issues: [
            {
              path: [0, "id"], // First element, id field
              message: "ID is required"
            },
            {
              path: [1, "name"], // Second element, name field
              message: "Name is required"
            },
            {
              path: [2, "config", "enabled"], // Third element, nested config
              message: "Enabled flag is required"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("0.id: ID is required");
        expect(result.errors).toContain("1.name: Name is required");
        expect(result.errors).toContain("2.config.enabled: Enabled flag is required");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with mixed path types and edge cases", () => {
      // Mock ConfigSchema.safeParse to return result with mixed path types and edge cases
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Complex validation failed",
          issues: [
            {
              path: ["root"], // Simple string path
              message: "Root validation failed"
            },
            {
              path: [0], // Numeric index only
              message: "Array element validation failed"
            },
            {
              path: ["nested", 0, "field"], // Mixed string/numeric path
              message: "Nested array field validation failed"
            },
            {
              path: ["deep", "nested", "object", "field"], // Deep nested path
              message: "Deep nested field validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("root: Root validation failed");
        expect(result.errors).toContain("0: Array element validation failed");
        expect(result.errors).toContain("nested.0.field: Nested array field validation failed");
        expect(result.errors).toContain("deep.nested.object.field: Deep nested field validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with edge case path combinations", () => {
      // Mock ConfigSchema.safeParse to return result with edge case path combinations
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Edge case validation failed",
          issues: [
            {
              path: [""], // Empty string path
              message: "Empty path validation failed"
            },
            {
              path: ["a", "", "b"], // Path with empty string in middle
              message: "Middle empty path validation failed"
            },
            {
              path: ["x", 999999999999999], // Very large number
              message: "Large number path validation failed"
            },
            {
              path: ["special", "chars", "!@#$%"], // Special characters
              message: "Special chars path validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain(": Empty path validation failed");
        expect(result.errors).toContain("a..b: Middle empty path validation failed");
        expect(result.errors).toContain("x.999999999999999: Large number path validation failed");
        expect(result.errors).toContain("special.chars.!@#$%: Special chars path validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with path processing errors gracefully", () => {
      // Mock ConfigSchema.safeParse to return result that might cause path processing issues
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Path processing test",
          issues: [
            {
              path: ["normal", "path"], // Normal path
              message: "Normal validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("normal.path: Normal validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with problematic path elements", () => {
      // Mock ConfigSchema.safeParse to return result with problematic path elements
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Problematic path test",
          issues: [
            {
              path: [null], // Null path element
              message: "Null path validation failed"
            },
            {
              path: [undefined], // Undefined path element
              message: "Undefined path validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // These should be converted to strings safely
        expect(result.errors).toContain("null: Null path validation failed");
        expect(result.errors).toContain("undefined: Undefined path validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with complex path elements that might cause errors", () => {
      // Mock ConfigSchema.safeParse to return result with complex path elements
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Complex path test",
          issues: [
            {
              path: [{}], // Object path element
              message: "Object path validation failed"
            },
            {
              path: [() => {}], // Function path element
              message: "Function path validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // These should be converted to strings safely or fall back to "unknown"
        expect(result.errors.length).toBeGreaterThan(0);
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with path elements that cause String() conversion errors", () => {
      // Mock ConfigSchema.safeParse to return result with path elements that cause String() conversion errors
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "String conversion error test",
          issues: [
            {
              path: [{
                toString: () => { throw new Error("toString error"); }
              }], // Object with problematic toString
              message: "ToString error validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should fall back to "unknown" when String() conversion fails
        expect(result.errors).toContain("unknown: ToString error validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with path elements that cause map() errors", () => {
      // Mock ConfigSchema.safeParse to return result with path elements that cause map() errors
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Map error test",
          issues: [
            {
              path: [{
                // Object that causes error when accessed
                get [Symbol.iterator]() { throw new Error("iterator error"); }
              }], // Object with problematic iterator
              message: "Iterator error validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // The object is converted to string successfully, so we get "[object Object]"
        expect(result.errors).toContain("[object Object]: Iterator error validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with undefined or null path", () => {
      // Mock ConfigSchema.safeParse to return result with undefined or null path
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Undefined/null path test",
          issues: [
            {
              path: undefined, // Undefined path
              message: "Undefined path validation failed"
            },
            {
              path: null, // Null path
              message: "Null path validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should fall back to "unknown" when path is undefined or null
        expect(result.errors).toContain("unknown: Undefined path validation failed");
        expect(result.errors).toContain("unknown: Null path validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with path that causes join() errors", () => {
      // Mock ConfigSchema.safeParse to return result with path that causes join() errors
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Join error test",
          issues: [
            {
              path: [{
                // Object that causes error when join() is called
                toString: () => "normal",
                // Override join to throw error
                join: () => { throw new Error("join error"); }
              }], // Object with problematic join
              message: "Join error validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // The object is converted to string successfully, so we get "normal"
        expect(result.errors).toContain("normal: Join error validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with non-array path", () => {
      // Mock ConfigSchema.safeParse to return result with non-array path
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Non-array path test",
          issues: [
            {
              path: "not-an-array", // String instead of array
              message: "Non-array path validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should fall back to "unknown" when path is not an array
        expect(result.errors).toContain("unknown: Non-array path validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with path that causes map() to throw", () => {
      // Mock ConfigSchema.safeParse to return result with path that causes map() to throw
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Map throw test",
          issues: [
            {
              path: [{
                // Object that causes error when map() is called
                toString: () => "normal",
                // Override map to throw error
                map: () => { throw new Error("map error"); }
              }], // Object with problematic map
              message: "Map error validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // The object is converted to string successfully, so we get "normal"
        expect(result.errors).toContain("normal: Map error validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with path that causes String() to throw during map", () => {
      // Mock ConfigSchema.safeParse to return result with path that causes String() to throw during map
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "String throw test",
          issues: [
            {
              path: [{
                // Object that causes error when String() is called during map
                toString: () => { throw new Error("toString error"); }
              }], // Object with problematic toString
              message: "ToString error validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should fall back to "unknown" when String() throws during map
        expect(result.errors).toContain("unknown: ToString error validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with path that causes join() to throw during path processing", () => {
      // Mock ConfigSchema.safeParse to return result with path that causes join() to throw during path processing
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Join throw test",
          issues: [
            {
              path: [{
                // Object that causes error when join() is called
                toString: () => "normal",
                // Override join to throw error
                join: () => { throw new Error("join error"); }
              }], // Object with problematic join
              message: "Join error validation failed"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // The object is converted to string successfully, so we get "normal"
        expect(result.errors).toContain("normal: Join error validation failed");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });

    test("should handle validation with path that causes join() to throw during path processing with problematic array", () => {
      // Mock ConfigSchema.safeParse to return result with path that causes join() to throw during path processing
      const mockSafeParse = spyOn(ConfigSchema, "safeParse").mockReturnValue({
        success: false,
        error: {
          message: "Join throw test 2",
          issues: [
            {
              path: [{
                // Object that causes error when join() is called
                toString: () => "normal",
                // Override join to throw error
                join: () => { throw new Error("join error 2"); }
              }], // Object with problematic join
              message: "Join error validation failed 2"
            }
          ]
        }
      } as never);
      
      const result = ConfigValidator.validate({ test: "data" });
      
      expect(result.success).toBe(false);
      if (!result.success) {
        // The object is converted to string successfully, so we get "normal"
        expect(result.errors).toContain("normal: Join error validation failed 2");
      }
      
      // Restore original method
      mockSafeParse.mockRestore();
    });
  });

  describe("validateFile method", () => {
    test("should validate valid config file successfully", async () => {
      const validConfig = createValidConfig();
      writeFileSync(testConfigPath, JSON.stringify(validConfig, null, 2));
      
      const result = await ConfigValidator.validateFile(testConfigPath);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validConfig);
      }
    });

    test("should handle non-existent file", async () => {
      const nonExistentPath = join(testDir, "non-existent.json");
      
      const result = await ConfigValidator.validateFile(nonExistentPath);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain("File error:");
      }
      expect(loggerSpy.error).toHaveBeenCalledWith(
        "❌ Failed to read or parse config file", 
        expect.any(Error)
      );
    });

    test("should handle invalid JSON file", async () => {
      writeFileSync(testConfigPath, "{ invalid json }");
      
      const result = await ConfigValidator.validateFile(testConfigPath);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain("File error:");
        expect(result.errors[0]).toContain("JSON");
      }
    });

    test("should handle file with invalid config structure", async () => {
      const invalidConfig = { name: "test" }; // Missing required fields
      writeFileSync(testConfigPath, JSON.stringify(invalidConfig));
      
      const result = await ConfigValidator.validateFile(testConfigPath);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(1);
        expect(result.errors.some(error => error.includes("version:"))).toBe(true);
      }
    });

    test("should handle empty file", async () => {
      writeFileSync(testConfigPath, "");
      
      const result = await ConfigValidator.validateFile(testConfigPath);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain("File error:");
      }
    });

    test("should handle binary file", async () => {
      // Write binary content to file
      writeFileSync(testConfigPath, Buffer.from([0x00, 0x01, 0x02, 0x03]));
      
      const result = await ConfigValidator.validateFile(testConfigPath);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain("File error:");
      }
    });

    test("should handle file with BOM (Byte Order Mark)", async () => {
      const validConfig = createValidConfig();
      const configJson = JSON.stringify(validConfig, null, 2);
      // Add BOM to the beginning
      writeFileSync(testConfigPath, "\uFEFF" + configJson);
      
      const result = await ConfigValidator.validateFile(testConfigPath);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("test-project");
      }
    });

    test("should handle permission denied error", async () => {
      // Create a directory instead of file to simulate permission error
      const dirPath = join(testDir, "permission-denied");
      mkdirSync(dirPath);
      
      const result = await ConfigValidator.validateFile(dirPath);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors[0]).toContain("File error:");
      }
      
      // Cleanup
      rmSync(dirPath, { recursive: true, force: true });
    });
  });

  describe("formatErrors method", () => {
    test("should format single error correctly", () => {
      const errors = ["Single error message"];
      
      const result = ConfigValidator.formatErrors(errors);
      
      expect(result).toBe("1. Single error message");
    });

    test("should format multiple errors correctly", () => {
      const errors = [
        "First error message",
        "Second error message",
        "Third error message"
      ];
      
      const result = ConfigValidator.formatErrors(errors);
      
      expect(result).toBe(
        "1. First error message\n2. Second error message\n3. Third error message"
      );
    });

    test("should handle empty errors array", () => {
      const errors: string[] = [];
      
      const result = ConfigValidator.formatErrors(errors);
      
      expect(result).toBe("");
    });

    test("should handle errors with special characters", () => {
      const errors = [
        "Error with special chars: !@#$%^&*()",
        "Error with unicode: ñáéíóú",
        "Error with newlines: line1\nline2"
      ];
      
      const result = ConfigValidator.formatErrors(errors);
      
      expect(result).toContain("1. Error with special chars: !@#$%^&*()");
      expect(result).toContain("2. Error with unicode: ñáéíóú");
      expect(result).toContain("3. Error with newlines: line1\nline2");
    });

    test("should handle very long error messages", () => {
      const longError = "A".repeat(1000);
      const errors = [longError];
      
      const result = ConfigValidator.formatErrors(errors);
      
      expect(result).toBe(`1. ${longError}`);
      expect(result.length).toBe(1003); // "1. " + 1000 chars
    });

    test("should handle many errors", () => {
      const errors = Array.from({ length: 100 }, (_, i) => `Error ${i + 1}`);
      
      const result = ConfigValidator.formatErrors(errors);
      
      const lines = result.split('\n');
      expect(lines).toHaveLength(100);
      expect(lines[0]).toBe("1. Error 1");
      expect(lines[99]).toBe("100. Error 100");
    });
  });

  describe("Edge cases and error handling", () => {
    test("should handle circular reference objects", () => {
      const circularObj: Record<string, unknown> = { name: "test" };
      circularObj.self = circularObj;
      
      const result = ConfigValidator.validate(circularObj);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
      }
    });

    test("should handle very large config objects", () => {
      const largeConfig = createValidConfig({
        description: "A".repeat(10000) // Very long description
      });
      
      const result = ConfigValidator.validate(largeConfig);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description.length).toBe(10000);
      }
    });

    test("should handle config with extra unknown properties", () => {
      const configWithExtra = {
        ...createValidConfig(),
        unknownProperty: "should be ignored",
        anotherExtra: { nested: "value" }
      };
      
      const result = ConfigValidator.validate(configWithExtra);
      
      // ZOD should handle unknown properties based on schema configuration
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("test-project");
        // Extra properties should not be in the validated data
        expect('unknownProperty' in result.data).toBe(false);
      }
    });

    test("should validate config with minimum valid values", () => {
      const minimalConfig = createValidConfig({
        name: "a", // Minimum length 1
        version: "1",
        description: "d",
        github: {
          owner: "o",
          repo: "r"
        },
        workflow: {
          auto_sync: false,
          sync_interval: 1 // Minimum positive number
        },
        storage: {
          database: { path: "." },
          config: { path: "." },
          logs: { path: "." }
        }
      });
      
      const result = ConfigValidator.validate(minimalConfig);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("a");
        expect(result.data.workflow.sync_interval).toBe(1);
      }
    });

    test("should handle maximum realistic config values", () => {
      const maxConfig = createValidConfig({
        workflow: {
          auto_sync: true,
          sync_interval: Number.MAX_SAFE_INTEGER
        }
      });
      
      const result = ConfigValidator.validate(maxConfig);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.workflow.sync_interval).toBe(Number.MAX_SAFE_INTEGER);
      }
    });
  });
});
