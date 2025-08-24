param(
    [Parameter(Mandatory=$false)]
    [string]$StoragePath
)

Write-Host "Dev Agent Project Initialization" -ForegroundColor Green
Write-Host ""

# Get storage path from user if not provided
if (-not $StoragePath) {
    $StoragePath = Read-Host "Enter path to storage folder (where .env and database will be created/found)"
}

# Check if storage directory exists
if (-not (Test-Path $StoragePath)) {
    Write-Host "Creating storage directory: $StoragePath" -ForegroundColor Yellow
    try {
        New-Item -ItemType Directory -Path $StoragePath -Force | Out-Null
    }
    catch {
        Write-Host "Failed to create storage directory: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Check for existing .env and database
$envPath = Join-Path $StoragePath ".env"
$dbPath = Join-Path $StoragePath "dev-agent.db"
$projectPath = Get-Location

Write-Host "Storage path: $StoragePath" -ForegroundColor Cyan
Write-Host "Project path: $projectPath" -ForegroundColor Cyan

# Check if .env already exists
if (Test-Path $envPath) {
    Write-Host "Found existing .env file: $envPath" -ForegroundColor Green
} else {
    Write-Host "Creating .env file: $envPath" -ForegroundColor Yellow
    $envContent = @"
# Dev Agent Environment Configuration
# Database
DATABASE_PATH=$dbPath

# Logging
LOG_LEVEL=info

# Project Configuration
PROJECT_PATH=$projectPath

# GitHub (optional)
GITHUB_TOKEN=
GITHUB_OWNER=
GITHUB_REPO=

# LLM Configuration (optional)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
"@

    try {
        Set-Content -Path $envPath -Value $envContent -Encoding UTF8
        Write-Host "Created .env file: $envPath" -ForegroundColor Green
    }
    catch {
        Write-Host "Failed to create .env file: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Check if database already exists
if (Test-Path $dbPath) {
    Write-Host "Found existing database: $dbPath" -ForegroundColor Green
} else {
    Write-Host "Database will be created at: $dbPath" -ForegroundColor Yellow
}

# Create config.json in root
$config = @{
    name = "dev-agent-project"
    version = "1.0.0"
    description = "Dev Agent project configuration"
    github = @{
        owner = "your-org"
        repo = "your-project"
    }
    branches = @{
        main = "main"
        develop = "develop"
        feature_prefix = "feature"
        release_prefix = "release"
    }
    goals = @{
        default_status = "todo"
        id_pattern = "^g-[a-z0-9]{6}$"
    }
    workflow = @{
        auto_sync = $true
        sync_interval = 300
    }
    validation = @{
        strict_language = $true
        auto_translate = $false
    }
    storage = @{
        database = @{
            path = $dbPath
        }
    }
    last_updated = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

$configJsonPath = Join-Path $projectPath "config.json"

try {
    $config | ConvertTo-Json -Depth 10 | Set-Content -Path $configJsonPath -Encoding UTF8
    Write-Host "Created config.json: $configJsonPath" -ForegroundColor Green
}
catch {
    Write-Host "Failed to create config.json: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Project initialization completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Project location: $projectPath" -ForegroundColor Cyan
Write-Host "Storage path: $StoragePath" -ForegroundColor Cyan
Write-Host "Database: $dbPath" -ForegroundColor Cyan
Write-Host "Environment: $envPath" -ForegroundColor Cyan
Write-Host "Configuration: $configJsonPath" -ForegroundColor Cyan

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review and customize config.json if needed" -ForegroundColor White
Write-Host "2. Set up your GitHub credentials in .env file" -ForegroundColor White
Write-Host "3. Database will be created automatically when needed" -ForegroundColor White
Write-Host "4. Start using Dev Agent with your chosen protocol" -ForegroundColor White

