@echo off
REM Open Friday - Run this file to start
echo.
echo ════════════════════════════════════
echo     Open Friday - AI Coder
echo ════════════════════════════════════
echo.

REM Try to find node
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo.
    echo Then run this again.
    echo.
    pause
    exit /b 1
)

echo Starting Open Friday...
echo.
node "%~dp0index.js"
pause