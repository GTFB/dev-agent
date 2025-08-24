# Task Validation and Plan Generation

> **🔍 Validate tasks against project architecture and generate execution plans**

## Overview

The Task Validator ensures new tasks align with project architecture, principles, and best practices. It validates against design, code, documentation, and process principles, then generates execution plans with timelines and risk assessments.

## 🚀 Quick Start

```bash
# Basic validation
make task-validate TASK="Add user authentication" DESC="Implement JWT-based auth system"

# With options
make task-validate TASK="Database migration" DESC="Add user table with indexes" \
  PRIORITY=high EFFORT=medium CATEGORY=infrastructure
```

## 📋 Task Parameters

| Parameter | Values | Default |
|-----------|--------|---------|
| **Category** | `feature`, `bugfix`, `refactoring`, `documentation`, `infrastructure` | `feature` |
| **Priority** | `low`, `medium`, `high`, `critical` | `medium` |
| **Effort** | `small`, `medium`, `large`, `epic` | `medium` |

## 🏗️ Architecture Principles

| Category | Principle | Priority |
|----------|-----------|----------|
| **Design** | Layered Architecture, Dependency Direction, Interface Stability | Critical |
| **Code** | TypeScript Only, English Only, Error Handling | Critical |
| **Documentation** | Documentation Coverage, API Documentation (TSDoc) | High |
| **Process** | Testing Requirements, Migration Safety | High |

## 🔍 Validation Process

1. **Architecture Analysis** - Examines current architecture state and component impact
2. **Principle Validation** - Validates against all architectural principles
3. **Business Logic Validation** - Uses existing ValidationService for goal validation
4. **Impact Assessment** - Determines architectural impact level and affected components

## 📊 Output

| Output | Description |
|--------|-------------|
| **Validation Results** | ✅ Valid, ⚠️ Warning, ❌ Error with suggestions |
| **Execution Plan** | 7-step plan: Pre-validation → Architecture Review → Planning → Development → Testing → Documentation → Review |
| **Risk Assessment** | Critical/High/Medium/Low risks with mitigation strategies |
| **Recommendations** | Actionable steps to address validation issues |
| **Timeline** | Estimated completion time based on complexity and impact |

## 💡 Examples

| Task Type | Command | Expected Impact |
|-----------|---------|-----------------|
| **Simple Feature** | `make task-validate TASK="Add logging" DESC="Implement structured logging"` | ✅ Low impact, standard plan |
| **Infrastructure** | `make task-validate TASK="DB migration" DESC="Add user table" PRIORITY=high` | ⚠️ Medium impact, migration warnings |
| **Breaking Change** | `make task-validate TASK="API v2.0" DESC="Breaking changes" PRIORITY=critical` | ❌ High impact, critical risks |

## 🔧 Integration

| Workflow | Command | Purpose |
|----------|---------|---------|
| **Pre-commit** | `make task-validate TASK="$(git log -1 --pretty=%B)"` | Validate commit messages |
| **CI/CD** | GitHub Actions with commit message validation | Automated task validation |
| **Planning** | `make task-validate TASK="..." > plan.md` | Generate execution plans |

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| **Non-English content** | ❌ Error: Translate all content to English |
| **Circular dependencies** | ⚠️ Warning: Review dependency direction |
| **Missing requirements** | ⚠️ Warning: Add testing/documentation to description |
| **Debug mode** | `DEBUG=true make task-validate TASK="..."` |

## 📈 Best Practices

| Practice | Description |
|----------|-------------|
| **Task Descriptions** | Be specific, include requirements, consider impact, plan for changes |
| **Validation Workflow** | Draft → Validate → Fix → Refine → Re-validate |
| **Architecture** | Layer separation, interface stability, dependency management, testing strategy |

## 🔗 Related

- **[Architecture Overview](architecture.md)** - System design and architecture
- **[Developer Guide](developer-guide.md)** - Development setup and guidelines
- **[Validation Service](../src/services/ValidationService.ts)** - Business logic validation
- **[Project Structure](structure.md)** - Complete project organization

---

**💡 Tip**: Use task validator early in planning to catch architectural issues!
