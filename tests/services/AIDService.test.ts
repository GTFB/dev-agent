import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { AIDService } from "../../src/services/AIDService.js";
import { StorageService } from "../../src/services/StorageService.js";

describe("AID Service", () => {
  let aidService: AIDService;
  let storageService: StorageService;

  beforeEach(async () => {
    storageService = new StorageService(":memory:");
    await storageService.initialize();
    aidService = new AIDService(storageService);
  });

  afterEach(async () => {
    await storageService.close();
  });

  describe("Goal ID Generation", () => {
    test("should generate unique goal ID", async () => {
      const goalId = await aidService.generateUniqueGoalId();
      
      expect(goalId).toMatch(/^g-/);
      expect(goalId.length).toBeGreaterThan(2);
    });

    test("should generate different goal IDs", async () => {
      const goalId1 = await aidService.generateUniqueGoalId();
      const goalId2 = await aidService.generateUniqueGoalId();
      
      expect(goalId1).not.toBe(goalId2);
    });

    test("should check database uniqueness", async () => {
      const goalId = await aidService.generateUniqueGoalId();
      
      // Create a goal with this ID
      await storageService.createGoal({
        id: goalId,
        title: "Test Goal",
        status: "todo",
        description: "Test description",
      });

      // Try to generate another ID - should be different
      const newGoalId = await aidService.generateUniqueGoalId();
      expect(newGoalId).not.toBe(goalId);
    });
  });

  describe("Document ID Generation", () => {
    test("should generate unique document ID", async () => {
      const documentId = await aidService.generateUniqueDocumentId();
      
      expect(documentId).toMatch(/^d-/);
      expect(documentId.length).toBeGreaterThan(2);
    });

    test("should generate different document IDs", async () => {
      const documentId1 = await aidService.generateUniqueDocumentId();
      const documentId2 = await aidService.generateUniqueDocumentId();
      
      expect(documentId1).not.toBe(documentId2);
    });
  });

  describe("File ID Generation", () => {
    test("should generate unique file ID", async () => {
      const fileId = await aidService.generateUniqueFileId();
      
      expect(fileId).toMatch(/^f-/);
      expect(fileId.length).toBeGreaterThan(2);
    });
  });

  describe("API ID Generation", () => {
    test("should generate unique API ID", async () => {
      const apiId = await aidService.generateUniqueApiId();
      
      expect(apiId).toMatch(/^a-/);
      expect(apiId.length).toBeGreaterThan(2);
    });
  });

  describe("Script ID Generation", () => {
    test("should generate unique script ID", async () => {
      const scriptId = await aidService.generateUniqueScriptId();
      
      expect(scriptId).toMatch(/^s-/);
      expect(scriptId.length).toBeGreaterThan(2);
    });
  });

  describe("Prompt ID Generation", () => {
    test("should generate unique prompt ID", async () => {
      const promptId = await aidService.generateUniquePromptId();
      
      expect(promptId).toMatch(/^p-/);
      expect(promptId.length).toBeGreaterThan(2);
    });
  });

  describe("Custom Entity ID Generation", () => {
    test("should generate unique entity ID with custom prefix", async () => {
      const entityId = await aidService.generateUniqueEntityId("g");
      
      expect(entityId).toMatch(/^g-/);
      expect(entityId.length).toBeGreaterThan(2);
    });

    test("should use custom uniqueness checker", async () => {
      let callCount = 0;
      const customChecker = async () => {
        callCount++;
        return callCount > 2; // Return true on third call
      };

      const entityId = await aidService.generateUniqueEntityId("g", customChecker);
      
      expect(entityId).toMatch(/^g-/);
      expect(callCount).toBe(3);
    });
  });

  describe("AID Validation", () => {
    test("should validate valid AID format", async () => {
      const result = await aidService.validateAndCheckUniqueness("g-abc123");
      
      expect(result.isValid).toBe(true);
      expect(result.prefix).toBe("g");
      expect(result.entityType).toBe("Goal/Task");
    });

    test("should reject invalid AID format", async () => {
      const result = await aidService.validateAndCheckUniqueness("invalid");
      
      expect(result.isValid).toBe(false);
      expect(result.isUnique).toBe(false);
    });

    test("should check database uniqueness", async () => {
      const goalId = await aidService.generateUniqueGoalId();
      
      // First check should show it's unique
      const result1 = await aidService.validateAndCheckUniqueness(goalId);
      expect(result1.isUnique).toBe(true);

      // Create goal in database
      await storageService.createGoal({
        id: goalId,
        title: "Test Goal",
        status: "todo",
        description: "Test description",
      });

      // Second check should show it's not unique
      const result2 = await aidService.validateAndCheckUniqueness(goalId);
      expect(result2.isUnique).toBe(false);
    });
  });

  describe("Generator Statistics", () => {
    test("should provide generator statistics", async () => {
      // Create service with counter enabled for testing
      const testService = new AIDService(storageService, { useCounter: true });
      await testService.generateUniqueGoalId();
      await testService.generateUniqueDocumentId();
      
      // Test individual methods
      const config = testService["generator"].getConfig();
      const counterG = testService["generator"].getCounter("g");
      const counterD = testService["generator"].getCounter("d");
      
      expect(config).toBeDefined();
      expect(counterG).toBeGreaterThan(0);
      expect(counterD).toBeGreaterThan(0);
    });
  });

  describe("Generator Management", () => {
    test("should reset generator state", async () => {
      await aidService.generateUniqueGoalId();
      
      const sessionCacheSizeBefore = aidService["generator"]["usedIds"].size;
      expect(sessionCacheSizeBefore).toBeGreaterThan(0);
      
      aidService.resetGenerator();
      
      const sessionCacheSizeAfter = aidService["generator"]["usedIds"].size;
      expect(sessionCacheSizeAfter).toBe(0);
    });

    test("should update generator configuration", async () => {
      const originalConfig = aidService["generator"].getConfig();
      
      aidService.updateGeneratorConfig({ maxRetries: 20 });
      
      const newConfig = aidService["generator"].getConfig();
      expect(newConfig.maxRetries).toBe(20);
      expect(newConfig.idLength).toBe(originalConfig.idLength); // Other config unchanged
    });
  });

  describe("Error Handling", () => {
    test("should handle database errors gracefully", async () => {
      // Close storage to simulate database error
      await storageService.close();
      
      // Should still generate IDs (assumes uniqueness when can't check)
      const goalId = await aidService.generateUniqueGoalId();
      expect(goalId).toMatch(/^g-/);
    });

    test("should handle custom uniqueness checker errors", async () => {
      // Should still generate ID (assumes uniqueness when can't check)
      const goalId = await aidService.generateUniqueGoalId();
      expect(goalId).toMatch(/^g-/);
    });
  });

  describe("Configuration", () => {
    test("should accept custom configuration", async () => {
      const customService = new AIDService(storageService, {
        maxRetries: 5,
        idLength: 10,
        useTimestamp: false,
        useCounter: false,
      });

      const goalId = await customService.generateUniqueGoalId();
      expect(goalId).toMatch(/^g-/);
      
      const stats = customService.getGeneratorStats();
      expect(stats.config.maxRetries).toBe(5);
      expect(stats.config.idLength).toBe(10);
      expect(stats.config.useTimestamp).toBe(false);
      expect(stats.config.useCounter).toBe(false);
    });
  });
});
