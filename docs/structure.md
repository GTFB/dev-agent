# Project Structure Documentation

> **📋 Complete file and directory structure of the Dev Agent project**

## 🏗️ Project Overview

**Dev Agent** is a CLI assistant for automating the High-Efficiency Standard Operating Protocol, built with TypeScript and Bun runtime.

## 📁 Root Directory Structure

```
dev-agent/                          # PROJECT ROOT
├── 🔧 CONFIGURATION FILES
├── 📖 DOCUMENTATION
├── 💻 SOURCE CODE
├── 🧪 TESTING
├── 🔧 GIT CONFIGURATION
├── 📦 DEPENDENCIES
└── 🚀 CI/CD WORKFLOWS
```

## 🔧 Configuration Files (Root Level)

### Core Configuration
- **`config.json`** - Main project configuration with external storage paths
- **`config.sample.json`** - Sample configuration template
- **`package.json`** - Dependencies and scripts configuration
- **`bun.lock`** - Locked dependency versions
- **`tsconfig.json`** - TypeScript compiler configuration
- **`Makefile`** - Build automation and development commands
- **`.eslintrc.cjs`** - ESLint configuration
- **`.prettierrc`** - Prettier code formatting configuration

### Git Configuration
- **`.gitignore`** - Git ignore patterns (excludes external storage, logs, etc.)
- **`.gitattributes`** - Git attributes configuration

## 📖 Documentation Structure

### Main Documentation
- **`README.md`** - Project overview, setup, and usage guide
- **`LICENSE`** - MIT License file

### Documentation Directory (`docs/`)
```
docs/
├── 📚 ARCHITECTURE & GUIDES
│   ├── architecture.md              # System architecture overview
│   ├── developer-guide.md           # Development setup
│   ├── structure.md                 # This file - complete structure
│   ├── task-validation.md           # Task validation system
│   ├── ci-cd.md                     # CI/CD pipeline documentation
│   ├── versioning.md                # Version management guide
│   └── README.md                    # Documentation index
│
├── 📋 PROTOCOLS
│   └── goals-enforcer.md            # Meta-protocol for task classification
│
├── 📖 API DOCUMENTATION
│   └── api/                         # Generated TypeDoc API documentation
│
├── 🔧 DOCUMENTATION TOOLS
│   ├── docs-entry.ts                # TypeDoc entry point
│   └── tsconfig.docs.json          # TypeDoc TypeScript configuration
```

## 💻 Source Code Structure (`src/`)

### Entry Point
- **`index.ts`** - CLI entry point and main application logic

### Core System (`src/core/`)
```
src/core/
├── aid-generator.ts                 # Atomic ID generation system
├── database.ts                      # Database management and operations
├── schema.ts                        # Database schema and migrations
└── types.ts                         # Core type definitions
```

### Configuration Management (`src/config/`)
```
src/config/
├── config.ts                        # Main configuration interface
├── ConfigurationManager.ts          # Configuration orchestration
├── index.ts                         # Configuration exports
├── llm-config.ts                   # LLM provider configuration
├── types.ts                         # Configuration type definitions
├── README.md                        # Configuration documentation
├── validators/                      # Configuration validation
│   └── ConfigValidator.ts          # ZOD schema validation
│
├── examples/                        # Configuration examples
│   └── usage-example.ts            # Usage examples
│
└── providers/                       # Configuration providers
    ├── DatabaseConfigProvider.ts    # Database configuration provider
    ├── EnvironmentConfigProvider.ts # Environment variables provider
    └── ProjectConfigProvider.ts    # Project-specific configuration
```

### Business Logic Services (`src/services/`)
```
src/services/
├── AIDService.ts                    # Atomic ID service operations
├── AutoTranslationService.ts        # Automatic language translation
├── GitHubService.ts                 # GitHub integration service
├── GitService.ts                    # Git operations service
├── LanguageDetectionService.ts      # Language detection and validation
├── LLMTranslationService.ts        # LLM-based translation
├── ProjectConfigService.ts          # Project configuration service
├── StorageService.ts                # External storage management
├── ValidationService.ts             # Data validation service
└── WorkflowService.ts               # Workflow orchestration service
```

### Middleware (`src/middleware/`)
```
src/middleware/
└── LanguageValidationMiddleware.ts  # Language compliance middleware
```

### Utility Scripts (`src/scripts/`)
```
src/scripts/
├── project-init.ts                  # Interactive project initialization
├── check-language.ts                # Language compliance checker
├── check-schema.ts                  # Database schema validation
├── config-manager.ts                # Configuration CLI management
├── generate-coverage-badge.ts       # Coverage badge generation
├── github-manager.ts                # GitHub operations management
├── init-db.ts                       # Database initialization
├── llm-manager.ts                   # LLM provider management
├── validate-structure.ts            # Project structure validation
├── structure-validator.ts           # Structure validation engine
├── task-validator.ts                # Task validation and planning
└── version-manager.ts               # Version management operations
```

### Utility Functions (`src/utils/`)
```
src/utils/
├── env-loader.ts                    # Environment variable loading
└── logger.ts                        # Logging utilities
```

## 🧪 Testing Structure (`tests/`)

### Test Organization
```
tests/
├── config/                          # Configuration tests
│   └── config.test.ts              # Configuration tests
│
├── core/                            # Core system tests
│   ├── aid-generator.test.ts       # AID generator tests
│   └── database.test.ts            # Database tests
│
├── services/                        # Service layer tests
│   ├── AIDService.test.ts          # AID service tests
│   └── StorageService.test.ts      # Storage service tests
│
├── utils/                           # Utility tests
│   └── logger.test.ts               # Logger utility tests
│
└── scripts/                         # Script tests
    └── structure-validator.test.ts  # Structure validator tests
```

## 🔧 Development Scripts (`scripts/`)

### Root Level Scripts
```
scripts/
├── project-init.ps1                 # Interactive project initialization (PowerShell)
├── init-storage.ts                  # External storage initialization
├── set-db-path.ts                   # Database path configuration
└── update-coverage-badge.ts         # Dynamic coverage badge updates
```

## 🚀 CI/CD Workflows (`.github/workflows/`)

### GitHub Actions
```
# Note: .github directory is optional and may not exist in all installations
# When present, contains:
# ├── workflows/                     # GitHub Actions workflows
# │   ├── ci.yml                     # Main CI/CD pipeline (main/develop branches)
# │   ├── release.yml                # Release management workflow
# │   └── release-staging.yml        # Release branch staging workflow
```

## 📦 Dependencies Structure

### Package Management
- **`node_modules/`** - All installed dependencies (managed by Bun)
- **`bun.lock`** - Locked dependency versions

### Key Dependencies
- **TypeScript** - Language and compiler
- **Bun** - Runtime and package manager
- **Commander.js** - CLI framework
- **bun:sqlite** - Database driver
- **simple-git** - Git operations
- **ZOD** - Schema validation library

## 🗂️ External Storage Configuration

### Storage Paths (configured in `config.json`)
```
# Note: External storage paths are configurable
# Example structure:
# ├── database/                      # SQLite database files
# ├── logs/                         # Application logs
# ├── config/                       # Configuration files
# └── backups/                      # Database backups
```

## 🔒 Git Ignore Patterns

### Excluded Files and Directories
- **External storage** - External storage directories (configurable)
- **Database files** - `*.db`, `*.db-wal`, `*.db-shm`
- **Logs** - `logs/`, `*.log`
- **Build artifacts** - `build/`, `coverage/`
- **Dependencies** - `node_modules/`
- **Environment files** - `.env`, `.env.*`
- **Configuration** - `config.json` (personal config)
- **IDE files** - `.vscode/`, `.idea/`
- **OS files** - `.DS_Store`, `Thumbs.db`

## 🏗️ Architecture Principles

### File Organization Rules
1. **TypeScript ONLY** - No JavaScript files allowed
2. **English ONLY** - All content must be in English
3. **Strict Structure** - Follow immutable project structure
4. **Separation of Concerns** - Clear separation between layers
5. **External Storage** - All data stored externally, not in project

### Directory Naming Conventions
- **Lowercase** - All directory names use lowercase
- **Hyphen-separated** - Multi-word directories use hyphens
- **Descriptive** - Names clearly indicate purpose
- **Consistent** - Follow established patterns

## 📊 Project Statistics

### File Counts by Type
- **TypeScript (.ts)**: ~50+ files
- **Markdown (.md)**: ~15+ files
- **JSON (.json)**: ~5+ files
- **Configuration**: ~10+ files
- **Documentation**: ~15+ files

### Directory Depth
- **Maximum depth**: 6 levels (including node_modules)
- **Average depth**: 3-4 levels
- **Source code depth**: 2-3 levels

## 🔄 Maintenance and Updates

### Structure Validation
- **Automated checks** via `make validate`
- **Structure validation** via `src/scripts/validate-structure.ts`
- **Structure validator engine** via `src/scripts/structure-validator.ts`
- **CI/CD enforcement** via GitHub Actions

### Documentation Updates
- **Structure changes** must update this file
- **README updates** via CI/CD automation
- **Coverage badges** updated dynamically

## 🔍 Structure Validation System

The Structure Validation System automatically ensures that this file accurately reflects the current project structure. It runs before each commit and automatically fixes common issues.

### Quick Start

```bash
# Check structure without making changes
make validate

# Run all pre-commit checks
make ci-check
```

### Validation Rules

#### Required Files
The following files must be documented:
- `config.json` - Main configuration
- `package.json` - Dependencies
- `bun.lock` - Locked versions
- `tsconfig.json` - TypeScript config
- `Makefile` - Build automation
- `.gitignore` - Git ignore patterns

#### Main Directories
These directories must exist:
- `src/` - Source code
- `tests/` - Test files
- `docs/` - Documentation
- `scripts/` - Utility scripts
# Note: .github/ is optional and may not exist in all installations

#### Forbidden Files
These files should NOT exist in root:
- `database.db` - Database file in root
- `dev-agent.db` - Database file in root
- `.dev-agent.db` - Database file in root

### How It Works

1. **Structure Scanning** - Scans the entire project directory
2. **Documentation Parsing** - Reads this file and extracts documented paths
3. **Validation** - Compares actual structure with documented structure
4. **Auto-fixing** - Updates "Last Updated" date and adds missing files

## 📝 Notes

### Important Considerations
1. **External Storage** - Database and logs are stored externally
2. **No Local Data** - Project root should remain clean
3. **TypeScript Only** - JavaScript files are strictly forbidden
4. **English Only** - All content must be in English
5. **Immutable Structure** - Core structure cannot be changed

### Future Considerations
- **Modular Architecture** - Easy to extend with new services
- **External Storage** - Scalable storage solution
- **CI/CD Integration** - Automated quality checks
- **Documentation** - Comprehensive and up-to-date

---

**Last Updated**: 2025-08-24  
**Maintained By**: Dev Agent Architecture Team  
**Version**: 0.3.0
