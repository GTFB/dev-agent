# Getting Started with Dev Agent

## Introduction

Dev Agent is a powerful CLI tool that automates and standardizes the complete software development lifecycle according to the **High-Efficiency Standard Operating Protocol**. It's designed to minimize human errors, reduce time spent on routine operations, and ensure predictable, high-quality development processes.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh) v1.x or later
- Git repository initialized in your project
- Basic understanding of Git workflows

## Installation

### Step 1: Add Dev Agent as Subtree

Dev Agent is designed to be integrated into your project as a Git subtree. This approach ensures that:

- The tool is version-controlled within your project
- Updates can be pulled independently
- No external dependencies are required

```bash
# In your project root
git subtree add --prefix=dev-agent https://github.com/your-org/dev-agent.git main --squash
```

### Step 2: Install Dependencies (if needed)

```bash
cd dev-agent
bun install
cd ..
```

### Step 3: Initialize Dev Agent

```bash
bun run dev-agent/src/index.ts init
```

This command will:

- Create the SQLite database (`.dev-agent.db`) in your project root
- Set up default configuration values
- Verify Git repository status
- Apply database schema migrations

## First Steps

### 1. Configure Your Project

Set up basic configuration for your project:

```bash
# Set GitHub repository information
bun run dev-agent/src/index.ts config set github.owner "your-org"
bun run dev-agent/src/index.ts config set github.repo "your-project"

# Verify configuration
bun run dev-agent/src/index.ts config list
```

### 2. Create Your First Task

```bash
bun run dev-agent/src/index.ts task create "Implement user authentication" -d "Add JWT-based authentication system"
```

The system will generate a unique AID (Atomic ID) for your task, such as `g-a1b2c3`.

### 3. Start Working

```bash
bun run dev-agent/src/index.ts task start g-a1b2c3
```

This will:

- Switch to the `develop` branch
- Pull latest changes
- Create a feature branch: `feature/g-a1b2c3-implement-user-authentication`
- Update task status to `in_progress`

### 4. Complete the Task

```bash
bun run dev-agent/src/index.ts task complete g-a1b2c3
```

## Understanding the AID System

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

## Project Structure

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

## Next Steps

- [CLI Commands Reference](02-cli-commands.md)
- [Configuration Guide](03-configuration.md)
- [Developer Guide](04-developer-guide.md)
- [Architecture Overview](05-architecture.md)
- [Development Protocols](protocols/README.md)

## Troubleshooting

### Common Issues

**Database not initialized error**

- Ensure you've run `bun run dev-agent/src/index.ts init` first
- Check that you have write permissions in your project directory

**Git repository not found**

- Ensure you're in a Git repository: `git status`
- Run `git init` if needed

**Permission denied errors**

- Check file permissions in your project directory
- Ensure Bun has access to create files

### Getting Help

- Run `bun run dev-agent/src/index.ts help` for command overview
- Check the [CLI Commands Reference](02-cli-commands.md) for detailed usage
- Review logs in the `.logs/` directory for debugging information
