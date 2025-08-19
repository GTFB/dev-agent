# Backups Directory

The `backups/` directory is used to store database backups and other important project data.

## Purpose

This directory serves as a safe location for:
- Database backups before major schema changes
- Configuration snapshots
- Project state archives
- Recovery points

## Usage

### Automatic Backups

The system automatically creates backups:
- Before running database migrations
- Before major configuration changes
- When requested via CLI commands

### Manual Backups

You can create manual backups using:

```bash
# Create database backup
bun run src/index.ts db backup

# Create configuration backup
bun run src/index.ts config backup
```

### Backup Contents

Each backup typically contains:
- Database file snapshot
- Configuration export
- Timestamp and metadata
- Change log summary

## Best Practices

1. **Regular Backups**: Create backups before major changes
2. **Version Control**: Keep backup files organized by date/version
3. **Storage**: Consider external storage for critical backups
4. **Testing**: Verify backup restoration periodically

## File Naming Convention

Backups follow this naming pattern:
```
dev-agent-backup-YYYY-MM-DD-HHMMSS.db
config-backup-YYYY-MM-DD-HHMMSS.json
```

## Recovery

To restore from a backup:

```bash
# Restore database
bun run src/index.ts db restore <backup-file>

# Restore configuration
bun run src/index.ts config restore <backup-file>
```

## Configuration

Backup settings can be configured via:
```bash
bun run config:set storage.backupDir ./custom/backups
bun run config:set storage.backupRetention 30
```

The backup directory path is configurable in the database configuration.
