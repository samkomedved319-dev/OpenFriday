@echo off
echo.
echo ========================================
echo   Installing Open Friday CLI globally
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Linking package...
call npm link

if %errorlevel% neq 0 (
    echo.
    echo ERROR: npm link failed
    echo Make sure Node.js is installed
    pause
    exit /b 1
)

echo.
echo [2/2] Testing command...
openfriday --version

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Command not found
    echo Try restarting your terminal
    pause
    exit /b 1
)

echo.
echo ========================================
echo   ✓ Open Friday installed!
echo.
echo   Usage: openfriday
echo.
echo   If command not found, restart terminal
echo   or add to PATH: %APPDATA%\npm
echo ========================================
echo.
pause