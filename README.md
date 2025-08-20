# Dev Agent 🚀

**CLI assistant for automating the High-Efficiency Standard Operating Protocol**

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/your-org/dev-agent)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
![Test Coverage](docs/assets/coverage.svg)
[![Bun](https://img.shields.io/badge/runtime-Bun-000000.svg)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)

## 🎯 What is Dev Agent?

Dev Agent is a powerful CLI tool that automates and standardizes the complete software development lifecycle according to the **High-Efficiency Standard Operating Protocol**. It's designed to minimize human errors, reduce time spent on routine operations, and ensure predictable, high-quality development processes.

## 🛠️ Technologies & Tools

### Core Technologies
- **Runtime**: [Bun](https://bun.sh) v1.x+ - Ultra-fast JavaScript runtime
- **Language**: **TypeScript ONLY** - Strict typing for reliability
- **Database**: SQLite with bun:sqlite driver - Local data storage
- **CLI Framework**: Commander.js - Command-line interface

### Development Tools
- **Package Manager**: Bun (NO npm/yarn allowed)
- **Testing**: Bun test runner
- **Linting**: ESLint with TypeScript rules
- **Git Hooks**: Automated language compliance checking

### CI/CD Pipeline

Our project uses GitHub Actions for automated testing, quality checks, and deployment:

- **🔄 Continuous Integration**: Automated testing on every push and PR
- **📊 Quality Gates**: 90%+ test coverage, linting, security audits
- **🚀 Automated Releases**: Version management and GitHub releases
- **📈 Coverage Badge**: Real-time test coverage monitoring

See [CI/CD Documentation](docs/ci-cd.md) for detailed information.

### Language Requirements

> **🚨 CRITICAL: ENGLISH ONLY POLICY**
> 
> **ALL** code, comments, documentation, commit messages, and user-facing text **MUST** be in English.
> 
> - ✅ **Allowed**: TypeScript (.ts), Markdown (.md), JSON (.json)
> - ❌ **FORBIDDEN**: JavaScript (.js), any non-English content
> - 🤖 **Automated**: Language compliance is enforced by Git pre-commit hooks

## 📁 Project Structure (IMMUTABLE)

> **⚠️ WARNING: This structure is IMMUTABLE and must NEVER be violated**

```
dev-agent/                          # PROJECT ROOT
├── 🔧 CONFIGURATION
│   ├── package.json                 # Dependencies & scripts
│   ├── tsconfig.json               # TypeScript configuration
│   ├── bun.lock                    # Locked dependencies
│   └── Makefile                    # Build automation
│
├── 📊 DATABASE & STORAGE
│   ├── dev-agent.db                # SQLite database (auto-generated)
│   ├── backups/                    # Database backups
│   └── logs/                       # Application logs
│
├── 📖 DOCUMENTATION
│   ├── README.md                   # This file
│   ├── LICENSE                     # MIT License
│   ├── docs/                       # Documentation files
│   │   ├── getting-started.md      # Setup and basic usage
│   │   ├── cli-commands.md         # Complete command reference
│   │   ├── configuration.md        # Configuration guide
│   │   ├── developer-guide.md      # Development setup
│   │   ├── architecture.md         # System architecture
│   │   ├── github-setup.md         # GitHub integration
│   │   ├── language-compliance.md  # Language policy
│   │   ├── backups.md              # Backup documentation
│   │   └── protocols/              # Development protocols
│   │       ├── auto-protocol-enforcer.md
│   │       ├── high-efficiency-sop.md
│   │       ├── protocol-test-examples.md
│   │       ├── README.md
│   │       └── refactoring.md
│   │
├── 💻 SOURCE CODE (TypeScript ONLY)
│   └── src/                        # All source code
│       ├── index.ts                # CLI entry point
│       ├── core/                   # Core system components
│       │   ├── aid-generator.ts    # Atomic ID generation
│       │   ├── database.ts         # Database management
│       │   ├── schema.ts           # Database schema & migrations
│       │   └── types.ts            # Type definitions
│       ├── config/                 # Configuration management
│       │   ├── config.ts           # Database-backed config
│       │   └── llm-config.ts       # LLM provider configuration
│       ├── services/               # Business logic services
│       │   ├── AIDService.ts
│       │   ├── AutoTranslationService.ts
│       │   ├── GitHubService.ts
│       │   ├── GitService.ts
│       │   ├── LanguageDetectionService.ts
│       │   ├── LLMTranslationService.ts
│       │   ├── StorageService.ts
│       │   ├── ValidationService.ts
│       │   └── WorkflowService.ts
│       ├── middleware/              # Request/response middleware
│       │   └── LanguageValidationMiddleware.ts
│       ├── scripts/                # Utility scripts
│       │   ├── check-language.ts   # Language compliance checker
│       │   ├── config-manager.ts   # Configuration CLI
│       │   └── init-db.ts          # Database initialization
│       └── utils/                  # Utility functions
│           └── logger.ts           # Logging utilities
│
├── 🧪 TESTING
│   └── tests/                      # Test files (mirrors src/)
│       ├── core/
│       ├── services/
│       └── utils/
│
└── 🔧 GIT CONFIGURATION
    └── .git/hooks/                 # Git hooks
        └── pre-commit              # Language compliance enforcement
```

### 🚫 Forbidden Patterns

These patterns are **STRICTLY FORBIDDEN** and will cause build failures:

```bash
# ❌ NEVER create these
*.js                    # JavaScript files
*.jsx                   # React JavaScript files  
scripts/               # Scripts in project root
temp/                  # Temporary directories
data/                  # Data directories
.env                   # Environment files
config.json            # JSON configuration files
node_modules/          # Wrong package manager
```

### ✅ Required Patterns

All files must follow these patterns:

```bash
# ✅ ALWAYS use these
src/**/*.ts            # TypeScript source files
tests/**/*.test.ts     # TypeScript test files
docs/**/*.md           # Markdown documentation
*.json                 # Configuration as JSON (only in root)
```

## ✨ Key Features

- **🔄 Automated Workflow Management** - Streamlines goal creation, development, and completion
- **🌿 Smart Git Operations** - Automated branch management and Git workflow
- **📊 Goal Tracking** - Local SQLite database for efficient goal management
- **⚡ High Performance** - Built with Bun for maximum speed and efficiency
- **🔒 AID System** - Typed entity identifiers for reliable data management
- **📝 Comprehensive Logging** - Detailed logging with multiple levels
- **🌍 Language Compliance** - Automated English-only enforcement
- **🗃️ Database-Backed Configuration** - All settings stored in SQLite

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.x or later (**REQUIRED**)
- Git repository initialized in your project
- **NO Node.js/npm/yarn required or allowed**

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/dev-agent.git
cd dev-agent

# Install dependencies (Bun ONLY)
bun install

# Initialize database and configuration
bun run db:init

# Verify installation
bun run src/index.ts --version
```

### Essential Commands

```bash
# Database Management
bun run db:init                     # Initialize/migrate database
bun run db:reset                    # Reset database (caution!)

# Configuration
bun run config:show                 # Show all configuration
bun run config:set key value        # Set configuration value
bun run config:validate             # Validate configuration

# Language Compliance
bun run lang:check                  # Check all files for language compliance
bun run lang:check-staged           # Check staged files (pre-commit)

# Goal Management
bun run src/index.ts goal create "Goal Title"
bun run src/index.ts goal list
bun run src/index.ts goal start <goal-id>
bun run src/index.ts goal complete <goal-id>
```

## 🤖 Language Compliance System

Dev Agent enforces strict English-only policies through automated systems:

### Automatic Detection & Prevention

- **Pre-commit hooks** - Block commits with non-English content
- **Unicode detection** - Identifies Cyrillic and other non-Latin scripts
- **Pattern matching** - Detects non-English words and phrases
- **File monitoring** - Scans all .ts, .md, .json files

### Supported LLM Providers

For automatic translation (when needed):

- **OpenAI GPT** - High-quality translations
- **Anthropic Claude** - Professional-grade translations
- **Google Gemini** - Fast and cost-effective
- **Custom APIs** - Support for any compatible LLM service

### Setup Translation (Optional)

```bash
# Configure LLM provider for translations
bun run src/scripts/config-manager.ts set llm.defaultProvider openai
bun run src/scripts/config-manager.ts set llm.apiKey your_api_key

# Test language detection
bun run src/index.ts lang check "Your text here"
```

## 🔧 Configuration Management

All configuration is stored in the SQLite database (`dev-agent.db`):

### View Configuration

```bash
# Show all configuration
bun run config:show

# Get specific value
bun run config:get storage.dataDir
```

### Set Configuration

```bash
# Project settings
bun run config:set project.name "My Project"
bun run config:set project.version "1.0.0"

# GitHub integration
bun run config:set github.owner "your-username"
bun run config:set github.repo "your-repository"
bun run config:set github.token "your-token"

# LLM providers
bun run config:set llm.defaultProvider "openai"
bun run config:set llm.apiKey "your-api-key"
```

### Configuration Categories

- **database** - Database connection settings
- **project** - Project metadata
- **github** - GitHub integration
- **llm** - Language model providers
- **logging** - Log levels and output
- **storage** - File storage paths

## 🆔 AID System

Dev Agent uses an **Atomic ID (AID)** system for reliable entity identification:

- **Format**: `[prefix]-[a-z0-9]{6}`
- **Examples**: `g-a1b2c3` (goal), `d-d4e5f6` (document)

### Entity Types

- **G** - Goals/Tasks
- **D** - Documents
- **P** - Projects
- **U** - Users
- **S** - Settings
- **L** - Logs

## 🧪 Development

### Development Commands

```bash
# Run tests
bun test

# Check language compliance
bun run lang:check

# Lint code
bun run lint

# Type checking
bun run type-check

# Database operations
bun run db:init                     # Initialize
bun run db:reset                    # Reset (destructive)
```

### Code Quality Standards

1. **TypeScript ONLY** - No JavaScript files allowed
2. **English ONLY** - All text must be in English
3. **Strict typing** - No `any` types allowed
4. **Comprehensive tests** - All features must have tests
5. **Documentation** - All public APIs documented

### Git Hooks

Pre-commit hooks automatically:
- Check language compliance
- Run TypeScript compilation
- Execute linting
- Validate file structure

## 📚 Documentation

- [Getting Started](docs/getting-started.md) - Setup and basic usage
- [CLI Commands](docs/cli-commands.md) - Complete command reference
- [Configuration](docs/configuration.md) - Configuration guide
- [Developer Guide](docs/developer-guide.md) - Development setup
- [Architecture](docs/architecture.md) - System architecture
- [GitHub Setup](docs/github-setup.md) - GitHub integration
- [Language Compliance](docs/language-compliance.md) - Language policy enforcement
- [Backups](docs/backups.md) - Backup directory documentation
- [Quick Commands](docs/quick-commands.md) - Command reference and examples
- [Protocols](docs/protocols/) - Development protocols
- [Changelog](docs/CHANGELOG.md) - Version history and changes

## 🤝 Contributing

1. **Language**: All contributions must be in English
2. **Code**: TypeScript only, no JavaScript
3. **Structure**: Follow the immutable project structure
4. **Testing**: Include tests for all new features
5. **Documentation**: Update relevant documentation

### Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Write TypeScript code with English comments
4. Add tests and documentation
5. Run `bun run lang:check` to verify language compliance
6. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Bun](https://bun.sh) for exceptional performance
- TypeScript for type safety and developer experience
- SQLite for reliable local data storage
- Git hooks for automated quality control

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/dev-agent/issues)
- **Documentation**: [docs/](docs/)
- **Language**: All support requests must be in English

---

**Made with ❤️ for English-only, TypeScript-first development**