# **Code Refactoring Protocol**

This document defines the standardized workflow for code refactoring, which is assisted and validated by the Dev Agent.

## **Guiding Principles**

-   **Refactor with a Purpose:** Refactoring must have a clear, measurable goal, such as improving readability, performance, or maintainability.
-   **Small Steps, Frequent Commits:** Break large refactors into small, atomic changes to make them easy to review and revert if necessary.
-   **Tests are the Safety Net:** No refactoring should begin without a robust test suite that validates the code's existing behavior.
-   **Do Not Introduce New Functionality:** Refactoring improves existing code; adding new features is a separate task.

---

## **1. Branch Definitions**

-   `refactor/*`: **Refactoring Branches.** Temporary branches for refactoring efforts. Branched from `develop`, merged into `develop`.

---

## **2. Developer Protocol: Refactoring Workflow**

### **Phase 0: Preparation & Analysis**

1.  **Identify Refactoring Target:**
    -   Use static analysis tools, code reviews, or complexity metrics to identify areas of the code that need improvement.
    -   Create a task (e.g., `g-xxxxxx`) to track the refactoring effort, documenting the "why" behind the change.

2.  **Ensure Test Coverage:**
    -   Before touching any code, run the existing test suite to ensure everything is passing.
    -   If test coverage is inadequate, **write the tests first**. These tests must validate the current behavior and should fail if it is broken.

3.  **Create a Refactoring Branch:**
    -   Sync your local `develop` branch: `git checkout develop && git pull`.
    -   Create a new refactoring branch:
        ```bash
        agent task start g-xxxxxx # Assuming the task is already created
        # Or manually:
        git checkout -b refactor/improve-auth-module-g-xxxxxx develop
        ```

### **Phase 1: Execution**

1.  **Make One Small, Atomic Change:**
    -   Apply a single, well-defined refactoring (e.g., Rename Variable, Extract Method, Move Function).
    -   Use your IDE's automated refactoring tools whenever possible to minimize errors.

2.  **Run the Tests:**
    -   After each small change, run the relevant test suite to guarantee no behavior has been broken.
    -   **If a test fails, revert the change and try a different approach.** Do not proceed with failing tests.

3.  **Commit the Change:**
    -   Commit your small, successful change with a clear and concise message. Use the `refactor:` prefix according to Conventional Commits:
        ```bash
        git commit -m "refactor: extract password validation logic into 'validatePassword' function"
        ```
    -   *Repeat steps 1-3 until the refactoring goal is achieved.*

### **Phase 2: Quality Assurance**

1.  **Run the Full Quality Gate:**
    -   After all refactoring changes have been committed, run the complete quality gate:
        ```bash
        make quality
        ```
    -   This ensures that readability, formatting, and project conventions are maintained.

2.  **Rebase with `develop`:**
    -   Keep your branch up-to-date with the latest changes from the main development line:
        ```bash
        git fetch origin
        git rebase origin/develop
        ```
    -   Resolve any conflicts and run `make quality` again to ensure integrity.

3.  **Push the Branch:**
    -   Push your changes to the remote repository.
        ```bash
        git push --force-with-lease origin refactor/your-branch-name
        ```

### **Phase 3: Code Review & Merge**

1.  **Create a Pull Request (PR):**
    -   Open a PR from your `refactor/*` branch into `develop`.
    -   In the PR description, clearly explain **what was refactored** and **why it was necessary**.
    -   Include metrics if possible (e.g., "Cyclomatic complexity reduced from 15 to 4," or "Improved performance by 10%").

2.  **Automated CI Checks:**
    -   Wait for the CI pipeline to run `make quality` and confirm that all tests pass. A PR cannot be merged if CI fails.

3.  **Peer Review:**
    -   Request a review from at least one colleague. The focus of the review should be on the structural improvements and readability, as the existing functionality is already guaranteed by the test suite.

4.  **Merge:**
    -   After receiving approval and a successful CI run, merge the PR using the **"Squash and Merge"** strategy to keep the `develop` history clean and atomic.

---

## **Dev Agent Integration**

Dev Agent assists the refactoring protocol in the following ways:

### **AI-Assisted Code Analysis**
-   **Target Identification:** `agent ai suggest-refactor <file>` can analyze a file and suggest refactoring candidates based on complexity and common code smells.
-   **Test Generation:** `agent ai generate-tests <file>` can be used in Phase 0 to improve test coverage before the refactoring begins.

### **Automated Execution**
-   **AI-Guided Refactoring:** `agent ai refactor <file> --prompt "Extract this logic into a separate function"` can perform specific refactorings based on natural language instructions.
-   **Quality Validation:** The `make quality` command is integrated into the agent's workflow to ensure checks are run at the appropriate times.

### **Tracking and Documentation**
-   **Task Management:** The refactoring effort is tracked as a standard task within the Dev Agent's database system.
-   **Commit Messaging:** The `agent commit` command can be used to help craft meaningful `refactor:` commit messages that follow the project's conventions.

---

*This protocol ensures that refactoring is a safe, controlled, and beneficial process, leveraging the automation of Dev Agent to increase both efficiency and quality.*