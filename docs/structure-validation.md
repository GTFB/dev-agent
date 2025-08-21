# Structure Validation System

> **🔍 Automated validation and maintenance of project structure documentation**

## 🎯 Overview

The Structure Validation System automatically ensures that `docs/structure.md` accurately reflects the current project structure. It runs before each commit and automatically fixes common issues.

## 🚀 Quick Start

### Manual Validation

```bash
# Check structure without making changes
make structure-check

# Validate and auto-fix issues
make structure-fix

# Run all pre-commit checks
make pre-commit
```

### Automatic Validation (Pre-commit Hook)

The system automatically runs before each commit via Git hooks:

```bash
# Git hooks are automatically installed
git add .
git commit -m "Your commit message"
# Structure validation runs automatically
```

## 🔧 How It Works

### 1. Structure Scanning
- Scans the entire project directory
- Ignores `node_modules`, `.git`, and other non-project files
- Identifies all files and directories

### 2. Documentation Parsing
- Reads `docs/structure.md`
- Extracts documented file paths from code blocks and lists
- Maps files to their documented sections

### 3. Validation
- Compares actual structure with documented structure
- Identifies missing documentation
- Finds documented files that no longer exist
- Checks for structural issues

### 4. Auto-fixing
- Updates "Last Updated" date
- Adds missing important files to documentation
- Updates file counts in statistics
- Saves changes to `structure.md`

## 📋 Validation Rules

### Required Files
The following files must be documented:
- `.dev-agent.json` - Main configuration
- `package.json` - Dependencies
- `bun.lock` - Locked versions
- `tsconfig.json` - TypeScript config
- `Makefile` - Build automation
- `.gitignore` - Git ignore patterns

### Main Directories
These directories must exist:
- `src/` - Source code
- `tests/` - Test files
- `docs/` - Documentation
- `scripts/` - Utility scripts
- `.github/` - GitHub workflows

### File Documentation
- All important files should be documented
- File descriptions should be accurate
- Code blocks should contain valid paths

## 🛠️ Configuration

### Ignored Paths
The following paths are automatically ignored:
```typescript
const ignoredPaths = [
  "node_modules",
  ".git",
  "coverage",
  "build",
  "dist",
  "logs",
  "test-logs",
  "data"
];
```

### Important Hidden Files
These hidden files are considered important:
```typescript
const importantFiles = [
  ".dev-agent.json",
  ".gitignore",
  ".gitattributes",
  ".eslintrc",
  ".prettierrc",
  ".bunfig",
  ".env.example"
];
```

## 📊 Validation Report

### Sample Output
```
============================================================
📋 STRUCTURE VALIDATION REPORT
============================================================
✅ All structure checks passed!

🔧 Auto-fixed 3 issues:
  📅 Updated last updated date
  📄 Added .dev-agent.json to documentation
  📊 Updated file counts
============================================================
```

### Issue Types
- **📄 File not documented** - File exists but isn't in docs
- **❌ Documented file not found** - File in docs doesn't exist
- **📁 Main directory missing** - Required directory missing
- **📅 Documentation outdated** - Last updated > 30 days ago

## 🔄 Integration Points

### Makefile Commands
```makefile
# Structure validation
structure-check:    # Validate without changes
structure-fix:      # Validate and auto-fix
pre-commit:         # Run all checks
```

### CI/CD Integration
The system integrates with GitHub Actions:
- Runs during CI/CD pipeline
- Ensures documentation consistency
- Fails builds if validation fails

### Git Hooks
- **Pre-commit hook** - Runs before each commit
- **Cross-platform** - Supports both bash and PowerShell
- **Automatic** - No manual intervention required

## 🧪 Testing

### Run Tests
```bash
# Run structure validator tests
bun test tests/scripts/structure-validator.test.ts

# Run all tests
bun test
```

### Test Coverage
Tests cover:
- Structure scanning
- Documentation parsing
- Validation logic
- Auto-fixing capabilities
- File description generation

## 🚨 Troubleshooting

### Common Issues

#### Validation Fails
```bash
❌ Structure validation failed!
Please fix the issues in docs/structure.md before committing.
```

**Solutions:**
1. Run `make structure-fix` to auto-fix issues
2. Manually review and update `structure.md`
3. Check for missing or renamed files

#### Pre-commit Hook Fails
```bash
❌ Pre-commit checks failed!
```

**Solutions:**
1. Fix structure issues: `make structure-fix`
2. Fix language compliance: `bun run src/scripts/check-language.ts`
3. Fix compilation errors: `bun run build`
4. Fix failing tests: `bun test`

### Debug Mode
Enable verbose logging:
```typescript
// In structure-validator.ts
logger.setLevel('debug');
```

## 📈 Best Practices

### 1. Regular Validation
- Run `make structure-check` before major changes
- Use `make structure-fix` to maintain documentation
- Commit structure updates separately

### 2. Documentation Maintenance
- Update `structure.md` when adding new files
- Remove references to deleted files
- Keep file descriptions accurate

### 3. Integration
- Include structure validation in CI/CD
- Use pre-commit hooks for automatic checking
- Run validation in development workflow

## 🔮 Future Enhancements

### Planned Features
- **Visual diff** - Show what changed in structure
- **Smart categorization** - Auto-categorize new files
- **Template generation** - Generate structure templates
- **Cross-reference validation** - Check links and references

### Customization
- **Configurable rules** - Custom validation rules
- **Ignore patterns** - Custom ignore patterns
- **Section mapping** - Custom section organization

## 📚 Related Documentation

- [Project Structure](structure.md) - Complete structure documentation
- [CI/CD Pipeline](ci-cd.md) - CI/CD integration details
- [Development Guide](developer-guide.md) - Development workflow
- [Makefile Commands](quick-commands.md) - Available commands

---

**Last Updated**: 2025-01-20  
**Maintained By**: Dev Agent Architecture Team  
**Version**: 0.2.0
