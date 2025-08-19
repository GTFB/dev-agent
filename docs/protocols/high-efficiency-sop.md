# High-Efficiency Standard Operating Protocol: Development and Release

This document defines the standardized workflow for development and release management that Dev Agent automates and enforces.

## **Guiding Principles**

- **Main is Always Deployable:** The `main` branch, at any point in time, contains stable, production-ready code.
- **Automate Everything Possible:** Manual checks are a source of errors. Code quality, tests, and deployments must be verified automatically.
- **Clean and Readable History:** Commit history is documentation. It must be linear and easy to understand.
- **No Code is Merged Without Review:** A second pair of eyes on the code is a mandatory condition for maintaining quality and sharing knowledge.

---

## **1. Branch Definitions & Protection Rules**

- `main`: **🛡️ Production.** Protected. Direct commits are forbidden. Merges are only allowed from `release/*` branches via PRs.
- `develop`: **🛡️ Integration.** Protected. Direct commits are forbidden. Merges are only allowed from `feature/*` and `release/*` branches via PRs.
- `feature/*`: **Tasks.** Temporary branches for development. Branched from `develop`, merged into `develop`.
- `release/*`: **Staging.** Branches for release preparation. Branched from `develop`, merged into `main` and `develop`.

---

## **2. Developer Protocol: Feature Workflow**

### **Phase 0: Initialization**

1. **Check `in-progress`:** Ensure your `.tasks/in-progress/` directory is empty.
2. **Sync & Select Task:** If `.tasks/todo/` is empty, run `make sync-issues`. Select a task based on priority.
3. **Claim Task & Reset Progress:**
   - Move the task file from `.tasks/todo/` to `.tasks/in-progress/`.
   - **GitHub:** Change the Issue's Milestone to **"In Progress"**.
   - **Reset Status:** `echo "Initialization" > .tasks/.task.progress.yaml` (This command overwrites the file, resetting the progress).

### **Phase 1: Branch Preparation**

1. **Update `develop`:**
   ```bash
   git checkout develop
   git pull origin develop --ff-only
   ```
2. **Create `feature` branch:**
   ```bash
   make branch type="feature" description="task-description-id"
   ```
3. **Update Status:** `echo "Branching" > .tasks/.task.progress.yaml`

### **Phase 2: Implementation & Quality**

1. **Code & Document:** Write code, cover it with Unit Tests (>= 90%), and write TSDoc documentation.
2. **Local Quality Gate:** Before each commit, run fast local checks:
   ```bash
   make lint && make test
   ```
   _Recommendation: Automate this step with a pre-commit hook._
3. **Update Status:** `echo "Implementation" > .tasks/.task.progress.yaml`

### **Phase 3: Finalization & Delivery**

1. **Sync with `develop` using Rebase:** Keep your branch up-to-date and maintain a linear history.
   ```bash
   git fetch origin
   git rebase origin/develop
   ```
   _(Resolve any conflicts that arise)_.
2. **Run Full Quality Gate:** Ensure all checks pass after syncing.
   ```bash
   make quality
   ```
3. **Push the branch:**
   ```bash
   git push --force-with-lease origin feature/your-branch-name
   ```
   _(`--force-with-lease` is safe after a rebase and won't overwrite others' work)._
4. **Update Status:** `echo "Quality Assurance" > .tasks/.task.progress.yaml`

### **Phase 4: Code Review & Merge**

1. **Create Pull Request (PR):**
   - Open a PR from your `feature` branch into `develop`.
   - Use the **PR template** to describe changes and how to test them.
2. **Automated CI Checks:** Wait for the CI pipeline (e.g., GitHub Actions) to automatically run `make quality` and confirm that all checks pass. **A PR cannot be merged if the CI pipeline fails.**
3. **Request Review:** Request a review from at least one colleague. Implement changes based on feedback.
4. **Merge:** After receiving an **Approve** and a successful CI run, merge the PR using the **"Squash and Merge"** strategy. This keeps the `develop` history clean.
5. **Update Status:** `echo "Code Review" > .tasks/.task.progress.yaml`

### **Phase 5: Cleanup**

1. **Sync Local Workspace:**
   ```bash
   git checkout develop
   git pull
   ```
2. The `feature/*` branch will be deleted automatically upon merging the PR (if configured in the repository). If not, delete it manually: `git branch -d feature/your-branch-name`.

_The developer's work on this task is now complete. Final closure occurs after the release._

---

## **3. Release Manager Protocol: Version Release Workflow**

### **Phase 1: Staging Preparation**

1. **Create `release` branch** from the latest `develop` (e.g., `release/v1.2.0`).
2. **Update Version:** Bump the project version in `package.json` and/or other necessary files. Commit this change.
3. **Deploy to Staging:** Deploy the `release` branch to the Staging environment for testing and client review.

### **Phase 2: Stabilization**

1. **Fix Bugs:** Any hotfixes for this release are committed **directly to the `release` branch**.
2. **Client Approval:** Wait for final sign-off from the client.

### **Phase 3: 🚀 Finalizing the Release**

1. **Merge to `main` & Tag:**
   ```bash
   git checkout main
   git pull
   git merge --no-ff release/v1.2.0 -m "Merge release v1.2.0"
   git tag -a v1.2.0 -m "Release version 1.2.0"
   git push && git push --tags
   ```
2. **Merge back to `develop`:** (Crucial for backporting hotfixes into the main development line!)
   ```bash
   git checkout develop
   git pull
   git merge --no-ff release/v1.2.0 -m "Merge release v1.2.0 into develop"
   git push
   ```
3. **Create GitHub Release:** On the "Releases" page in GitHub, create a new release from the newly pushed tag. Attach a changelog.
4. **Delete `release` branch:** Remove the branch from the local and remote repositories.
5. **Automate Task Closure:**
   - **Recommendation:** Use a script that leverages the GitHub API to find all Issues associated with the commits in the release.
   - For each such Issue:
     - **GitHub:** Change Milestone to **"Done"**.
     - **GitHub:** Change Status to **"Closed"**.
   - **Locally:** Move the corresponding task files from `.tasks/in-progress/` or `.tasks/done/` to `.tasks/archive/`.

---

## **Action Plan for Implementation**

Here is the list of tasks to set up this high-efficiency workflow.

### **Category 1: GitHub Repository Configuration**

1. **Set up Branch Protection Rules:**
   - Go to `Repository Settings` > `Branches`.
   - Add a rule for `main`:
     - Enable "Require a pull request before merging".
     - Enable "Require status checks to pass before merging".
     - (Optional) Enable "Require approvals".
   - Add a rule for `develop`:
     - Enable "Require a pull request before merging".
     - Enable "Require status checks to pass before merging". Choose the CI check you will create in the next section.

2. **Configure Merge Strategy:**
   - Go to `Repository Settings` > `Pull Requests`.
   - Enable **"Allow squash merging"** and make it the default option. This ensures a clean history in `develop` and `main`.

3. **Enable Automatic Branch Deletion:**
   - In the same `Pull Requests` settings page, check the box for "Automatically delete head branches".

4. **Create a Pull Request Template:**
   - Create a file in your repository at this exact path: `.github/PULL_REQUEST_TEMPLATE.md`.
   - Add content to guide developers, for example:

     ```markdown
     ### Description

     _A clear and concise description of the changes._

     ### Related Issue

     _Closes #..._

     ### How to Test

     1. Step 1...
     2. Step 2...

     ### Checklist

     - [ ] I have added/updated unit tests.
     - [ ] I have run `make quality` locally.
     ```

### **Category 2: Automation & CI/CD**

5. **Set up the CI Pipeline:**
   - Create a file at `.github/workflows/ci.yml`.
   - This workflow should trigger on pull requests targeting `develop`. Its main job is to run your full quality gate.
   - Example `ci.yml`:
     ```yaml
     name: CI Quality Gate
     on:
       pull_request:
         branches: [develop]
     jobs:
       build-and-test:
         runs-on: ubuntu-latest
         steps:
           - uses: actions/checkout@v3
           - name: Set up Node.js
             uses: actions/setup-node@v3
             with:
               node-version: "18"
           - name: Install dependencies
             run: npm install
           - name: Run Quality Gate
             run: make quality
     ```

6. **(Advanced) Develop Post-Release Script:**
   - Create a script (e.g., in Bash using the `gh` CLI, or in Node.js/Python using the GitHub API) that automates the task closure described in Phase 3 of the Release Manager protocol. This script will be run manually by the Release Manager after a successful release.

### **Category 3: Local Development Environment**

7. **Set up Pre-commit Hooks:**
   - Add `husky` and `lint-staged` to your project's `devDependencies`.
   - Configure `husky` to run `lint-staged` on the `pre-commit` hook.
   - Configure `lint-staged` to run `make lint` and `make test` on staged files. This prevents broken code from ever being committed.

---

## **Dev Agent Integration**

Dev Agent automates many aspects of this protocol:

### **Automated Task Management**

- **Task Creation:** `agent task create "Task title"`
- **Task Status Tracking:** Database-backed task status management
- **Branch Management:** Automatic feature branch creation following naming conventions

### **Git Workflow Automation**

- **Branch Operations:** Automatic checkout, pull, and branch creation
- **Status Validation:** Ensures working directory is clean before operations
- **Naming Conventions:** Consistent `feature/g-xxxxxx-task-title` branch naming

### **Quality Assurance**

- **Pre-commit Validation:** Integration with `make quality` commands
- **Status Reporting:** Real-time task status and progress tracking
- **Configuration Management:** Centralized project configuration

### **Integration Points**

- **GitHub Issues:** Future integration for issue linking
- **CI/CD Pipelines:** Compatible with existing GitHub Actions workflows
- **Release Management:** Supports version tagging and release preparation

By following this protocol and using Dev Agent for automation, teams can achieve:

- ✅ Consistent development workflows
- ✅ Reduced manual errors
- ✅ Improved code quality
- ✅ Faster delivery cycles
- ✅ Better collaboration

---

_This protocol is implemented and enforced by Dev Agent v2.0. For technical details on the implementation, see the [Architecture Overview](../05-architecture.md)._
