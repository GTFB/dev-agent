# Dev Agent Makefile
# Provides convenient commands for development and release management

.PHONY: help install test build clean version-bump version-patch version-minor version-major release-prepare release-validate

# Default target
help:
	@echo "Dev Agent - Development and Release Management"
	@echo ""
	@echo "Available commands:"
	@echo "  install          Install dependencies"
	@echo "  test            Run test suite"
	@echo "  build           Build the project"
	@echo "  clean           Clean build artifacts"
	@echo "  validate        Validate project structure"
	@echo ""
	@echo "Version Management:"
	@echo "  version-info    Show current version information"
	@echo "  version-patch   Bump patch version (0.1.0 -> 0.1.1)"
	@echo "  version-minor   Bump minor version (0.1.0 -> 0.2.0)"
	@echo "  version-major   Bump major version (0.1.0 -> 1.0.0)"
	@echo ""
	@echo "Pre-Release Management:"
	@echo "  pre-release-alpha  Create alpha pre-release (0.2.0 -> 0.2.0-alpha.1)"
	@echo "  pre-release-beta   Create beta pre-release (0.2.0 -> 0.2.0-beta.1)"
	@echo "  pre-release-rc     Create release candidate (0.2.0 -> 0.2.0-rc.1)"
	@echo ""
	@echo "Release Management:"
	@echo "  release-prepare Prepare release (create release branch)"
	@echo "  release-validate Validate release readiness"
	@echo "  release-create  Create GitHub release (requires token)"

# Development commands
install:
	bun install

test:
	bun test

build:
	bun run build

clean:
	rm -rf dist/
	rm -rf build/
	rm -rf coverage/

validate:
	bun run src/scripts/validate-structure.ts

# Version management
version-info:
	bun run src/scripts/version-manager.ts info

version-patch:
	bun run src/scripts/version-manager.ts bump patch

version-minor:
	bun run src/scripts/version-manager.ts bump minor

version-major:
	bun run src/scripts/version-manager.ts bump major

# Pre-release management
pre-release-alpha:
	bun run src/scripts/version-manager.ts pre-release alpha

pre-release-beta:
	bun run src/scripts/version-manager.ts pre-release beta

pre-release-rc:
	bun run src/scripts/version-manager.ts pre-release rc

# Release management
release-prepare: version-patch
	@echo "Release prepared! Next steps:"
	@echo "1. Review changes in release branch"
	@echo "2. Create Pull Request to main"
	@echo "3. Merge and create tag"

release-validate:
	@echo "Validating release readiness..."
	bun run src/scripts/validate-structure.ts
	@echo "Running tests..."
	bun test
	@echo "✅ Release validation passed!"

# Database management
db-init:
	bun run src/scripts/init-db.ts

db-check:
	bun run src/scripts/check-schema.ts

# Configuration management
config-check:
	bun run src/scripts/check-config.ts

# Quick development workflow
dev: install test validate
	@echo "✅ Development environment ready!"

# Full release workflow
release: clean install test validate release-prepare
	@echo "🎉 Release workflow completed!"
