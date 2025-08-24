# Documentation Management Protocol

## Overview
Maintain accurate, concise, and interconnected documentation, where TSDOC is the single source of truth for the API, and conceptual documents describe workflows.

## Steps
1.  **In-Code Documentation (TSDoc)**
   - **Rule:** All public API (classes, methods, types) **MUST** be documented using TSDoc syntax.
   - Comments should explain the **"what" and "why,"** not the "how."

2.  **Generate API Reference**
   - After making changes to TSDoc, run the command to automatically generate the HTML documentation.
   - **Command:** `make docs-generate`
   - The generated documentation is placed in `docs/api/` and is never edited manually.

3.  **Update Conceptual Documents**
   - Determine if the changes affect any workflows (protocols).
   - If so, update the relevant `.md` file (e.g., `workflow-feature.md`).
   - **Key Rule:** **Link** to the generated API reference (`/docs/api/`); **do not duplicate** its content.

4.  **Verify Integrity and Cross-Linking**
   - Ensure the new or modified document is linked from the main documentation `README.md`.
   - Check all new links to ensure they are not broken.
   - Remove any information that is now redundant with the generated API reference.

## Checklist
- [ ] TSDoc has been written for all new/changed public API
- [ ] API reference has been generated (`make docs-generate`)
- [ ] Conceptual documents are updated (without duplicating information)
- [ ] Cross-links have been added and verified
- [ ] There is no redundancy or "fluff"