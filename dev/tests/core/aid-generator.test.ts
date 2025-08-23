/**
 * Tests for AID Generator
 */

import { describe, test, expect, beforeEach } from "bun:test";
import {
  AIDGenerator,
  AIDConfig,
  DEFAULT_AID_CONFIG,
  isValidAID,
  getAIDPrefix,
  getEntityTypeDescription,
  AID_REGISTRY,
  parseAID,
} from "../../src/core/aid-generator.js";

describe("AID Generator", () => {
  let generator: AIDGenerator;

  beforeEach(() => {
    generator = new AIDGenerator();
  });

  describe("Configuration", () => {
    test("should use default configuration", () => {
      const config = generator.getConfig();
      expect(config).toEqual(DEFAULT_AID_CONFIG);
    });

    test("should accept custom configuration", () => {
      const customConfig: Partial<AIDConfig> = {
        maxRetries: 5,
        idLength: 10,
        useTimestamp: false,
        useCounter: false,
      };
      
      const customGenerator = new AIDGenerator(customConfig);
      const config = customGenerator.getConfig();
      
      expect(config.maxRetries).toBe(5);
      expect(config.idLength).toBe(10);
      expect(config.useTimestamp).toBe(false);
      expect(config.useCounter).toBe(false);
    });

    test("should update configuration", () => {
      generator.updateConfig({ maxRetries: 15 });
      const config = generator.getConfig();
      expect(config.maxRetries).toBe(15);
    });
  });

  describe("generateUniqueEntityId", () => {
    test("should generate valid AID for goal prefix", async () => {
      const aid = await generator.generateUniqueEntityId("g");
      expect(isValidAID(aid)).toBe(true);
      expect(aid.startsWith("g-")).toBe(true);
    });

    test("should generate valid AID for document prefix", async () => {
      const aid = await generator.generateUniqueEntityId("d");
      expect(isValidAID(aid)).toBe(true);
      expect(aid.startsWith("d-")).toBe(true);
    });

    test("should throw error for invalid prefix", async () => {
      await expect(generator.generateUniqueEntityId("x")).rejects.toThrow("Invalid prefix");
    });

    test("should throw error for empty prefix", async () => {
      await expect(generator.generateUniqueEntityId("")).rejects.toThrow("Prefix cannot be empty");
    });

    test("should generate different AIDs for same input", async () => {
      const aid1 = await generator.generateUniqueEntityId("g");
      const aid2 = await generator.generateUniqueEntityId("g");
      expect(aid1).not.toBe(aid2);
    });

    test("should respect maxRetries configuration", async () => {
      const limitedGenerator = new AIDGenerator({ maxRetries: 1 });
      
      // Mock uniqueness check to always return false
      const mockCheck = async () => false;
      
      await expect(limitedGenerator.generateUniqueEntityId("g", mockCheck))
        .rejects.toThrow("Failed to generate unique AID after 1 attempts");
    });

    test("should use custom uniqueness checker", async () => {
      let callCount = 0;
      const mockCheck = async () => {
        callCount++;
        return callCount > 2; // Return true on third call
      };

      const aid = await generator.generateUniqueEntityId("g", mockCheck);
      expect(isValidAID(aid)).toBe(true);
      expect(callCount).toBe(3);
    });
  });

  describe("Specific ID generators", () => {
    test("should generate goal ID", async () => {
      const goalId = await generator.generateGoalId();
      expect(isValidAID(goalId)).toBe(true);
      expect(goalId.startsWith("g-")).toBe(true);
    });

    test("should generate document ID", async () => {
      const documentId = await generator.generateDocumentId();
      expect(isValidAID(documentId)).toBe(true);
      expect(documentId.startsWith("d-")).toBe(true);
    });

    test("should generate file ID", async () => {
      const fileId = await generator.generateFileId();
      expect(isValidAID(fileId)).toBe(true);
      expect(fileId.startsWith("f-")).toBe(true);
    });

    test("should generate API ID", async () => {
      const apiId = await generator.generateApiId();
      expect(isValidAID(apiId)).toBe(true);
      expect(apiId.startsWith("a-")).toBe(true);
    });

    test("should generate script ID", async () => {
      const scriptId = await generator.generateScriptId();
      expect(isValidAID(scriptId)).toBe(true);
      expect(scriptId.startsWith("s-")).toBe(true);
    });

    test("should generate prompt ID", async () => {
      const promptId = await generator.generatePromptId();
      expect(isValidAID(promptId)).toBe(true);
      expect(promptId.startsWith("p-")).toBe(true);
    });
  });

  describe("Session management", () => {
    test("should track used IDs in session", async () => {
      const aid1 = await generator.generateGoalId();
      const aid2 = await generator.generateGoalId();
      
      expect(generator.isUniqueInSession(aid1)).toBe(false);
      expect(generator.isUniqueInSession(aid2)).toBe(false);
      expect(generator.isUniqueInSession("g-unknown")).toBe(true);
    });

    test("should clear session cache", () => {
      generator.clearCache();
      expect(generator.isUniqueInSession("g-anything")).toBe(true);
    });

    test("should reset counters", () => {
      generator.resetCounters();
      expect(generator.getCounter("g")).toBe(0);
    });
  });

  describe("Counter management", () => {
    test("should increment counters for each prefix when enabled", async () => {
      const counterGenerator = new AIDGenerator({ useCounter: true });
      const initialCounter = counterGenerator.getCounter("g");
      
      await counterGenerator.generateGoalId();
      await counterGenerator.generateGoalId();
      
      expect(counterGenerator.getCounter("g")).toBe(initialCounter + 2);
    });

    test("should maintain separate counters for different prefixes when enabled", async () => {
      const counterGenerator = new AIDGenerator({ useCounter: true });
      
      await counterGenerator.generateGoalId();
      await counterGenerator.generateDocumentId();
      
      expect(counterGenerator.getCounter("g")).toBe(1);
      expect(counterGenerator.getCounter("d")).toBe(1);
    });
  });

  describe("ID format", () => {
    test("should include timestamp when enabled", async () => {
      const timestampGenerator = new AIDGenerator({ useTimestamp: true, useCounter: false });
      const aid = await timestampGenerator.generateGoalId();
      
      const parts = aid.split("-");
      expect(parts.length).toBeGreaterThanOrEqual(2);
      expect(parts[1].length).toBe(4); // Timestamp part
    });

    test("should include counter when enabled", async () => {
      const counterGenerator = new AIDGenerator({ useTimestamp: false, useCounter: true });
      const aid = await counterGenerator.generateGoalId();
      
      const parts = aid.split("-");
      expect(parts.length).toBeGreaterThanOrEqual(2);
    });

    test("should respect idLength configuration", async () => {
      const lengthGenerator = new AIDGenerator({ idLength: 20 });
      const aid = await lengthGenerator.generateGoalId();
      
      expect(aid.length).toBeLessThanOrEqual(20);
    });
  });

  describe("Validation functions", () => {
    test("should validate correct AID format", () => {
      expect(isValidAID("g-abc123")).toBe(true);
      expect(isValidAID("d-xyz789")).toBe(true);
      expect(isValidAID("f-timestamp-counter-random")).toBe(true);
    });

    test("should reject invalid AID format", () => {
      expect(isValidAID("invalid")).toBe(false);
      expect(isValidAID("g-")).toBe(false);
      expect(isValidAID("g-123")).toBe(false); // Too short
      expect(isValidAID("X-abc123")).toBe(false); // Uppercase prefix
    });

    test("should extract prefix from valid AID", () => {
      expect(getAIDPrefix("g-abc123")).toBe("g");
      expect(getAIDPrefix("d-xyz789")).toBe("d");
    });

    test("should return null for invalid AID", () => {
      expect(getAIDPrefix("invalid")).toBe(null);
    });

    test("should return entity type description", () => {
      expect(getEntityTypeDescription("g-abc123")).toBe("Goal/Task");
      expect(getEntityTypeDescription("d-xyz789")).toBe("Document");
      expect(getEntityTypeDescription("invalid")).toBe("Unknown");
    });
  });

  describe("AID parsing", () => {
    test("should parse AID components correctly", () => {
      const parsed = parseAID("g-timestamp-counter-random");
      
      expect(parsed).not.toBe(null);
      if (parsed) {
        expect(parsed.prefix).toBe("g");
        expect(parsed.timestamp).toBe("timestamp");
        expect(parsed.counter).toBe("counter");
        expect(parsed.random).toBe("random");
      }
    });

    test("should parse AID with only prefix and random", () => {
      const parsed = parseAID("g-random123");
      
      expect(parsed).not.toBe(null);
      if (parsed) {
        expect(parsed.prefix).toBe("g");
        expect(parsed.timestamp).toBeUndefined();
        expect(parsed.counter).toBeUndefined();
        expect(parsed.random).toBe("random123");
      }
    });

    test("should return null for invalid AID", () => {
      expect(parseAID("invalid")).toBe(null);
    });
  });

  describe("AID Registry", () => {
    test("should contain all expected entity types", () => {
      expect(AID_REGISTRY).toHaveProperty("g");
      expect(AID_REGISTRY).toHaveProperty("d");
      expect(AID_REGISTRY).toHaveProperty("f");
      expect(AID_REGISTRY).toHaveProperty("a");
      expect(AID_REGISTRY).toHaveProperty("s");
      expect(AID_REGISTRY).toHaveProperty("p");
    });

    test("should have meaningful descriptions", () => {
      expect(AID_REGISTRY.g).toBe("Goal/Task");
      expect(AID_REGISTRY.d).toBe("Document");
      expect(AID_REGISTRY.f).toBe("File");
      expect(AID_REGISTRY.a).toBe("API Endpoint");
      expect(AID_REGISTRY.s).toBe("Script");
      expect(AID_REGISTRY.p).toBe("Prompt");
    });
  });

  describe("Statistics", () => {
    test("should provide generator statistics", async () => {
      const counterGenerator = new AIDGenerator({ useCounter: true });
      await counterGenerator.generateGoalId();
      await counterGenerator.generateDocumentId();
      
      const config = counterGenerator.getConfig();
      const counterG = counterGenerator.getCounter("g");
      const counterD = counterGenerator.getCounter("d");
      
      expect(config).toBeDefined();
      expect(counterG).toBeGreaterThan(0);
      expect(counterD).toBeGreaterThan(0);
    });
  });
});
