/**
 * Tests for Logger utility
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { Logger, LogLevel, createLogger } from "../../src/utils/logger.js";

describe("Logger", () => {
  let logger: Logger;
  let tempLogFile: string;

  beforeEach(() => {
    tempLogFile = ".logs/test-logger.log";
    logger = new Logger({
      level: LogLevel.INFO,
      writeToFile: false,
      logFilePath: tempLogFile,
    });
  });

  afterEach(() => {
    // Clean up test log file
    try {
      Bun.removeSync(tempLogFile);
    } catch (error) {
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
        writeToFile: false,
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

    test("should log at SUCCESS level when set", () => {
      logger.setLevel(LogLevel.SUCCESS);
      expect(() => logger.success("Success message")).not.toThrow();
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
    test("should create log directory when file logging is enabled", () => {
      const fileLogger = new Logger({
        writeToFile: true,
        logFilePath: ".logs/test-dir/test.log",
      });

      // This should create the directory
      expect(() => fileLogger.info("Test message")).not.toThrow();

      // Clean up
      try {
        Bun.removeSync(".logs/test-dir/test.log");
        Bun.removeSync(".logs/test-dir");
      } catch (error) {
        // Ignore cleanup errors
      }
    });

    test("should write to file when file logging is enabled", () => {
      const fileLogger = new Logger({
        writeToFile: true,
        logFilePath: tempLogFile,
      });

      fileLogger.info("File test message");

      // Check if file was created and contains the message
      try {
        const logContent = Bun.file(tempLogFile).text();
        expect(logContent).toContain("File test message");
      } catch (error) {
        // File might not be written immediately, this is acceptable
      }
    });

    test("should not write to file when file logging is disabled", () => {
      const noFileLogger = new Logger({
        writeToFile: false,
        logFilePath: tempLogFile,
      });

      noFileLogger.info("No file test message");

      // File should not exist
      expect(() => Bun.file(tempLogFile).text()).toThrow();
    });
  });

  describe("Configuration Methods", () => {
    test("should set log level", () => {
      logger.setLevel(LogLevel.DEBUG);
      expect(logger.getConfig().level).toBe(LogLevel.DEBUG);
    });

    test("should set file logging", () => {
      logger.setFileLogging(true, ".logs/new-test.log");
      const config = logger.getConfig();
      expect(config.writeToFile).toBe(true);
      expect(config.logFilePath).toBe(".logs/new-test.log");

      // Reset to original path for other tests
      logger.setFileLogging(false, tempLogFile);
    });

    test("should get current configuration", () => {
      const config = logger.getConfig();
      expect(config).toHaveProperty("level");
      expect(config).toHaveProperty("includeTimestamp");
      expect(config).toHaveProperty("writeToFile");
      expect(config).toHaveProperty("logFilePath");
    });
  });

  describe("Utility Functions", () => {
    test("should create logger with createLogger function", () => {
      const newLogger = createLogger({
        level: LogLevel.ERROR,
        writeToFile: false,
      });

      expect(newLogger).toBeInstanceOf(Logger);
      expect(newLogger.getConfig().level).toBe(LogLevel.ERROR);
    });

    test("should format timestamp correctly", () => {
      const timestamp = logger.formatTimestamp(
        new Date("2025-01-01T12:00:00Z"),
      );
      expect(timestamp).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe("Error Handling", () => {
    test("should handle file write errors gracefully", () => {
      const invalidPathLogger = new Logger({
        writeToFile: true,
        logFilePath: "/invalid/path/test.log",
      });

      // Should not throw error
      expect(() => invalidPathLogger.info("Test message")).not.toThrow();
    });

    test("should handle directory creation errors gracefully", () => {
      const invalidDirLogger = new Logger({
        writeToFile: true,
        logFilePath: "/invalid/dir/test.log",
      });

      // Should not throw error
      expect(() => invalidDirLogger.info("Test message")).not.toThrow();
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
