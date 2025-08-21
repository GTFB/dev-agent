# Feature Development Protocol

## Overview
Systematically develop new functionality, from selecting a task in the database to handing off for testing.

## Steps
1. **Determine Task for Work**
   - **Start a new task:** Automatically create a `feature/g-XXXXXX-description` branch, update the selected `todo` task's status to `in_progress`, **and change its milestone on GitHub to "In Progress"**.

2.  **Implement & Document**
   - Before starting the task, propose an algorithm of how you are going to solve it.
   - After plan approval, break it down into a technical to-do checklist.
   - Write code and TSDoc documentation within the current working branch.
   - Regularly run quality checks (`make quality`).
   - **Log result in DB:** After development is complete, add a brief summary of the work done to the corresponding field of the task in the database.

3.  **Finalize & Review**
   - Sync the branch with `develop` (`rebase`).
   - Push the branch to the remote repository.

4.  **Handoff to Testing**
   - After the merge, update the task status in the DB to `done`.
   - **Delete the local and remote `feature` branch.**
   - Transfer control to the next protocol.
   - **See Protocol:** **[Run All Tests and Fix Failures](./run-all-tests-and-fix-failures.md)**

## Checklist
- [ ] Task for work identified (`in_progress` or new `todo`)
- [ ] `feature` branch is current or newly created
- [ ] Implementation is complete, result logged in DB
- [ ] Branch merged into `develop`
- [ ] Task status updated to `done`
- [ ] Task branch has been deleted
- [ ] Handoff to testing protocol is complete