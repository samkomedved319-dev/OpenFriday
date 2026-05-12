@echo off
REM Download and install Node.js LTS
echo.
echo ════════════════════════════════════════
echo   Node.js Auto-Installer
echo ════════════════════════════════════════
echo.

echo Downloading Node.js LTS...
powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\node-installer.msi'"

echo Installing...
echo Note: You may see a window popup - click Yes to install
msiexec /i "%TEMP%\node-installer.msi" /quiet /qn

echo.
echo Done! Please restart this window, then run start.bat
pause