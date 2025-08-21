# Dev Agent 🚀

**CLI assistant for automating the High-Efficiency Standard Operating Protocol**

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/your-org/dev-agent)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/test%20coverage-90%25-brightgreen.svg)](https://github.com/your-org/dev-agent)
[![Bun](https://img.shields.io/badge/runtime-Bun-000000.svg)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)

## 🎯 What is Dev Agent?

Dev Agent is a powerful CLI tool that automates and standardizes the complete software development lifecycle according to the **High-Efficiency Standard Operating Protocol**. It's designed to minimize human errors, reduce time spent on routine operations, and ensure predictable, high-quality development processes.

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
bun run dev-agent/src/index.ts goal create "Implement user authentication"
```

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

## 📁 Project Structure

```
dev-agent/                          # PROJECT ROOT
├── 🔧 CONFIGURATION
│   ├── package.json                # Dependencies & scripts
│   ├── tsconfig.json              # TypeScript configuration
│   ├── bun.lock                   # Locked dependencies
│   ├── Makefile                   # Build automation
│   ├── .eslintrc.cjs             # ESLint configuration
│   ├── .prettierrc               # Prettier configuration
│   └── .dev-agent.json           # Dev Agent configuration
│
├── 📁 SOURCE CODE (TypeScript ONLY)
│   └── src/                       # All source code
│       ├── index.ts               # CLI entry point
│       ├── core/                  # Core system components
│       │   ├── types.ts          # TypeScript interfaces and types
│       │   ├── schema.ts         # Database schema & migrations
│       │   ├── database.ts       # Database connection & management
│       │   └── aid-generator.ts  # AID generation & validation
│       ├── services/             # Business logic services
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
│       ├── config/               # Configuration management
│       │   ├── config.ts         # Database-backed config
│       │   ├── ConfigurationManager.ts
│       │   ├── llm-config.ts
│       │   ├── types.ts
│       │   └── providers/        # Configuration providers
│       ├── middleware/           # Request/response middleware
│       │   └── LanguageValidationMiddleware.ts
│       ├── scripts/              # Utility scripts
│       │   ├── check-language.ts
│       │   ├── check-schema.ts
│       │   ├── config-manager.ts
│       │   ├── generate-coverage-badge.ts
│       │   ├── github-manager.ts
│       │   ├── init-db.ts
│       │   ├── llm-manager.ts
│       │   ├── validate-structure.ts
│       │   └── version-manager.ts
│       └── utils/                # Utility functions
│           ├── env-loader.ts
│           ├── logger.ts
│           └── types.ts
│
├── 🧪 TESTING
│   └── tests/                    # Test files (mirrors src/)
│       ├── core/                 # Core module tests
│       ├── services/             # Service layer tests
│       ├── config/               # Configuration tests
│       ├── scripts/              # Script tests
│       └── utils/                # Utility tests
│
├── 📖 DOCUMENTATION
│   ├── docs/                     # Documentation files
│   │   ├── api/                  # API Reference (auto-generated)
│   │   ├── README.md             # Documentation index
│   │   ├── developer-guide.md
│   │   ├── architecture.md
│   │   ├── ci-cd.md
│   │   ├── versioning.md
│   │   ├── structure.md
│   │   ├── structure-validation.md
│   │   └── CHANGELOG.md
│   └── README.md                 # Main project overview
│
├── 🔧 DEVELOPMENT
│   ├── scripts/                  # Build & utility scripts
│   │   └── set-db-path.ts
│   ├── .github/                  # GitHub Actions workflows
│   ├── .cursor/                  # Cursor IDE configuration
│   └── .git/                     # Git repository
│
└── 📦 DEPENDENCIES
    ├── node_modules/             # Installed packages
    └── bun.lock                  # Locked dependency versions
```

## 🆔 AID System

Dev Agent uses an **Atomic ID (AID)** system for reliable entity identification:

- **Format**: `[prefix]-[a-z0-9]{6}`
- **Examples**:
  - `g-a1b2c3` (goal/task)
  - `d-d4e5f6` (document)
  - `s-x7y8z9` (script)

### Entity Type Prefixes

- **G** - Goals/Tasks
- **D** - Documents
- **S** - Scripts
- **A** - API endpoints
- **F** - Files

## 📋 Essential Commands

### Project Management
```bash
# Initialize project
bun run dev-agent/src/index.ts init

# Configure GitHub
bun run dev-agent/src/index.ts config set github.owner "your-org"
bun run dev-agent/src/index.ts config set github.repo "your-project"
```

### Goal Management
```bash
# Create goal
bun run dev-agent/src/index.ts goal create "Task title"

# List goals
bun run dev-agent/src/index.ts goal list

# Start working
bun run dev-agent/src/index.ts goal start <goal-id>

# Complete goal
bun run dev-agent/src/index.ts goal complete <goal-id>
```

### Git Operations
```bash
# Show status
bun run dev-agent/src/index.ts git status

# Create commit
bun run dev-agent/src/index.ts git commit "message" --add-all

# Push changes
bun run dev-agent/src/index.ts git push
```

### Development
```bash
# Run tests
make test

# Run with coverage
make test-coverage

# Build project
make build

# Generate docs
make docs-generate
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
  "goals.default_status": "todo",
  "goals.id_pattern": "^g-[a-z0-9]{6}$"
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
make test

# Run quality checks
make ci-check

# Build project
make build
```

## 📚 Documentation

- **[Documentation Index](docs/README.md)** - Complete documentation guide
- **[API Reference](docs/api/)** - Auto-generated API documentation
- **[Developer Guide](docs/developer-guide.md)** - Development setup and contribution
- **[Architecture](docs/architecture.md)** - System design and architecture

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/dev-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/dev-agent/discussions)

## 🤝 Contributing

We welcome contributions! Please see our [Developer Guide](docs/developer-guide.md) for details on development setup, code style guidelines, testing requirements, and pull request process.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by the Dev Agent Team**