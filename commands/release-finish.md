# Release Finalization Protocol

## Overview
The final steps to publish a tested and stabilized release branch to `main`.

## Steps
1.  **Finish Release**
   - Ensure you are on the `release/x.y.z` branch.
   - Merge the release branch into `main` (`--no-ff`).
   - Create a Git tag `vx.y.z` on `main`.
   - Merge the release branch back into `develop` (to backport hotfixes).
   - Push `main`, `develop`, and tags.

2.  **Cleanup**
   - Delete the release branch (local and remote).

## Checklist
- [ ] Branch merged into `main` and `develop`
- [ ] Git tag `vx.y.z` created and pushed
- [ ] Release branch has been deleted
- [ ] Release successfully completed