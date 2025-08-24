# Architecture Overview

> **💡 For basic usage and setup, see the [main README](../README.md) first!**

## System Architecture

Dev Agent is built with a clean, layered architecture that promotes separation of concerns, testability, and maintainability. The system follows the **Dependency Inversion Principle** where high-level modules depend on abstractions rather than concrete implementations.

```
┌─────────────────────────────────────────────────────────────┐
│                      CLI Layer                              │
│               (Commander.js Interface)                      │
├─────────────────────────────────────────────────────────────┤
│                 Workflow Service                            │
│            (Business Logic Orchestrator)                    │
├─────────────────────────────────────────────────────────────┤
│                   Service Layer                             │
│           Storage | Git | GitHub | AI | Notification        │
├─────────────────────────────────────────────────────────────┤
│                    Core Layer                               │
│              Types | Database | AID Gen | Utils             │
└─────────────────────────────────────────────────────────────┘
```

## Layer Details

### 1. CLI Layer (`src/index.ts`)

**Purpose**: User interface and command orchestration

**Responsibilities**:

- Parse command line arguments using Commander.js
- Display formatted output with emojis and structured information
- Handle global options (verbose, debug logging)
- Orchestrate calls to WorkflowService
- Provide user-friendly error messages

**Key Components**:

- `Command` instances for each command category
- Global option handlers for logging configuration
- Output formatting functions (`displayTasks`)
- Error handling and process exit management

**Example Flow**:

```typescript
// User runs: bun run src/index.ts task create "Fix bug"
program
  .command("task")
  .command("create")
  .argument("<title>")
  .action(async (title) => {
    const result = await workflowService.createTask(title);
    // Display result...
  });
```

### 2. Workflow Service (`src/services/WorkflowService.ts`)

**Purpose**: Business logic orchestration and protocol implementation

**Responsibilities**:

- Implement the High-Efficiency Standard Operating Protocol
- Coordinate interactions between Storage and Git services
- Validate business rules and constraints
- Return structured `CommandResult` objects
- Handle complex multi-step workflows

**Key Methods**:

- `initializeProject()`: Project setup and configuration
- `startTask()`: Task workflow initiation
- `completeTask()`: Task completion workflow
- `createTask()`: Task creation with AID generation
- Configuration management methods

**Business Logic Examples**:

```typescript
async startTask(taskId: string): Promise<CommandResult> {
  // 1. Validate task ID format
  // 2. Check task exists and status
  // 3. Ensure working directory is clean
  // 4. Switch to develop branch
  // 5. Pull latest changes
  // 6. Create feature branch
  // 7. Update task status
  // 8. Return success result
}
```

### 3. Service Layer

#### Storage Service (`src/services/StorageService.ts`)

**Purpose**: Data persistence and database operations

**Responsibilities**:

- CRUD operations for tasks and configuration
- Database connection management
- Transaction handling
- Automatic service initialization
- Error logging and recovery

**Key Features**:

- Lazy initialization with `ensureInitialized()`
- Comprehensive error handling
- Transaction support for atomic operations
- Automatic database setup

**Data Models**:

```typescript
interface Task {
  id: string; // AID format: g-xxxxxx
  title: string;
  status: TaskStatus; // todo | in_progress | done | archived
  description?: string;
  github_issue_id?: number;
  branch_name?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}
```

#### Git Service (`src/services/GitService.ts`)

**Purpose**: Git operations abstraction

**Responsibilities**:

- Branch management (create, checkout, delete)
- Repository status checking
- Commit operations
- Remote operations (pull, push)
- Working directory validation

**Key Features**:

- Uses `simple-git` library for Git operations
- Comprehensive error handling
- Logging for debugging
- Branch naming conventions

**Operations**:

```typescript
// Branch management
await git.createBranch("feature/g-a1b2c3-task-title");
await git.checkoutBranch("develop");

// Status checking
const isClean = await git.isWorkingDirectoryClean();
const currentBranch = await git.getCurrentBranch();
```

### 4. Core Layer

#### Types (`src/core/types.ts`)

**Purpose**: TypeScript type definitions and interfaces

**Key Types**:

- `Task`: Core task entity with all properties
- `TaskStatus`: Union type for task states
- `CommandResult`: Standardized command response
- `WorkflowContext`: Runtime context information
- `AIDMetadata`: Metadata for AID generation

**Type Safety Benefits**:

- Compile-time error detection
- IntelliSense support
- Refactoring safety
- Documentation through types

#### Database (`src/core/database.ts`)

**Purpose**: SQLite database management and migrations

**Key Features**:

- Automatic schema migration system
- Transaction support
- Prepared statement handling
- Error recovery and logging
- Lazy initialization

**Migration System**:

```typescript
export const SCHEMA_MIGRATIONS = {
  "001": `CREATE TABLE tasks...`,
  "002": `CREATE TABLE project_config...`,
  "003": `CREATE TABLE schema_migrations...`,
};
```

**Database Operations**:

```typescript
// Query with parameters
const tasks = db.query<Task>("SELECT * FROM tasks WHERE status = ?", ["todo"]);

// Execute statement
db.run("INSERT INTO tasks (id, title, status) VALUES (?, ?, ?)", [
  id,
  title,
  status,
]);

// Transaction handling
db.beginTransaction();
try {
  // Multiple operations...
  db.commitTransaction();
} catch (error) {
  db.rollbackTransaction();
  throw error;
}
```

#### AID Generator (`src/core/aid-generator.ts`)

**Purpose**: Unique identifier generation and validation

**Key Features**:

- Typed entity prefixes (G for Goals/Tasks, A for Archive, etc.)
- Random string generation
- Format validation
- Entity type mapping

**AID Format**: `[prefix]-[a-z0-9]{6}`

**Examples**:

- `g-a1b2c3` - Task (Goal)
- `a-d4e5f6` - Document (Archive)
- `b-x7y8z9` - Inventory item (Base)

**Registry System**:

```typescript
export const AID_REGISTRY = {
  A: "Archive (Documents)",
  B: "Base (Logistics, Inventory)",
  C: "Contractor (Legal Entities)",
  D: "Deal (Deals)",
  E: "Employee (Employees)",
  F: "Finance (Transactions)",
  G: "Goal (Tasks)",
  H: "Human (Individuals / Natural Persons)",
  I: "Invoice (Invoices for Payment / Bills)",
  J: "Journal (System Logs)",
  K: "Key (API Keys, Tokens)",
  L: "Location (Geo. Points)",
  M: "Message (Messages)",
  N: "Notice (Notifications)",
  O: "Outreach (Marketing)",
  P: "Product (Products)",
  Q: "Qualification (Assessments / Ratings)",
  R: "Routine (Automation)",
  S: "Segment (Segments)",
  T: "Text (Content)",
  U: "University (LMS / Learning)",
  V: "Vote (Polls / Surveys)",
  W: "Wallet (Wallets)",
  X: "Xpanse (Spaces)",
  Y: "Yard (Gamification)",
  Z: "Zoo (Animals)"
};
```

#### Logger (`src/utils/logger.ts`)

**Purpose**: Centralized logging system

**Features**:

- Multiple log levels (DEBUG, INFO, WARN, ERROR, SUCCESS)
- File and console output
- Timestamp formatting
- Configurable log levels
- Automatic log directory creation

## Data Flow

### 1. Task Creation Flow

```
User Input → CLI Parser → WorkflowService → StorageService → Database
     ↓              ↓            ↓              ↓            ↓
"Fix bug" → task create → createTask() → createTask() → INSERT INTO tasks
```

**Detailed Flow**:

1. **CLI Layer**: Parse `task create "Fix bug"` command
2. **Workflow Service**: Generate AID, validate input
3. **Storage Service**: Ensure database initialized, create task
4. **Database**: Execute INSERT statement, return result
5. **Response Chain**: Success result flows back through layers
6. **Output**: Display formatted success message

### 2. Task Start Flow

```
User Input → CLI Parser → WorkflowService → GitService → StorageService
     ↓              ↓            ↓            ↓            ↓
"start g-123" → task start → startTask() → Git ops → Update status
```

**Detailed Flow**:

1. **CLI Layer**: Parse `task start g-123` command
2. **Workflow Service**: Validate task, check status
3. **Git Service**: Checkout develop, pull, create feature branch
4. **Storage Service**: Update task status to `in_progress`
5. **Response**: Return success with branch information

### 3. Configuration Flow

```
User Input → CLI Parser → WorkflowService → StorageService → Database
     ↓              ↓            ↓              ↓            ↓
"set key value" → config set → setConfig() → setConfig() → UPDATE/INSERT
```

## Error Handling Strategy

### 1. Layered Error Handling

**CLI Layer**: User-friendly error messages
**Workflow Service**: Business logic validation
**Service Layer**: Operation-specific error handling
**Core Layer**: Low-level error recovery

### 2. Error Types

```typescript
interface CommandResult {
  success: boolean;
  message: string;
  error?: string; // Error description
  data?: any; // Additional data
}
```

### 3. Error Recovery

- **Database errors**: Automatic retry and rollback
- **Git errors**: Status checking and recovery
- **Validation errors**: Clear error messages
- **System errors**: Graceful degradation

## Performance Considerations

### 1. Database Performance

- **Indexes**: Strategic indexing on frequently queried columns
- **Transactions**: Batch related operations
- **Prepared statements**: Reuse statement objects
- **Connection management**: Single connection per instance

### 2. Memory Management

- **Lazy initialization**: Services initialize only when needed
- **Resource cleanup**: Proper database connection closing
- **Streaming**: Handle large datasets efficiently
- **Caching**: Cache frequently accessed data

### 3. Async Operations

- **Non-blocking**: All I/O operations are asynchronous
- **Parallel execution**: Independent operations run concurrently
- **Error boundaries**: Isolated error handling per operation

## Security Considerations

### 1. Input Validation

- **AID validation**: Strict format checking
- **SQL injection prevention**: Prepared statements
- **Path traversal prevention**: Safe file operations
- **Command injection prevention**: Sanitized inputs

### 2. Data Protection

- **Local storage**: All data stored locally
- **No external APIs**: Self-contained operation
- **Permission checking**: File system access validation
- **Error information**: Limited error details in production

## Scalability Design

### 1. Horizontal Scaling

- **Stateless services**: Services can be instantiated multiple times
- **Database isolation**: Each project has its own database
- **Service independence**: Services can be deployed separately

### 2. Vertical Scaling

- **Connection pooling**: Database connection management
- **Memory optimization**: Efficient data structures
- **Async processing**: Non-blocking operations

### 3. Extension Points

- **Plugin system**: Future extensibility
- **Service interfaces**: Abstract service definitions
- **Configuration-driven**: Behavior controlled by configuration

## Testing Strategy

### 1. Test Pyramid

```
    ┌─────────────┐
    │ Integration │ ← Few, high-level tests
    ├─────────────┤
    │   Service   │ ← Medium number, service-level tests
    ├─────────────┤
    │    Unit     │ ← Many, low-level tests
    └─────────────┘
```

### 2. Test Types

- **Unit tests**: Individual function testing
- **Service tests**: Service layer integration
- **Integration tests**: End-to-end workflows
- **Performance tests**: Load and stress testing

### 3. Test Coverage

- **Code coverage**: Aim for >90% coverage
- **Path coverage**: Test all execution paths
- **Error coverage**: Test error scenarios
- **Boundary coverage**: Test edge cases

## Deployment Architecture

### 1. Local Development

- **Direct execution**: `bun run src/index.ts`
- **Hot reloading**: Development server with file watching
- **Debug mode**: Enhanced logging and error details

### 2. Production Deployment

- **Subtree integration**: Git subtree for client projects
- **Binary distribution**: Compiled TypeScript (future)
- **Package distribution**: NPM package (future)

### 3. CI/CD Integration

- **Automated testing**: Run tests on every commit
- **Quality gates**: Lint, test, and build validation
- **Deployment automation**: Automated release process

## Future Architecture

### 1. Planned Extensions

- **GitHub integration**: Issue linking and PR management
- **AI assistance**: Intelligent task suggestions
- **Team collaboration**: Multi-user support
- **Plugin system**: Third-party extensions

### 2. Architecture Evolution

- **Microservices**: Service decomposition
- **Event-driven**: Async event processing
- **API-first**: RESTful API endpoints
- **Cloud-native**: Containerized deployment

## Conclusion

Dev Agent's architecture provides a solid foundation for:

- **Maintainability**: Clear separation of concerns
- **Testability**: Dependency injection and mocking
- **Extensibility**: Plugin-ready service interfaces
- **Performance**: Efficient data handling and async operations
- **Security**: Input validation and safe operations

The layered design ensures that changes in one layer don't affect others, making the system robust and easy to evolve over time.

## Next Steps

- [Getting Started Guide](getting-started.md)
- [CLI Commands Reference](cli-commands.md)
- [Configuration Guide](configuration.md)
- [Developer Guide](developer-guide.md)
