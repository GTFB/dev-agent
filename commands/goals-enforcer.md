# Goals Enforcer Protocol

## Overview
Automatically determines the current task (either from a user request or an autonomous queue) and applies the correct, architecturally-compliant workflow protocol to execute it.

## Steps

**Step 1: Task Acquisition & Context Initialization**
   - **If a specific user request is provided:** Proceed directly to Step 2.
   - **If no request is provided (autonomous mode):**
     1.  **Check for Active Work:** Query the DB for a task with `in_progress` status. If found, check out its associated branch and resume work.
     2.  **Select New Task:** If no active tasks exist, find a task in the DB with `todo` status (by high priority or earliest date).
     3.  **Sync Queue if Empty:** If no `todo` tasks exist, sync with GitHub to populate the queue. New tasks are created in the DB with an ID from `aid-generator`.

**Step 2: Request Analysis & Task Typing**
   - **Analyze Content:** Analyze the acquired task's title and description.
   - **Determine Task Type:** Classify the task as `Feature`, `Refactor`, `Hotfix`, or `Release`.

**Step 3: Architectural Validation & Planning**
   - **Run Task Validator:** Validate the task against the system architecture to ensure compliance and generate a detailed execution plan.
   - **Command:** `make task-validate TASK="Task title" DESC="Description" [OPTIONS]`
   - **Goal:** Prevent architectural drift before work begins.
   - Before you write the code, explain the core principles of the Observer design pattern and why it's the right choice for managing state updates in this UI component. Once I confirm your explanation, proceed with the implementation.

**Step 4: Protocol Execution**
   - **Apply Protocol:** Select and apply the corresponding workflow protocol based on the determined task type.
   - **Log & Execute:** Log the decision and begin execution of the selected workflow.

## Checklist
- [ ] Task acquired (from user request or queue)
- [ ] Task type determined
- [ ] Task validated against architecture
- [ ] Correct protocol execution started

## Related Protocols
- **[Feature Workflow](./feature-workflow.md)** - For implementing new functionality.
- **[Refactoring Workflow](./refactoring-workflow.md)** - For improving existing code.
- **[Hotfix Protocol](./workflow-hotfix.md)** - For urgent bug fixes.
- **[Release Workflow](./release-workflow.md)** - For publishing new versions.