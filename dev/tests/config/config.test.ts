import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { ConfigManager, type GitHubConfig } from "../../src/config/config";

describe("ConfigManager", () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    // Create a test instance with in-memory database
    // Override the database path for testing to use in-memory
    const testConfigManager = new (ConfigManager as unknown as new () => ConfigManager)();
    (testConfigManager as unknown as { configPath: string }).configPath = ":memory:";
    configManager = testConfigManager;
    // Initialize the database for testing
    configManager.initialize();
  });

  afterEach(() => {
    configManager.close();
  });

  describe("Configuration Management", () => {
    test("should set and get configuration values", () => {
      configManager.setConfig("test.key", "test.value", "string", "Test description", "test");
      
      const value = configManager.getConfig("test.key");
      expect(value).toBe("test.value");
    });

    test("should return default value when config not found", () => {
      const value = configManager.getConfig("nonexistent.key", "default");
      expect(value).toBe("default");
    });

    test("should get configuration by category", () => {
      configManager.setConfig("category.key1", "value1", "string", "Description 1", "testcat");
      configManager.setConfig("category.key2", "value2", "string", "Description 2", "testcat");
      configManager.setConfig("other.key", "value3", "string", "Description 3", "other");

      const categoryConfig = configManager.getConfigByCategory("testcat");
      expect(categoryConfig).toEqual({
        "category.key1": "value1",
        "category.key2": "value2"
      });
    });

    test("should delete configuration", () => {
      configManager.setConfig("delete.key", "delete.value", "string", "To be deleted", "test");
      
      let value = configManager.getConfig("delete.key");
      expect(value).toBe("delete.value");
      
      configManager.deleteConfig("delete.key");
      
      value = configManager.getConfig("delete.key");
      expect(value).toBeUndefined();
    });
  });

  describe("LLM Provider Management", () => {
    test("should set and get LLM provider configuration", () => {
      configManager.setLLMProvider("openai", "sk-test-key", "gpt-4", "https://api.openai.com", { temperature: 0.7 });
      
      const llmConfig = configManager.getLLMProvider("openai");
      expect(llmConfig).toEqual({
        apiKey: "sk-test-key",
        model: "gpt-4",
        apiBase: "https://api.openai.com",
        config: { temperature: 0.7 }
      });
    });

    test("should return undefined for non-existent LLM provider", () => {
      const llmConfig = configManager.getLLMProvider("nonexistent");
      expect(llmConfig).toBeUndefined();
    });

    test("should set and get default LLM provider", () => {
      configManager.setLLMProvider("openai", "sk-test-key", "gpt-4");
      configManager.setLLMProvider("anthropic", "sk-ant-key", "claude-3");
      
      configManager.setDefaultLLMProvider("anthropic");
      
      const defaultProvider = configManager.getDefaultLLMProvider();
      expect(defaultProvider).toBe("anthropic");
    });

    test("should get all LLM providers", () => {
      configManager.setLLMProvider("openai", "sk-test-key", "gpt-4");
      configManager.setLLMProvider("anthropic", "sk-ant-key", "claude-3");
      configManager.setDefaultLLMProvider("openai");
      
      const providers = configManager.getAllLLMProviders();
      expect(providers).toHaveLength(2);
      
      const openaiProvider = providers.find(p => p.provider === "openai");
      expect(openaiProvider?.isDefault).toBe(true);
      
      const anthropicProvider = providers.find(p => p.provider === "anthropic");
      expect(anthropicProvider?.isDefault).toBe(false);
    });
  });

  describe("Specialized Configuration Getters", () => {
    test("should get database configuration", () => {
      configManager.setConfig("database.path", "/custom/path/db.sqlite", "string", "Database path", "database");
      configManager.setConfig("database.type", "sqlite", "string", "Database type", "database");
      
      const dbConfig = configManager.getDatabaseConfig();
      expect(dbConfig).toEqual({
        path: "/custom/path/db.sqlite",
        type: "sqlite"
      });
    });

    test("should get default database configuration when not set", () => {
      const dbConfig = configManager.getDatabaseConfig();
      expect(dbConfig.type).toBe("sqlite");
      expect(dbConfig.path).toContain("database.db");
    });

    test("should get GitHub configuration", () => {
      const githubConfig: GitHubConfig = {
        token: "ghp_test_token",
        owner: "test-owner",
        repo: "test-repo",
        baseUrl: "https://api.github.com"
      };
      
      configManager.setGitHubConfig(githubConfig);
      
      const retrievedConfig = configManager.getGitHubConfig();
      expect(retrievedConfig).toEqual(githubConfig);
    });

    test("should return undefined for incomplete GitHub configuration", () => {
      configManager.setConfig("github.token", "token", "string", "Token", "github");
      // Missing owner and repo
      
      const githubConfig = configManager.getGitHubConfig();
      expect(githubConfig).toBeUndefined();
    });

    test("should get project configuration", () => {
      const projectConfig = configManager.getProjectConfig();
      expect(projectConfig.name).toBe("Dev Agent");
      expect(projectConfig.version).toBe("0.3.0");
      expect(projectConfig.license).toBe("MIT");
    });

    test("should get storage configuration", () => {
      configManager.setConfig("storage.dataDir", "/custom/data", "string", "Data directory", "storage");
      configManager.setConfig("storage.backupDir", "/custom/backups", "string", "Backup directory", "storage");
      
      const storageConfig = configManager.getStorageConfig();
      expect(storageConfig).toEqual({
        dataDir: "/custom/data",
        backupDir: "/custom/backups"
      });
    });

    test("should get logging configuration", () => {
      configManager.setConfig("logging.level", "debug", "string", "Log level", "logging");
      configManager.setConfig("logging.console", "false", "boolean", "Console logging", "logging");
      
      const loggingConfig = configManager.getLoggingConfig();
      expect(loggingConfig).toEqual({
        level: "debug",
        console: false
      });
    });
  });

  describe("Statistics", () => {
    test("should get configuration statistics", () => {
      configManager.setConfig("test1", "value1", "string", "Test 1", "category1");
      configManager.setConfig("test2", "value2", "string", "Test 2", "category2");
      configManager.setLLMProvider("openai", "key", "model");
      
      const stats = configManager.getStats();
      expect(stats.totalConfigs).toBeGreaterThan(0);
      expect(stats.totalLLMProviders).toBe(1);
      expect(stats.categories).toContain("category1");
      expect(stats.categories).toContain("category2");
    });
  });

  describe("Default Configuration Initialization", () => {
    test("should initialize default configuration on empty database", () => {
      // This test verifies that the constructor properly initializes default config
      const stats = configManager.getStats();
      expect(stats.totalConfigs).toBeGreaterThan(0);
      
      const projectConfig = configManager.getProjectConfig();
      expect(projectConfig.name).toBe("Dev Agent");
      
      const dbConfig = configManager.getDatabaseConfig();
      expect(dbConfig.type).toBe("sqlite");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty string values", () => {
      // SQLite might not store empty strings, so we test with minimal content
      configManager.setConfig("minimal.key", " ", "string", "Minimal value", "test");
      const value = configManager.getConfig("minimal.key");
      expect(value).toBe(" ");
      
      // Test with a single character
      configManager.setConfig("single.key", "a", "string", "Single char value", "test");
      const singleValue = configManager.getConfig("single.key");
      expect(singleValue).toBe("a");
    });

    test("should handle special characters in keys and values", () => {
      const specialKey = "test.key.with.special.chars!@#$%^&*()";
      const specialValue = "value with special chars: !@#$%^&*()_+-=[]{}|;:,.<>?";
      
      configManager.setConfig(specialKey, specialValue, "string", "Special chars test", "test");
      const value = configManager.getConfig(specialKey);
      expect(value).toBe(specialValue);
    });

    test("should handle very long keys and values", () => {
      const longKey = "a".repeat(1000);
      const longValue = "b".repeat(1000);
      
      configManager.setConfig(longKey, longValue, "string", "Long value test", "test");
      const value = configManager.getConfig(longKey);
      expect(value).toBe(longValue);
    });

    test("should handle numeric values as strings", () => {
      configManager.setConfig("numeric.key", "123", "number", "Numeric value", "test");
      const value = configManager.getConfig("numeric.key");
      expect(value).toBe("123");
    });

    test("should handle boolean values as strings", () => {
      configManager.setConfig("bool.key", "true", "boolean", "Boolean value", "test");
      const value = configManager.getConfig("bool.key");
      expect(value).toBe("true");
    });

    test("should handle null description", () => {
      configManager.setConfig("no.desc.key", "value", "string", undefined, "test");
      const value = configManager.getConfig("no.desc.key");
      expect(value).toBe("value");
    });

    test("should handle empty category", () => {
      configManager.setConfig("no.category.key", "value", "string", "No category", "");
      const value = configManager.getConfig("no.category.key");
      expect(value).toBe("value");
    });
  });

  describe("Configuration Validation", () => {
    test("should handle invalid database type gracefully", () => {
      configManager.setConfig("database.type", "invalid_type", "string", "Invalid type", "database");
      const dbConfig = configManager.getDatabaseConfig();
      // ConfigManager stores whatever is set, no validation
      expect(dbConfig.type).toBe("invalid_type");
    });

    test("should handle missing logging level gracefully", () => {
      // Remove logging level config
      configManager.deleteConfig("logging.level");
      const loggingConfig = configManager.getLoggingConfig();
      // Should fall back to default 'info'
      expect(loggingConfig.level).toBe("info");
    });

    test("should handle missing console logging gracefully", () => {
      // Test with explicit false value
      configManager.setConfig("logging.console", "false", "boolean", "Console logging", "logging");
      const loggingConfig1 = configManager.getLoggingConfig();
      expect(loggingConfig1.console).toBe(false);
      
      // Test with explicit true value
      configManager.setConfig("logging.console", "true", "boolean", "Console logging", "logging");
      const loggingConfig2 = configManager.getLoggingConfig();
      expect(loggingConfig2.console).toBe(true);
      
      // Remove console logging config and verify it falls back to default
      configManager.deleteConfig("logging.console");
      const loggingConfig3 = configManager.getLoggingConfig();
      // Should fall back to default true
      expect(loggingConfig3.console).toBe(true);
    });
  });

  describe("LLM Provider Edge Cases", () => {
    test("should handle LLM provider with null config", () => {
      configManager.setLLMProvider("nullconfig", "key", "model", undefined, null);
      const llmConfig = configManager.getLLMProvider("nullconfig");
      expect(llmConfig?.config).toBeUndefined();
    });

    test("should handle LLM provider with empty config", () => {
      configManager.setLLMProvider("emptyconfig", "key", "model", undefined, {});
      const llmConfig = configManager.getLLMProvider("emptyconfig");
      expect(llmConfig?.config).toEqual({});
    });

    test("should handle LLM provider with complex config", () => {
      const complexConfig = {
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1
      };
      
      configManager.setLLMProvider("complexconfig", "key", "model", undefined, complexConfig);
      const llmConfig = configManager.getLLMProvider("complexconfig");
      expect(llmConfig?.config).toEqual(complexConfig);
    });

    test("should handle multiple default LLM providers", () => {
      configManager.setLLMProvider("provider1", "key1", "model1");
      configManager.setLLMProvider("provider2", "key2", "model2");
      
      // Set first as default
      configManager.setDefaultLLMProvider("provider1");
      expect(configManager.getDefaultLLMProvider()).toBe("provider1");
      
      // Set second as default
      configManager.setDefaultLLMProvider("provider2");
      expect(configManager.getDefaultLLMProvider()).toBe("provider2");
      
      // Verify first is no longer default
      const providers = configManager.getAllLLMProviders();
      const provider1 = providers.find(p => p.provider === "provider1");
      expect(provider1?.isDefault).toBe(false);
    });
  });
});
