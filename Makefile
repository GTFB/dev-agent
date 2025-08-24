# Dev Agent Makefile

.PHONY: help test test-coverage build clean validate ci-check docs-generate task-validate dev-init dev-sync dev-goals-list dev-goals-create protect-branches restore-branches

help:
	@echo "Dev Agent - Available Commands:"
	@echo ""
	@echo "Development Commands:"
	@echo "  test            Run test suite"
	@echo "  test-coverage   Run tests with coverage report"
	@echo "  build           Build the project"
	@echo "  clean           Clean build artifacts"
	@echo "  validate        Validate project structure"
	@echo "  ci-check        Run all CI checks locally"
	@echo "  docs-generate   Generate API documentation"
	@echo "  task-validate   Validate task and generate execution plan"
	@echo ""
	@echo "Dev Agent Commands:"
	@echo "  project-init    Show project initialization usage"
	@echo "  project-init-custom Initialize new Dev Agent project (PATH='path')"
	@echo "  dev-init        Initialize Dev Agent project
	@echo "  dev-sync        Sync with GitHub (HARD ALGORITHM)"
	@echo "  dev-goals-list  List all goals"
	@echo "  dev-goals-create Create new goal (TITLE='title')"
	@echo "  dev-goals-update Update goal (ID='goal-id' STATUS='status')"
	@echo "  dev-goals-delete Delete goal (ID='goal-id')"
	@echo "  dev-config-set  Set config (KEY='key' VALUE='value')"
	@echo "  dev-config-get  Get config (KEY='key')"
	@echo "  dev-config-list List all config"
	@echo ""
	@echo "Database & Environment:"
	@echo "  db-init         Initialize database"
	@echo "  env-setup       Create .env file template"
	@echo ""
	@echo "Branch Protection Commands:"
	@echo "  protect-branches Check protection for critical branches"
	@echo "  restore-branches Restore any missing critical branches"

test:
	bun test

test-coverage:
	@echo "Running tests with coverage..."
	bun test --coverage

build:
	bun run build

clean:
	@echo "Cleaning up build artifacts..."
	@if exist build rmdir /s /q build

validate:
	bun run src/scripts/validate-structure.ts

ci-check:
	@echo "Running CI checks locally..."
	bun install
	bun test --coverage
	bun run build
	bun run src/scripts/validate-structure.ts
	@echo "Cleaning up build artifacts..."
	make clean
	@echo "All CI checks passed!"

docs-generate:
	@echo "Generating API documentation..."
	@echo "API documentation is already generated in docs/api/"
	@echo "To regenerate manually, run: cd docs && npx typedoc docs-entry.ts --out api --excludePrivate --excludeProtected --excludeInternal --tsconfig tsconfig.docs.json"

task-validate:
	@echo "Task Validator and Plan Generator"
	@echo "Usage: make task-validate TASK='Task title' DESC='Task description' [OPTIONS]"
	@echo ""
	@echo "Options:"
	@echo "  PRIORITY=high|medium|low|critical"
	@echo "  EFFORT=small|medium|large|epic"
	@echo "  CATEGORY=feature|bugfix|refactoring|documentation|infrastructure"
	@echo ""
	@echo "Example:"
	@echo "  make task-validate TASK='Add user authentication' DESC='Implement JWT-based auth' PRIORITY=high CATEGORY=feature"
	@echo ""
	@if [ -n "$(TASK)" ]; then \
		echo "Validating task: $(TASK)"; \
		bun run src/scripts/task-validator.ts "$(TASK)" "$(DESC)" --priority $(PRIORITY) --effort $(EFFORT) --category $(CATEGORY); \
	else \
		echo "Please provide TASK parameter"; \
		echo "Example: make task-validate TASK='Task title'"; \
	fi

# Dev Agent Commands
project-init:
	@echo "Initializing new Dev Agent project..."
	@echo "Usage: powershell -ExecutionPolicy Bypass -File scripts/project-init.ps1 'G:\Общие диски\Altrp'"
	@echo "Or use: make project-init-custom PATH='G:\Общие диски\Altrp'"

project-init-custom:
	@echo "Running project initialization for: $(PATH)"
	@powershell -ExecutionPolicy Bypass -File scripts/project-init.ps1 "$(PATH)"

dev-init:
	@echo "Initializing Dev Agent project..."
	@bun run src/index.ts init

dev-sync:
	@echo "Syncing with GitHub (HARD ALGORITHM)..."
	@bun run src/index.ts sync

dev-goals-list:
	@echo "Listing all goals..."
	@bun run src/index.ts goal list

dev-goals-create:
	@echo "Creating new goal..."
	@bun run src/index.ts goal create "$(TITLE)"

dev-goals-delete:
	@echo "Deleting goal..."
	@bun run src/index.ts goal delete "$(ID)"

dev-goals-update:
	@echo "Updating goal (updated)..."
	@bun run src/index.ts goal update-status "$(ID)" "$(STATUS)"

dev-config-set:
	@echo "Setting configuration..."
	@bun run src/index.ts config set "$(KEY)" "$(VALUE)"

dev-config-get:
	@echo "Getting configuration..."
	@bun run src/index.ts config get "$(KEY)"

dev-config-list:
	@echo "Listing all configuration..."
	@bun run src/index.ts config list

# Branch Protection Commands
protect-branches:
	@echo "Checking critical branch protection..."
	@powershell -ExecutionPolicy Bypass -File scripts/protect-branches.ps1

restore-branches:
	@echo "Restoring critical branches if needed..."
	@echo "Checking main branch..."
	@git rev-parse --verify main >/dev/null 2>&1 && ( \
		echo "Main branch exists" \
	) || ( \
		echo "Creating main branch from origin/main..."; \
		git checkout -b main origin/main; \
		echo "Main branch restored!" \
	)
	@echo "Checking develop branch..."
	@git rev-parse --verify develop >/dev/null 2>&1 && ( \
		echo "Develop branch exists" \
	) || ( \
		echo "Creating develop branch from origin/develop..."; \
		git checkout -b develop origin/develop; \
		echo "Develop branch restored!" \
	)

# Database & Environment
db-init:
	@echo "Initializing database..."
	@bun run scripts/init-storage.ts

env-setup:
	@echo "Setting up environment file..."
	@if not exist .env ( \
		echo "Creating .env file..."; \
		echo "# Dev Agent Environment Variables" > .env; \
		echo "GITHUB_TOKEN=your_token_here" >> .env; \
		echo "OPENAI_API_KEY=your_key_here" >> .env; \
		echo ".env file created. Please update with your actual values." \
	) else ( \
		echo ".env file already exists" \
	)
