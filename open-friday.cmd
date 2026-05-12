@echo off
setlocal

set "SCRIPT_DIR=%~dp0"

where node >nul 2>nul
if %errorlevel%==0 (
  node "%SCRIPT_DIR%index.js"
  exit /b %errorlevel%
)

set "CURSOR_NODE=%LocalAppData%\Programs\cursor\resources\app\resources\helpers\node.exe"
if exist "%CURSOR_NODE%" (
  "%CURSOR_NODE%" "%SCRIPT_DIR%index.js"
  exit /b %errorlevel%
)

echo Could not find Node.js.
echo Install Node from https://nodejs.org/ or add node.exe to PATH.
exit /b 1
