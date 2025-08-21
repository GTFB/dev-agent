
# Feature Development Protocol

This document defines the standardized workflow for creating new functionality. The Dev Agent automates and enforces this protocol to ensure consistency, quality, and a clean Git history.

## Guiding Principles

- **Main is Always Deployable:** The `main` branch contains production-ready code at all times.
- **Automate Everything:** Manual checks are a source of error. All quality gates are automated.
- **Clean and Readable History:** Git history is documentation and must be easy to understand.
- **No Code is Merged Without Review:** Peer review is mandatory for maintaining quality.

## Branching Model

- **Source Branch:** `develop`
- **Feature Branch Naming:** `feature/<task-id>-<short-description>` (e.g., `feature/g-1a2b3c-user-authentication`)
- **Target Branch:** `develop` (via a versionless Pull Request)

---

## Developer Workflow: From Idea to Integration

### **Phase 0: Initialization**

1.  **Ensure Clean State:** Verify you have no tasks currently in progress.
    ```powershell
    agent task list --status=in_progress
    ```

2.  **Sync & Select Task:** Synchronize with the issue tracker and identify the task to work on. If the task doesn't exist locally, create it.
    ```powershell
    # Sync with GitHub issues
    agent task sync
    # Or create a new local task
    agent task create "Implement user authentication endpoint"
    ```

3.  **Start Work:** This is the key command that initiates the entire workflow.
    ```powershell
    agent task start <task-id>
    ```
    **What this command automates:**
    - Verifies the task exists and has the status `todo`.
    - Runs `make sync-develop` to ensure your `develop` branch is up-to-date.
    - Creates and checks out a new `feature/` branch with the correct name.
    - Updates the task's status to `in_progress` and links the branch name in the database.

### **Phase 1: Implementation & Quality**

1.  **Code & Document:** Write the code to implement the feature. Adhere to all coding standards and provide TSDoc for all public APIs.

2.  **Run Local Quality Gate:** Before every commit, ensure your changes pass local checks.
    ```powershell
    make quality
    ```
    *This should be automated with a pre-commit hook.*

3.  **Commit Changes:** Make small, atomic commits with clear messages. Use the `agent commit` helper for guided, conventional commit messages.
    ```powershell
    agent commit
    ```

### **Phase 2: Finalization & Delivery**

1.  **Sync with `develop`:** Before creating a Pull Request, rebase your branch on the latest `develop` to maintain a linear history.
    ```powershell
    make rebase-develop
    ```
    *This command fetches the latest `develop` and performs a `git rebase`.*

2.  **Run Full Quality Gate (Again):** After the rebase, run the full quality check to ensure no new conflicts or issues were introduced.
    ```powershell
    make quality
    ```

3.  **Push the Branch:** Push your feature branch to the remote repository. The `--force-with-lease` flag is used safely after a rebase.
    ```powershell
    make push-branch
    ```

### **Phase 3: Code Review & Merge**

1.  **Create Pull Request:** Use the agent to create a Pull Request into `develop`.
    ```powershell
    agent pr create
    ```
    *This command automatically populates the PR template with task details from the database.*

2.  **Pass CI Checks:** The CI pipeline will automatically run `make quality` on your PR. A successful run is mandatory for merging.

3.  **Peer Review:** Request a review from at least one teammate. Address all feedback.

4.  **Merge:** After approval and successful CI, merge the PR using the **"Squash and Merge"** strategy. This keeps the `develop` history clean and atomic.

### **Phase 4: Cleanup**

After the PR is merged, the `feature/*` branch is typically deleted automatically by GitHub. Sync your local workspace to complete the cycle.
```powershell
make sync-develop
```