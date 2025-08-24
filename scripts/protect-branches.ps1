# Branch protection script for main and develop branches

Write-Host "Checking branch protection..." -ForegroundColor Cyan

# Check main branch
$mainBranch = git rev-parse --verify main 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Main branch: OK" -ForegroundColor Green
} else {
    Write-Host "Main branch: MISSING!" -ForegroundColor Red
    $mainError = $true
}

# Check develop branch
$developBranch = git rev-parse --verify develop 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Develop branch: OK" -ForegroundColor Green
} else {
    Write-Host "Develop branch: MISSING!" -ForegroundColor Red
    $developError = $true
}

# Result
if ($mainError -or $developError) {
    Write-Host "`nUse 'make restore-branches' to fix missing branches" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`nAll branches protected!" -ForegroundColor Green
}
