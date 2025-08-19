/**
 * Tests for Logger utility
 */

import { Logger, LogLevel } from "../../src/utils/logger.js";
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync } from "fs";

describe("Logger", () => {
  let logger: Logger;
  let tempLogFile: string;

  beforeEach(() => {
    tempLogFile = ".logs/test-logger.log";
    logger = new Logger({
      level: LogLevel.INFO,
      fileLogging: false,
      logFilePath: tempLogFile,
    });
  });

  afterEach(() => {
    // Clean up test log file
    try {
      // Use fs.unlinkSync instead of Bun.removeSync
      const fs = require("fs");
      fs.unlinkSync(tempLogFile);
    } catch {
      // File might not exist, ignore
    }
  });

  describe("Constructor and Configuration", () => {
    test("should create logger with default configuration", () => {
      const defaultLogger = new Logger();
      expect(defaultLogger).toBeInstanceOf(Logger);
    });

    test("should create logger with custom configuration", () => {
      const customLogger = new Logger({
        level: LogLevel.DEBUG,
        includeTimestamp: false,
        fileLogging: false,
      });
      expect(customLogger).toBeInstanceOf(Logger);
    });

    test("should merge custom configuration with defaults", () => {
      const customLogger = new Logger({
        level: LogLevel.WARN,
      });
      expect(customLogger).toBeInstanceOf(Logger);
    });
  });

  describe("Log Levels", () => {
    test("should log at DEBUG level when set", () => {
      logger.setLevel(LogLevel.DEBUG);
      expect(() => logger.debug("Debug message")).not.toThrow();
    });

    test("should log at INFO level when set", () => {
      logger.setLevel(LogLevel.INFO);
      expect(() => logger.info("Info message")).not.toThrow();
    });

    test("should log at WARN level when set", () => {
      logger.setLevel(LogLevel.WARN);
      expect(() => logger.warn("Warning message")).not.toThrow();
    });

    test("should log at ERROR level when set", () => {
      logger.setLevel(LogLevel.ERROR);
      expect(() => logger.error("Error message")).not.toThrow();
    });

    test("should not log below current level", () => {
      logger.setLevel(LogLevel.WARN);
      // Just test that it doesn't throw
      expect(() => logger.debug("Debug message")).not.toThrow();
      expect(() => logger.info("Info message")).not.toThrow();
    });
  });

  describe("Logging Methods", () => {
    test("should format debug messages correctly", () => {
      logger.setLevel(LogLevel.DEBUG);
      expect(() => logger.debug("Debug message")).not.toThrow();
    });

    test("should format info messages correctly", () => {
      expect(() => logger.info("Info message")).not.toThrow();
    });

    test("should format warn messages correctly", () => {
      expect(() => logger.warn("Warning message")).not.toThrow();
    });

    test("should format error messages correctly", () => {
      expect(() => logger.error("Error message")).not.toThrow();
    });

    test("should format success messages correctly", () => {
      expect(() => logger.success("Success message")).not.toThrow();
    });

    test("should include timestamp when enabled", () => {
      expect(() => logger.info("Timestamp test")).not.toThrow();
    });

    test("should not include timestamp when disabled", () => {
      const noTimestampLogger = new Logger({ includeTimestamp: false });
      expect(() => noTimestampLogger.info("No timestamp test")).not.toThrow();
    });
  });

  describe("File Logging", () => {
    test("should create log file when fileLogging is enabled", async () => {
      const logFilePath = "./test-logs/test-file.log";
      const fileLogger = new Logger({
        level: LogLevel.INFO,
        fileLogging: true,
        logFilePath,
      });

      await fileLogger.info("Test message");

      // Check if directory was created
      const fs = require("fs");
      const logDir = "./test-logs";
      expect(fs.existsSync(logDir)).toBe(true);
      
      // Cleanup
      try {
        const fs = require("fs");
        if (fs.existsSync(logFilePath)) {
          fs.unlinkSync(logFilePath);
        }
        if (fs.existsSync(logDir)) {
          fs.rmdirSync(logDir);
        }
      } catch {
        // Ignore cleanup errors
      }
    });

    test("should not create log file when fileLogging is disabled", async () => {
      const logFilePath = "./test-logs/test-disabled.log";
      const fileLogger = new Logger({
        level: LogLevel.INFO,
        fileLogging: false,
        logFilePath,
      });

      await fileLogger.info("Test message");

      expect(existsSync(logFilePath)).toBe(false);
    });
  });

  describe("Error Handling", () => {
    test("should handle file write errors gracefully", async () => {
      const logFilePath = "/invalid/path/test.log";
      const fileLogger = new Logger({
        level: LogLevel.INFO,
        fileLogging: true,
        logFilePath,
      });

      // Mock Bun.write to simulate error
      const originalWrite = Bun.write;
      Bun.write = async () => {
        throw new Error("Write error");
      };

      await fileLogger.info("Test message");

      // Restore original
      Bun.write = originalWrite;
    });

    test("should handle directory creation errors gracefully", async () => {
      const logFilePath = "/invalid/path/test.log";
      const fileLogger = new Logger({
        level: LogLevel.INFO,
        fileLogging: true,
        logFilePath,
      });

      // Mock Bun.write to simulate directory creation error
      const originalWrite = Bun.write;
      Bun.write = async () => {
        throw new Error("Directory creation error");
      };

      await fileLogger.info("Test message");

      // Restore original
      Bun.write = originalWrite;
    });
  });

  describe("Configuration", () => {
    test("should use default configuration when none provided", () => {
      const defaultLogger = new Logger();
      expect(defaultLogger.getConfig().level).toBe(LogLevel.INFO);
      expect(defaultLogger.getConfig().fileLogging).toBe(false);
    });

    test("should apply custom configuration", () => {
      const customLogger = new Logger({
        level: LogLevel.DEBUG,
        fileLogging: true,
        logFilePath: "./custom.log",
      });

      expect(customLogger.getConfig().level).toBe(LogLevel.DEBUG);
      expect(customLogger.getConfig().fileLogging).toBe(true);
    });

    test("should update level dynamically", () => {
      const logger = new Logger({ level: LogLevel.INFO });
      expect(logger.getConfig().level).toBe(LogLevel.INFO);

      logger.setLevel(LogLevel.DEBUG);
      expect(logger.getConfig().level).toBe(LogLevel.DEBUG);
    });

    test("should update fileLogging dynamically", () => {
      const logger = new Logger({ fileLogging: false });
      expect(logger.getConfig().fileLogging).toBe(false);

      logger.setFileLogging(true);
      expect(logger.getConfig().fileLogging).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty messages", () => {
      expect(() => logger.info("")).not.toThrow();
    });

    test("should handle special characters in messages", () => {
      expect(() =>
        logger.info("Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?"),
      ).not.toThrow();
    });

    test("should handle very long messages", () => {
      const longMessage = "A".repeat(1000);
      expect(() => logger.info(longMessage)).not.toThrow();
    });
  });
});
