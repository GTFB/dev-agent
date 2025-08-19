/**
 * Logger utility for Dev Agent
 * Provides consistent logging with different levels and formatting
 */

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /** Minimum log level to display */
  level: LogLevel;
  /** Whether to include timestamps */
  includeTimestamp: boolean;
  /** Whether to write errors to log file */
  writeToFile: boolean;
  /** Log file path */
  logFilePath?: string;
}

/**
 * Logger class
 */
export class Logger {
  private config: LoggerConfig;
  private logFile: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      includeTimestamp: true,
      writeToFile: true,
      logFilePath: ".logs/dev-agent.log",
      ...config,
    };

    this.logFile = this.config.logFilePath || ".logs/dev-agent.log";

    // Ensure logs directory exists
    if (this.config.writeToFile) {
      this.ensureLogDirectory();
    }
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    try {
      const logDir = this.logFile.split("/").slice(0, -1).join("/");
      if (logDir) {
        Bun.write(`${logDir}/.gitkeep`, "");
      }
    } catch (error) {
      // Ignore errors, logging should not break the application
    }
  }

  /**
   * Format timestamp
   */
  private formatTimestamp(): string {
    if (!this.config.includeTimestamp) return "";
    return `[${new Date().toISOString()}] `;
  }

  /**
   * Write to log file
   */
  private async writeToFile(level: string, message: string): Promise<void> {
    if (!this.config.writeToFile) return;

    try {
      const logEntry = `${this.formatTimestamp()}[${level}] ${message}\n`;
      await Bun.write(this.logFile, logEntry, { append: true });
    } catch (error) {
      // Don't throw, just log to console
      console.error("Failed to write to log file:", error);
    }
  }

  /**
   * Log debug message
   */
  debug(message: string, ...args: any[]): void {
    if (this.config.level <= LogLevel.DEBUG) {
      const formattedMessage = `[DEBUG] ${message}`;
      console.debug(this.formatTimestamp() + formattedMessage, ...args);
    }
  }

  /**
   * Log info message
   */
  info(message: string, ...args: any[]): void {
    if (this.config.level <= LogLevel.INFO) {
      const formattedMessage = `[INFO] ${message}`;
      console.info(this.formatTimestamp() + formattedMessage, ...args);
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, ...args: any[]): void {
    if (this.config.level <= LogLevel.WARN) {
      const formattedMessage = `[WARN] ${message}`;
      console.warn(this.formatTimestamp() + formattedMessage, ...args);
      this.writeToFile("WARN", message);
    }
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, ...args: any[]): void {
    if (this.config.level <= LogLevel.ERROR) {
      const formattedMessage = `[ERROR] ${message}`;
      console.error(this.formatTimestamp() + formattedMessage, ...args);

      if (error) {
        console.error("Error details:", error.message);
        if (error.stack) {
          console.error("Stack trace:", error.stack);
        }
      }

      // Always write errors to log file
      this.writeToFile("ERROR", message);
      if (error) {
        this.writeToFile(
          "ERROR",
          `Error: ${error.message}\nStack: ${error.stack || "No stack trace"}`,
        );
      }
    }
  }

  /**
   * Log success message
   */
  success(message: string, ...args: any[]): void {
    if (this.config.level <= LogLevel.INFO) {
      const formattedMessage = `[SUCCESS] ${message}`;
      console.log(this.formatTimestamp() + formattedMessage, ...args);
    }
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Enable/disable file logging
   */
  setFileLogging(enabled: boolean, logFilePath?: string): void {
    this.config.writeToFile = enabled;
    if (logFilePath) {
      this.config.logFilePath = logFilePath;
      this.logFile = logFilePath;
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Create logger with specific configuration
 */
export function createLogger(config: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}
