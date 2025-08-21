# Workspace Synchro

## Overview
Systematically synchronize the local workspace to prepare for a new task.

## Steps
1. **Synchronize `main`**
   - Switch to `main`
   - Pull latest changes
    - Resolve any conflicts

2. **Reset `develop`**
   - Switch to `develop`
   - Discard all local changes
   - Merge `main` into `develop`

3. **Verify State**
   - Push `develop` branch
   - Confirm clean workspace status
   - Announce readiness

## Checklist
- [ ] `main` branch synchronized
- [ ] Conflicts resolved
- [ ] `develop` branch reset and synchronized
- [ ] Workspace is clean
- [ ] Ready for work