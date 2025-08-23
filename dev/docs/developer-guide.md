# Developer Guide

## Overview

This guide is for developers who want to contribute to Dev Agent or understand its internal architecture. 

> **💡 For basic setup and usage, see the [main README](../README.md) first!**

This guide covers:
- Development environment setup
- Code structure and architecture
- Testing and quality assurance
- Contribution guidelines

## Development Setup

> **📖 Basic setup instructions are in the [main README](../README.md#-quick-start)**

### Prerequisites

- [Bun](https://bun.sh) v1.x or later
- [Git](https://git-scm.com/) v2.x or later
- [TypeScript](https://www.typescriptlang.org/) 5.x knowledge
- Basic understanding of SQLite and Git operations

### Environment Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-org/dev-agent.git
   cd dev-agent
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Verify setup:**
   ```bash
   bun test
   bun run lint
   bun run format
   ```

## Project Structure

```
dev-agent/                  # PROJECT ROOT
├── 🔧 CONFIGURATION
│   ├── package.json        # Dependencies & scripts
│   ├── tsconfig.json      # TypeScript configuration
│   ├── bun.lock           # Locked dependencies
│   ├── Makefile           # Build automation
│   ├── .eslintrc.cjs      # ESLint configuration
│   ├── .prettierrc        # Prettier configuration
│   └── config.json    # Dev Agent configuration
│
├── 📁 SOURCE CODE
│   └── src/               # All source code
│       ├── index.ts       # CLI entry point
│       ├── core/          # Core system components
│       │   ├── types.ts   # TypeScript interfaces and types
│       │   ├── schema.ts  # Database schema & migrations
│       │   ├── database.ts # Database connection & management
│       │   └── aid-generator.ts # AID generation & validation
│       ├── services/      # Business logic services
│       │   ├── AIDService.ts
│       │   ├── AutoTranslationService.ts
│       │   ├── GitHubService.ts
│       │   ├── GitService.ts
│       │   ├── LanguageDetectionService.ts
│       │   ├── LLMTranslationService.ts
│       │   ├── ProjectConfigService.ts
│       │   ├── StorageService.ts
│       │   ├── ValidationService.ts
│       │   └── WorkflowService.ts
│       ├── config/        # Configuration management
│       │   ├── config.ts  # Database-backed config
│       │   ├── ConfigurationManager.ts
│       │   ├── llm-config.ts
│       │   ├── types.ts
│       │   └── providers/ # Configuration providers
│       ├── middleware/    # Request/response middleware
│       │   └── LanguageValidationMiddleware.ts
│       ├── scripts/       # Utility scripts
│       │   ├── check-language.ts
│       │   ├── check-schema.ts
│       │   ├── config-manager.ts
│       │   ├── generate-coverage-badge.ts
│       │   ├── github-manager.ts
│       │   ├── init-db.ts
│       │   ├── llm-manager.ts
│       │   ├── validate-structure.ts
│       │   └── version-manager.ts
│       └── utils/         # Utility functions
│           ├── env-loader.ts
│           ├── logger.ts
│           └── types.ts
│
├── 🧪 TESTING
│   └── tests/             # Test files (mirrors src/)
│       ├── core/          # Core module tests
│       ├── services/      # Service layer tests
│       ├── config/        # Configuration tests
│       ├── scripts/       # Script tests
│       └── utils/         # Utility tests
│
├── 📖 DOCUMENTATION
│   ├── docs/              # Documentation files
│   │   ├── api/           # Auto-generated API docs
│   │   ├── protocols/     # Development protocols
│   │   ├── README.md      # Documentation index
│   │   ├── developer-guide.md
│   │   ├── architecture.md
│   │   ├── ci-cd.md
│   │   ├── versioning.md
│   │   ├── structure.md
│   │   ├── structure-validation.md
│   │   └── CHANGELOG.md
│   └── README.md          # Main project overview
│
├── 🔧 DEVELOPMENT
│   ├── scripts/           # Build & utility scripts
│   │   └── set-db-path.ts
│   ├── .github/           # GitHub Actions workflows
│   ├── .cursor/           # Cursor IDE configuration
│   └── .git/              # Git repository
│
└── 📦 DEPENDENCIES
    ├── node_modules/      # Installed packages
    └── bun.lock           # Locked dependency versions
```

## Architecture Overview

Dev Agent follows a clean, layered architecture:

```
┌─────────────────────────────────────┐
│             CLI Layer               │
│       (Commander.js Interface)      │
├─────────────────────────────────────┤
│          Workflow Service           │
│    (Business Logic Orchestrator)    │
├─────────────────────────────────────┤
│           Service Layer             │
│     Storage | Git | GitHub | AI     │
├─────────────────────────────────────┤
│             Core Layer              │
│     Types | Database | AID Gen      │
└─────────────────────────────────────┘
```

### Layer Responsibilities

#### CLI Layer (`src/index.ts`)

- **Purpose**: User interface and command parsing
- **Technology**: Commander.js
- **Responsibilities**:
  - Parse command line arguments
  - Display formatted output
  - Handle global options (verbose, debug)
  - Orchestrate service calls

#### Workflow Service (`src/services/WorkflowService.ts`)

- **Purpose**: Business logic orchestration
- **Responsibilities**:
  - Implement High-Efficiency Standard Operating Protocol
  - Coordinate between Storage and Git services
  - Validate business rules
  - Return structured CommandResult objects

#### Service Layer

- **StorageService**: Database operations and data persistence
- **GitService**: Git operations and branch management
- **GitHubService**: GitHub API integration (future)
- **AIService**: AI-powered features (future)

#### Core Layer

- **[Types](api/modules.html)**: TypeScript interfaces and type definitions
- **[Database](api/classes/DatabaseManager.html)**: SQLite connection and schema management
- **AID Generator**: Unique identifier generation and validation

## Core Components

> **📖 For complete API reference, see [API Documentation](api/)**

### 1. AID System (`src/core/aid-generator.ts`)

The Atomic ID (AID) system provides typed, unique identifiers:

```typescript
// Generate a task ID
const taskId = generateTaskId("Fix login bug");
// Result: "g-a1b2c3"

// Validate an AID
const isValid = isValidAID("g-a1b2c3"); // true

// Extract prefix
const prefix = getAIDPrefix("g-a1b2c3"); // "G"
```

**Key Functions:**

- `generateUniqueEntityId(prefix, metadata)`: Generate AID for any entity type
- `isValidAID(aid)`: Validate AID format
- `getAIDPrefix(aid)`: Extract entity type from AID
- `generateTaskId(title)`: Convenience function for tasks

### 2. Database Management (`src/core/database.ts`)

> **API Reference**: [DatabaseManager](api/classes/DatabaseManager.html)

Handles SQLite database operations with automatic migrations:

```typescript
const db = new DatabaseManager(".dev-agent.db");
await db.initialize(); // Creates tables and applies migrations
```

**Features:**

- Automatic schema migration
- Transaction support
- Prepared statement handling
- Error logging and recovery

### 3. Storage Service (`src/services/StorageService.ts`)

> **API Reference**: [StorageService](api/classes/StorageService.html)

High-level data access layer:

```typescript
const storage = new StorageService();
await storage.initialize();

// Create task
await storage.createGoal({
  id: "g-a1b2c3",
  title: "Fix login bug",
  status: "todo",
});

// Query tasks
const goals = await storage.listGoals("todo");
```

**Key Methods:**

- Goal CRUD operations
- Configuration management
- Transaction handling
- Automatic initialization

### 4. Git Service (`src/services/GitService.ts`)

Abstraction layer for Git operations:

```typescript
const git = new GitService();
const isRepo = await git.isGitRepository();
const currentBranch = await git.getCurrentBranch();
```

**Features:**

- Branch management
- Status checking
- Commit operations
- Error handling and logging

## Development Workflow

### 1. Making Changes

1. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Follow TypeScript best practices
   - Add comprehensive error handling
   - Include logging for debugging
   - Update tests for new functionality

3. **Run quality checks:**

   ```bash
   bun run quality  # Runs lint + test
   ```

4. **Commit your changes:**
   ```bash
   git commit -m "feat: add new feature description"
   ```

### 2. Testing

#### Running Tests

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test tests/core/aid-generator.test.ts

# Run tests in watch mode
bun test --watch
```

#### Writing Tests

Tests should cover:

- **Happy path**: Normal operation scenarios
- **Error cases**: Invalid input and failure scenarios
- **Edge cases**: Boundary conditions and unusual inputs
- **Integration**: Service interactions

**Example Test Structure:**

```typescript
describe("StorageService", () => {
  describe("createTask", () => {
    test("should create task with valid data", async () => {
      // Arrange
      const taskData = {
        /* test data */
      };

      // Act
      await storageService.createTask(taskData);

      // Assert
      const result = await storageService.getTask(taskData.id);
      expect(result).toBeTruthy();
    });

    test("should handle invalid task data", async () => {
      // Test error scenarios
    });
  });
});
```

### 3. Code Quality

#### Linting

```bash
# Run ESLint
bun run lint

# Fix auto-fixable issues
bun run lint --fix
```

#### Formatting

```bash
# Run Prettier
bun run format

# Check formatting without changes
bun run format --check
```

#### Type Checking

```bash
# Run TypeScript compiler
bun run build

# Check types without building
bun run tsc --noEmit
```

## Database Development

### Schema Migrations

1. **Add new migration in `src/core/schema.ts`:**

   ```typescript
   export const SCHEMA_MIGRATIONS = {
     "001": `CREATE TABLE tasks...`,
     "002": `CREATE TABLE project_config...`,
     "003": `ALTER TABLE tasks ADD COLUMN priority...`, // New migration
   };
   ```

2. **Migration naming convention:**
   - Use sequential numbers: `001`, `002`, `003`
   - Include descriptive comment
   - Test migration rollback scenarios

### Database Operations

**Best Practices:**

- Use prepared statements to prevent SQL injection
- Wrap related operations in transactions
- Handle SQLite errors gracefully
- Log database operations for debugging

**Example Transaction:**

```typescript
try {
  this.db.beginTransaction();

  // Multiple operations
  this.db.run("INSERT INTO tasks...", [taskData]);
  this.db.run("UPDATE project_stats...", [statsData]);

  this.db.commitTransaction();
} catch (error) {
  this.db.rollbackTransaction();
  throw error;
}
```

## Logging and Debugging

### Logger Configuration

```typescript
import { logger, LogLevel } from "./utils/logger.js";

// Set log level
logger.setLevel(LogLevel.DEBUG);

// Log with context
logger.info("Creating task", { taskId, title });
logger.error("Failed to create task", error);
logger.success("Task created successfully");
```

### Debug Mode

Enable debug logging for development:

```bash
bun run src/index.ts --debug task create "Test task"
```

### Log Files

Logs are stored in `.logs/dev-agent.log` with timestamps and log levels.

## Performance Considerations

### Database Performance

- **Indexes**: Ensure proper indexing on frequently queried columns
- **Transactions**: Batch related operations
- **Prepared statements**: Reuse statement objects
- **Connection pooling**: Single database connection per instance

### Memory Management

- **Streaming**: Use streaming for large datasets
- **Cleanup**: Properly close database connections
- **Caching**: Cache frequently accessed data

## Contributing Guidelines

### Code Style

- **TypeScript**: Use strict mode and proper typing
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Document complex logic and public APIs
- **Error handling**: Comprehensive error handling with meaningful messages

### Pull Request Process

1. **Fork the repository**
2. **Create feature branch**
3. **Make changes with tests**
4. **Run quality checks**
5. **Submit pull request with description**

### Commit Message Format

Use conventional commit format:

```
type(scope): description

feat(task): add priority field to tasks
fix(storage): resolve database connection leak
docs(readme): update installation instructions
test(aid): add edge case test coverage
```

## Troubleshooting

### Common Development Issues

**Tests failing:**

- Check database state
- Verify test data isolation
- Check for race conditions

**Type errors:**

- Run `bun run tsc --noEmit`
- Check interface definitions
- Verify import/export statements

**Database issues:**

- Check file permissions
- Verify schema migrations
- Check SQLite version compatibility

### Debugging Tips

1. **Enable debug logging**
2. **Check log files**
3. **Use TypeScript compiler for type checking**
4. **Run tests with coverage**
5. **Check database state directly**

## Next Steps

- [Main README](../README.md) - Complete setup guide and essential commands
- [Architecture Overview](architecture.md) - System design and architecture
- [API Reference](api/) - Auto-generated TypeScript documentation

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Commander.js Guide](https://github.com/tj/commander.js)
- [Bun Runtime](https://bun.sh/docs)
