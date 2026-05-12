# Open Friday - Simple launcher
# Just run: powershell -ExecutionPolicy Bypass -File start.ps1

$ErrorActionPreference = "Continue"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host @"
╔════════════════════════════════════════╗
║     Open Friday Bootstrapper      ║
╚════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# Check for node
$nodeFound = $false
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "Found Node.js: $nodeVersion" -ForegroundColor Green
        $nodeFound = $true
    }
} catch { }

if (-not $nodeFound) {
    Write-Host "Node.js not found. Attempting to locate..." -ForegroundColor Yellow
    
    # Check common locations
    $nodePaths = @(
        "$env:ProgramFiles\nodejs\node.exe",
        "$env:LOCALAPPDATA\nodejs\node.exe",
        "$env:APPDATA\npm\node.exe",
        "$env:ProgramFiles\node\node.exe"
    )
    
    foreach ($p in $nodePaths) {
        if (Test-Path $p) {
            $env:PATH = "$((Split-Path $p -Parent));$env:PATH"
            Write-Host "Found Node.js at: $p" -ForegroundColor Green
            $nodeFound = $true
            break
        }
    }
}

if ($nodeFound) {
    Write-Host "Starting Open Friday..." -ForegroundColor Green
    node "$scriptDir\index.js"
} else {
    Write-Host @"

ERROR: Node.js is not installed or not in PATH.
Please install Node.js from: https://nodejs.org

Run the installer, restart your computer, then try again.
"@ -ForegroundColor Red
    
    # Try to open browser
    try {
        Start-Process "https://nodejs.org"
    } catch { }
}