# ===================================================
# ServerUI — Windows PowerShell 1-Click Runner
# Run with: .\run.ps1
# ===================================================

$ErrorActionPreference = "Stop"

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "          ServerUI — Windows Runner               " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Ensure .env file
if (-not (Test-Path ".env")) {
    Write-Host "[INFO] Creating .env from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

# 2. Check encryption key
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "SERVERUI_CREDENTIAL_ENCRYPTION_KEY=[a-fA-F0-9]{64}") {
    Write-Host "[INFO] Generating 32-byte AES-256-GCM encryption key..." -ForegroundColor Yellow
    $bytes = New-Object byte[] 32
    (New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
    $hexKey = ($bytes | ForEach-Object { "{0:x2}" -f $_ }) -join ""
    
    $updatedContent = $envContent -replace "SERVERUI_CREDENTIAL_ENCRYPTION_KEY=.*", "SERVERUI_CREDENTIAL_ENCRYPTION_KEY=$hexKey"
    Set-Content -Path ".env" -Value $updatedContent
    Write-Host "[OK] Key configured in .env" -ForegroundColor Green
}

# 3. Check Docker
$dockerRunning = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) { $dockerRunning = $true }
} catch {
    $dockerRunning = $false
}

if ($dockerRunning) {
    Write-Host "[OK] Docker Desktop is running! Starting ServerUI..." -ForegroundColor Green
    docker compose -f deploy/docker/docker-compose.yml up -d --build
    
    Write-Host ""
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host "  ServerUI is running at: http://localhost:3000   " -ForegroundColor Green
    Write-Host "===================================================" -ForegroundColor Green
    Write-Host ""
    
    Start-Process "http://localhost:3000"
} else {
    Write-Host "[WARN] Docker Desktop is not running." -ForegroundColor Yellow
    Write-Host "[INFO] Starting local Web Desktop development server..." -ForegroundColor Cyan
    
    Push-Location "apps/web"
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Host "[INFO] Running npm install..." -ForegroundColor Yellow
            npm install
        }
        Write-Host "[OK] Opening http://localhost:3000 in your browser..." -ForegroundColor Green
        Start-Process "http://localhost:3000"
        npm run dev
    } finally {
        Pop-Location
    }
}
