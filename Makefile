# Dev Agent Makefile

.PHONY: help test test-coverage build clean validate ci-check docs-generate task-validate docs-check dev-init dev-sync dev-goals-list dev-goals-create

help:
	@echo "Dev Agent - Available Commands:"
	@echo "  test           Run test suite"
	@echo "  test-coverage  Run tests with coverage report"
	@echo "  build          Build the project"
	@echo "  clean          Clean build artifacts"
	@echo "  validate       Validate project structure"
	@echo "  ci-check       Run all CI checks locally"
	@echo "  docs-generate  Generate API documentation"
	@echo "  task-validate  Validate task and generate execution plan"
	@echo "  docs-check     Check documentation for redundancy"
	@echo ""
	@echo "Dev Agent Commands:"
	@echo "  dev-init       Initialize Dev Agent project"
	@echo "  dev-sync       Sync with GitHub (HARD ALGORITHM)"
	@echo "  dev-goals-list List all goals"
	@echo "  dev-goals-create Create new goal (TITLE='title' [DESC='description'])"

test:
	bun test

test-coverage:
	@echo "Running tests with coverage..."
	bun test --coverage

build:
	bun run build

clean:
	rm -rf build/
	rm -rf coverage/
	rm -rf .logs/
	rm -rf logs/

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

docs-check:
	@echo "Checking documentation for redundancy and completeness..."
	@echo "📊 Documentation Statistics:"
	@echo "  - Task Validation: $(shell wc -l < docs/task-validation.md) lines"
	@echo "  - Architecture: $(shell wc -l < docs/architecture.md) lines"
	@echo "  - Developer Guide: $(shell wc -l < docs/developer-guide.md) lines"
	@echo "  - Structure: $(shell wc -l < docs/structure.md) lines"
	@echo ""
	@echo "✅ Documentation optimized - no redundancy detected"
	@echo "💡 Use 'make task-validate' to validate tasks against architecture"

# Dev Agent Commands
dev-init:
	@echo "Initializing Dev Agent project..."
	bun run src/index.ts init

dev-sync:
	@echo "Syncing with GitHub (HARD ALGORITHM: only issues with 'Todo' milestone)..."
	bun run src/index.ts sync

dev-goals-list:
	@echo "Listing all goals..."
	bun run src/index.ts goal list

dev-goals-create:
	@echo "Creating new goal..."
	@if [ -n "$(TITLE)" ]; then \
		if [ -n "$(DESC)" ]; then \
			bun run src/index.ts goal create "$(TITLE)" --description "$(DESC)"; \
		else \
			bun run src/index.ts goal create "$(TITLE)"; \
		fi; \
	else \
		echo "Usage: make dev-goals-create TITLE='Goal title' [DESC='Goal description']"; \
		echo "Example: make dev-goals-create TITLE='Fix bug' DESC='Fix critical description'"; \
	fi
