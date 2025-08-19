# CLI Commands Reference

## Overview

Dev Agent provides a comprehensive set of CLI commands for managing your development workflow. All commands follow the pattern:

```bash
bun run dev-agent/src/index.ts <command> [subcommand] [options] [arguments]
```

## Global Options

All commands support these global options:

- `-v, --verbose` - Enable verbose logging
- `-d, --debug` - Enable debug logging
- `-h, --help` - Show help for the command

## Command Categories

### 1. Project Initialization

#### `init`

Initialize Dev Agent in the current project.

```bash
bun run dev-agent/src/index.ts init
```

**What it does:**

- Creates SQLite database (`.dev-agent.db`) in project root
- Applies database schema migrations
- Sets up default configuration values
- Verifies Git repository status

**Requirements:**

- Must be run in a Git repository
- Requires write permissions in project directory

**Output:**

```
✅ Dev Agent project initialized successfully

🎉 Dev Agent initialized successfully!

Next steps:
1. Configure GitHub repository: agent config set github.owner <owner>
2. Create your first task: agent task create "Task title"
3. Start working: agent task start <task-id>
```

### 2. Task Management

#### `task create`

Create a new task with optional description.

```bash
bun run dev-agent/src/index.ts task create "Task title" [-d "Description"]
```

**Arguments:**

- `title` (required) - Task title
- `-d, --description` (optional) - Task description

**Examples:**

```bash
# Simple task
bun run dev-agent/src/index.ts task create "Fix login bug"

# Task with description
bun run dev-agent/src/index.ts task create "Add user profile" -d "Implement user profile page with avatar upload"
```

**Output:**

```
✅ Task created successfully
Task ID: g-a1b2c3
Title: Fix login bug
Status: todo
```

#### `task list`

List all tasks with optional status filtering.

```bash
bun run dev-agent/src/index.ts task list [-s <status>]
```

**Options:**

- `-s, --status <status>` - Filter by status: `todo`, `in_progress`, `done`, `archived`

**Examples:**

```bash
# List all tasks
bun run dev-agent/src/index.ts task list

# List only in-progress tasks
bun run dev-agent/src/index.ts task list --status=in_progress

# List completed tasks
bun run dev-agent/src/index.ts task list -s done
```

**Output:**

```
✅ Found 3 tasks

📋 Task Summary:
   Todo: 1 | In Progress: 1 | Done: 1 | Archived: 0

⏳ TODO (1):
   g-a1b2c3: Fix login bug (19.08.2025)

🔄 IN_PROGRESS (1):
   g-d4e5f6 [feature/g-d4e5f6-add-user-profile]: Add user profile (19.08.2025)

✅ DONE (1):
   g-x7y8z9: Update documentation (19.08.2025)
```

#### `task start`

Start working on a task.

```bash
bun run dev-agent/src/index.ts task start <task-id>
```

**Arguments:**

- `task-id` (required) - Task AID (e.g., `g-a1b2c3`)

**What it does:**

- Validates task ID format
- Checks task exists and is in `todo` status
- Ensures working directory is clean
- Switches to `develop` branch
- Pulls latest changes
- Creates feature branch
- Updates task status to `in_progress`

**Examples:**

```bash
bun run dev-agent/src/index.ts task start g-a1b2c3
```

**Output:**

```
✅ Started working on task g-a1b2c3
Branch: feature/g-a1b2c3-fix-login-bug
Status: in_progress
```

#### `task complete`

Mark a task as completed.

```bash
bun run dev-agent/src/index.ts task complete <task-id>
```

**Arguments:**

- `task-id` (required) - Task AID

**Requirements:**

- Task must be in `in_progress` status
- Must be on the correct feature branch

**What it does:**

- Validates task status
- Checks current branch
- Updates task status to `done`
- Sets completion timestamp

**Examples:**

```bash
bun run dev-agent/src/index.ts task complete g-a1b2c3
```

**Output:**

```
✅ Task g-a1b2c3 completed successfully
Task ID: g-a1b2c3
Status: done
Completed: 2025-08-19T13:55:16.379Z
```

#### `task stop`

Stop working on a task and return to develop branch.

```bash
bun run dev-agent/src/index.ts task stop <task-id>
```

**Arguments:**

- `task-id` (required) - Task AID

**What it does:**

- Validates task status
- Switches back to `develop` branch
- Updates task status to `todo`
- Removes branch association

**Examples:**

```bash
bun run dev-agent/src/index.ts task stop g-a1b2c3
```

**Output:**

```
✅ Stopped working on task g-a1b2c3
Task ID: g-a1b2c3
Status: todo
```

### 3. Configuration Management

#### `config set`

Set a configuration value.

```bash
bun run dev-agent/src/index.ts config set <key> <value>
```

**Arguments:**

- `key` (required) - Configuration key (e.g., `github.owner`)
- `value` (required) - Configuration value

**Common Configuration Keys:**

**GitHub Settings:**

```bash
bun run dev-agent/src/index.ts config set github.owner "your-org"
bun run dev-agent/src/index.ts config set github.repo "your-project"
```

**Branch Naming:**

```bash
bun run dev-agent/src/index.ts config set branches.main "main"
bun run dev-agent/src/index.ts config set branches.develop "develop"
bun run dev-agent/src/index.ts config set branches.feature_prefix "feature"
bun run dev-agent/src/index.ts config set branches.release_prefix "release"
```

**Task Settings:**

```bash
bun run dev-agent/src/index.ts config set tasks.default_status "todo"
bun run dev-agent/src/index.ts config set tasks.id_pattern "^g-[a-z0-9]{6}$"
```

**Examples:**

```bash
bun run dev-agent/src/index.ts config set github.owner "acme-corp"
bun run dev-agent/src/index.ts config set branches.feature_prefix "feature"
```

**Output:**

```
✅ Configuration updated: github.owner = acme-corp
```

#### `config get`

Get a configuration value.

```bash
bun run dev-agent/src/index.ts config get <key>
```

**Arguments:**

- `key` (required) - Configuration key

**Examples:**

```bash
bun run dev-agent/src/index.ts config get github.owner
bun run dev-agent/src/index.ts config get branches.feature_prefix
```

**Output:**

```
✅ Configuration value: acme-corp
github.owner = acme-corp
```

#### `config list`

List all configuration values.

```bash
bun run dev-agent/src/index.ts config list
```

**Output:**

```
✅ Retrieved 8 configuration items

📋 Configuration:
   github.owner = acme-corp
   github.repo = web-app
   branches.main = main
   branches.develop = develop
   branches.feature_prefix = feature
   branches.release_prefix = release
   tasks.default_status = todo
   tasks.id_pattern = ^g-[a-z0-9]{6}$
```

### 4. Help and Information

#### `help`

Show detailed help information.

```bash
bun run dev-agent/src/index.ts help
```

**Output:**

```
🚀 Dev Agent - High-Efficiency Standard Operating Protocol
========================================================

Quick Start:
  agent init                    - Initialize project
  agent task create "Title"     - Create new task
  agent task start <task-id>    - Start working on task
  agent task complete <task-id> - Mark task as done
  agent task list               - List all tasks

Configuration:
  agent config set <key> <value> - Set configuration
  agent config get <key>         - Get configuration
  agent config list              - List all configuration

For detailed help on any command:
  agent <command> --help
```

#### Command-Specific Help

Get help for any specific command:

```bash
bun run dev-agent/src/index.ts <command> --help
```

**Examples:**

```bash
bun run dev-agent/src/index.ts task --help
bun run dev-agent/src/index.ts config --help
bun run dev-agent/src/index.ts task create --help
```

## Error Handling

All commands return structured error messages:

- **Success**: ✅ followed by success message
- **Error**: ❌ followed by error message and details

**Common Error Patterns:**

```
❌ Failed to create task
Error: Database not initialized. Call initialize() first.
```

## Logging

Dev Agent provides comprehensive logging:

- **Log files**: Stored in `.logs/dev-agent.log`
- **Log levels**: DEBUG, INFO, WARN, ERROR, SUCCESS
- **Global options**: `--verbose` and `--debug` for increased logging

## Examples

### Complete Workflow Example

```bash
# 1. Initialize project
bun run dev-agent/src/index.ts init

# 2. Configure GitHub
bun run dev-agent/src/index.ts config set github.owner "my-org"
bun run dev-agent/src/index.ts config set github.repo "my-project"

# 3. Create task
bun run dev-agent/src/index.ts task create "Add user authentication" -d "Implement JWT auth"

# 4. Start working
bun run dev-agent/src/index.ts task start g-a1b2c3

# 5. Complete task
bun run dev-agent/src/index.ts task complete g-a1b2c3

# 6. List all tasks
bun run dev-agent/src/index.ts task list
```

### Batch Configuration

```bash
# Set multiple configuration values
bun run dev-agent/src/index.ts config set github.owner "acme-corp"
bun run dev-agent/src/index.ts config set github.repo "web-app"
bun run dev-agent/src/index.ts config set branches.feature_prefix "feature"
bun run dev-agent/src/index.ts config set branches.release_prefix "release"

# Verify configuration
bun run dev-agent/src/index.ts config list
```

## Next Steps

- [Getting Started Guide](01-getting-started.md)
- [Configuration Guide](03-configuration.md)
- [Developer Guide](04-developer-guide.md)
- [Architecture Overview](05-architecture.md)
