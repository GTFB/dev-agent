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

## Project Structure Validation

The CI/CD pipeline validates the following project structure:

### Required Files
- `config.json` - Main project configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `Makefile` - Build automation
- `.gitignore` - Git ignore patterns

### Required Directories
- `src/` - Source code
- `tests/` - Test files
- `docs/` - Documentation
- `scripts/` - Utility scripts
- `.github/` - GitHub workflows

### Forbidden Files
- Database files in root directory (should be in external storage)
- Old structure remnants (`config/`, `data/` directories)

## Configuration

### Environment Variables
- `GITHUB_TOKEN` - GitHub API access
- `NODE_ENV` - Environment (development, testing, production)

### Secrets Management
- GitHub secrets stored in repository settings
- Environment-specific configuration in `.env` files
- Database credentials in external storage

## Monitoring and Alerts

### Success Notifications
- GitHub status checks
- Coverage badge updates
- Release notifications

### Failure Alerts
- Test failure notifications
- Security audit failures
- Structure validation errors

## Troubleshooting

### Common Issues

#### Test Failures
```bash
# Run tests locally
make test

# Check coverage
make test-coverage

# Validate structure
make validate
```

#### Build Failures
```bash
# Clean and rebuild
make clean
make build

# Check dependencies
bun install
```

#### Structure Validation
```bash
# Run validation locally
make validate

# Check specific files
ls -la config.json
ls -la src/
```

### Debug Mode

Enable verbose logging:

```bash
# Set debug environment variable
DEBUG=true make ci-check

# Or modify workflow files for more verbose output
```

## Best Practices

### 1. Commit Messages
- Use conventional commit format
- Include issue references
- Be descriptive but concise

### 2. Branch Management
- Keep `develop` stable
- Use feature branches for development
- Test thoroughly before merging

### 3. Configuration
- Store secrets in GitHub secrets
- Use environment variables for configuration
- Keep sensitive data out of code

### 4. Testing
- Write comprehensive tests
- Maintain high coverage
- Test edge cases

## Future Enhancements

Planned improvements:

- **Automated dependency updates** - Dependabot integration
- **Performance testing** - Lighthouse CI integration
- **Security scanning** - CodeQL analysis
- **Deployment automation** - Auto-deploy to staging
- **Monitoring integration** - Application performance monitoring

---

**💡 Tip**: Use `make ci-check` to run all CI checks locally before pushing!
