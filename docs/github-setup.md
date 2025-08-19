# GitHub Integration Setup

This document explains how to set up GitHub integration for Dev Agent to sync issues and manage tasks.

## Prerequisites

1. **GitHub Personal Access Token** with the following permissions:
   - `repo` - Full control of private repositories
   - `issues` - Read and write access to issues
   - `workflow` - Update GitHub Action workflows

## Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Dev Agent Integration")
4. Select the required scopes:
   - `repo` (Full control of private repositories)
   - `issues` (Read and write access to issues)
   - `workflow` (Update GitHub Action workflows)
5. Click "Generate token"
6. **Copy the token immediately** - you won't be able to see it again!

### 2. Configure Dev Agent

#### Option A: Using CLI (Recommended)

```bash
# Set GitHub configuration
bun run src/index.ts config github -o GTFB -r dev-agent -t YOUR_TOKEN_HERE

# Or set individually
bun run src/index.ts config set github.owner GTFB
bun run src/index.ts config set github.repo dev-agent
```

#### Option B: Using Configuration File

1. Copy `.github-config.example.json` to `.github-config.json`
2. Edit `.github-config.json` and replace:
   - `your-organization-or-username` with `GTFB`
   - `your-repository-name` with `dev-agent`
   - `ghp_your_github_personal_access_token_here` with your actual token
3. Save the file

### 3. Test Integration

```bash
# Test GitHub sync
bun run src/index.ts sync

# List goals (should show synced issues)
bun run src/index.ts goal list
```

## Security Notes

- **Never commit** `.github-config.json` to version control
- The file is already added to `.gitignore`
- Tokens are stored in environment variables during runtime
- Rotate tokens regularly for security

## Troubleshooting

### Common Issues

1. **"GitHub token not provided"**
   - Ensure token is set via CLI or config file
   - Check token permissions

2. **"Repository not found"**
   - Verify owner and repository names
   - Ensure token has access to the repository

3. **"Authentication failed"**
   - Token may be expired or invalid
   - Generate a new token

### Verification

```bash
# Check current configuration
bun run src/index.ts config list

# Check GitHub configuration specifically
bun run src/index.ts config github
```

## Integration Features

Once configured, Dev Agent will:

- **Sync Issues**: Automatically create local goals from GitHub issues
- **Status Updates**: Keep goal status in sync with issue state
- **Milestone Management**: Track issue milestones and releases
- **Branch Integration**: Link goals to feature branches

## Next Steps

After successful GitHub setup:

1. **Create Issues**: Add issues to your GitHub repository
2. **Sync**: Run `bun run src/index.ts sync` to import issues
3. **Work**: Use `bun run src/index.ts goal start <goal-id>` to begin work
4. **Update**: Status changes are automatically synced back to GitHub
