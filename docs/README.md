# Dev Agent Documentation

Welcome to the Dev Agent documentation! This guide provides quick access to all documentation resources.

## 🚀 Quick Start

For immediate setup and usage, see the **[main README](../README.md)** in the project root.

## 📚 Documentation Index

### 🎯 **Getting Started**
- **[Main README](../README.md)** - Complete setup guide, installation, and essential commands
- **[Developer Guide](developer-guide.md)** - Development environment setup and contribution guidelines

### 🏗️ **Architecture & Design**
- **[Architecture Overview](architecture.md)** - System design, components, and data flow
- **[API Reference](api/)** - Auto-generated TypeScript API documentation

### 🔧 **Development & Operations**
- **[CI/CD Pipeline](ci-cd.md)** - GitHub Actions workflows and deployment
- **[Versioning](versioning.md)** - Release management and versioning strategy
- **[Structure Validation](structure-validation.md)** - Automated project structure validation
- **[Task Validation](task-validation.md)** - Task validation and execution plan generation

### 📋 **Reference Materials**
- **[Project Structure](structure.md)** - Complete file and directory organization
- **[CHANGELOG](CHANGELOG.md)** - Version history and changes

## 🎯 **Key Information**

### **Installation (Subtree)**
```bash
git subtree add --prefix=dev-agent https://github.com/your-org/dev-agent.git main --squash
```

### **Essential Commands**
```bash
# Initialize
bun run dev-agent/src/index.ts init

# Create goal
bun run dev-agent/src/index.ts goal create "Task title"

# Start working
bun run dev-agent/src/index.ts goal start <goal-id>

# Complete goal
bun run dev-agent/src/index.ts goal complete <goal-id>
```

### **Development Commands**
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

## 🔗 **Cross-References**

- **Main README** contains: Installation, Quick Start, Essential Commands, Configuration
- **Developer Guide** contains: Development setup, Testing, Contributing guidelines
- **Architecture** contains: System design, Component relationships, Data flow
- **API Reference** contains: Auto-generated TypeScript documentation

## 📖 **Documentation Philosophy**

1. **No Duplication** - Each topic is documented in one place
2. **Cross-References** - Documents link to each other, not repeat content
3. **Progressive Disclosure** - Start simple, drill down for details
4. **Single Source of Truth** - Main README for key information, docs/ for details

---

**💡 Tip**: Start with the [main README](../README.md) for setup, then use this index to find specific details.
