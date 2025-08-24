# Configuration Architecture

## Overview

The configuration system follows a **layered architecture** that separates concerns and follows the Single Responsibility Principle. This approach avoids the "chicken and egg" problem of storing all configuration in a database.

## Why Not Store Everything in Database?

### The Fundamental Problem
If we store database connection details in the database itself, the application can never connect to it. This is a logical trap that breaks the system.

### Security Issues
- **Secrets in database files**: Database files (`.dev-agent.db`) are just files on disk - storing secrets there is a security risk
- **Environment isolation**: CI/CD pipelines don't have our local database, they need environment variables

### Version Control Issues
- **Protocol as Code**: Project rules (branch naming, GitHub settings) must be versioned with code
- **Team collaboration**: Changes to project rules should go through Pull Requests, not manual commands
- **Transparency**: Developers should see project rules by opening a text file, not by running special commands

## Architecture

### Core Components

1. **ConfigurationManager** - Main orchestrator that manages all configuration providers
2. **ConfigurationProvider** - Interface for different configuration sources
3. **BaseConfig** - Base interface for all configuration types with priority and source metadata

### Configuration Layers

The system uses a **priority-based layered approach**:

1. **Project Configuration** (Priority: 100)
   - Source: `config.json` file
   - Contains: Project rules, GitHub settings, branch conventions
   - **Versioned with code** (Protocol as Code principle)
   - **Shared across team** through Git

2. **Environment Configuration** (Priority: 200)
   - Source: Environment variables (`config/.env` file)
   - Contains: Secrets, environment-specific settings
   - **NOT versioned** (gitignored)
   - **Isolated per environment**

3. **Database Configuration** (Priority: 300)
   - Source: Database or defaults
   - Contains: Runtime state, LLM settings, storage paths
   - **Can be modified at runtime**
   - **Local to each developer**

## File Structure

```
dev-agent/
├── config/                  # Configuration files
│   ├── config.json     # Project rules (versioned)
│   └── .env                # Secrets (gitignored)
├── data/                    # Data and runtime files
│   ├── .dev-agent.db       # Database (gitignored)
│   ├── backups/            # Backup files
│   └── temp/               # Temporary files
├── src/                     # Source code
├── tsconfig.json            # TypeScript config (root - standard)
├── package.json             # Package config (root - standard)
└── logs/                    # Application logs (auto-created)
```

### Why Some Files Stay in Root?

- **`tsconfig.json`** - TypeScript standard, must be in root for IDE recognition
- **`package.json`** - Node.js standard, must be in root for package managers
- **`.gitignore`** - Git standard, must be in root for repository configuration

## Providers

#### ProjectConfigProvider
- Loads configuration from `config.json`
- Validates project structure
- Provides typed access to project settings

#### EnvironmentConfigProvider
- Loads from environment variables
- Provides type-safe access to secrets
- Handles `config/.env` file loading

#### DatabaseConfigProvider
- Provides database connection configuration
- Defaults to SQLite in `data/.dev-agent.db`
- Supports PostgreSQL and MySQL

## Usage

### Basic Usage

```typescript
import { configManager } from './config/index.js';

// Load all configurations
const config = await configManager.loadAll();

// Access specific configuration types
const projectConfig = await configManager.getProjectConfig();
const envConfig = await configManager.getEnvironmentConfig();
const dbConfig = await configManager.getDatabaseConfig();
```

### Configuration Validation

```typescript
// Validate all configurations
const validation = await configManager.validateAll();
if (!validation.isValid) {
  console.error('Configuration validation failed:', validation.errors);
}
```

## Benefits

1. **Separation of Concerns** - Each provider handles one configuration source
2. **Security** - Secrets stay in environment variables, not in versioned files
3. **Version Control** - Project rules are versioned and shared through Git
4. **Team Collaboration** - Changes to rules go through Pull Requests
5. **Environment Isolation** - Different environments can have different secrets
6. **Clean Structure** - Clear separation between config, data, and code
7. **Standards Compliance** - Follows TypeScript and Node.js conventions
8. **Extensibility** - Easy to add new configuration sources
9. **Type Safety** - Full TypeScript support with interfaces

## Migration

The old configuration system is still available for backward compatibility:

```typescript
// Old way (still works)
import { ConfigManager } from './config/config.js';
const oldConfig = new ConfigManager();

// New way (recommended)
import { configManager } from './config/index.js';
const newConfig = await configManager.loadAll();
```

## Future Enhancements

1. **Configuration Hot Reloading** - Watch for configuration changes
2. **Remote Configuration** - Load from remote sources (API, etc.)
3. **Configuration Encryption** - Encrypt sensitive configuration values
4. **Schema Validation** - JSON Schema validation for configurations
5. **Configuration Diffing** - Track configuration changes over time
