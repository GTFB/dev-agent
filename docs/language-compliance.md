# Language Compliance System

Dev Agent includes an automated language compliance system that ensures all project files use English language.

## 🚀 How It Works

### Automatic Language Validation

The system automatically checks language compliance in multiple scenarios:

1. **Git Pre-commit Hook** - Automatically validates staged files before commit
2. **CLI Commands** - Manual validation of text and files
3. **Database Operations** - Validates content before saving to database
4. **File Operations** - Checks file content when working with documents

### Language Detection

- **English Content** ✅ - Passes validation
- **Russian Content** ❌ - Detected and flagged
- **Mixed Content**   ⚠️ - Partially flagged
- **Other Languages** ❌ - Detected and flagged

## 🔧 Setup

### 1. Git Pre-commit Hook (Automatic)

The pre-commit hook is automatically installed and will run on every commit:

```bash
# The hook runs automatically when you commit
git add .
git commit -m "Your commit message"
# Language check runs automatically here
```

### 2. Manual Validation Commands

```bash
# Check staged files (what will be committed)
bun run lang:check-staged

# Check specific text
bun run src/index.ts lang check "Your text here"

# Validate specific file
bun run src/index.ts lang validate-file path/to/file.md
```

## 📋 File Types Checked

The system automatically checks these file types:

- **Documentation**: `.md`, `.txt`
- **Source Code**: `.js`, `.ts`, `.jsx`, `.tsx`, `.vue`
- **Other Languages**: `.py`, `.java`, `.cpp`, `.c`, `.php`, `.rb`, `.go`, `.rs`, `.swift`, `.kt`, `.scala`

## 🚨 Severity Levels

### 🔴 HIGH Severity (>50% Russian text)
- Files with significant amounts of Russian content
- Should be completely translated before committing
- Commit will be blocked

### 🟡 MEDIUM Severity (20-50% Russian text)
- Files with moderate Russian content
- Should be reviewed and translated
- Commit will be blocked

### 🟢 LOW Severity (<20% Russian text)
- Files with minimal Russian content
- May contain occasional Russian words
- Commit will be blocked (configurable)

## 💡 Best Practices

### 1. Write in English
- Use English for all documentation
- Write comments in English
- Use English for user interfaces

### 2. Translate Existing Content
- Run language checks before committing
- Translate Russian content to English
- Use Dev Agent translation suggestions

### 3. Regular Validation
- Check language compliance regularly
- Use `bun run lang:check` to validate staged files
- Fix issues before they accumulate

## 🔄 Integration with Dev Agent

### Language Validation Middleware

The system integrates with Dev Agent's language validation middleware:

```typescript
// Automatic validation when saving to database
const result = await middleware.validateBeforeSave({
  entityType: "goal",
  fieldName: "title",
  content: "Your content here",
  autoTranslate: true,
  strictMode: true
});
```

### Translation Services

When configured, the system can automatically translate content:

```bash
# Setup LLM provider for translation
bun run src/index.ts lang setup-llm openai your-api-key

# Enable auto-translation
bun run src/index.ts lang set-default openai
```

## 🚨 Troubleshooting

### Commit Blocked by Language Check

If your commit is blocked:

1. **Check the report** - See which files have issues
2. **Translate content** - Convert Russian text to English
3. **Re-run validation** - Use `bun run lang:check-staged`
4. **Commit again** - Once all issues are resolved

### False Positives

If you get false positives:

1. **Check file content** - Verify the detection is correct
2. **Review ignored files** - Some files are automatically ignored
3. **Adjust thresholds** - Modify severity levels if needed

### Performance Issues

For large repositories:

1. **Use selective validation** - Check only changed files
2. **Optimize file patterns** - Adjust which files to check
3. **Batch processing** - Process files in smaller batches

## 📚 Examples

### Validating a File

```bash
# Check a specific file
bun run src/index.ts lang validate-file docs/README.md

# Output shows:
# - Detected language
# - Confidence level
# - Issues found
# - Translation suggestions
```

### Checking Text

```bash
# Check text content
bun run src/index.ts lang check "Create new function"

# Output shows:
# - Language detection
# - Validation results
# - Translation recommendations
```

### Pre-commit Validation

```bash
# Add files to staging
git add .

# Commit (triggers automatic validation)
git commit -m "Add new feature"

# If language issues found:
# - Commit is blocked
# - Detailed report is shown
# - Fix issues and try again
```

## 🔧 Configuration

### Customizing File Types

Edit `src/scripts/check-language.ts` to modify:

- File extensions to check
- Files to ignore
- Severity thresholds
- Validation rules

### Git Hook Customization

Modify `.git/hooks/pre-commit` to:

- Change validation script
- Add additional checks
- Modify error handling
- Customize output format

## 🎯 Summary

The language compliance system ensures:

✅ **Consistent Language** - All files use English  
✅ **Quality Control** - Automatic validation on commit  
✅ **Developer Experience** - Clear feedback and suggestions  
✅ **Integration** - Works with Dev Agent middleware  
✅ **Flexibility** - Configurable rules and thresholds  

This system helps maintain professional, international standards for your project documentation and code.
