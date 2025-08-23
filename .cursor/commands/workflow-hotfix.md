# Hotfix Protocol

## Overview
A rapid fix for a critical bug in production, followed by integration into `main` and `develop`.

## Steps
1.  **Initialize Hotfix**
   - **Create a `hotfix/g-XXXXXX` branch from `main`**.
   - Create a task in the DB for tracking.

2.  **Fix & Versioning**
   - Before starting the task, propose an algorithm of how you are going to solve it.
   - After plan approval, break it down into a technical to-do checklist.
   - Implement the code fix.
   - **Write a test that reproduces and fixes the bug.**
   - Run the full quality gate (`make quality`).
   - **Increment the patch version** in `package.json`, `config.sample.json`, and update `CHANGELOG.md`.

3.  **Create Pull Request**
   - Push the hotfix branch to the remote repository.
   - Create a Pull Request **targeting the `main` branch**.
   - Pass CI checks and an expedited code review.

4.  **Integration**
   - After the PR is merged into `main`, **immediately merge `main` into `develop`** to backport the fix.
   - Delete the hotfix branch.

## Checklist
- [ ] `hotfix` branch created from `main`
- [ ] Bug is fixed and covered by a test
- [ ] Quality checks (`make quality`) have passed
- [ ] PR has been merged into `main`
- [ ] Changes have been integrated into `develop`
- [ ] Hotfix branch has been deleted