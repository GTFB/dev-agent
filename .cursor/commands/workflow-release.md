# Release Preparation Protocol

## Overview
An interactive process for creating a release branch with automatic version detection and a publication decision gate.

## Steps
1.  **Preparation & Versioning**
   - **Analyze commits in `develop`**: Detect `feat:`, `fix:`, `BREAKING CHANGE:` to suggest a version type.
   - **Suggest version**: Automatically suggest a `major`, `minor`, or `patch` update.
   - **Request user confirmation**: "Suggested version: `x.y.z`. Confirm? (Yes/No/Enter custom)".
   - **Create `release/x.y.z` branch** based on the confirmed version.
   - **Update and commit project files:**
     - Bump the version in `package.json` and `config.sample.json`.
     - Generate a new version section in `CHANGELOG.md` with release notes.
     - Update version badges or references in `README.md`.

2.  **Publication Gate (Decision Gate)**
   - **Request publication decision**: "Publish this version directly to `main` (skipping QA)? (Yes/No)".
   - **If 'No' (Recommended) -> Handoff to QA**:
       - Push the `release/x.y.z` branch to the remote.
       - **Halt the protocol.** Announce that the branch has been handed off for testing.
   - **If 'Yes' -> Immediate Publication**:
       - Issue a warning about skipping the stabilization phase.
       - **Proceed to protocol:** **[Release Finalization Protocol](./release-finish.md)**

## Checklist
- [ ] Version suggested and confirmed by the user
- [ ] `release/x.y.z` branch created
- [ ] Publication decision has been made
- [ ] (If Yes) Proceeded to the release finalization protocol
- [ ] (If No) Branch handed off to QA, protocol paused