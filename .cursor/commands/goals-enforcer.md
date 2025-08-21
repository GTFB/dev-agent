# Goals Enforcer Protocol

## Overview
Automatically analyze user requests to select and apply the correct workflow protocol.

## Steps
1.  **Analyze Request**
   - Analyze user request
   - Score based on keywords

2.  **Determine Task Type**
   - Determine task type: `Feature`, `Refactor`, `Hotfix` or `Release`

3. **Task Validation Integration**
   - **[Task Validator](../../docs/task-validation.md)** - Validate tasks against architecture and generate execution plans
   - **Usage**: `make task-validate TASK="Task title" DESC="Description" [OPTIONS]`
   - **Integration**: Run before applying any workflow protocol to ensure architectural compliance

3.  **Apply Protocol**
   - Select the corresponding protocol
   - Log decision and begin execution

## Checklist
- [ ] User request analyzed
- [ ] Task type determined
- [ ] Correct protocol applied
- [ ] Execution started

## Related Protocols
- **[Feature Workflow](./feature-workflow.md)** - For implementing new functionality.
- **[Refactoring Workflow](./refactoring-workflow.md)** - For improving existing code.
- **[Release Workflow](./release-workflow.md)** - For publishing new versions.
- **[Hotfix Protocol](./workflow-hotfix.md)** - For fast bugfix.