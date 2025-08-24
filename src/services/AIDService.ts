/**
 * AID Service for Dev Agent
 * Integrates AID generator with database for uniqueness checking
 */

import { AIDGenerator, AIDConfig, AIDPrefix } from "../core/aid-generator.js";
import { StorageService } from "./StorageService.js";
import { logger } from "../utils/logger.js";

/**
 * AID Service class
 */
export class AIDService {
  private generator: AIDGenerator;
  private storage: StorageService;

  constructor(storage: StorageService, config?: Partial<AIDConfig>) {
    this.storage = storage;
    this.generator = new AIDGenerator(config);
  }

  /**
   * Check if AID is unique in database
   */
  private async checkDatabaseUniqueness(aid: string): Promise<boolean> {
    try {
      // Check if goal with this ID exists
      const existingGoal = await this.storage.getGoal(aid);
      if (existingGoal) {
        return false;
      }

      // Check if any other entity with this ID exists
      // For now, we only have goals, but this can be extended
      // when other entity types are added
      
      return true;
    } catch (error) {
      logger.warn(`Failed to check database uniqueness for ${aid}:`, error as Error);
      // If we can't check, assume it's unique to avoid blocking
      return true;
    }
  }

  /**
   * Generate unique goal ID with database uniqueness checking
   */
  async generateUniqueGoalId(): Promise<string> {
    try {
      const goalId = await this.generator.generateGoalId(
        (id: string) => this.checkDatabaseUniqueness(id)
      );
      
      logger.debug(`Generated unique goal ID: ${goalId}`);
      return goalId;
    } catch (error) {
      logger.error("Failed to generate unique goal ID", error as Error);
      throw error;
    }
  }

  /**
   * Generate unique document ID with database uniqueness checking
   */
  async generateUniqueDocumentId(): Promise<string> {
    try {
      const documentId = await this.generator.generateUniqueEntityId(
        "d",
        (id: string) => this.checkDatabaseUniqueness(id)
      );
      
      logger.debug(`Generated unique document ID: ${documentId}`);
      return documentId;
    } catch (error) {
      logger.error("Failed to generate unique document ID", error as Error);
      throw error;
    }
  }

  /**
   * Generate unique file ID with database uniqueness checking
   */
  async generateUniqueFileId(): Promise<string> {
    try {
      const fileId = await this.generator.generateUniqueEntityId(
        "f",
        (id: string) => this.checkDatabaseUniqueness(id)
      );
      
      logger.debug(`Generated unique file ID: ${fileId}`);
      return fileId;
    } catch (error) {
      logger.error("Failed to generate unique file ID", error as Error);
      throw error;
    }
  }

  /**
   * Generate unique API endpoint ID with database uniqueness checking
   */
  async generateUniqueApiId(): Promise<string> {
    try {
      const apiId = await this.generator.generateUniqueEntityId(
        "a",
        (id: string) => this.checkDatabaseUniqueness(id)
      );
      
      logger.debug(`Generated unique API ID: ${apiId}`);
      return apiId;
    } catch (error) {
      logger.error("Failed to generate unique API ID", error as Error);
      throw error;
    }
  }

  /**
   * Generate unique script ID with database uniqueness checking
   */
  async generateUniqueScriptId(): Promise<string> {
    try {
      const scriptId = await this.generator.generateUniqueEntityId(
        "s",
        (id: string) => this.checkDatabaseUniqueness(id)
      );
      
      logger.debug(`Generated unique script ID: ${scriptId}`);
      return scriptId;
    } catch (error) {
      logger.error("Failed to generate unique script ID", error as Error);
      throw error;
    }
  }

  /**
   * Generate unique prompt ID with database uniqueness checking
   */
  async generateUniquePromptId(): Promise<string> {
    try {
      const promptId = await this.generator.generateUniqueEntityId(
        "p",
        (id: string) => this.checkDatabaseUniqueness(id)
      );
      
      logger.debug(`Generated unique prompt ID: ${promptId}`);
      return promptId;
    } catch (error) {
      logger.error("Failed to generate unique prompt ID", error as Error);
      throw error;
    }
  }

  /**
   * Generate unique entity ID with custom prefix and database uniqueness checking
   */
  async generateUniqueEntityId(
    prefix: string,
    customUniquenessCheck?: (id: string) => Promise<boolean>
  ): Promise<string> {
    try {
      const checkFunction = customUniquenessCheck || 
        ((id: string) => this.checkDatabaseUniqueness(id));
      
      const entityId = await this.generator.generateUniqueEntityId(prefix, checkFunction);
      
      logger.debug(`Generated unique entity ID: ${entityId}`);
      return entityId;
    } catch (error) {
      logger.error(`Failed to generate unique entity ID with prefix ${prefix}`, error as Error);
      throw error;
    }
  }

  /**
   * Validate AID format and check if it's unique in database
   */
  async validateAndCheckUniqueness(aid: string): Promise<{
    isValid: boolean;
    isUnique: boolean;
    prefix?: string;
    entityType?: string;
  }> {
    try {
      // Import validation functions
      const { isValidAID, getAIDPrefix, getEntityTypeDescription } = await import("../core/aid-generator.js");
      
      if (!isValidAID(aid)) {
        return { isValid: false, isUnique: false };
      }

      const prefix = getAIDPrefix(aid);
      const entityType = getEntityTypeDescription(aid);
      const isUnique = await this.checkDatabaseUniqueness(aid);

      return {
        isValid: true,
        isUnique,
        prefix: prefix || undefined,
        entityType,
      };
    } catch (error) {
      logger.error(`Failed to validate AID ${aid}`, error as Error);
      return { isValid: false, isUnique: false };
    }
  }

  /**
   * Get AID generator statistics
   */
  getGeneratorStats(): {
    config: AIDConfig;
    counters: Record<AIDPrefix, number>;
    sessionCacheSize: number;
  } {
    const counters: Record<AIDPrefix, number> = {} as Record<AIDPrefix, number>;
    Object.keys(this.generator["counter"]).forEach((prefix) => {
      counters[prefix as AIDPrefix] = this.generator.getCounter(prefix as AIDPrefix);
    });

    return {
      config: this.generator.getConfig(),
      counters,
      sessionCacheSize: this.generator["usedIds"].size,
    };
  }

  /**
   * Reset AID generator state
   */
  resetGenerator(): void {
    this.generator.resetCounters();
    this.generator.clearCache();
    logger.info("AID generator state reset");
  }

  /**
   * Update AID generator configuration
   */
  updateGeneratorConfig(newConfig: Partial<AIDConfig>): void {
    this.generator.updateConfig(newConfig);
    logger.info("AID generator configuration updated", newConfig);
  }
}
