# Initialization Protocol (Start)

## Overview
An interactive startup and readiness check for the Architect, beginning with environment verification and the selection of the primary protocol.

## Steps
1.  **Environment Verification (Pre-flight Check)**
   - Read the external storage path from the `config.json` file (key `storage`). If the file is missing, run to **[create it](../../scripts/project-init.ps1)**.
   - Verify that the directory at this path exists.
   - Verify that the `.env` file and the database file (`.dev-agent.db`) exist within it.
   - **On failure:** Abort execution and report the specific issue (e.g., "Storage directory not found" or ".env file is missing").
   - **On success:** Print the following message to the chat: **"Connection to the database and environment established."**

2.  **Request Initial Protocol**
   - **Ask the user:** "Which protocol should be executed first: `Workspace Synchronization` or `goals-enforcer`?".
   - Await the user's choice to proceed.

3.  **Activate Core Directives**
   - **Language:** Code, comments, and documentation are strictly in English. Chat communication is in Russian.
   - **Stack:** Development is done exclusively in TypeScript for the Bun runtime.
   - **Style:** All communication and documentation must be maximally concise, with no redundancy.
   - **File System:** Upon any file addition or deletion, this change must be immediately reflected in the **[Structure](../../docs/structure.md)** file.
   - **Tooling:** All terminal operations are performed only through **[Makefile](../../Makefile)**.
   - Do not create new files or folders, and do not delete files or folders without user consent.
   - We are using PowerShell for Windows, so please do not use &&. Instead, use a semicolon (;) for sequential commands and follow other PowerShell syntax rules to ensure correct execution.

## Workflow Protocols
- **[Workspace Synchronization](./workspace-synchronization.md)** - To synchronize your local workspace before starting work.
- **[Goals Enforcer](./goals-enforcer.md)** - To analyze a new task directive and begin a development workflow.

## Checklist
- [ ] Environment verification passed successfully
- [ ] Initial protocol choice has been requested
- [ ] All core directives are active
- [ ] Ready to execute the chosen protocol