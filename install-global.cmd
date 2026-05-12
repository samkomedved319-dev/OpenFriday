@echo off
setlocal EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "BIN_DIR=%USERPROFILE%\open-friday-bin"
set "TARGET=%BIN_DIR%\open-friday.cmd"

if not exist "%BIN_DIR%" mkdir "%BIN_DIR%"

(
  echo @echo off
  echo setlocal
  echo call "%SCRIPT_DIR%open-friday.cmd"
) > "%TARGET%"

echo Installed launcher: "%TARGET%"

echo %PATH% | find /I "%BIN_DIR%" >nul
if %errorlevel%==0 (
  echo PATH already contains "%BIN_DIR%".
  echo Open a new terminal and run: open-friday
  exit /b 0
)

set "NEW_PATH=%PATH%;%BIN_DIR%"
setx PATH "%NEW_PATH%" >nul

if %errorlevel% neq 0 (
  echo Failed to update PATH automatically.
  echo Add this folder to your user PATH manually:
  echo   %BIN_DIR%
  exit /b 1
)

echo PATH updated.
echo Open a NEW terminal and run: open-friday
