# Quick Start Guide

> **🚀 Get up and running with Dev Agent in minutes**

## Overview

This guide helps you get started with Dev Agent quickly. For detailed information, see the [main README](../README.md) and [developer guide](developer-guide.md).

## Prerequisites

- [Bun](https://bun.sh) v1.x or later
- [Git](https://git-scm.com/) v2.x or later
- Basic knowledge of TypeScript and Git

## 🚀 Quick Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/your-org/dev-agent.git
cd dev-agent

# Install dependencies
bun install
```

### 2. Configuration Setup

```bash
# Copy sample configuration
cp config.sample.json config.json

# Edit config.json with your settings
# - Update GitHub owner/repo
# - Set external storage paths
# - Configure branch names
```

### 3. Environment Setup

```bash
# Create environment file
make env-setup

# Edit .env with your secrets
# - GITHUB_TOKEN=your_token_here
# - OPENAI_API_KEY=your_key_here
```

### 4. Initialize Storage

```bash
# Initialize external storage
make db-init

# Verify setup
make validate
```

## 🎯 Essential Commands

### Project Management

```bash
# Initialize Dev Agent project
make dev-init

# Sync with GitHub
make dev-sync

# List all goals
make dev-goals-list

# Create new goal
make dev-goals-create TITLE="Your task title"

# Delete goal
make dev-goals-delete ID="goal-id"
```

### Configuration

```bash
# Set configuration
make dev-config-set KEY="workflow.auto_sync" VALUE="true"

# Get configuration
make dev-config-get KEY="workflow.auto_sync"

# List all configuration
make dev-config-list
```

### Development

```bash
# Run tests
make test

# Run with coverage
make test-coverage

# Build project
make build

# Validate structure
make validate

# Run all CI checks
make ci-check
```

## 🔒 Branch Protection

**Critical**: Protect your branches before starting development!

```bash
# Check branch protection
make protect-branches

# Restore missing branches if needed
make restore-branches
```

## 📁 Project Structure

```
dev-agent/
├── config.json              # Your configuration (gitignored)
├── config.sample.json       # Template configuration
├── src/                     # Source code
├── tests/                   # Test files
├── docs/                    # Documentation
├── scripts/                 # Utility scripts
└── .github/                 # CI/CD workflows
```

## 🔧 Configuration Examples

### Basic Configuration

```json
{
  "name": "my-project",
  "version": "0.1.0",
  "github": {
    "owner": "your-username",
    "repo": "your-repo-name"
  },
  "storage": {
    "database": {
      "path": "./data/dev-agent.db"
    }
  }
}
```

### External Storage Configuration

```json
{
  "storage": {
    "database": {
      "path": "G:/path/to/your/database.db"
    },
    "config": {
      "path": "G:/path/to/your/config"
    },
    "logs": {
      "path": "G:/path/to/your/logs"
    }
  }
}
```

## 🚨 Common Issues

### Configuration Errors

```bash
# Error: Configuration validation failed
# Solution: Check config.json format and required fields
make validate

# Error: Storage paths not found
# Solution: Run make db-init to create directories
```

### Git Issues

```bash
# Error: Branch not found
# Solution: Run make restore-branches
make restore-branches

# Error: GitHub sync failed
# Solution: Check GITHUB_TOKEN in .env
```

### Build Issues

```bash
# Error: TypeScript compilation failed
# Solution: Check for syntax errors
make build

# Error: Tests failing
# Solution: Run tests locally first
make test
```

## 📚 Next Steps

1. **Read the [Developer Guide](developer-guide.md)** for detailed development setup
2. **Check [Architecture](architecture.md)** to understand the system design
3. **Review [CI/CD Pipeline](ci-cd.md)** for deployment information
4. **Explore [API Documentation](api/)** for integration details

## 🆘 Getting Help

- **Documentation**: Check the [docs directory](README.md)
- **Issues**: Report bugs on GitHub
- **Discussions**: Ask questions in GitHub Discussions
- **Code**: Review source code in `src/` directory

---

**💡 Tip**: Use `make help` to see all available commands!
