# CI/CD Pipeline

## Overview

Our project uses GitHub Actions to automate development, testing, and deployment processes. The pipeline consists of several workflow files, each responsible for specific tasks.

## Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

Main workflow that runs on every push and pull request to `main` and `develop` branches.

#### Jobs

##### Test
- **Runtime**: Ubuntu Latest with Node.js 18, 20 matrix and Bun latest
- **Tasks**:
  - Install dependencies
  - Run linter
  - Run tests with coverage
  - Generate coverage badge
  - Check coverage threshold (minimum 90%)
  - Build project
  - Validate project structure
  - Check for database files in root

##### Security
- **Dependencies**: `test`
- **Tasks**:
  - Security audit of dependencies
  - Check for secrets in code

##### Deploy Preview
- **Dependencies**: `test`, `security`
- **Condition**: Pull Request to `develop`
- **Tasks**:
  - Build preview version
  - Comment in PR with results

##### Update README
- **Dependencies**: `test`, `security`
- **Condition**: Push to `main`
- **Tasks**:
  - Generate current coverage badge
  - Update README.md
  - Auto-commit changes

### 2. Release Management (`.github/workflows/release.yml`)

Workflow for managing releases when merging PRs to `main`.

#### Jobs

##### Validate Release
- **Condition**: PR to `main`
- **Tasks**:
  - Validate project structure
  - Check version consistency
  - Run tests

##### Create Release
- **Condition**: Merge PR to `main`
- **Dependencies**: `validate-release`
- **Tasks**:
  - Create GitHub Release
  - Update version in database

##### Notify Team
- **Dependencies**: `create-release`
- **Tasks**:
  - Success/failure notifications

## Triggers

### Push Events
- `main` → Run CI/CD + Update README
- `develop` → Run CI/CD

### Pull Request Events
- To `main` → Run CI/CD + Validate Release
- To `develop` → Run CI/CD + Deploy Preview

### Manual Triggers
- Release workflow can be triggered manually with version type selection

## Quality Requirements

### Test Coverage
- **Functions**: minimum 90%
- **Lines**: minimum 90%

### Linting
- All warnings must be resolved
- Code must comply with project standards

### Security
- Dependency audit must pass
- No secrets should be in code

## Project Structure

Pipeline checks for required directories:
- `src/` - source code
- `config/` - configuration files
- `data/` - data and database

## Coverage Badge

Automatically generates SVG badge with current test coverage and saves it to `docs/assets/coverage.svg`. Badge is updated on every push to `main`.

## Monitoring

### GitHub Actions
- All workflows available in repository Actions section
- Detailed execution logs for each job
- Execution status on PR page

### Notifications
- Automatic comments in PRs
- Deployment status in GitHub
- Integration with external services (Slack, Discord)

## Local Testing

Before sending code, run locally:

```bash
# Linting
bun run lint

# Tests with coverage
bun test --coverage

# Generate badge
bun run test:coverage:badge

# Build
bun run build
```

## Troubleshooting

### Common Issues

1. **Coverage below 90%**
   - Add tests for missing functions
   - Ensure all code branches are covered

2. **Linter errors**
   - Run `bun run lint` locally
   - Fix all warnings

3. **Database files in root**
   - Ensure tests use in-memory databases
   - Check paths in configuration

4. **Build errors**
   - Check dependencies
   - Ensure TypeScript compiles without errors

### Logs

All execution logs are available in GitHub Actions. When issues arise:
1. Open failed workflow
2. Study failed job logs
3. Fix issue locally
4. Send fix

## Extension

Pipeline is easily extended by adding new jobs or steps:

1. Add new job to appropriate workflow
2. Define dependencies and execution conditions
3. Add necessary steps
4. Test locally
5. Send changes
