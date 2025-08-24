#!/usr/bin/env bun

/**
 * Task Validator and Plan Generator
 * 
 * This script validates new tasks against project architecture, principles,
 * and generates execution plans that ensure architectural consistency.
 * 
 * Features:
 * - Architecture compatibility validation
 * - Principle adherence checking
 * - Impact analysis on existing components
 * - Execution plan generation
 * - Documentation compliance verification
 */

import { existsSync } from "fs";
import { join } from "path";
import { logger } from "../utils/logger.js";
import { ValidationService } from "../services/ValidationService.js";
import { StorageService } from "../services/StorageService.js";
import { GitService } from "../services/GitService.js";
import { Goal, GoalStatus } from "../core/types.js";

interface TaskValidationRequest {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
  estimatedEffort?: "small" | "medium" | "large" | "epic";
  category?: "feature" | "bugfix" | "refactoring" | "documentation" | "infrastructure";
  dependencies?: string[]; // Goal IDs this task depends on
}

interface ArchitecturePrinciple {
  name: string;
  description: string;
  category: "design" | "code" | "documentation" | "process";
  priority: "critical" | "high" | "medium" | "low";
  validationRule: (task: TaskValidationRequest) => Promise<ValidationResult>;
}

interface ValidationResult {
  valid: boolean;
  message: string;
  severity: "error" | "warning" | "info";
  suggestion?: string;
  impact?: "low" | "medium" | "high";
  affectedComponents?: string[];
}

interface ValidationContext {
  projectStructure: ProjectStructure;
  existingGoals: Goal[];
  currentArchitecture: ArchitectureState;
  gitStatus: GitStatus;
  documentationState: DocumentationState;
}

interface ProjectStructure {
  layers: string[];
  components: ComponentInfo[];
  dependencies: DependencyInfo[];
  interfaces: InterfaceInfo[];
}

interface ComponentInfo {
  name: string;
  layer: string;
  responsibilities: string[];
  dependencies: string[];
  stability: "stable" | "evolving" | "unstable";
}

interface DependencyInfo {
  from: string;
  to: string;
  type: "direct" | "indirect" | "interface";
  strength: "strong" | "weak";
}

interface InterfaceInfo {
  name: string;
  contract: string;
  consumers: string[];
  providers: string[];
}

interface ArchitectureState {
  currentBranch: string;
  hasUncommittedChanges: boolean;
  lastArchitectureReview: string;
  pendingChanges: string[];
}

interface GitStatus {
  currentBranch: string;
  isClean: boolean;
  pendingCommits: number;
  remoteStatus: "up-to-date" | "behind" | "ahead" | "diverged";
}

interface DocumentationState {
  architectureDocs: string[];
  apiDocs: string[];
  processDocs: string[];
  lastUpdated: string;
}

interface ExecutionPlan {
  taskId: string;
  title: string;
  validationResults: ValidationResult[];
  architecturalImpact: ArchitecturalImpact;
  executionSteps: ExecutionStep[];
  risks: Risk[];
  recommendations: string[];
  estimatedTimeline: string;
}

interface ArchitecturalImpact {
  level: "none" | "low" | "medium" | "high";
  affectedComponents: string[];
  newDependencies: string[];
  interfaceChanges: string[];
  breakingChanges: boolean;
}

interface ExecutionStep {
  step: number;
  description: string;
  component: string;
  estimatedTime: string;
  dependencies: string[];
  validationChecks: string[];
}

interface Risk {
  level: "low" | "medium" | "high" | "critical";
  description: string;
  mitigation: string;
  probability: string;
}

/**
 * Task Validator and Plan Generator
 */
export class TaskValidator {
  private validationService: ValidationService;
  private storage: StorageService;
  private git: GitService;
  private architecturePrinciples: ArchitecturePrinciple[] = [];

  constructor(storage: StorageService, git: GitService) {
    this.storage = storage;
    this.git = git;
    this.validationService = new ValidationService(storage, git);
    this.initializeArchitecturePrinciples();
  }

  /**
   * Initialize architecture validation principles
   */
  private initializeArchitecturePrinciples(): void {
    this.architecturePrinciples = [
      // Design Principles
      {
        name: "Layered Architecture",
        description: "Maintain clear separation between CLI, Service, and Core layers",
        category: "design",
        priority: "critical",
        validationRule: this.validateLayeredArchitecture.bind(this)
      },
      {
        name: "Dependency Direction",
        description: "Dependencies should flow from high-level to low-level layers",
        category: "design",
        priority: "critical",
        validationRule: this.validateDependencyDirection.bind(this)
      },
      {
        name: "Interface Stability",
        description: "Public interfaces should remain stable",
        category: "design",
        priority: "high",
        validationRule: this.validateInterfaceStability.bind(this)
      },

      // Code Principles
      {
        name: "TypeScript Only",
        description: "All new code must be in TypeScript",
        category: "code",
        priority: "critical",
        validationRule: this.validateTypeScriptOnly.bind(this)
      },
      {
        name: "English Only",
        description: "All code, comments, and documentation must be in English",
        category: "code",
        priority: "critical",
        validationRule: this.validateEnglishOnly.bind(this)
      },
      {
        name: "Error Handling",
        description: "Comprehensive error handling with meaningful messages",
        category: "code",
        priority: "high",
        validationRule: this.validateErrorHandling.bind(this)
      },

      // Documentation Principles
      {
        name: "Documentation Coverage",
        description: "New features must include documentation updates",
        category: "documentation",
        priority: "high",
        validationRule: this.validateDocumentationCoverage.bind(this)
      },
      {
        name: "API Documentation",
        description: "Public APIs must be documented with TSDoc",
        category: "documentation",
        priority: "high",
        validationRule: this.validateAPIDocumentation.bind(this)
      },

      // Process Principles
      {
        name: "Testing Requirements",
        description: "New features must include comprehensive tests",
        category: "process",
        priority: "high",
        validationRule: this.validateTestingRequirements.bind(this)
      },
      {
        name: "Migration Safety",
        description: "Database and schema changes must be backward compatible",
        category: "process",
        priority: "high",
        validationRule: this.validateMigrationSafety.bind(this)
      }
    ];
  }

  /**
   * Main validation method
   */
  async validateTaskAndGeneratePlan(task: TaskValidationRequest): Promise<ExecutionPlan> {
    logger.info("🔍 Starting comprehensive task validation...");

    try {
      // Build validation context (not used in current implementation)
      await this.buildValidationContext();

      // Run architecture principle validations
      const architecturalResults = await this.validateArchitecturePrinciples(task);

      // Run business logic validations
      const businessResults = await this.validateBusinessLogic(task);

      // Combine all validation results
      const allResults = [...architecturalResults, ...businessResults];

      // Analyze architectural impact
      const architecturalImpact = this.analyzeArchitecturalImpact(task, allResults);

      // Generate execution plan
      const executionPlan = await this.generateExecutionPlan(task, allResults, architecturalImpact);

      // Generate recommendations
      const recommendations = this.generateRecommendations(allResults, architecturalImpact);

      return {
        taskId: this.generateTaskId(),
        title: task.title,
        validationResults: allResults,
        architecturalImpact,
        executionSteps: executionPlan,
        risks: this.assessRisks(allResults, architecturalImpact),
        recommendations,
        estimatedTimeline: this.estimateTimeline(task, allResults, architecturalImpact)
      };

    } catch (error) {
      logger.error("Task validation failed", error as Error);
      throw error;
    }
  }

  /**
   * Validate task against architecture principles
   */
  private async validateArchitecturePrinciples(
    task: TaskValidationRequest
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const principle of this.architecturePrinciples) {
      try {
        const result = await principle.validationRule(task);
        results.push({
          ...result,
          impact: this.calculatePrincipleImpact(principle.priority, result.severity)
        });
      } catch (error) {
        logger.error(`Principle validation failed: ${principle.name}`, error as Error);
        results.push({
          valid: false,
          message: `Principle validation failed: ${principle.name}`,
          severity: "error",
          impact: "high"
        });
      }
    }

    return results;
  }

  /**
   * Validate business logic using existing ValidationService
   */
  private async validateBusinessLogic(task: TaskValidationRequest): Promise<ValidationResult[]> {
    // Create a temporary goal for validation
    const tempGoal: Goal = {
      id: this.generateTaskId(),
      title: task.title,
      description: task.description || "",
      status: "todo" as GoalStatus,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const businessResults = await this.validationService.validateGoal(tempGoal);
    
    // Convert to our ValidationResult format
    return businessResults.map(result => ({
      valid: result.valid,
      message: result.message || "Business validation",
      severity: result.severity,
      suggestion: result.suggestion,
      impact: "medium"
    }));
  }

  /**
   * Build comprehensive validation context
   */
  private async buildValidationContext(): Promise<ValidationContext> {
    logger.info("🏗️ Building validation context...");

    const projectStructure = await this.analyzeProjectStructure();
    const existingGoals = await this.storage.listGoals();
    const currentArchitecture = await this.analyzeCurrentArchitecture();
    const gitStatus = await this.analyzeGitStatus();
    const documentationState = await this.analyzeDocumentationState();

    return {
      projectStructure,
      existingGoals,
      currentArchitecture,
      gitStatus,
      documentationState
    };
  }

  /**
   * Analyze current project structure
   */
  private async analyzeProjectStructure(): Promise<ProjectStructure> {
    const layers = ["CLI", "Service", "Core"];
    
    const components: ComponentInfo[] = [
      {
        name: "CLI Layer",
        layer: "CLI",
        responsibilities: ["User interface", "Command parsing", "Output formatting"],
        dependencies: ["Service Layer"],
        stability: "stable"
      },
      {
        name: "Workflow Service",
        layer: "Service",
        responsibilities: ["Business logic orchestration", "Protocol implementation"],
        dependencies: ["Storage Service", "Git Service", "Core Layer"],
        stability: "evolving"
      },
      {
        name: "Storage Service",
        layer: "Service",
        responsibilities: ["Data persistence", "Database operations"],
        dependencies: ["Database Manager", "Core Types"],
        stability: "stable"
      },
      {
        name: "Database Manager",
        layer: "Core",
        responsibilities: ["SQLite operations", "Schema migrations"],
        dependencies: [],
        stability: "stable"
      }
    ];

    const dependencies: DependencyInfo[] = [
      { from: "CLI Layer", to: "Service Layer", type: "direct", strength: "strong" },
      { from: "Service Layer", to: "Core Layer", type: "direct", strength: "strong" },
      { from: "Workflow Service", to: "Storage Service", type: "direct", strength: "strong" }
    ];

    const interfaces: InterfaceInfo[] = [
      {
        name: "Storage Interface",
        contract: "CRUD operations for goals and configuration",
        consumers: ["Workflow Service"],
        providers: ["Storage Service"]
      }
    ];

    return { layers, components, dependencies, interfaces };
  }

  /**
   * Analyze current architecture state
   */
  private async analyzeCurrentArchitecture(): Promise<ArchitectureState> {
    const currentBranch = await this.git.getCurrentBranch();
    const hasUncommittedChanges = !(await this.git.isWorkingDirectoryClean());

    return {
      currentBranch,
      hasUncommittedChanges,
      lastArchitectureReview: new Date().toISOString(),
      pendingChanges: hasUncommittedChanges ? ["Uncommitted changes detected"] : []
    };
  }

  /**
   * Analyze Git repository status
   */
  private async analyzeGitStatus(): Promise<GitStatus> {
    const currentBranch = await this.git.getCurrentBranch();
    const isClean = await this.git.isWorkingDirectoryClean();

    return {
      currentBranch,
      isClean,
      pendingCommits: isClean ? 0 : 1,
      remoteStatus: "up-to-date" // Simplified for now
    };
  }

  /**
   * Analyze documentation state
   */
  private async analyzeDocumentationState(): Promise<DocumentationState> {
    const docsPath = join(process.cwd(), "docs");
    
    const architectureDocs = existsSync(join(docsPath, "architecture.md")) ? ["architecture.md"] : [];
    const apiDocs = existsSync(join(docsPath, "api")) ? ["api/"] : [];
    const processDocs = existsSync(join(docsPath, "ci-cd.md")) ? ["ci-cd.md"] : [];

    return {
      architectureDocs,
      apiDocs,
      processDocs,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Architecture principle validation methods
   */
  private async validateLayeredArchitecture(
    task: TaskValidationRequest
  ): Promise<ValidationResult> {
    // Check if task affects multiple layers inappropriately
    const taskCategory = task.category;
    
    if (taskCategory === "infrastructure" && task.description?.includes("cross-layer")) {
      return {
        valid: false,
        message: "Cross-layer changes should be carefully planned",
        severity: "warning",
        suggestion: "Consider breaking into layer-specific tasks"
      };
    }

    return {
      valid: true,
      message: "Task respects layered architecture",
      severity: "info"
    };
  }

  private async validateDependencyDirection(
    task: TaskValidationRequest
  ): Promise<ValidationResult> {
    // Check if task creates circular dependencies
    if (task.description?.includes("circular") || task.description?.includes("bidirectional")) {
      return {
        valid: false,
        message: "Task may create circular dependencies",
        severity: "error",
        suggestion: "Review dependency direction and avoid circular references"
      };
    }

    return {
      valid: true,
      message: "Task maintains proper dependency direction",
      severity: "info"
    };
  }

  private async validateInterfaceStability(
    task: TaskValidationRequest
  ): Promise<ValidationResult> {
    // Check if task modifies public interfaces
    if (task.description?.includes("API change") || task.description?.includes("interface")) {
      return {
        valid: false,
        message: "Task modifies public interfaces",
        severity: "warning",
        suggestion: "Ensure backward compatibility or plan for versioning"
      };
    }

    return {
      valid: true,
      message: "Task maintains interface stability",
      severity: "info"
    };
  }

  private async validateTypeScriptOnly(): Promise<ValidationResult> {
    // This is always valid as we're working in a TypeScript project
    return {
      valid: true,
      message: "Task will be implemented in TypeScript",
      severity: "info"
    };
  }

  private async validateEnglishOnly(
    task: TaskValidationRequest
  ): Promise<ValidationResult> {
    // Check for non-English content in title and description
    const nonEnglishPattern = /[а-яё]/i;
    
    if (nonEnglishPattern.test(task.title) || (task.description && nonEnglishPattern.test(task.description))) {
      return {
        valid: false,
        message: "Task contains non-English content",
        severity: "error",
        suggestion: "Translate all content to English"
      };
    }

    return {
      valid: true,
      message: "Task content is in English",
      severity: "info"
    };
  }

  private async validateErrorHandling(
    task: TaskValidationRequest
  ): Promise<ValidationResult> {
    // Check if task mentions error handling
    const hasErrorHandling = task.description?.toLowerCase().includes("error") ||
                           task.description?.toLowerCase().includes("exception") ||
                           task.description?.toLowerCase().includes("validation");

    if (!hasErrorHandling && task.category === "feature") {
      return {
        valid: false,
        message: "Task should include error handling considerations",
        severity: "warning",
        suggestion: "Add error handling and validation logic to the task description"
      };
    }

    return {
      valid: true,
      message: "Task includes error handling considerations",
      severity: "info"
    };
  }

  private async validateDocumentationCoverage(
    task: TaskValidationRequest
  ): Promise<ValidationResult> {
    // Check if task includes documentation updates
    const needsDocs = task.category === "feature" || task.category === "infrastructure";
    const hasDocs = task.description?.toLowerCase().includes("document") ||
                   task.description?.toLowerCase().includes("readme") ||
                   task.description?.toLowerCase().includes("api");

    if (needsDocs && !hasDocs) {
      return {
        valid: false,
        message: "Task should include documentation updates",
        severity: "warning",
        suggestion: "Add documentation update requirements to the task description"
      };
    }

    return {
      valid: true,
      message: "Task includes documentation requirements",
      severity: "info"
    };
  }

  private async validateAPIDocumentation(
    task: TaskValidationRequest
  ): Promise<ValidationResult> {
    // Check if task affects APIs and includes TSDoc requirements
    const affectsAPI = task.description?.toLowerCase().includes("api") ||
                      task.description?.toLowerCase().includes("service") ||
                      task.description?.toLowerCase().includes("interface");

    if (affectsAPI && !task.description?.toLowerCase().includes("tsdoc")) {
      return {
        valid: false,
        message: "API changes should include TSDoc documentation",
        severity: "warning",
        suggestion: "Add TSDoc documentation requirements to the task"
      };
    }

    return {
      valid: true,
      message: "Task includes API documentation requirements",
      severity: "info"
    };
  }

  private async validateTestingRequirements(
    task: TaskValidationRequest
  ): Promise<ValidationResult> {
    // Check if task includes testing requirements
    const hasTesting = task.description?.toLowerCase().includes("test") ||
                      task.description?.toLowerCase().includes("spec") ||
                      task.description?.toLowerCase().includes("coverage");

    if (!hasTesting && task.category !== "documentation") {
      return {
        valid: false,
        message: "Task should include testing requirements",
        severity: "warning",
        suggestion: "Add testing requirements to the task description"
      };
    }

    return {
      valid: true,
      message: "Task includes testing requirements",
      severity: "info"
    };
  }

  private async validateMigrationSafety(
    task: TaskValidationRequest
  ): Promise<ValidationResult> {
    // Check if task affects database or schema
    const affectsDatabase = task.description?.toLowerCase().includes("database") ||
                           task.description?.toLowerCase().includes("schema") ||
                           task.description?.toLowerCase().includes("migration");

    if (affectsDatabase && !task.description?.toLowerCase().includes("backward compatible")) {
      return {
        valid: false,
        message: "Database changes should ensure backward compatibility",
        severity: "warning",
        suggestion: "Add backward compatibility requirements to the task"
      };
    }

    return {
      valid: true,
      message: "Task considers migration safety",
      severity: "info"
    };
  }

  /**
   * Calculate principle impact based on priority and severity
   */
  private calculatePrincipleImpact(priority: string, severity: string): "low" | "medium" | "high" {
    if (priority === "critical" || severity === "error") return "high";
    if (priority === "high" || severity === "warning") return "medium";
    return "low";
  }

  /**
   * Analyze architectural impact of the task
   */
  private analyzeArchitecturalImpact(
    task: TaskValidationRequest,
    results: ValidationResult[]
  ): ArchitecturalImpact {
    const errors = results.filter(r => r.severity === "error");
    const warnings = results.filter(r => r.severity === "warning");
    
    let impactLevel: "none" | "low" | "medium" | "high" = "none";
    if (errors.length > 0) impactLevel = "high";
    else if (warnings.length > 2) impactLevel = "medium";
    else if (warnings.length > 0) impactLevel = "low";

    const affectedComponents = this.identifyAffectedComponents(task);
    const newDependencies = this.identifyNewDependencies(task);
    const interfaceChanges = this.identifyInterfaceChanges(task);

    return {
      level: impactLevel,
      affectedComponents,
      newDependencies,
      interfaceChanges,
      breakingChanges: errors.some(r => r.message.includes("breaking"))
    };
  }

  /**
   * Identify components affected by the task
   */
  private identifyAffectedComponents(
    task: TaskValidationRequest
  ): string[] {
    const components: string[] = [];
    
    if (task.description?.includes("CLI")) components.push("CLI Layer");
    if (task.description?.includes("service") || task.description?.includes("Service")) components.push("Service Layer");
    if (task.description?.includes("database") || task.description?.includes("core")) components.push("Core Layer");
    
    return components.length > 0 ? components : ["Unknown impact"];
  }

  /**
   * Identify new dependencies created by the task
   */
  private identifyNewDependencies(
    task: TaskValidationRequest
  ): string[] {
    const dependencies: string[] = [];
    
    if (task.description?.includes("external")) dependencies.push("External API");
    if (task.description?.includes("database")) dependencies.push("Database Schema");
    if (task.description?.includes("file")) dependencies.push("File System");
    
    return dependencies;
  }

  /**
   * Identify interface changes required by the task
   */
  private identifyInterfaceChanges(
    task: TaskValidationRequest
  ): string[] {
    const changes: string[] = [];
    
    if (task.description?.includes("API")) changes.push("Public API");
    if (task.description?.includes("interface")) changes.push("Service Interface");
    if (task.description?.includes("CLI")) changes.push("CLI Interface");
    
    return changes;
  }

  /**
   * Generate execution plan
   */
  private async generateExecutionPlan(
    task: TaskValidationRequest,
    results: ValidationResult[],
    impact: ArchitecturalImpact
  ): Promise<ExecutionStep[]> {
    const steps: ExecutionStep[] = [];
    let stepNumber = 1;

    // Pre-validation step
    steps.push({
      step: stepNumber++,
      description: "Review and address validation issues",
      component: "Validation System",
      estimatedTime: "1-2 hours",
      dependencies: [],
      validationChecks: ["All validation errors resolved", "Warnings reviewed"]
    });

    // Architecture review step
    if (impact.level !== "none") {
      steps.push({
        step: stepNumber++,
        description: "Architecture impact review",
        component: "Architecture Team",
        estimatedTime: "2-4 hours",
        dependencies: ["Validation issues resolved"],
        validationChecks: ["Architecture principles reviewed", "Impact assessment completed"]
      });
    }

    // Implementation planning step
    steps.push({
      step: stepNumber++,
      description: "Detailed implementation planning",
      component: "Development Team",
      estimatedTime: "4-8 hours",
      dependencies: ["Architecture review completed"],
      validationChecks: ["Technical design approved", "Implementation approach defined"]
    });

    // Development step
    const devTime = this.estimateDevelopmentTime(task, impact);
    steps.push({
      step: stepNumber++,
      description: "Code implementation",
      component: "Development",
      estimatedTime: devTime,
      dependencies: ["Implementation plan approved"],
      validationChecks: ["Code follows project standards", "TypeScript compliance", "Error handling implemented"]
    });

    // Testing step
    steps.push({
      step: stepNumber++,
      description: "Testing and validation",
      component: "Testing",
      estimatedTime: "2-4 hours",
      dependencies: ["Code implementation completed"],
      validationChecks: ["Unit tests passing", "Integration tests passing", "Coverage requirements met"]
    });

    // Documentation step
    if (task.category !== "documentation") {
      steps.push({
        step: stepNumber++,
        description: "Update documentation",
        component: "Documentation",
        estimatedTime: "1-2 hours",
        dependencies: ["Testing completed"],
        validationChecks: ["API docs updated", "README updated if needed", "Architecture docs updated"]
      });
    }

    // Review and merge step
    steps.push({
      step: stepNumber++,
      description: "Code review and merge",
      component: "Review Process",
      estimatedTime: "1-2 hours",
      dependencies: ["Documentation updated"],
      validationChecks: ["Code review approved", "All checks passing", "Ready for merge"]
    });

    return steps;
  }

  /**
   * Estimate development time based on task complexity
   */
  private estimateDevelopmentTime(_task: TaskValidationRequest, impact: ArchitecturalImpact): string {
    const baseTime = _task.estimatedEffort === "small" ? 4 : 
                    _task.estimatedEffort === "medium" ? 8 :
                    _task.estimatedEffort === "large" ? 16 : 32;

    const impactMultiplier = impact.level === "high" ? 1.5 : 
                            impact.level === "medium" ? 1.25 : 1.0;

    const totalHours = Math.round(baseTime * impactMultiplier);
    
    if (totalHours <= 8) return `${totalHours} hours`;
    if (totalHours <= 40) return `${Math.round(totalHours / 8)} days`;
    return `${Math.round(totalHours / 40)} weeks`;
  }

  /**
   * Assess risks based on validation results and impact
   */
  private assessRisks(results: ValidationResult[], impact: ArchitecturalImpact): Risk[] {
    const risks: Risk[] = [];

    // High severity validation errors
    const errors = results.filter(r => r.severity === "error");
    if (errors.length > 0) {
      risks.push({
        level: "critical",
        description: `${errors.length} validation errors must be resolved`,
        mitigation: "Address all validation errors before proceeding",
        probability: "high"
      });
    }

    // Architecture impact risks
    if (impact.level === "high") {
      risks.push({
        level: "high",
        description: "High architectural impact may affect system stability",
        mitigation: "Conduct thorough architecture review and testing",
        probability: "medium"
      });
    }

    // Breaking changes
    if (impact.breakingChanges) {
      risks.push({
        level: "critical",
        description: "Task introduces breaking changes",
        mitigation: "Plan for versioning and migration strategy",
        probability: "high"
      });
    }

    // Interface changes
    if (impact.interfaceChanges.length > 0) {
      risks.push({
        level: "medium",
        description: "Public interfaces will be modified",
        mitigation: "Ensure backward compatibility or plan for versioning",
        probability: "medium"
      });
    }

    return risks;
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateRecommendations(results: ValidationResult[], impact: ArchitecturalImpact): string[] {
    const recommendations: string[] = [];

    // Address validation errors first
    const errors = results.filter(r => r.severity === "error");
    if (errors.length > 0) {
      recommendations.push("Resolve all validation errors before proceeding with implementation");
    }

    // Address warnings
    const warnings = results.filter(r => r.severity === "warning");
    if (warnings.length > 0) {
      recommendations.push("Review and address validation warnings to improve task quality");
    }

    // Architecture considerations
    if (impact.level === "high") {
      recommendations.push("Schedule architecture review meeting to discuss impact and approach");
      recommendations.push("Consider breaking task into smaller, more manageable pieces");
    }

    // Testing recommendations
    if (impact.affectedComponents.length > 1) {
      recommendations.push("Implement comprehensive integration tests for affected components");
    }

    // Documentation recommendations
    if (impact.interfaceChanges.length > 0) {
      recommendations.push("Update API documentation and provide migration guide if needed");
    }

    // Risk mitigation
    if (impact.breakingChanges) {
      recommendations.push("Develop rollback strategy and communicate changes to stakeholders");
    }

    return recommendations;
  }

  /**
   * Estimate overall timeline
   */
  private estimateTimeline(_task: TaskValidationRequest, results: ValidationResult[], impact: ArchitecturalImpact): string {
    const baseTime = this.estimateDevelopmentTime(_task, impact);
    const validationTime = results.some(r => r.severity === "error") ? "1-2 days" : "4-8 hours";
    const reviewTime = impact.level === "high" ? "2-3 days" : "1 day";
    
    return `Total: ${validationTime} validation + ${reviewTime} review + ${baseTime} development`;
  }

  /**
   * Generate unique task ID
   */
  private generateTaskId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `g-${timestamp}${random}`;
  }
}

/**
 * CLI interface for task validation
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("Usage: bun run src/scripts/task-validator.ts <task-title> [description] [options]");
    console.log("\nOptions:");
    console.log("  --priority <level>     Set priority (low|medium|high|critical)");
    console.log("  --effort <size>        Set effort (small|medium|large|epic)");
    console.log("  --category <type>      Set category (feature|bugfix|refactoring|documentation|infrastructure)");
    console.log("  --dependencies <ids>   Comma-separated list of dependent goal IDs");
    console.log("\nExample:");
    console.log("  bun run src/scripts/task-validator.ts 'Add user authentication' 'Implement JWT-based auth system' --priority high --category feature");
    process.exit(1);
  }

  const title = args[0];
  const description = args[1] || "";
  
  // Parse options
  const options: Record<string, string> = {};
  for (let i = 2; i < args.length; i += 2) {
    if (args[i].startsWith('--') && args[i + 1]) {
      const key = args[i].substring(2);
      options[key] = args[i + 1];
    }
  }

  const task: TaskValidationRequest = {
    title,
    description,
    priority: (options.priority as "low" | "medium" | "high" | "critical") || "medium",
    estimatedEffort: (options.effort as "small" | "medium" | "large" | "epic") || "medium",
    category: (options.category as "feature" | "bugfix" | "refactoring" | "documentation" | "infrastructure") || "feature",
    dependencies: options.dependencies ? options.dependencies.split(',') : []
  };

  try {
    // Initialize services (simplified for CLI)
    const storage = new StorageService();
    const git = new GitService();
    const validator = new TaskValidator(storage, git);

    console.log("🔍 Validating task and generating execution plan...\n");
    
    const plan = await validator.validateTaskAndGeneratePlan(task);
    
    // Display results
    console.log("📋 TASK VALIDATION RESULTS");
    console.log("=" .repeat(50));
    console.log(`Task ID: ${plan.taskId}`);
    console.log(`Title: ${plan.title}`);
    console.log(`Architectural Impact: ${plan.architecturalImpact.level.toUpperCase()}`);
    console.log(`Timeline: ${plan.estimatedTimeline}\n`);

    // Display validation results
    console.log("✅ VALIDATION RESULTS");
    console.log("-".repeat(30));
    const errors = plan.validationResults.filter(r => r.severity === "error");
    const warnings = plan.validationResults.filter(r => r.severity === "warning");
    const info = plan.validationResults.filter(r => r.severity === "info");

    if (errors.length > 0) {
      console.log(`❌ Errors (${errors.length}):`);
      errors.forEach(error => console.log(`  - ${error.message}`));
    }

    if (warnings.length > 0) {
      console.log(`⚠️  Warnings (${warnings.length}):`);
      warnings.forEach(warning => console.log(`  - ${warning.message}`));
    }

    if (info.length > 0) {
      console.log(`ℹ️  Info (${info.length}):`);
      info.forEach(info => console.log(`  - ${info.message}`));
    }

    // Display execution plan
    console.log("\n📋 EXECUTION PLAN");
    console.log("-".repeat(30));
    plan.executionSteps.forEach(step => {
      console.log(`${step.step}. ${step.description}`);
      console.log(`   Component: ${step.component}`);
      console.log(`   Time: ${step.estimatedTime}`);
      console.log(`   Dependencies: ${step.dependencies.length > 0 ? step.dependencies.join(', ') : 'None'}`);
      console.log("");
    });

    // Display risks
    if (plan.risks.length > 0) {
      console.log("⚠️  RISKS");
      console.log("-".repeat(20));
      plan.risks.forEach(risk => {
        console.log(`${risk.level.toUpperCase()}: ${risk.description}`);
        console.log(`   Mitigation: ${risk.mitigation}`);
        console.log(`   Probability: ${risk.probability}\n`);
      });
    }

    // Display recommendations
    if (plan.recommendations.length > 0) {
      console.log("💡 RECOMMENDATIONS");
      console.log("-".repeat(30));
      plan.recommendations.forEach(rec => console.log(`- ${rec}`));
    }

    // Final status
    console.log("\n" + "=".repeat(50));
    if (errors.length === 0) {
      console.log("✅ Task is ready for implementation!");
    } else {
      console.log("❌ Task has validation errors that must be resolved first.");
      process.exit(1);
    }

  } catch (error) {
    console.error("❌ Task validation failed:", error);
    process.exit(1);
  }
}

// Run CLI if called directly
if (import.meta.main) {
  main().catch(console.error);
}
