# Install Node.js automatically
# Run: powershell -ExecutionPolicy Bypass -File install-node.ps1

$ErrorActionPreference = "Stop"

Write-Host @"
╔════════════════════════════════════════╗
║     Node.js Installer       ║
╚════════════════════════════════════════╝
"@ -ForegroundColor Green

# Check if winget is available
$winget = Get-Command winget -ErrorAction SilentlyContinue
if ($winget) {
    Write-Host "Using Windows Package Manager..." -ForegroundColor Cyan
    winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
    Write-Host "Node.js installed!" -ForegroundColor Green
    exit 0
}

# Try direct download
Write-Host "Downloading Node.js LTS..." -ForegroundColor Cyan
$url = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
$installer = "$env:TEMP\node-installer.msi"

try {
    Invoke-WebRequest -Uri $url -OutFile $installer -UseBasicParsing
    Write-Host "Running installer..." -ForegroundColor Yellow
    Start-Process msiexec.exe -ArgumentList "/i `"$installer`" /quiet /qn" -Wait
    Write-Host "Node.js installed!" -ForegroundColor Green
} catch {
    Write-Host "Failed auto-install. Please download manually:" -ForegroundColor Red
    Write-Host "https://nodejs.org" -ForegroundColor Yellow
    Start-Process "https://nodejs.org"
}