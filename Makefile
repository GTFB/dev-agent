# lnd-boilerplate Makefile
# Проксирование команд dev-agent и собственные команды проекта

.PHONY: help dev-help dev-init dev-goals-create dev-goals-list dev-goals-update dev-goals-delete dev-workflow-feature dev-workflow-release dev-workflow-hotfix dev-sync dev-validate dev-build dev-test dev-clean install build type-check lint format

# Основные команды проекта
help: ## Показать справку по всем командам
	@echo "🚀 lnd-boilerplate - Available Commands:"
	@echo ""
	@echo "📦 Project Commands:"
	@echo "  install      - Install all dependencies"
	@echo "  build        - Build all packages"
	@echo "  type-check   - Run TypeScript type checking"
	@echo "  lint         - Run ESLint across all packages"
	@echo "  format       - Format code with Prettier"
	@echo "  clean        - Clean build artifacts"
	@echo ""
	@echo "🛠️  Dev Agent Commands:"
	@echo "  dev-help     - Show dev-agent help"
	@echo "  dev-init     - Initialize dev-agent"
	@echo "  dev-goals-*  - Manage goals (create, list, update, delete)"
	@echo "  dev-workflow-* - Workflow commands (feature, release, hotfix)"
	@echo "  dev-sync     - Sync with remote repository"
	@echo "  dev-validate - Validate project structure"
	@echo "  dev-build    - Build dev-agent"
	@echo "  dev-test     - Run dev-agent tests"
	@echo "  dev-clean    - Clean dev-agent build artifacts"
	@echo ""
	@echo "💡 Usage: make <command>"

# Проксирование команд dev-agent
dev-help: ## Показать справку dev-agent
	@cd dev && make help

dev-init: ## Инициализировать dev-agent
	@cd dev && make dev-init

dev-goals-create: ## Создать новую цель
	@cd dev && make dev-goals-create

dev-goals-list: ## Список всех целей
	@cd dev && make dev-goals-list

dev-goals-update: ## Обновить цель
	@cd dev && make dev-goals-update

dev-goals-delete: ## Удалить цель
	@cd dev && make dev-goals-delete

dev-workflow-feature: ## Запустить workflow для feature
	@cd dev && make dev-workflow-feature

dev-workflow-release: ## Запустить workflow для release
	@cd dev && make dev-workflow-release

dev-workflow-hotfix: ## Запустить workflow для hotfix
	@cd dev && make dev-workflow-hotfix

dev-sync: ## Синхронизировать с remote
	@cd dev && make dev-sync

dev-validate: ## Валидировать проект
	@cd dev && make dev-validate

dev-build: ## Собрать dev-agent
	@cd dev && make dev-build

dev-test: ## Запустить тесты dev-agent
	@cd dev && make dev-test

dev-clean: ## Очистить dev-agent
	@cd dev && make dev-clean

# Команды проекта
install: ## Установить все зависимости
	@echo "📦 Installing dependencies..."
	bun install

build: ## Собрать все пакеты
	@echo "🏗️ Building all packages..."
	bun run build

type-check: ## Проверить типы TypeScript
	@echo "🔍 Running TypeScript type checking..."
	bun run type-check

lint: ## Запустить ESLint
	@echo "🧹 Running ESLint..."
	bun run lint

format: ## Форматировать код с Prettier
	@echo "✨ Formatting code with Prettier..."
	bun run format

clean: ## Очистить артефакты сборки
	@echo "🧹 Cleaning build artifacts..."
	bun run clean
	@echo "🗑️ Removing dist folders..."
	rm -rf packages/*/dist
	@echo "✅ Cleanup complete!"

# Специальные команды для создания задач по ТЗ
create-tech-spec-tasks: ## Создать все задачи по ТЗ в dev-agent
	@echo "📋 Creating TECH_SPEC.md tasks in dev-agent..."
	@cd dev && make dev-goals-create TITLE="Phase 1: Foundation and Structure" DESCRIPTION="Monorepo initialization with Turborepo, structure creation, tooling setup, and base Next.js application" STATUS="completed"
	@cd dev && make dev-goals-create TITLE="Phase 2: Design System and Content" DESCRIPTION="UI setup with Tailwind CSS, theme implementation, Sveltia CMS integration, and marketing blocks development" STATUS="todo"
	@cd dev && make dev-goals-create TITLE="Phase 3: Advanced Features" DESCRIPTION="Internationalization (i18n), search integration with Typesense, authentication with Next-auth.js, and community features" STATUS="todo"
	@cd dev && make dev-goals-create TITLE="Phase 4: Offline Mode and PWA" DESCRIPTION="PWA setup with next-pwa, Dexie.js integration, React Query configuration, and offline testing" STATUS="todo"
	@cd dev && make dev-goals-create TITLE="Phase 5: Observability and CI/CD" DESCRIPTION="Monitoring integration (GlitchTip, Plausible), CI/CD workflow setup, and deployment automation" STATUS="todo"
	@echo "✅ All TECH_SPEC.md tasks created successfully!"
