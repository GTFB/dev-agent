/**
 * Tests for AID Generator
 */

import { describe, test, expect } from "bun:test";
import {
  generateUniqueEntityId,
  isValidAID,
  getAIDPrefix,
  getEntityTypeDescription,
  generateGoalId,
  generateDocumentId,
  AID_REGISTRY,
} from "../../src/core/aid-generator.js";

describe("AID Generator", () => {
  describe("generateUniqueEntityId", () => {
    test("should generate valid AID for task prefix", () => {
      const aid = generateUniqueEntityId("G", {
        prefix: "G",
        title: "Test Task",
        type: "task",
        status: "todo",
      });

      expect(aid).toMatch(/^g-[a-z0-9]{6}$/);
      expect(aid.length).toBe(8); // g- + 6 chars
    });

    test("should generate valid AID for document prefix", () => {
      const aid = generateUniqueEntityId("A", {
        prefix: "A",
        title: "Test Document",
        type: "document",
        status: "draft",
      });

      expect(aid).toMatch(/^a-[a-z0-9]{6}$/);
      expect(aid.length).toBe(8);
    });

    test("should throw error for invalid prefix", () => {
      expect(() => {
        generateUniqueEntityId("!" as any, {
          prefix: "!",
          title: "Test",
          type: "test",
          status: "test",
        });
      }).toThrow("Invalid AID prefix: !");
    });

    test("should generate different AIDs for same input", () => {
      const aid1 = generateUniqueEntityId("G", {
        prefix: "G",
        title: "Test Task",
        type: "task",
        status: "todo",
      });

      const aid2 = generateUniqueEntityId("G", {
        prefix: "G",
        title: "Test Task",
        type: "task",
        status: "todo",
      });

      expect(aid1).not.toBe(aid2);
    });
  });

  describe("isValidAID", () => {
    test("should validate correct AID format", () => {
      expect(isValidAID("g-a1b2c3")).toBe(true);
      expect(isValidAID("a-d4e5f6")).toBe(true);
      expect(isValidAID("b-x7y8z9")).toBe(true);
    });

    test("should reject invalid AID format", () => {
      expect(isValidAID("g-a1b2")).toBe(false); // too short
      expect(isValidAID("g-a1b2c3d")).toBe(false); // too long
      expect(isValidAID("g-a1b2c")).toBe(false); // wrong length
      expect(isValidAID("!-a1b2c3")).toBe(false); // invalid prefix
      expect(isValidAID("g-a1b2c")).toBe(false); // missing character
      expect(isValidAID("")).toBe(false); // empty string
      expect(isValidAID("G-a1b2c3")).toBe(false); // uppercase prefix
    });
  });

  describe("getAIDPrefix", () => {
    test("should extract prefix from valid AID", () => {
      expect(getAIDPrefix("g-a1b2c3")).toBe("G");
      expect(getAIDPrefix("a-d4e5f6")).toBe("A");
      expect(getAIDPrefix("b-x7y8z9")).toBe("B");
    });

    test("should return null for invalid AID", () => {
      expect(getAIDPrefix("invalid")).toBe(null);
      expect(getAIDPrefix("g-a1b2")).toBe(null);
      expect(getAIDPrefix("")).toBe(null);
    });
  });

  describe("getEntityTypeDescription", () => {
    test("should return correct description for valid prefix", () => {
      expect(getEntityTypeDescription("G")).toBe("Goal");
      expect(getEntityTypeDescription("A")).toBe("Archive (Documents)");
      expect(getEntityTypeDescription("B")).toBe("Base (Logistics, Inventory)");
    });

    test("should return description for all registered prefixes", () => {
      Object.keys(AID_REGISTRY).forEach((prefix) => {
        const description = getEntityTypeDescription(prefix as any);
        expect(description).toBeTruthy();
        expect(typeof description).toBe("string");
      });
    });
  });

  describe("generateGoalId", () => {
    test("should generate goal AID with G prefix", () => {
      const goalId = generateGoalId("Test Goal");

      expect(goalId).toMatch(/^g-[a-z0-9]{6}$/);
      expect(goalId.length).toBe(8);
    });

    test("should generate different IDs for different titles", () => {
      const id1 = generateGoalId("Goal 1");
      const id2 = generateGoalId("Goal 2");

      expect(id1).not.toBe(id2);
    });
  });

  describe("generateDocumentId", () => {
    test("should generate document AID with A prefix", () => {
      const docId = generateDocumentId("Test Document");

      expect(docId).toMatch(/^a-[a-z0-9]{6}$/);
      expect(docId.length).toBe(8);
    });

    test("should generate different IDs for different titles", () => {
      const id1 = generateDocumentId("Document 1");
      const id2 = generateDocumentId("Document 2");

      expect(id1).not.toBe(id2);
    });
  });

  describe("AID_REGISTRY", () => {
    test("should contain all expected entity types", () => {
      const expectedPrefixes = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
      ];

      expectedPrefixes.forEach((prefix) => {
        expect(AID_REGISTRY).toHaveProperty(prefix);
        expect(typeof AID_REGISTRY[prefix as keyof typeof AID_REGISTRY]).toBe(
          "string",
        );
      });
    });

    test("should have meaningful descriptions", () => {
      Object.entries(AID_REGISTRY).forEach(([prefix, description]) => {
        // Some descriptions might not have parentheses (like 'Goal')
        expect(description.length).toBeGreaterThan(3);
        expect(typeof description).toBe("string");
      });
    });
  });
});
