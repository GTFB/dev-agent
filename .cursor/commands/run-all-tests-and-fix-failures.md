# Run All Tests and Fix Failures

## Overview
Execute the full suite of quality checks: static analysis (linting), testing, and coverage analysis. Systematically fix all identified errors, warnings, and failures to prepare the codebase for code review.

## Steps
1. **Static Analysis (Linting)**
   - Run the linter across the entire project.
   - **Fix all linter errors.**
   - **Fix all linter warnings.**

2. **Testing and Coverage**
   - Run the command to execute tests and generate a coverage report: `make test-coverage`.
   - **Analyze the coverage report:** Ensure total coverage by **unit and integration tests exceeds 90%**.
   - **Analyze test failures:** Identify and fix all errors reported by the testing system.
   - Fix one issue at a time, rerunning checks after each fix.

3. **Prioritize fixes:**
   - Linter errors.
   - Test failures.
   - Add missing tests to achieve >90% coverage.
   - Linter warnings.

4. **Finalization and Pull Request**
   - **Request Confirmation:** After all checks pass successfully, ask the question: "All quality checks have passed. Create a Pull Request now?"
   - **If 'Yes':** Proceed to the next step.
     - **See Protocol:** **[Pull Request Creation Protocol](./create-pr.md)**
   - **If 'No':** Thank the user for their work and conclude the current protocol.

## Checklist
- [ ] All linter errors are fixed
- [ ] All linter warnings are fixed
- [ ] Test coverage is > 90%
- [ ] All tests pass successfully
- [ ] The `make test-coverage` command completes without errors
- [ ] Process concluded (PR created or deferred)