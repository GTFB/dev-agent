# Dev Agent Documentation

Welcome to the Dev Agent documentation! This comprehensive guide will help you understand, install, configure, and use Dev Agent effectively.

## 📚 Documentation Index

### 🚀 Getting Started

- **[Getting Started Guide](getting-started.md)** - Quick start and first steps
- **[CLI Commands Reference](cli-commands.md)** - Complete command reference
- **[Configuration Guide](configuration.md)** - System configuration and customization
- **[Language Compliance](language-compliance.md)** - Language policy enforcement
- **[Backups](backups.md)** - Backup directory documentation

### 🛠️ Development

- **[Developer Guide](developer-guide.md)** - Contributing and development setup
- **[Architecture Overview](architecture.md)** - System design and architecture

### 📋 Protocols

- **[Development Protocols](protocols/README.md)** - Standardized workflows and procedures
- **[High-Efficiency SOP](protocols/high-efficiency-sop.md)** - Core development and release protocol

### 📖 Quick Reference

#### Essential Commands

```bash
# Initialize project
bun run dev-agent/src/index.ts init

# Create task
bun run dev-agent/src/index.ts task create "Task title"

# List tasks
bun run dev-agent/src/index.ts task list

# Start working
bun run dev-agent/src/index.ts task start <task-id>

# Complete task
bun run dev-agent/src/index.ts task complete <task-id>
```

#### Configuration

```bash
# Set GitHub repository
bun run dev-agent/src/index.ts config set github.owner "your-org"
bun run dev-agent/src/index.ts config set github.repo "your-project"

# View configuration
bun run dev-agent/src/index.ts config list
```

## 🎯 What is Dev Agent?

Dev Agent is a powerful CLI tool that automates and standardizes the complete software development lifecycle according to the **High-Efficiency Standard Operating Protocol**. It's designed to:

- **Minimize human errors** in development workflows
- **Reduce time spent** on routine operations
- **Ensure predictable, high-quality** development processes
- **Provide consistent** task management and Git workflows

## ✨ Key Features

- **🔄 Automated Workflow Management** - Streamlines task creation, development, and completion
- **🌿 Smart Git Operations** - Automated branch management and Git workflow
- **📊 Task Tracking** - Local SQLite database for efficient task management
- **⚡ High Performance** - Built with Bun for maximum speed and efficiency
- **🔒 AID System** - Typed entity identifiers for reliable data management
- **📝 Comprehensive Logging** - Detailed logging with multiple levels

## 🏗️ Architecture

Dev Agent follows a clean, layered architecture:

```
┌─────────────────────────────────────┐
│           CLI Layer                 │
│      (Commander.js Interface)      │
├─────────────────────────────────────┤
│        Workflow Service             │
│   (Business Logic Orchestrator)    │
├─────────────────────────────────────┤
│      Service Layer                  │
│  Storage | Git | GitHub | AI       │
├─────────────────────────────────────┤
│         Core Layer                  │
│   Types | Database | AID Gen       │
└─────────────────────────────────────┘
```

## 🆔 AID System

Dev Agent uses an **Atomic ID (AID)** system for reliable entity identification:

- **Format**: `[prefix]-[a-z0-9]{6}`
- **Examples**:
  - `g-a1b2c3` (task)
  - `a-d4e5f6` (document)
  - `b-x7y8z9` (inventory item)

### Entity Type Prefixes

- **G** - Goals/Tasks
- **A** - Archive/Documents
- **B** - Base/Inventory
- **C** - Contractor/Legal entities
- **D** - Deal/Sales deals
- **E** - Employee/Staff
- **F** - Finance/Transactions
- **H** - Human/Natural persons
- **I** - Invoice/Bills
- **J** - Journal/System logs
- **K** - Key/API keys, tokens
- **L** - Location/Geo points
- **M** - Message/Messages
- **N** - Notice/Notifications
- **O** - Outreach/Marketing
- **P** - Product/Products
- **Q** - Qualification/Assessments
- **R** - Routine/Automation
- **S** - Segment/Segments
- **T** - Text/Content
- **U** - University/LMS/Education
- **V** - Vote/Surveys
- **W** - Wallet/Wallets
- **X** - Xpanse/Spaces
- **Y** - Yard/Gamification
- **Z** - Zoo/Animals

## 🚀 Quick Start

### 1. Add Dev Agent as Subtree

```bash
# In your project root
git subtree add --prefix=dev-agent https://github.com/your-org/dev-agent.git main --squash
```

### 2. Initialize

```bash
bun run dev-agent/src/index.ts init
```

### 3. Configure

```bash
bun run dev-agent/src/index.ts config set github.owner "your-org"
bun run dev-agent/src/index.ts config set github.repo "your-project"
```

### 4. Create Your First Task

```bash
bun run dev-agent/src/index.ts task create "Implement user authentication"
```

## 📋 Project Structure

After initialization, your project will contain:

```
your-project/
├── .dev-agent.db          # SQLite database
├── .dev-agent.db-shm      # SQLite shared memory
├── .dev-agent.db-wal      # SQLite write-ahead log
├── dev-agent/             # Dev Agent subtree
│   ├── src/               # Source code
│   ├── tests/             # Test files
│   ├── docs/              # Documentation
│   └── package.json       # Dependencies
└── .git/                  # Git repository
```

## 🔧 Configuration

Dev Agent uses a simple key-value configuration system stored in SQLite. The database file (`.dev-agent.db`) is created in your project root when you run `init`.

### Default Configuration

```json
{
  "github.owner": "",
  "github.repo": "",
  "branches.main": "main",
  "branches.develop": "develop",
  "branches.feature_prefix": "feature",
  "branches.release_prefix": "release",
  "tasks.default_status": "todo",
  "tasks.id_pattern": "^g-[a-z0-9]{6}$"
}
```

## 🧪 Development

### Prerequisites

- Bun v1.x
- TypeScript 5.x
- Git

### Setup Development Environment

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run quality checks
bun run quality

# Build project
bun run build

# Generate documentation
bun run docs:generate
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/dev-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/dev-agent/discussions)
- **Documentation**: [docs/](docs/)

## 🤝 Contributing

We welcome contributions! Please see our [Developer Guide](developer-guide.md) for details on:

- Development setup
- Code style guidelines
- Testing requirements
- Pull request process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Made with ❤️ by the Dev Agent Team**
