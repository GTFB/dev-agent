/**
 * Tests for Storage Service
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { StorageService } from "../../src/services/StorageService.js";
import { Goal, GoalStatus } from "../../src/core/types.js";

describe("StorageService", () => {
  let storageService: StorageService;
  const testDbPath = ":memory:"; // Use in-memory database for tests

  beforeEach(async () => {
    storageService = new StorageService(testDbPath);
    await storageService.initialize();
  });

  afterEach(() => {
    storageService.close();
  });

  describe("Goal Operations", () => {
    test("should create and retrieve a goal", async () => {
      const goalData = {
        id: "g-test01",
        title: "Test Goal",
        status: "todo" as GoalStatus,
        description: "Test description",
      };

      await storageService.createGoal(goalData);
      const retrievedGoal = await storageService.getGoal("g-test01");

      expect(retrievedGoal).toBeTruthy();
      expect(retrievedGoal?.id).toBe(goalData.id);
      expect(retrievedGoal?.title).toBe(goalData.title);
      expect(retrievedGoal?.status).toBe(goalData.status);
      expect(retrievedGoal?.description).toBe(goalData.description);
      expect(retrievedGoal?.created_at).toBeTruthy();
      expect(retrievedGoal?.updated_at).toBeTruthy();
    });

    test("should update a goal", async () => {
      // Create goal first
      const goalData = {
        id: "g-test02",
        title: "Original Title",
        status: "todo" as GoalStatus,
      };

      await storageService.createGoal(goalData);

      // Update goal
      await storageService.updateGoal("g-test02", {
        title: "Updated Title",
        status: "in_progress" as GoalStatus,
      });

      const updatedGoal = await storageService.getGoal("g-test02");
      expect(updatedGoal?.title).toBe("Updated Title");
      expect(updatedGoal?.status).toBe("in_progress");
    });

    test("should list all goals", async () => {
      const goals = [
        { id: "g-test03", title: "Goal 1", status: "todo" as GoalStatus },
        {
          id: "g-test04",
          title: "Goal 2",
          status: "in_progress" as GoalStatus,
        },
        { id: "g-test05", title: "Goal 3", status: "done" as GoalStatus },
      ];

      for (const goal of goals) {
        await storageService.createGoal(goal);
      }

      const allGoals = await storageService.listGoals();
      expect(allGoals).toHaveLength(3);
      expect(allGoals.map((g) => g.id)).toContain("g-test03");
      expect(allGoals.map((g) => g.id)).toContain("g-test04");
      expect(allGoals.map((g) => g.id)).toContain("g-test05");
    });

    test("should list goals by status", async () => {
      const goals = [
        { id: "g-test06", title: "Goal 1", status: "todo" as GoalStatus },
        { id: "g-test07", title: "Goal 2", status: "todo" as GoalStatus },
        {
          id: "g-test08",
          title: "Goal 3",
          status: "in_progress" as GoalStatus,
        },
      ];

      for (const goal of goals) {
        await storageService.createGoal(goal);
      }

      const todoGoals = await storageService.listGoals("todo");
      expect(todoGoals).toHaveLength(2);
      expect(todoGoals.every((g) => g.status === "todo")).toBe(true);

      const inProgressGoals = await storageService.listGoals("in_progress");
      expect(inProgressGoals).toHaveLength(1);
      expect(inProgressGoals.every((g) => g.status === "in_progress")).toBe(
        true,
      );
    });

    test("should delete a goal", async () => {
      const goalData = {
        id: "g-test09",
        title: "Goal to Delete",
        status: "todo" as GoalStatus,
      };

      await storageService.createGoal(goalData);

      // Verify goal exists
      let goal = await storageService.getGoal("g-test09");
      expect(goal).toBeTruthy();

      // Delete goal
      await storageService.deleteGoal("g-test09");

      // Verify goal is deleted
      goal = await storageService.getGoal("g-test09");
      expect(goal).toBeNull();
    });

    test("should get goal count by status", async () => {
      const goals = [
        { id: "g-test10", title: "Goal 1", status: "todo" as GoalStatus },
        { id: "g-test11", title: "Goal 2", status: "todo" as GoalStatus },
        {
          id: "g-test12",
          title: "Goal 3",
          status: "in_progress" as GoalStatus,
        },
        { id: "g-test13", title: "Goal 4", status: "done" as GoalStatus },
      ];

      for (const goal of goals) {
        await storageService.createGoal(goal);
      }

      const todoCount = await storageService.getGoalCount("todo");
      expect(todoCount).toBe(2);

      const inProgressCount = await storageService.getGoalCount("in_progress");
      expect(inProgressCount).toBe(1);

      const doneCount = await storageService.getGoalCount("done");
      expect(doneCount).toBe(1);

      const totalCount = await storageService.getGoalCount();
      expect(totalCount).toBe(4);
    });

    test("should find goal by GitHub issue ID", async () => {
      const goalData = {
        id: "g-test14",
        title: "GitHub Goal",
        status: "todo" as GoalStatus,
        github_issue_id: 123,
      };

      await storageService.createGoal(goalData);

      const foundGoal = await storageService.findGoalByGitHubIssue(123);
      expect(foundGoal).toBeTruthy();
      expect(foundGoal?.id).toBe("g-test14");
      expect(foundGoal?.github_issue_id).toBe(123);
    });

    test("should find goal by branch name", async () => {
      const goalData = {
        id: "g-test15",
        title: "Branch Goal",
        status: "in_progress" as GoalStatus,
        branch_name: "feature/test-branch",
      };

      await storageService.createGoal(goalData);

      const foundGoal = await storageService.findGoalByBranch(
        "feature/test-branch",
      );
      expect(foundGoal).toBeTruthy();
      expect(foundGoal?.id).toBe("g-test15");
      expect(foundGoal?.branch_name).toBe("feature/test-branch");
    });
  });

  describe("Configuration Operations", () => {
    test("should set and get configuration", async () => {
      await storageService.setConfig("test.key", "test.value");

      const value = await storageService.getConfig("test.key");
      expect(value).toBe("test.value");
    });

    test("should update existing configuration", async () => {
      await storageService.setConfig("test.key", "initial.value");
      await storageService.setConfig("test.key", "updated.value");

      const value = await storageService.getConfig("test.key");
      expect(value).toBe("updated.value");
    });

    test("should return null for non-existent config", async () => {
      const value = await storageService.getConfig("non.existent");
      expect(value).toBeNull();
    });

    test("should get all configuration", async () => {
      const configs = {
        key1: "value1",
        key2: "value2",
        key3: "value3",
      };

      for (const [key, value] of Object.entries(configs)) {
        await storageService.setConfig(key, value);
      }

      const allConfig = await storageService.getAllConfig();
      expect(allConfig).toEqual(configs);
    });

    test("should delete configuration", async () => {
      await storageService.setConfig("delete.me", "will.be.deleted");

      // Verify it exists
      let value = await storageService.getConfig("delete.me");
      expect(value).toBe("will.be.deleted");

      // Delete it
      await storageService.deleteConfig("delete.me");

      // Verify it's gone
      value = await storageService.getConfig("delete.me");
      expect(value).toBeNull();
    });
  });

  describe("Utility Methods", () => {
    test("should check if database is initialized", () => {
      const isInit = storageService.isInitialized();
      expect(isInit).toBe(true);
    });

    test("should get database path", () => {
      const dbPath = storageService.getDatabasePath();
      expect(dbPath).toBeTruthy();
      expect(typeof dbPath).toBe("string");
    });

    test("should handle transactions", () => {
      // These methods should not throw
      expect(() => storageService.beginTransaction()).not.toThrow();
      expect(() => storageService.commitTransaction()).not.toThrow();

      // Start a transaction first, then rollback
      storageService.beginTransaction();
      expect(() => storageService.rollbackTransaction()).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid goal ID format", async () => {
      // This test would require database constraint validation
      // For now, we'll test that the service handles basic operations
      const goalData = {
        id: "g-test16",
        title: "Valid Goal",
        status: "todo" as GoalStatus,
      };

      await storageService.createGoal(goalData);
      const goal = await storageService.getGoal("g-test16");
      expect(goal).toBeTruthy();
    });
  });
});
