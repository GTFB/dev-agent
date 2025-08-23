# Version Management System

> **🚀 Quick version management for Dev Agent projects**

## Overview

Dev Agent uses a comprehensive version management system that automates version updates across all project files and integrates with GitHub for seamless release management.

## 🎯 Key Features

- **Automatic Version Bumping**: Semantic versioning with automatic file updates
- **Multi-file Synchronization**: Version updated in config, README, CHANGELOG, and database
- **Release Branch Management**: Automatic creation of release branches
- **GitHub Integration**: Automated release creation and tagging
- **CI/CD Ready**: GitHub Actions workflow for validation and deployment

## 🚀 Quick Start

### Show Current Version
```bash
# Using the script directly
bun run src/scripts/version-manager.ts info

# Using Makefile
make version-info
```

### Bump Version
```bash
# Patch version (0.1.0 -> 0.1.1)
bun run src/scripts/version-manager.ts bump patch
make version-patch

# Minor version (0.1.0 -> 0.2.0)
bun run src/scripts/version-manager.ts bump minor
make version-minor

# Major version (0.1.0 -> 1.0.0)
bun run src/scripts/version-manager.ts bump major
make version-major
```

### Prepare Release
```bash
# Complete release preparation workflow
make release-prepare

# Validate release readiness
make release-validate
```

## 📋 Version Types

### Semantic Versioning (SemVer)

Dev Agent follows [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html):

- **MAJOR.MINOR.PATCH** format (e.g., `1.2.3`)
- **MAJOR**: Breaking changes, incompatible API changes
- **MINOR**: New functionality, backward compatible
- **PATCH**: Bug fixes, backward compatible

### Version Bump Rules

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Breaking change | MAJOR | `1.2.3` → `2.0.0` |
| New feature | MINOR | `1.2.3` → `1.3.0` |
| Bug fix | PATCH | `1.2.3` → `1.2.4` |

## 🔄 Release Workflow

### 1. Development Phase
```bash
# Work on features in develop branch
git checkout develop
# ... make changes ...
git commit -m "feat: add new feature"
git push origin develop
```

### 2. Release Preparation
```bash
# Ensure you're on develop branch
git checkout develop
git pull origin develop

# Bump version and create release branch
make version-patch  # or minor/major
# This creates release/v0.1.1 branch
```

### 3. Review and Testing
```bash
# Review changes in release branch
git log --oneline -5

# Run validation
make release-validate

# Test the release
bun test
```

### 4. Create Pull Request
```bash
# Push release branch
git push origin release/v0.1.1

# Create PR from release/v0.1.1 to main
# GitHub Actions will validate the release
```

### 5. Merge and Release
```bash
# After PR approval and merge
# GitHub Actions automatically:
# - Creates GitHub release
# - Tags the release
# - Updates database version
```

## 📁 Files Updated

When bumping version, the following files are automatically updated:

### 1. Configuration Files
- **`config.json`**: Project configuration and current version
- **Database**: Version (if connected)

### 2. Documentation
- **`README.md`**: Version badge and references
- **`CHANGELOG.md`**: Release notes and history

### 3. Git
- **Release branch**: `release/vX.Y.Z`
- **Commit message**: `chore: prepare release vX.Y.Z`

## 🛠️ Manual Version Management

### Using Version Manager Script

```typescript
import { VersionManager } from './src/scripts/version-manager.js';

const versionManager = new VersionManager();

// Bump version
await versionManager.bumpVersion('patch');

// Show version info
await versionManager.showVersionInfo();
```

### Direct File Updates

If you need to update versions manually:

```bash
jq '.version = "0.1.1"' config.json > temp.json && mv temp.json config.json

# Update README badge
sed -i 's/version-0\.1\.0/version-0.1.1/g' README.md

# Update CHANGELOG
# Add new version entry manually
```

## 🔧 Configuration

### Version Manager Settings

The version manager reads configuration from:

- **`config.json`**: Project configuration and current version
- **Environment variables**: For database connections and API keys

### Customization

You can customize the version manager by modifying:

- **File paths**: Update constructor in `VersionManager` class
- **Version format**: Modify `bumpVersion` method
- **Release notes**: Customize `updateChangelog` method
- **Git workflow**: Adjust `createReleaseBranch` method

## 🚨 Troubleshooting

### Common Issues

#### Version Mismatch
```bash
# Check version consistency
make validate

# Verify all files have same version
grep -r "0.1.0" . --exclude-dir=node_modules --exclude-dir=.git
```

#### Git Branch Issues
```bash
# Ensure you're on develop branch
git branch --show-current

# If not on develop, switch
git checkout develop
git pull origin develop
```

#### File Permission Issues
```bash
# Check file permissions
ls -la config.json
ls -la README.md

# Fix permissions if needed
chmod 644 config.json
chmod 644 README.md
```

### Debug Mode

Enable debug logging:

```bash
# Set debug environment variable
DEBUG=true bun run src/scripts/version-manager.ts bump patch

# Or modify logger level in the script
```

## 🔗 Integration

### GitHub Actions

The release workflow is automatically triggered by:

- **Pull Request**: When PR targets `main` branch
- **Manual Dispatch**: Through GitHub Actions interface

### Database Integration

To enable database version updates:

1. **Connect to database** in `updateDatabaseVersion` method
2. **Update version table** with new version
3. **Handle migration scripts** if needed

### CI/CD Pipeline

Integrate with your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Bump Version
  run: |
    bun run src/scripts/version-manager.ts bump ${{ inputs.version_type }}
    
- name: Create Release
  run: |
    make release-prepare
```

## 📚 Best Practices

### 1. Version Naming
- Use semantic versioning consistently
- Avoid pre-release versions in production
- Document breaking changes clearly

### 2. Release Process
- Always test releases before merging
- Use conventional commit messages
- Review CHANGELOG before release

### 3. Branch Management
- Keep `develop` branch stable
- Use feature branches for development
- Merge features to `develop` regularly

### 4. Documentation
- Update README with new features
- Maintain comprehensive CHANGELOG
- Document breaking changes

## 🔮 Future Enhancements

Planned improvements:

- **Pre-release versions**: Support for alpha/beta releases
- **Version rollback**: Ability to revert version changes
- **Multi-package support**: Monorepo version management
- **Release templates**: Customizable release note templates
- **Version analytics**: Track version adoption and usage

## 📖 Additional Resources

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [GitHub Actions](https://docs.github.com/en/actions)
