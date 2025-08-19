# Development Protocols

This directory contains the standardized protocols and workflows that Dev Agent implements and enforces.

## 📋 Available Protocols

### [High-Efficiency Standard Operating Protocol](high-efficiency-sop.md)

The core development and release management protocol that defines:

- **Branch Management**: Structured Git workflow with protected branches
- **Developer Workflow**: 5-phase feature development process
- **Release Management**: Standardized version release procedures
- **Quality Assurance**: Automated testing and code review requirements
- **Task Management**: Systematic approach to task tracking and completion

### [Code Refactoring Protocol](refactoring.md)

Standardized workflow for code refactoring that ensures:

- **Purpose-Driven Changes**: Clear, measurable refactoring goals
- **Incremental Approach**: Small, atomic changes with frequent commits
- **Test Safety Net**: Robust test suite validation before and after changes
- **Quality Maintenance**: No new functionality introduced during refactoring

### [Automatic Protocol Enforcer](auto-protocol-enforcer.md) 🚨 **IRON RULE**

**Automatically determines task type and applies the appropriate protocol:**

- **New tasks** → `high-efficiency-sop.md`
- **Refactoring** → `refactoring.md`

**Dev Agent ALWAYS follows this rule automatically!**

The core development and release management protocol that defines:

- **Branch Management**: Structured Git workflow with protected branches
- **Developer Workflow**: 5-phase feature development process
- **Release Management**: Standardized version release procedures
- **Quality Assurance**: Automated testing and code review requirements
- **Task Management**: Systematic approach to task tracking and completion

## 🎯 Protocol Goals

1. **Consistency**: Standardized workflows across all team members
2. **Quality**: Automated quality gates and mandatory code reviews
3. **Efficiency**: Streamlined processes that reduce manual overhead
4. **Reliability**: Predictable outcomes through systematic procedures
5. **Collaboration**: Clear communication and handoff procedures

## 🔄 How Dev Agent Implements These Protocols

Dev Agent automatically determines and applies the correct protocol for every user request:

### **🚨 Automatic Protocol Application**

1. **User message analysis** - Keyword detection
2. **Task classification** - New tasks vs Refactoring
3. **Protocol application** - Automatic following of Phase 0-5 or Phase 0-3
4. **Step execution** - Step-by-step execution of all protocol requirements
5. **Progress logging** - Report on each execution stage

### **📊 Task type determination logic**

```typescript
// Keywords for new tasks
const newTaskKeywords = ['create', 'add', 'implement', 'make', 'setup', 'new', 'feature', 'task'];

// Keywords for refactoring  
const refactorKeywords = ['refactor', 'improve', 'optimize', 'code', 'structure', 'architecture'];

// Automatic counting and protocol selection
```

Dev Agent automates key aspects of these protocols:

### Task Management

- **AID System**: Unique, typed identifiers for all tasks
- **Status Tracking**: Automatic status updates through the workflow
- **Database Storage**: Persistent task state and history

### Git Workflow

- **Branch Creation**: Automatic feature branch creation with naming conventions
- **Status Validation**: Working directory cleanliness checks
- **Branch Management**: Automated checkout and synchronization

### Quality Assurance

- **Pre-commit Hooks**: Integration with quality gates
- **Configuration Management**: Centralized project settings
- **Reporting**: Task status and progress tracking

## 🚀 Getting Started

1. **Initialize your project** with Dev Agent:

   ```bash
   bun run dev-agent/src/index.ts init
   ```

2. **Configure your repository** according to the protocol requirements

3. **Start following the workflow**:

   ```bash
   # Create a task
   bun run dev-agent/src/index.ts task create "Implement feature X"

   # Start working
   bun run dev-agent/src/index.ts task start g-xxxxxx
   ```

4. **Follow the development phases** as outlined in the protocol

## 📚 Related Documentation

- [Getting Started Guide](../getting-started.md) - Basic setup and usage
- [CLI Commands Reference](../cli-commands.md) - Complete command documentation
- [Architecture Overview](../architecture.md) - Technical implementation details
- [Developer Guide](../developer-guide.md) - Contributing to Dev Agent

## 🔧 Customization

These protocols can be customized through Dev Agent's configuration system:

```bash
# Configure branch naming
bun run dev-agent/src/index.ts config set branches.feature_prefix "feat"
bun run dev-agent/src/index.ts config set branches.develop "development"

# Configure GitHub integration
bun run dev-agent/src/index.ts config set github.owner "your-org"
bun run dev-agent/src/index.ts config set github.repo "your-project"
```

## 📞 Support

For questions about implementing these protocols:

- Check the [CLI Commands Reference](../cli-commands.md) for specific commands
- Review the [Configuration Guide](../configuration.md) for customization options
- See the [Developer Guide](../developer-guide.md) for advanced usage

---

_These protocols are designed to work seamlessly with Dev Agent's automation capabilities while maintaining flexibility for team-specific requirements._
