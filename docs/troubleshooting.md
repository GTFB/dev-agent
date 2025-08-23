# Troubleshooting Guide

> **🔧 Solutions for common Dev Agent issues**

## Quick Diagnosis

```bash
# Check system health
make validate

# Run all checks
make ci-check

# Check configuration
make dev-config-list
```

## 🚨 Common Issues

### Configuration Problems

#### Error: "Configuration validation failed"

**Symptoms**: ZOD validation errors, missing fields, incorrect types

**Solutions**:
```bash
# 1. Validate configuration
make validate

# 2. Check config.json format
cat config.json | jq '.'

# 3. Copy fresh sample
cp config.sample.json config.json

# 4. Edit with your settings
nano config.json
```

**Common Fixes**:
- Ensure all required fields are present
- Check field types (strings vs numbers vs booleans)
- Verify storage paths exist or are writable

#### Error: "Storage paths not found"

**Symptoms**: Database initialization fails, storage errors

**Solutions**:
```bash
# 1. Initialize storage
make db-init

# 2. Check directory permissions
ls -la data/

# 3. Create directories manually
mkdir -p data/database data/config data/logs

# 4. Verify paths in config.json
grep -A 10 "storage" config.json
```

### Git and Branch Issues

#### Error: "Branch not found" or "Branch protection failed"

**Symptoms**: Missing main/develop branches, protection errors

**Solutions**:
```bash
# 1. Check current branch
git branch --show-current

# 2. Check remote branches
git branch -r

# 3. Restore missing branches
make restore-branches

# 4. Verify protection
make protect-branches
```

**Prevention**:
- Always run `make protect-branches` after setup
- Never delete main/develop branches
- Use feature branches for development

#### Error: "GitHub sync failed"

**Symptoms**: GitHub API errors, authentication failures

**Solutions**:
```bash
# 1. Check GitHub token
echo $GITHUB_TOKEN

# 2. Verify .env file
cat .env

# 3. Test GitHub connection
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/user

# 4. Check repository access
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/repos/owner/repo
```

**Common Issues**:
- Expired or invalid GitHub token
- Insufficient repository permissions
- Network connectivity problems

### Build and Test Issues

#### Error: "TypeScript compilation failed"

**Symptoms**: Build errors, type mismatches

**Solutions**:
```bash
# 1. Check TypeScript errors
make build

# 2. Run type checking
bun run tsc --noEmit

# 3. Fix import/export issues
# Check for missing .js extensions in imports

# 4. Clean and rebuild
make clean
make build
```

**Common Fixes**:
- Add `.js` extensions to imports
- Fix type mismatches
- Resolve circular dependencies

#### Error: "Tests failing"

**Symptoms**: Test suite failures, coverage issues

**Solutions**:
```bash
# 1. Run tests with verbose output
bun test --verbose

# 2. Check specific test file
bun test tests/specific-file.test.ts

# 3. Run with coverage
make test-coverage

# 4. Check test database
ls -la *.db
```

**Common Issues**:
- Database file conflicts
- Environment variable issues
- Test isolation problems

### Database Issues

#### Error: "Database connection failed"

**Symptoms**: SQLite errors, database not found

**Solutions**:
```bash
# 1. Check database path
grep "database" config.json

# 2. Verify file exists
ls -la /path/to/database.db

# 3. Check permissions
ls -la /path/to/database/

# 4. Reinitialize database
make db-init
```

**Common Fixes**:
- Ensure database directory exists
- Check file permissions
- Use absolute paths for external storage

#### Error: "Schema migration failed"

**Symptoms**: Database schema errors, table not found

**Solutions**:
```bash
# 1. Check current schema
bun run src/scripts/check-schema.ts

# 2. Reset database (WARNING: loses data)
rm *.db
make db-init

# 3. Check migration files
ls -la src/core/schema.ts
```

### Environment Issues

#### Error: "Environment variables not found"

**Symptoms**: Missing configuration, undefined values

**Solutions**:
```bash
# 1. Check .env file
cat .env

# 2. Verify environment loading
echo $GITHUB_TOKEN
echo $OPENAI_API_KEY

# 3. Create .env if missing
make env-setup

# 4. Restart shell/terminal
```

**Common Issues**:
- Missing .env file
- Incorrect variable names
- Shell not reloading environment

## 🔍 Debug Mode

Enable verbose logging for troubleshooting:

```bash
# Set debug environment variable
export DEBUG=true

# Run commands with debug output
DEBUG=true make validate
DEBUG=true bun test
DEBUG=true make build
```

## 📊 System Health Check

Run comprehensive system check:

```bash
# Full system validation
make ci-check

# Individual checks
make test
make build
make validate

# Configuration check
make dev-config-list
```

## 🆘 Getting More Help

### Check Logs

```bash
# Application logs
tail -f logs/dev-agent.log

# Test logs
bun test --verbose 2>&1 | tee test.log

# Build logs
make build 2>&1 | tee build.log
```

### Documentation

- **[Quick Start](quick-start.md)** - Basic setup guide
- **[Developer Guide](developer-guide.md)** - Detailed development setup
- **[Architecture](architecture.md)** - System design overview
- **[API Documentation](api/)** - Code reference

### External Resources

- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and share solutions
- **TypeScript Docs**: Language and compiler reference
- **Bun Docs**: Runtime and package manager reference

## 🚀 Prevention Tips

### Regular Maintenance

```bash
# Daily
make validate

# Before commits
make ci-check

# Weekly
make test-coverage
make clean
```

### Best Practices

1. **Always validate** before committing
2. **Use feature branches** for development
3. **Test locally** before pushing
4. **Keep dependencies updated**
5. **Monitor CI/CD pipeline**

---

**💡 Tip**: Most issues can be resolved by running `make validate` and `make ci-check`!
