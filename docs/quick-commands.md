# Quick Commands Reference

## 🚀 Database Management

```bash
# Initialize/reset database
bun run db:init                    # Initialize with new schema
bun run db:reset                   # Reset database (destructive)

# Check database schema
bun run src/scripts/check-schema.ts
```

## 🤖 LLM Provider Management

```bash
# Add LLM provider
bun run llm:add <provider> <apiKey> <model> [options]
bun run llm:add gemini AIzaSyKey123 gemini-pro --setAsDefault
bun run llm:add openai sk-Key123 gpt-4 --apiBase https://custom-api.com

# Manage providers
bun run llm:list                   # List all providers
bun run llm:default <provider>     # Set default provider
bun run llm:test <provider>        # Test provider configuration
bun run llm:update <provider> [options]  # Update provider settings
bun run llm:remove <provider>      # Remove provider

# Examples
bun run llm:add anthropic sk-ant-Key123 claude-3-sonnet --setAsDefault
bun run llm:update gemini --status inactive
```

## 🐙 GitHub Configuration

```bash
# Setup GitHub integration
bun run github:setup <owner> <repo> <token> [options]
bun run github:setup myuser myrepo ghp_Token123
bun run github:setup myuser myrepo ghp_Token123 --baseUrl https://github.company.com

# Configure branches
bun run github:branches <main> <develop> <feature> <release> <hotfix>
bun run github:branches main develop feature release hotfix

# Configure goals
bun run github:goals <status> <pattern> [options]
bun run github:goals todo "^g-[a-z0-9]{6}$" --autoCreateBranches --autoSyncIssues

# Manage configuration
bun run github:show               # Show current configuration
bun run github:test               # Test GitHub connection
bun run github:remove             # Remove all GitHub configuration
```

## ⚙️ Configuration Management

```bash
# View configuration
bun run config:show               # Show all configuration
bun run config:get <key>          # Get specific value

# Set configuration
bun run config:set <key> <value>  # Set configuration value
bun run config:set project.name "My Project"

# Validate and reset
bun run config:validate           # Validate configuration
bun run config:reset              # Reset to defaults
```

## 🌍 Language Compliance

```bash
# Check language compliance
bun run lang:check                # Check all files
bun run lang:check-staged         # Check staged files (pre-commit)
```

## 📁 Project Structure

The project now enforces a strict, immutable structure:

- **Source Code**: `src/**/*.ts` (TypeScript ONLY)
- **Tests**: `tests/**/*.test.ts`
- **Documentation**: `docs/**/*.md`
- **Forbidden**: `*.js`, `*.jsx`, `scripts/`, `temp/`, `data/`

## 🔧 Quick Setup Examples

### 1. Initial Setup
```bash
# Initialize database
bun run db:init

# Setup GitHub
bun run github:setup myuser myrepo ghp_Token123
bun run github:branches main develop feature release hotfix
bun run github:goals todo "^g-[a-z0-9]{6}$" --autoCreateBranches

# Setup LLM
bun run llm:add gemini AIzaSyKey123 gemini-pro --setAsDefault
bun run llm:add openai sk-Key123 gpt-4
```

### 2. Daily Usage
```bash
# Check configuration
bun run config:show
bun run github:show
bun run llm:list

# Language compliance
bun run lang:check-staged

# Update settings
bun run llm:update gemini --status inactive
bun run config:set logging.level debug
```

### 3. Troubleshooting
```bash
# Check database schema
bun run src/scripts/check-schema.ts

# Reset configuration
bun run config:reset
bun run github:remove

# Reinitialize database
bun run db:reset
bun run db:init
```

## 📊 Configuration Categories

- **project**: Project metadata (name, version, description)
- **database**: Database connection settings
- **storage**: File storage paths
- **logging**: Log levels and output
- **github**: GitHub integration settings
- **branches**: Branch naming conventions
- **goals**: Goal management settings
- **llm**: LLM provider configurations

## 🔒 Security Notes

- API keys are stored in the SQLite database
- Never commit the database file to version control
- Use `.gitignore` to exclude `dev-agent.db`
- Tokens are encrypted at rest (when implemented)
