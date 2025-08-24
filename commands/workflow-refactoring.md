# Code Refactoring Protocol

## Overview
Systematically improve existing code with a focus on safety through testing and preservation of current functionality.

## Steps
1.  **Preparation & Analysis**
   - **Start task:** Automatically create a `refactor/g-XXXXXX-description` branch and update the task's status to `in_progress`.

2.  **Iterative Refactoring**
   - Before starting the task, propose an algorithm of how you are going to solve it.
   - After plan approval, break it down into a technical to-do checklist.
   - **Make one atomic change:** Apply a single, small, isolated refactoring (e.g., rename variable, extract method).
   - **Run tests:** After *every* change, run tests to ensure no behavior was broken.
   - **Commit the change:** Create a commit with the `refactor:` prefix. Repeat this cycle until the goal is achieved.

3.  **Finalize & Review**
   - Sync the branch with `develop` (`rebase`).
   - Push the branch to the remote repository.
   - Create a Pull Request to `develop`, pass CI and code review.
   - Merge the branch.

4.  **Handoff to Testing**
   - After the merge, update the task status in the DB to `done`.
   - **Delete the local and remote `refactor` branch.**
   - Transfer control to the next protocol.
   - **See Protocol:** **[Code Quality Assurance Protocol](./run-all-tests-and-fix-failures.md)**

## Checklist
- [ ] Refactoring task created
- [ ] Test coverage verified and sufficient
- [ ] `refactor` branch created, task is `in_progress`
- [ ] Iterative refactoring is complete
- [ ] Branch merged into `develop`
- [ ] Task status updated to `done`
- [ ] Task branch has been deleted
- [ ] Handoff to QA protocol is complete