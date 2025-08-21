# Code Refactoring Protocol

This document defines the standardized workflow for improving existing code. The Dev Agent assists and validates this process to ensure that refactoring is safe, purposeful, and effective.

## Guiding Principles

- **Refactor with a Purpose:** Refactoring must have a clear goal (e.g., improve readability, performance, maintainability).
- **Small Steps, Frequent Commits:** Break down large refactors into small, atomic changes.
- **Tests are the Safety Net:** No refactoring begins without a robust test suite that validates existing behavior.
- **Do Not Introduce New Functionality:** Refactoring improves *existing* code; new features are a separate task.

## Branching Model

- **Source Branch:** `develop`
- **Refactor Branch Naming:** `refactor/<task-id>-<short-description>` (e.g., `refactor/g-4d5e6f-optimize-query-engine`)
- **Target Branch:** `develop` (via a versionless Pull Request)

---

## Developer Workflow: Improving Code Safely

### **Phase 0: Preparation & Analysis**

1.  **Identify Target & Create Task:** Identify the code to be refactored and create a task to track the effort, clearly documenting the "why."
    ```powershell
    agent task create "Refactor authentication service to use dependency injection"
    ```

2.  **Ensure Test Coverage:** Before writing any code, verify that the target module has sufficient test coverage. If not, **write the tests first**.
    ```powershell
    # Use AI to help generate missing tests
    agent ai generate-tests --file=src/services/AuthenticationService.ts
    # Run tests to confirm a stable baseline
    make test
    ```

3.  **Start Work:** Use the standard `agent task start` command. The agent will recognize the "refactor" keyword and may apply specialized checks.
    ```powershell
    agent task start <task-id>
    ```
    **Automation:** This command performs the same actions as in the feature workflow: syncs `develop`, creates a correctly named `refactor/` branch, and updates the task status in the database.

### **Phase 1: Execution**

1.  **Make One Small, Atomic Change:** Apply a single, well-defined refactoring (e.g., Rename Variable, Extract Method). Use IDE tools whenever possible.

2.  **Run Tests:** After *each small change*, run the relevant tests to guarantee no behavior was broken. **If a test fails, revert the change and try again.**

3.  **Commit the Change:** Commit the successful change with a `refactor:` prefix.
    ```powershell
    # Use the interactive helper for a guided commit
    agent commit
    # Git example:
    # git commit -m "refactor(auth): extract password validation logic"
    ```
    *Repeat this loop until the refactoring goal is achieved.*

### **Phase 2: Quality Assurance & Delivery**

This phase is identical to the Feature Workflow.

1.  **Sync with `develop`:** `make rebase-develop`
2.  **Run Full Quality Gate:** `make quality`
3.  **Push the Branch:** `make push-branch`

### **Phase 3: Code Review & Merge**

1.  **Create Pull Request:** `agent pr create`
    *In the PR description, clearly explain **what** was refactored and **why**. Include metrics if possible (e.g., "Cyclomatic complexity reduced from 15 to 4").*

2.  **Pass CI Checks & Peer Review:** The process is identical to the feature workflow. The review focuses on structural improvements, as tests guarantee functionality.

3.  **Merge:** After approval, **"Squash and Merge"** the PR into `develop`. The task status is updated to `done`.

### **Dev Agent AI Integration**

The agent's AI capabilities are particularly useful for refactoring:
- **`agent ai suggest-refactor <file>`:** Analyzes a file and suggests refactoring candidates.
- **`agent ai refactor <file> --prompt "..."`:** Performs specific refactorings based on natural language.
- **`agent ai generate-tests <file>`:** Helps achieve necessary test coverage in Phase 0.