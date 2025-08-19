# Dev Agent 🚀

**CLI assistant for automating the High-Efficiency Standard Operating Protocol**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-org/dev-agent)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Bun](https://img.shields.io/badge/runtime-Bun-000000.svg)](https://bun.sh)

## 🎯 What is Dev Agent?

Dev Agent is a powerful CLI tool that automates and standardizes the complete software development lifecycle according to the **High-Efficiency Standard Operating Protocol**. It's designed to minimize human errors, reduce time spent on routine operations, and ensure predictable, high-quality development processes.

### ✨ Key Features

- **🔄 Automated Workflow Management** - Streamlines goal creation, development, and completion
- **🌿 Smart Git Operations** - Automated branch management and Git workflow
- **📊 Goal Tracking** - Local SQLite database for efficient goal management
- **⚡ High Performance** - Built with Bun for maximum speed and efficiency
- **🔒 AID System** - Typed entity identifiers for reliable data management
- **📝 Comprehensive Logging** - Detailed logging with multiple levels

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.x or later
- Git repository initialized in your project

### ⚡ Super Quick Commands

```bash
# Using make shortcuts (recommended for daily use)
make init                           # Initialize project
make goal-create TITLE="My Goal"    # Create new goal
make goal-list                      # List all goals
make config-set KEY=github.owner VALUE=myuser  # Configure GitHub

# Or using dev command directly
bun run dev/src/index.ts init                    # Initialize project  
bun run dev/src/index.ts goal create "My Goal"   # Create new goal
bun run dev/src/index.ts goal list               # List all goals
```

### Installation

Dev Agent is designed to be integrated into your monorepo as a Git subtree in the `dev/` folder.

1. **Add Dev Agent as subtree to your monorepo:**
   ```bash
   # In your monorepo root
   git subtree add --prefix=dev https://github.com/your-org/dev-agent.git main --squash
   ```

2. **Install dependencies for Dev Agent:**
   ```bash
   cd dev
   bun install
   cd ..
   ```

3. **Initialize Dev Agent in your monorepo:**
   ```bash
   bun run dev/src/index.ts init
   ```

4. **Create your first goal:**
   ```bash
   bun run dev/src/index.ts goal create "Implement user authentication"
   ```

5. **Start working on the goal:**
   ```bash
   bun run dev/src/index.ts goal start g-a1b2c3
   ```

## 📖 Usage Guide

### Basic Commands

#### Project Initialization
```bash
# Initialize Dev Agent in current monorepo
bun run dev/src/index.ts init
# or: make init
```

#### Goal Management
```bash
# Create a new goal
bun run dev/src/index.ts goal create "goal title" -d "Optional description"
# or: make goal-create TITLE="goal title"

# List all goals
bun run dev/src/index.ts goal list
# or: make goal-list

# List goals by status
bun run dev/src/index.ts goal list --status=in_progress

# Start working on a goal
bun run dev/src/index.ts goal start g-a1b2c3
# or: make goal-start ID=g-a1b2c3

# Complete a goal
bun run dev/src/index.ts goal complete g-a1b2c3
# or: make goal-complete ID=g-a1b2c3

# Stop working on a goal
bun run dev/src/index.ts goal stop g-a1b2c3
# or: make goal-stop ID=g-a1b2c3
```

#### Configuration
```bash
# Set configuration value
bun run dev/src/index.ts config set github.owner "your-org"
bun run dev/src/index.ts config set github.repo "your-repo"
# or: make config-set KEY=github.owner VALUE="your-org"

# Get configuration value
bun run dev/src/index.ts config get github.owner
# or: make config-get KEY=github.owner

# List all configuration
bun run dev/src/index.ts config list
# or: make config-list
```

### Workflow Example

Here's a typical development workflow using Dev Agent:

1. **Initialize the monorepo:**
   ```bash
   make init
   # or: bun run dev/src/index.ts init
   ```

2. **Configure GitHub repository:**
   ```bash
   make config-set KEY=github.owner VALUE="your-org"
   make config-set KEY=github.repo VALUE="your-monorepo"
   # or: bun run dev/src/index.ts config set github.owner "your-org"
   ```

3. **Create a goal:**
   ```bash
   make goal-create TITLE="Add user authentication"
   # or: bun run dev/src/index.ts goal create "Add user authentication" -d "Implement JWT-based authentication system"
   ```

4. **Start working:**
   ```bash
   make goal-start ID=g-a1b2c3
   # or: bun run dev/src/index.ts goal start g-a1b2c3
   ```
   This will:
   - Switch to `develop` branch
   - Pull latest changes
   - Create a feature branch: `feature/g-a1b2c3-add-user-authentication`
   - Update goal status to `in_progress`

5. **Complete the goal:**
   ```bash
   make goal-complete ID=g-a1b2c3
   # or: bun run dev/src/index.ts goal complete g-a1b2c3
   ```

## 🏗️ Architecture

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

### Core Components

- **WorkflowService** - Orchestrates the development protocol
- **StorageService** - Manages local SQLite database
- **GitService** - Handles all Git operations
- **AID Generator** - Creates typed entity identifiers

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

### Setting Configuration
```bash
# Set GitHub repository
dev config set github.owner "your-org"
dev config set github.repo "your-project"

# Set branch naming
dev config set branches.feature_prefix "feature"
dev config set branches.release_prefix "release"
```

## 🆔 AID System

Dev Agent uses an **Atomic ID (AID)** system for reliable entity identification:

- **Format**: `[prefix]-[a-z0-9]{6}`
- **Examples**: `g-a1b2c3` (goal), `a-d4e5f6` (document)

### Entity Types
- **G** - Goals (задачи и цели)
- **D** - Documents (проектная документация)
- **F** - Files (файлы проекта)
- **A** - API endpoints (API endpoints)
- **S** - Scripts (скрипты автоматизации)
- **P** - Prompts (AI промпты)
- **C** - Config (конфигурации)
- **M** - Milestones (майлстоуны)
- **R** - Releases (релизы)
- **T** - Tests (тесты)

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

### Project Structure

**Layer 1: Dev Agent (dev/)**
```
dev/                           # Dev Agent - development automation
├── src/
│   ├── core/                  # Core types, database, AID generator
│   ├── services/              # Business logic services
│   ├── utils/                 # Utility functions
│   └── index.ts               # CLI entry point
├── tests/                     # Test files
├── docs/                      # Documentation
└── package.json               # Dependencies
```

**Layer 2: Project (Monorepo)**
```
/monorepo/                    # Project monorepo
├── .git/                     # Git repository
├── .github/                  # GitHub configuration
│
├── apps/                     # === PRODUCT APPLICATIONS ===
│   ├── web/                  # Main web application (Next.js)
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── src/
│   │
│   └── marketing/            # Marketing website (Nextra/Next.js)
│       ├── package.json
│       └── src/
│    
│
├── gas/                      # Google Sheets integrator
│
├── dev/                      # === DEVELOPMENT TOOLKIT ===
│   │                         # (Git subtree dev-agent)
│   ├── .dev-agent.json       # Agent config (generated)
│   ├── .dev-agent.db         # Database (generated)
│   ├── src/                  # Dev Agent source code
│   ├── docs/                 # Dev Agent documentation
│   ├── package.json          # Dev Agent dependencies
│   └── tsconfig.json         # Dev Agent TypeScript config
│
├── packages/                 # === REUSABLE LIBRARIES ===
│   ├── ui/                   # UI components
│   ├── utils/                # Utilities
│   ├── eslint-config-custom/ # ESLint configuration
│   └── tsconfig/             # TypeScript configuration
│
├── .gitignore
├── package.json              # Root monorepo package.json
├── bun.lockb
└── turbo.json                # Turborepo configuration
```

### 🏗️ Two-Layer Architecture

**Dev Agent (dev/)**
- Development automation and task management
- Validation and quality control
- Git operations and GitHub integration
- Branch management and workflow

**Project (Monorepo)**
- **apps/** - Product applications (web, google-sheets-integrator)
- **packages/** - Reusable libraries (ui, utils, configurations)
- **dev/** - Development toolkit (Dev Agent as Git subtree)
- All project entities (tasks, documents, API) stored in dev-agent database
- Connection between tasks and monorepo files
- Centralized management through Dev Agent

## 📚 Documentation

- [Getting Started Guide](docs/01-getting-started.md)
- [CLI Commands Reference](docs/02-cli-commands.md)
- [Configuration Guide](docs/03-configuration.md)
- [Developer Guide](docs/04-developer-guide.md)
- [Architecture Overview](docs/05-architecture.md)
- [API Documentation](docs/api/)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `bun test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Bun](https://bun.sh) for exceptional performance
- Uses [simple-git](https://github.com/steveukx/git-js) for Git operations
- Powered by [Commander.js](https://github.com/tj/commander.js) for CLI interface

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/dev-agent/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/dev-agent/discussions)
- **Documentation**: [docs/](docs/)

---

**Made with ❤️ by the Altrp Team**