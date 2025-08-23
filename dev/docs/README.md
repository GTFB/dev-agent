# Dev Agent Documentation

Welcome to the Dev Agent documentation! This guide provides quick access to all documentation resources.

## 🚀 Quick Start

For immediate setup and usage, see the **[main README](../README.md)** in the project root.

## 📚 Documentation Index

### 🎯 **Getting Started**
- **[Main README](../README.md)** - Complete setup guide, installation, and essential commands
- **[Quick Start](quick-start.md)** - Get up and running in minutes
- **[Developer Guide](developer-guide.md)** - Development environment setup and contribution guidelines

### 🏗️ **Architecture & Design**
- **[Architecture Overview](architecture.md)** - System design, components, and data flow
- **[API Reference](api/)** - Auto-generated TypeScript API documentation

### 🔧 **Development & Operations**
- **[CI/CD Pipeline](ci-cd.md)** - GitHub Actions workflows and deployment
- **[Versioning](versioning.md)** - Release management and versioning strategy
- **[Task Validation](task-validation.md)** - Task validation and execution plan generation

### 📋 **Reference Materials**
- **[Project Structure](structure.md)** - Complete file and directory organization
- **[CHANGELOG](CHANGELOG.md)** - Version history and changes

### 🆘 **Support & Troubleshooting**
- **[Troubleshooting Guide](troubleshooting.md)** - Solutions for common issues
- **[Quick Start](quick-start.md)** - Fast setup guide

## 🎯 **Key Information**

### **Installation (Subtree)**
```bash
git subtree add --prefix=dev-agent https://github.com/your-org/dev-agent.git main --squash
```

### **Essential Commands**
```bash
# Initialize
make dev-init

# Create goal
make dev-goals-create TITLE="Task title"

# Start working
make dev-goals-start ID="goal-id"

# Complete goal
make dev-goals-complete ID="goal-id"
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
- **Quick Start** contains: Fast setup, basic configuration, essential commands
- **Developer Guide** contains: Development setup, Testing, Contributing guidelines
- **Architecture** contains: System design, Component relationships, Data flow
- **API Reference** contains: Auto-generated TypeScript documentation
- **Troubleshooting** contains: Common issues, solutions, debug tips

## 📖 **Documentation Philosophy**

1. **No Duplication** - Each topic is documented in one place
2. **Cross-References** - Documents link to each other, not repeat content
3. **Progressive Disclosure** - Start simple, drill down for details
4. **Single Source of Truth** - Main README for key information, docs/ for details
5. **User-Focused** - Quick Start for immediate needs, detailed guides for depth

## 🎯 **Documentation Levels**

### **Level 1: Quick Start**
- **[Quick Start](quick-start.md)** - Get running in 5 minutes
- **[Main README](../README.md)** - Essential commands and setup

### **Level 2: Development**
- **[Developer Guide](developer-guide.md)** - Development environment and workflow
- **[Task Validation](task-validation.md)** - Task planning and validation

### **Level 3: Architecture**
- **[Architecture](architecture.md)** - System design and components
- **[Project Structure](structure.md)** - File organization and validation

### **Level 4: Operations**
- **[CI/CD Pipeline](ci-cd.md)** - Deployment and automation
- **[Versioning](versioning.md)** - Release management
- **[Troubleshooting](troubleshooting.md)** - Problem solving

---

**💡 Tip**: Start with [Quick Start](quick-start.md) for immediate setup, then use this index to find specific details.
