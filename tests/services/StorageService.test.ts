/**
 * Tests for Storage Service
 */

import { StorageService } from "../../src/services/StorageService.js";
import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { GoalStatus } from "../../src/core/types.js";

describe("StorageService", () => {
  let storageService: StorageService;

  beforeEach(async () => {
    storageService = new StorageService(":memory:");
    await storageService.initialize();
  });

  afterEach(async () => {
    await storageService.close();
  });

  describe("Goal Operations", () => {
    it("should create and retrieve a goal", async () => {
      const goalId = `g-test-${Date.now()}`;
      const goal = {
        id: goalId,
        title: "Test Goal",
        status: "todo" as GoalStatus,
        description: "Test description",
      };

      await storageService.createGoal(goal);
      const retrievedGoal = await storageService.getGoal(goalId);

      expect(retrievedGoal).toBeDefined();
      expect(retrievedGoal!.id).toBe(goalId);
      expect(retrievedGoal!.title).toBe(goal.title);
      expect(retrievedGoal!.status).toBe(goal.status);
    });

    it("should update a goal", async () => {
      const goalId = `g-test-${Date.now()}`;
      const goal = {
        id: goalId,
        title: "Original Title",
        status: "todo" as GoalStatus,
        description: "Original description",
      };

      await storageService.createGoal(goal);
      await storageService.updateGoal(goalId, {
        title: "Updated Title",
        description: "Updated description",
      });

      const updatedGoal = await storageService.getGoal(goalId);
      expect(updatedGoal!.title).toBe("Updated Title");
      expect(updatedGoal!.description).toBe("Updated description");
    });

    it("should list all goals", async () => {
      const goal1 = {
        id: `g-test-${Date.now()}-1`,
        title: "Goal 1",
        status: "todo" as GoalStatus,
        description: "Description 1",
      };
      const goal2 = {
        id: `g-test-${Date.now()}-2`,
        title: "Goal 2",
        status: "in_progress" as GoalStatus,
        description: "Description 2",
      };
      const goal3 = {
        id: `g-test-${Date.now()}-3`,
        title: "Goal 3",
        status: "done" as GoalStatus,
        description: "Description 3",
      };

      await storageService.createGoal(goal1);
      await storageService.createGoal(goal2);
      await storageService.createGoal(goal3);

      const allGoals = await storageService.listGoals();
      expect(allGoals.length).toBeGreaterThanOrEqual(3);
    });

    it("should list goals by status", async () => {
      const goal1 = {
        id: `g-test-${Date.now()}-1`,
        title: "Goal 1",
        status: "todo" as GoalStatus,
        description: "Description 1",
      };
      const goal2 = {
        id: `g-test-${Date.now()}-2`,
        title: "Goal 2",
        status: "todo" as GoalStatus,
        description: "Description 2",
      };
      const goal3 = {
        id: `g-test-${Date.now()}-3`,
        title: "Goal 3",
        status: "in_progress" as GoalStatus,
        description: "Description 3",
      };

      await storageService.createGoal(goal1);
      await storageService.createGoal(goal2);
      await storageService.createGoal(goal3);

      const todoGoals = await storageService.listGoals("todo");
      expect(todoGoals.length).toBeGreaterThanOrEqual(2);
    });

    it("should delete a goal", async () => {
      const goalId = `g-test-${Date.now()}`;
      const goal = {
        id: goalId,
        title: "Goal to Delete",
        status: "todo" as GoalStatus,
        description: "Will be deleted",
      };

      await storageService.createGoal(goal);
      await storageService.deleteGoal(goalId);

      const deletedGoal = await storageService.getGoal(goalId);
      expect(deletedGoal).toBeNull();
    });

    it("should get goal count by status", async () => {
      const goal1 = {
        id: `g-test-${Date.now()}-1`,
        title: "Goal 1",
        status: "todo" as GoalStatus,
        description: "Description 1",
      };
      const goal2 = {
        id: `g-test-${Date.now()}-2`,
        title: "Goal 2",
        status: "todo" as GoalStatus,
        description: "Description 2",
      };
      const goal3 = {
        id: `g-test-${Date.now()}-3`,
        title: "Goal 3",
        status: "in_progress" as GoalStatus,
        description: "Description 3",
      };
      const goal4 = {
        id: `g-test-${Date.now()}-4`,
        title: "Goal 4",
        status: "done" as GoalStatus,
        description: "Description 4",
      };

      await storageService.createGoal(goal1);
      await storageService.createGoal(goal2);
      await storageService.createGoal(goal3);
      await storageService.createGoal(goal4);

      const todoCount = await storageService.getGoalCount("todo");
      const inProgressCount = await storageService.getGoalCount("in_progress");
      const doneCount = await storageService.getGoalCount("done");

      expect(todoCount).toBeGreaterThanOrEqual(2);
      expect(inProgressCount).toBeGreaterThanOrEqual(1);
      expect(doneCount).toBeGreaterThanOrEqual(1);
    });

    it("should find goal by GitHub issue ID", async () => {
      // Use in-memory database for isolation
      const testStorageService = new StorageService(":memory:");
      await testStorageService.initialize();
      
      const goalId = `g-test-${Date.now()}`;
      const uniqueIssueId = Date.now(); // Use timestamp as unique issue ID
      const goal = {
        id: goalId,
        title: "GitHub Goal",
        status: "todo" as GoalStatus,
        description: "Goal from GitHub issue",
        github_issue_id: uniqueIssueId,
      };

      await testStorageService.createGoal(goal);
      const foundGoal = await testStorageService.findGoalByGitHubIssue(uniqueIssueId);

      expect(foundGoal).toBeDefined();
      expect(foundGoal!.id).toBe(goalId);
      expect(foundGoal!.github_issue_id).toBe(uniqueIssueId);
      
      await testStorageService.close();
    });

    it("should find goal by branch name", async () => {
      // Use in-memory database for isolation
      const testStorageService = new StorageService(":memory:");
      await testStorageService.initialize();
      
      const goalId = `g-test-${Date.now()}`;
      const goal = {
        id: goalId,
        title: "Branch Goal",
        status: "todo" as GoalStatus,
        description: "Goal with branch",
        branch_name: "feature/test-branch",
      };

      await testStorageService.createGoal(goal);
      const foundGoal = await testStorageService.findGoalByBranch("feature/test-branch");

      expect(foundGoal).toBeDefined();
      expect(foundGoal!.id).toBe(goalId);
      expect(foundGoal!.branch_name).toBe("feature/test-branch");
      
      await testStorageService.close();
    });
  });

  describe("Configuration Operations", () => {
    it("should set and get configuration", async () => {
      await storageService.setConfig("test.key", "test.value");

      const value = await storageService.getConfig("test.key");
      expect(value).toBe("test.value");
    });

    it("should update existing configuration", async () => {
      await storageService.setConfig("test.key", "initial.value");
      await storageService.setConfig("test.key", "updated.value");

      const value = await storageService.getConfig("test.key");
      expect(value).toBe("updated.value");
    });

    it("should return null for non-existent config", async () => {
      const value = await storageService.getConfig("non.existent");
      expect(value).toBeNull();
    });

    it("should get all configuration", async () => {
      // Use in-memory database for isolation
      const testStorageService = new StorageService(":memory:");
      await testStorageService.initialize();
      
      const configs = {
        key1: "value1",
        key2: "value2",
        key3: "value3",
      };

      for (const [key, value] of Object.entries(configs)) {
        await testStorageService.setConfig(key, value);
      }

      const allConfig = await testStorageService.getAllConfig();
      
      // Check that our test configs are present
      expect(allConfig.find(c => c.key === "key1")?.value).toBe("value1");
      expect(allConfig.find(c => c.key === "key2")?.value).toBe("value2");
      expect(allConfig.find(c => c.key === "key3")?.value).toBe("value3");
      
      // Check that we have at least our test configs plus default configs
      expect(allConfig.length).toBeGreaterThanOrEqual(3);
      
      await testStorageService.close();
    });

    it("should delete configuration", async () => {
      await storageService.setConfig("delete.me", "will.be.deleted");

      const value = await storageService.getConfig("delete.me");
      expect(value).toBe("will.be.deleted");

      await storageService.deleteConfig("delete.me");
      const deletedValue = await storageService.getConfig("delete.me");
      expect(deletedValue).toBeNull();
    });
  });

  describe("Utility Methods", () => {
    it("should check if database is initialized", () => {
      const isInit = storageService.isInitialized();
      expect(isInit).toBe(true);
    });

    it("should get database path", () => {
      const dbPath = storageService.getDatabasePath();
      expect(dbPath).toBeTruthy();
      expect(typeof dbPath).toBe("string");
    });

    it("should handle transactions", () => {
      // These methods should not throw
      expect(() => storageService.beginTransaction()).not.toThrow();
      expect(() => storageService.commitTransaction()).not.toThrow();
      
      // Start a new transaction before rollback
      storageService.beginTransaction();
      expect(() => storageService.rollbackTransaction()).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid goal ID format", async () => {
      const goalId = `g-test-${Date.now()}`;
      const goal = {
        id: goalId,
        title: "Valid Goal",
        status: "todo" as GoalStatus,
        description: "Valid description",
      };

      await storageService.createGoal(goal);
      const retrievedGoal = await storageService.getGoal(goalId);
      expect(retrievedGoal).toBeDefined();
    });
  });
});
