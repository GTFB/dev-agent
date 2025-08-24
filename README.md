# Dev Agent 🚀

**CLI assistant for automating the High-Efficiency Standard Operating Protocol**

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](https://github.com/your-org/dev-agent)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Test Coverage](https://img.shields.io/badge/test%20coverage-99.09%25-brightgreen.svg)](https://github.com/your-org/dev-agent)
[![Bun](https://img.shields.io/badge/runtime-Bun-000000.svg)](https://bun.sh)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6.svg)](https://www.typescriptlang.org/)

## 🎯 What is Dev Agent?

Dev Agent automates and standardizes the complete software development lifecycle according to the **High-Efficiency Standard Operating Protocol**.

## 🚀 Quick Start

### 1. Add Dev Agent as Subtree
```bash
git subtree add --prefix=dev https://github.com/GTFB/dev-agent.git main --squash
```

### 2. Setup Configuration & Environment
```bash
cp dev/config.sample.json config.json
make env-setup
```

### 3. Setup Storage & Database
```bash
make db-init
```

### 4. Initialize Dev Agent
```bash
make dev-init
```

### 5. Protect Critical Branches
```bash
make protect-branches
```

### 6. Create Your First Task
```bash
make dev-goals-create TITLE="Create initial commit"
```

## 🛠️ Core Commands

```bash
# Goal Management
make dev-goals-create TITLE="Task title"
make dev-goals-list
make dev-goals-delete ID="goal-id"

# Configuration
make dev-config-set KEY="workflow.auto_sync" VALUE="false"
make dev-config-get KEY="workflow.auto_sync"
make dev-config-list

**Note**: `config set` is for runtime configuration, not GitHub settings. GitHub integration is configured via `config.json`.

**Examples of runtime config**:
```bash
make dev-config-set KEY="workflow.auto_sync" VALUE="false"    # Disable auto-sync
make dev-config-set KEY="validation.strict_language" VALUE="false"  # Disable strict language
make dev-config-set KEY="workflow.sync_interval" VALUE="600"  # Set sync interval to 10 minutes
```

# Development
make test
make build

# Branch Protection
make protect-branches
git protect
```

## 🔧 GitHub Configuration

**Important**: GitHub integration is configured via `config.json`, not environment variables:

```json
{
  "github": {
    "owner": "your-org",
    "repo": "your-project"
  }
}
```

**For secrets** (tokens, API keys), use `.env` file:
```env
GITHUB_TOKEN=your_token_here
OPENAI_API_KEY=your_key_here
```

**Setup process**:
```bash
make env-setup          # Create .env template
# Copy config.sample.json to config.json and edit github.owner and github.repo
# Edit .env file with your actual tokens
```

## 💾 Storage Configuration

**Important**: Storage paths are configured in `config.json`:

```json
{
  "storage": {
    "database": {
      "path": "PATH/dev-agent.db"
    },
    "config": {
      "path": "PATH/.env"
    }
  }
}
```

**Setup storage**:
```bash
# 1. Copy sample configuration
cp config.sample.json config.json

# 2. Edit config.json with your storage paths
# Use relative paths (./data/) or absolute paths (G:/path/to/storage/)

# 3. Initialize storage directories
make db-init
```

**Storage locations**:
- **Database**: SQLite database file
- **Config**: Runtime configuration files
- **Logs**: Application and workflow logs

## 🛡️ Branch Protection

**CRITICAL**: Protect your branches immediately after installation:

```bash
make protect-branches
```

This prevents accidental deletion of `main` and `develop` branches.

## 📚 Documentation

- **[Developer Guide](docs/developer-guide.md)** - Setup and contribution
- **[API Reference](docs/api/)** - Auto-generated API docs

## 🤝 Contributing

See [Developer Guide](docs/developer-guide.md) for contribution details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file.
