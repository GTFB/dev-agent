# Dev Agent Makefile
# Common development tasks and shortcuts

.PHONY: help install test test-coverage lint format quality build clean docs dev init config goal commit pr

# Default target
help:
	@echo "🚀 Dev Agent - Development Commands"
	@echo "=================================="
	@echo ""
	@echo "📦 Package Management:"
	@echo "  install          Install dependencies"
	@echo "  clean            Clean build artifacts and dependencies"
	@echo ""
	@echo "🧪 Testing:"
	@echo "  test             Run all tests"
	@echo "  test-coverage    Run tests with coverage report"
	@echo ""
	@echo "🔍 Code Quality:"
	@echo "  lint             Run ESLint"
	@echo "  format           Run Prettier"
	@echo "  quality          Run lint + test (quality gate)"
	@echo ""
	@echo "🏗️  Build:"
	@echo "  build            Build the project"
	@echo "  dev              Run in development mode"
	@echo ""
	@echo "📚 Documentation:"
	@echo "  docs             Generate API documentation"
	@echo ""
	@echo "🎯 Dev Agent CLI:"
	@echo "  init             Initialize project"
	@echo "  config           Configure settings"
	@echo "  goal             Manage goals (list, create, etc.)"
	@echo "  commit           Make commit with standards"
	@echo "  pr               Create pull request"
	@echo ""
	@echo "🚀 Quick Start:"
	@echo "  make install     # Install dependencies"
	@echo "  make quality     # Run quality checks"
	@echo "  make dev         # Start development"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	bun install

# Clean build artifacts and dependencies
clean:
	@echo "🧹 Cleaning up..."
	rm -rf node_modules/
	rm -rf dist/
	rm -rf build/
	rm -rf .logs/
	rm -rf dev/
	rm -f bun.lockb
	@echo "✅ Cleaned up successfully"

# Run all tests
test:
	@echo "🧪 Running tests..."
	bun test

test-coverage:
	@echo "📊 Running tests with coverage..."
	bun run test:coverage

# Run tests with coverage
test-coverage:
	@echo "📊 Running tests with coverage..."
	bun test --coverage

# Run ESLint
lint:
	@echo "🔍 Running ESLint..."
	bun run lint

# Run Prettier
format:
	@echo "✨ Running Prettier..."
	bun run format

# Run quality gate (lint + test)
quality:
	@echo "🚀 Running quality gate..."
	bun run quality

# Build the project
build:
	@echo "🏗️  Building project..."
	bun run build

# Run in development mode
dev:
	@echo "🚀 Starting development mode..."
	bun run start

# Generate API documentation
docs:
	@echo "📚 Generating API documentation..."
	bun run docs:generate

# Initialize project (first time setup)
init:
	@echo "🚀 Initializing Dev Agent project..."
	bun run src/index.ts init

# Create a new task
task-create:
	@echo "📝 Creating new task..."
	@read -p "Enter task title: " title; \
	read -p "Enter task description (optional): " description; \
	if [ -z "$$description" ]; then \
		bun run src/index.ts task create "$$title"; \
	else \
		bun run src/index.ts task create "$$title" -d "$$description"; \
	fi

# List all tasks
task-list:
	@echo "📋 Listing tasks..."
	bun run src/index.ts task list

# Start working on a task
task-start:
	@echo "🔄 Starting task..."
	@read -p "Enter task ID (e.g., g-a1b2c3): " taskId; \
	bun run src/index.ts task start "$$taskId"

# Complete a task
task-complete:
	@echo "✅ Completing task..."
	@read -p "Enter task ID: " taskId; \
	bun run src/index.ts task complete "$$taskId"

# Show configuration
config-list:
	@echo "⚙️  Listing configuration..."
	bun run src/index.ts config list

# Set configuration
config-set:
	@echo "⚙️  Setting configuration..."
	@read -p "Enter config key (e.g., github.owner): " key; \
	read -p "Enter config value: " value; \
	bun run src/index.ts config set "$$key" "$$value"

# Show help
help-cli:
	@echo "📖 Showing CLI help..."
	bun run src/index.ts help

# Run specific command with arguments
run:
	@echo "🚀 Running Dev Agent command..."
	@read -p "Enter command (e.g., task list): " command; \
	bun run src/index.ts $$command

# Development workflow helpers
workflow-start:
	@echo "🚀 Starting development workflow..."
	@echo "1. Initialize project: make init"
	@echo "2. Create task: make task-create"
	@echo "3. Start working: make task-start"
	@echo "4. Complete task: make task-complete"

# Check project status
status:
	@echo "📊 Project Status:"
	@echo "=================="
	@echo "Node version: $(shell node --version 2>/dev/null || echo 'Node not found')"
	@echo "Bun version: $(shell bun --version 2>/dev/null || echo 'Bun not found')"
	@echo "Git status: $(shell git status --porcelain 2>/dev/null | wc -l | tr -d ' ') files changed"
	@echo "Database: $(shell ls -la dev/.dev-agent.db 2>/dev/null && echo '✅ Initialized' || echo '❌ Not initialized')"

# Install development dependencies
install-dev:
	@echo "🔧 Installing development dependencies..."
	bun install --dev

# Update dependencies
update:
	@echo "🔄 Updating dependencies..."
	bun update

# Check for outdated packages
outdated:
	@echo "🔍 Checking for outdated packages..."
	bun outdated

# Security audit
audit:
	@echo "🔒 Running security audit..."
	bun audit

# Performance benchmark
benchmark:
	@echo "⚡ Running performance benchmark..."
	@echo "Testing AID generation..."
	@time bun run src/index.ts goal create "Benchmark Goal 1" > /dev/null
	@time bun run src/index.ts goal create "Benchmark Goal 2" > /dev/null
	@time bun run src/index.ts goal create "Benchmark Goal 3" > /dev/null
	@echo "✅ Benchmark completed"

# Show project info
info:
	@echo "ℹ️  Project Information:"
	@echo "========================"
	@echo "Name: $(shell jq -r .name package.json 2>/dev/null || echo 'Unknown')"
	@echo "Version: $(shell jq -r .version package.json 2>/dev/null || echo 'Unknown')"
	@echo "Description: $(shell jq -r .description package.json 2>/dev/null || echo 'Unknown')"
	@echo "License: $(shell jq -r .license package.json 2>/dev/null || echo 'Unknown')"
	@echo "Repository: $(shell jq -r .repository.url package.json 2>/dev/null || echo 'Unknown')"

# =====================================
# Dev Agent CLI Shortcuts
# =====================================

# Initialize project
init:
	@echo "🚀 Initializing Dev Agent project..."
	bun run src/index.ts init

# Configuration shortcuts
config:
	@echo "⚙️  Configuration management:"
	@echo "  make config-set KEY=<key> VALUE=<value>  # Set configuration"
	@echo "  make config-get KEY=<key>                # Get configuration"
	@echo "  make config-list                         # List all configuration"

config-set:
	@test "$(KEY)" || (echo "❌ Error: KEY parameter required. Usage: make config-set KEY=<key> VALUE=<value>" && exit 1)
	@test "$(VALUE)" || (echo "❌ Error: VALUE parameter required. Usage: make config-set KEY=<key> VALUE=<value>" && exit 1)
	@echo "⚙️  Setting configuration: $(KEY) = $(VALUE)"
	bun run src/index.ts config set "$(KEY)" "$(VALUE)"

config-get:
	@test "$(KEY)" || (echo "❌ Error: KEY parameter required. Usage: make config-get KEY=<key>" && exit 1)
	@echo "⚙️  Getting configuration: $(KEY)"
	bun run src/index.ts config get "$(KEY)"

config-list:
	@echo "⚙️  Listing all configuration:"
	bun run src/index.ts config list

# Goal management shortcuts
goal:
	@echo "🎯 Goal management:"
	@echo "  make goal-list                           # List all goals"
	@echo "  make goal-create TITLE=\"<title>\"         # Create new goal"
	@echo "  make goal-start ID=<goal-id>             # Start working on goal"
	@echo "  make goal-complete ID=<goal-id>          # Complete goal"
	@echo "  make goal-stop ID=<goal-id>              # Stop working on goal"
	@echo "  make goal-delete ID=<goal-id>            # Delete goal"

goal-list:
	@echo "📋 Listing all goals:"
	@$(DEV_CMD) goal list

goal-create:
	@test "$(TITLE)" || (echo "❌ Error: TITLE parameter required. Usage: make goal-create TITLE=\"<title>\"" && exit 1)
	@echo "✨ Creating new goal: $(TITLE)"
	@$(DEV_CMD) goal create "$(TITLE)"

goal-start:
	@test "$(ID)" || (echo "❌ Error: ID parameter required. Usage: make goal-start ID=<goal-id>" && exit 1)
	@echo "🚀 Starting work on goal: $(ID)"
	@$(DEV_CMD) goal start "$(ID)"

goal-complete:
	@test "$(ID)" || (echo "❌ Error: ID parameter required. Usage: make goal-complete ID=<goal-id>" && exit 1)
	@echo "✅ Completing goal: $(ID)"
	@$(DEV_CMD) goal complete "$(ID)"

goal-stop:
	@test "$(ID)" || (echo "❌ Error: ID parameter required. Usage: make goal-stop ID=<goal-id>" && exit 1)
	@echo "⏹️  Stopping work on goal: $(ID)"
	@$(DEV_CMD) goal stop "$(ID)"

goal-delete:
	@test "$(ID)" || (echo "❌ Error: ID parameter required. Usage: make goal-delete ID=<goal-id>" && exit 1)
	@echo "🗑️  Deleting goal: $(ID)"
	@$(DEV_CMD) goal delete "$(ID)"

# Git operations using Dev Agent
git-status:
	@echo "📍 Git Status"
	@$(DEV_CMD) git status

git-commit:
	@test "$(MSG)" || (echo "❌ Error: MSG parameter required. Usage: make git-commit MSG=\"<message>\"" && exit 1)
	@echo "📝 Creating commit: $(MSG)"
	@$(DEV_CMD) git commit "$(MSG)" --add-all

git-commit-feat:
	@test "$(MSG)" || (echo "❌ Error: MSG parameter required. Usage: make git-commit-feat MSG=\"<message>\"" && exit 1)
	@echo "✨ Creating feature commit: $(MSG)"
	@$(DEV_CMD) git commit "$(MSG)" --type feat --add-all

git-commit-fix:
	@test "$(MSG)" || (echo "❌ Error: MSG parameter required. Usage: make git-commit-fix MSG=\"<message>\"" && exit 1)
	@echo "🐛 Creating bug fix commit: $(MSG)"
	@$(DEV_CMD) git commit "$(MSG)" --type fix --add-all

git-commit-docs:
	@test "$(MSG)" || (echo "❌ Error: MSG parameter required. Usage: make git-commit-docs MSG=\"<message>\"" && exit 1)
	@echo "📚 Creating documentation commit: $(MSG)"
	@$(DEV_CMD) git commit "$(MSG)" --type docs --add-all

git-push:
	@echo "📤 Pushing to remote"
	@$(DEV_CMD) git push

git-pull:
	@echo "📥 Pulling from remote"
	@$(DEV_CMD) git pull

git-branch:
	@test "$(NAME)" || (echo "❌ Error: NAME parameter required. Usage: make git-branch NAME=\"<branch-name>\"" && exit 1)
	@echo "🌿 Creating and switching to branch: $(NAME)"
	@$(DEV_CMD) git branch "$(NAME)" --create

# Language validation
lang-check:
	@test "$(TEXT)" || (echo "❌ Error: TEXT parameter required. Usage: make lang-check TEXT=\"<text>\"" && exit 1)
	@echo "🔍 Checking language compliance: $(TEXT)"
	@$(DEV_CMD) lang check "$(TEXT)" --translate

lang-validate-file:
	@test "$(FILE)" || (echo "❌ Error: FILE parameter required. Usage: make lang-validate-file FILE=<file-path>" && exit 1)
	@echo "🔍 Validating file language: $(FILE)"
	@$(DEV_CMD) lang validate-file "$(FILE)" --translate

lang-setup-llm:
	@test "$(PROVIDER)" || (echo "❌ Error: PROVIDER parameter required. Usage: make lang-setup-llm PROVIDER=<provider> API_KEY=<api-key>" && exit 1)
	@test "$(API_KEY)" || (echo "❌ Error: API_KEY parameter required. Usage: make lang-setup-llm PROVIDER=<provider> API_KEY=<api-key>" && exit 1)
	@echo "🔧 Setting up LLM translation service..."
	@$(DEV_CMD) lang setup-llm "$(PROVIDER)" "$(API_KEY)"

# Quick setup for common providers
lang-setup-gemini:
	@test "$(API_KEY)" || (echo "❌ Error: API_KEY parameter required. Usage: make lang-setup-gemini API_KEY=<gemini-api-key>" && exit 1)
	@echo "🔧 Setting up Gemini translation service..."
	@$(DEV_CMD) lang setup-llm gemini "$(API_KEY)"

lang-setup-openai:
	@test "$(API_KEY)" || (echo "❌ Error: API_KEY parameter required. Usage: make lang-setup-openai API_KEY=<openai-api-key>" && exit 1)
	@echo "🔧 Setting up OpenAI translation service..."
	@$(DEV_CMD) lang setup-llm openai "$(API_KEY)"

# LLM provider management
lang-list-providers:
	@echo "🤖 Listing configured LLM providers..."
	@$(DEV_CMD) lang list-providers

lang-remove-provider:
	@test "$(NAME)" || (echo "❌ Error: NAME parameter required. Usage: make lang-remove-provider NAME=<provider-name>" && exit 1)
	@echo "🗑️  Removing LLM provider..."
	@$(DEV_CMD) lang remove-provider "$(NAME)"

lang-set-default:
	@test "$(NAME)" || (echo "❌ Error: NAME parameter required. Usage: make lang-set-default NAME=<provider-name>" && exit 1)
	@echo "⭐ Setting default LLM provider..."
	@$(DEV_CMD) lang set-default "$(NAME)"

# Configure retry settings
lang-configure-retry:
	@echo "⚙️  Configuring LLM retry settings..."
	@$(DEV_CMD) lang configure-retry

lang-set-retry:
	@test "$(MAX_RETRIES)" || (echo "❌ Error: MAX_RETRIES parameter required. Usage: make lang-set-retry MAX_RETRIES=<number> RETRY_DELAY=<seconds> BACKOFF=<multiplier>" && exit 1)
	@echo "⚙️  Setting LLM retry configuration..."
	@$(DEV_CMD) lang configure-retry -r "$(MAX_RETRIES)" -d "$(RETRY_DELAY)" -b "$(BACKOFF)"

# Pull Request operations
pr-create:
	@test "$(TITLE)" || (echo "❌ Error: TITLE parameter required. Usage: make pr-create TITLE=\"<title>\"" && exit 1)
	@echo "🔄 Creating pull request: $(TITLE)"
	@$(DEV_CMD) git pr "$(TITLE)" $(if $(DESC),--description "$(DESC)")

# Legacy Git shortcuts (for backward compatibility)
commit:
	@echo "📝 Git commit shortcuts (legacy):"
	@echo "  make git-commit MSG=\"<message>\"         # Standard commit"
	@echo "  make git-commit-feat MSG=\"<message>\"    # Feature commit"
	@echo "  make git-commit-fix MSG=\"<message>\"     # Bug fix commit"
	@echo "  make git-commit-docs MSG=\"<message>\"    # Documentation commit"
	@echo ""
	@echo "💡 Use the new git-* commands above for better integration"

commit-msg:
	@test "$(MSG)" || (echo "❌ Error: MSG parameter required. Usage: make commit-msg MSG=\"<message>\"" && exit 1)
	@echo "📝 Creating commit: $(MSG)"
	git add -A
	git commit -m "$(MSG)"

commit-feat:
	@test "$(MSG)" || (echo "❌ Error: MSG parameter required. Usage: make commit-feat MSG=\"<message>\"" && exit 1)
	@echo "✨ Creating feature commit: $(MSG)"
	git add -A
	git commit -m "feat: $(MSG)"

commit-fix:
	@test "$(MSG)" || (echo "❌ Error: MSG parameter required. Usage: make commit-fix MSG=\"<message>\"" && exit 1)
	@echo "🐛 Creating bug fix commit: $(MSG)"
	git add -A
	git commit -m "fix: $(MSG)"

commit-docs:
	@test "$(MSG)" || (echo "❌ Error: MSG parameter required. Usage: make commit-docs MSG=\"<message>\"" && exit 1)
	@echo "📚 Creating documentation commit: $(MSG)"
	git add -A
	git commit -m "docs: $(MSG)"

# Legacy PR shortcuts
pr:
	@echo "🔄 Pull Request shortcuts:"
	@echo "  make pr-create TITLE=\"<title>\" [DESC=\"<description>\"]  # Create PR"
	@echo "  make git-status                                          # Check status"
	@echo ""
	@echo "💡 All PR operations now use Dev Agent for better integration"
