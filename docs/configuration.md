# Configuration Guide

## Overview

Dev Agent uses a simple key-value configuration system stored in SQLite. Configuration values are automatically created during initialization and can be customized to match your project's needs.

## Configuration Storage

- **Database**: SQLite (`.dev-agent.db`)
- **Table**: `project_config`
- **Format**: Key-value pairs
- **Persistence**: Survives project restarts

## Default Configuration

When you run `bun run dev-agent/src/index.ts init`, the following default values are automatically set:

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

## Configuration Categories

### 1. GitHub Settings

Configure your GitHub repository information for future integrations.

#### `github.owner`

- **Purpose**: GitHub organization or username
- **Example**: `"acme-corp"` or `"john-doe"`
- **Usage**: Used for GitHub API calls and issue linking

#### `github.repo`

- **Purpose**: GitHub repository name
- **Example**: `"web-app"` or `"mobile-app"`
- **Usage**: Used for GitHub API calls and issue linking

**Setting GitHub Configuration:**

```bash
bun run dev-agent/src/index.ts config set github.owner "acme-corp"
bun run dev-agent/src/index.ts config set github.repo "web-app"
```

### 2. Branch Naming

Configure your Git branch naming conventions.

#### `branches.main`

- **Purpose**: Main production branch name
- **Default**: `"main"`
- **Alternatives**: `"master"`, `"production"`
- **Usage**: Used for release management and hotfixes

#### `branches.develop`

- **Purpose**: Development integration branch name
- **Default**: `"develop"`
- **Alternatives**: `"development"`, `"dev"`
- **Usage**: Used for feature branch integration

#### `branches.feature_prefix`

- **Purpose**: Prefix for feature branches
- **Default**: `"feature"`
- **Alternatives**: `"feat"`, `"task"`
- **Usage**: Creates branches like `feature/g-a1b2c3-task-title`

#### `branches.release_prefix`

- **Purpose**: Prefix for release branches
- **Default**: `"release"`
- **Alternatives**: `"rel"`, `"version"`
- **Usage**: Creates branches like `release/v1.2.0`

**Setting Branch Configuration:**

```bash
bun run dev-agent/src/index.ts config set branches.main "main"
bun run dev-agent/src/index.ts config set branches.develop "develop"
bun run dev-agent/src/index.ts config set branches.feature_prefix "feature"
bun run dev-agent/src/index.ts config set branches.release_prefix "release"
```

### 3. Task Settings

Configure task-related behavior and validation.

#### `tasks.default_status`

- **Purpose**: Default status for newly created tasks
- **Default**: `"todo"`
- **Valid Values**: `"todo"`, `"in_progress"`, `"done"`, `"archived"`
- **Usage**: Sets initial status when creating tasks

#### `tasks.id_pattern`

- **Purpose**: Regular expression for validating task IDs
- **Default**: `"^g-[a-z0-9]{6}$"`
- **Pattern**: Ensures task IDs follow AID format
- **Usage**: Validates task ID format in commands

**Setting Task Configuration:**

```bash
bun run dev-agent/src/index.ts config set tasks.default_status "todo"
bun run dev-agent/src/index.ts config set tasks.id_pattern "^g-[a-z0-9]{6}$"
```

## Managing Configuration

### View All Configuration

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

### Get Specific Configuration

```bash
bun run dev-agent/src/index.ts config get <key>
```

**Examples:**

```bash
bun run dev-agent/src/index.ts config get github.owner
bun run dev-agent/src/index.ts config get branches.feature_prefix
bun run dev-agent/src/index.ts config get tasks.default_status
```

**Output:**

```
✅ Configuration value: acme-corp
github.owner = acme-corp
```

### Set Configuration

```bash
bun run dev-agent/src/index.ts config set <key> <value>
```

**Examples:**

```bash
bun run dev-agent/src/index.ts config set github.owner "acme-corp"
bun run dev-agent/src/index.ts config set branches.feature_prefix "feat"
bun run dev-agent/src/index.ts config set tasks.default_status "in_progress"
```

**Output:**

```
✅ Configuration updated: github.owner = acme-corp
```

## Configuration Best Practices

### 1. Set Configuration Early

Configure your project immediately after initialization:

```bash
# Initialize project
bun run dev-agent/src/index.ts init

# Configure GitHub
bun run dev-agent/src/index.ts config set github.owner "your-org"
bun run dev-agent/src/index.ts config set github.repo "your-project"

# Configure branches (if different from defaults)
bun run dev-agent/src/index.ts config set branches.feature_prefix "feat"
bun run dev-agent/src/index.ts config set branches.release_prefix "rel"
```

### 2. Use Consistent Naming

Maintain consistency across your organization:

```bash
# Standard branch naming
bun run dev-agent/src/index.ts config set branches.main "main"
bun run dev-agent/src/index.ts config set branches.develop "develop"
bun run dev-agent/src/index.ts config set branches.feature_prefix "feature"
bun run dev-agent/src/index.ts config set branches.release_prefix "release"
bun run dev-agent/src/index.ts config set branches.hotfix_prefix "hotfix"
```

### 3. Validate Configuration

Regularly check your configuration:

```bash
# List all configuration
bun run dev-agent/src/index.ts config list

# Verify critical settings
bun run dev-agent/src/index.ts config get github.owner
bun run dev-agent/src/index.ts config get branches.feature_prefix
```

## Advanced Configuration

### Custom Configuration Keys

You can add custom configuration keys for your specific needs:

```bash
# Project-specific settings
bun run dev-agent/src/index.ts config set project.name "My Awesome Project"
bun run dev-agent/src/index.ts config set project.version "1.0.0"
bun run dev-agent/src/index.ts config set project.environment "development"

# Team settings
bun run dev-agent/src/index.ts config set team.lead "john.doe@company.com"
bun run dev-agent/src/index.ts config set team.slack_channel "#dev-team"
```

### Environment-Specific Configuration

Consider different configurations for different environments:

```bash
# Development environment
bun run dev-agent/src/index.ts config set environment "development"
bun run dev-agent/src/index.ts config set debug.enabled "true"
bun run dev-agent/src/index.ts config set logging.level "debug"

# Production environment
bun run dev-agent/src/index.ts config set environment "production"
bun run dev-agent/src/index.ts config set debug.enabled "false"
bun run dev-agent/src/index.ts config set logging.level "info"
```

## Configuration Persistence

### Database Storage

Configuration is stored in the SQLite database:

```sql
CREATE TABLE project_config (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
```

### Backup and Restore

To backup your configuration:

```bash
# Export configuration to JSON
sqlite3 .dev-agent.db "SELECT key, value FROM project_config;" > config_backup.txt

# Restore configuration (manual process)
# Edit config_backup.txt and use config set commands
```

## Troubleshooting

### Common Configuration Issues

**Configuration not found error:**

```
❌ Configuration key 'github.owner' not found
Error: Configuration not found
```

**Solution:** Ensure you've run `init` first and set the configuration value.

**Invalid configuration value:**

```
❌ Failed to set configuration
Error: Invalid value for key
```

**Solution:** Check the expected format and valid values for the configuration key.

**Configuration not persisting:**

- Ensure you have write permissions to the database
- Check that the database file (`.dev-agent.db`) exists
- Verify the database is not corrupted

### Configuration Validation

Dev Agent validates configuration values:

- **Branch names**: Must be valid Git branch names
- **Status values**: Must be valid task statuses
- **Patterns**: Must be valid regular expressions
- **GitHub values**: Must be valid GitHub identifiers

## Next Steps

- [Getting Started Guide](getting-started.md)
- [CLI Commands Reference](cli-commands.md)
- [Developer Guide](developer-guide.md)
- [Architecture Overview](architecture.md)
