#!/usr/bin/env pwsh
<#
.SYNOPSIS
  One-command installer for Open Friday AI Coding Assistant
.DESCRIPTION
  Installs Open Friday globally and launches it
.EXAMPLE
  irm https://samkomedved319-dev.github.io/OpenFriday/install.ps1 | iex
#>

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$Version = "2.0.0"
$RepoUrl = "https://github.com/samkomedved319-dev/OpenFriday.git"
$InstallDir = "$env:USERPROFILE\OpenFriday"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🤖 Open Friday v$Version Installer        ║" -ForegroundColor Cyan
Write-Host "║     Your AI Coding Companion                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ─── Step 1: Check Node.js ───
Write-Host "[1/4] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js $nodeVersion detected" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js not found!" -ForegroundColor Red
    Write-Host "  Download from: https://nodejs.org" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  After installing Node.js, run this script again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# ─── Step 2: Install / Update ───
if (Test-Path "$InstallDir") {
    Write-Host "[2/4] Updating Open Friday..." -ForegroundColor Yellow
    Set-Location "$InstallDir"
    git pull 2>$null
    Write-Host "  ✓ Updated!" -ForegroundColor Green
} else {
    Write-Host "[2/4] Downloading Open Friday..." -ForegroundColor Yellow
    git clone "$RepoUrl" "$InstallDir" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ✗ Download failed. Trying alternative..." -ForegroundColor Red
        # Fallback: download ZIP
        $zipUrl = "https://github.com/samkomedved319-dev/OpenFriday/archive/main.zip"
        $zipPath = "$env:TEMP\openfriday.zip"
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
        Expand-Archive -Path $zipPath -DestinationPath "$env:TEMP\openfriday-temp" -Force
        Move-Item "$env:TEMP\openfriday-temp\OpenFriday-main\*" "$InstallDir" -Force
        Remove-Item "$env:TEMP\openfriday-temp" -Recurse -Force 2>$null
        Remove-Item $zipPath -Force 2>$null
        Write-Host "  ✓ Downloaded via ZIP" -ForegroundColor Green
    } else {
        Write-Host "  ✓ Downloaded!" -ForegroundColor Green
    }
}

Set-Location "$InstallDir"

# ─── Step 3: Install dependencies ───
Write-Host "[3/4] Installing global command..." -ForegroundColor Yellow
npm link --silent 2>$null
Write-Host "  ✓ Global command installed!" -ForegroundColor Green

# ─── Step 4: Launch ───
Write-Host "[4/4] Launching Open Friday..." -ForegroundColor Yellow
Write-Host ""

Start-Sleep -Seconds 1

# Clear session so login is required
$sessionFile = "$InstallDir\core\session.json"
if (Test-Path $sessionFile) { Remove-Item $sessionFile -Force }

openfriday