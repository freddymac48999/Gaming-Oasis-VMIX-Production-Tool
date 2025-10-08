@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Change to this script's directory
cd /d "%~dp0"

echo === VMIX Control Panel ===
echo Project: %cd%

REM Check Node.js
where node >nul 2>&1
if errorlevel 1 (
  echo.
  echo ERROR: Node.js is not installed or not in PATH.
  echo Please install from https://nodejs.org and then re-run this file.
  pause
  exit /b 1
)

REM Install dependencies only if node_modules missing
if not exist node_modules (
  echo Installing dependencies...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo Failed to install dependencies.
    pause
    exit /b 1
  )
)

REM Start the local server in its own window
echo Starting VMIX Control Panel...
start "VMIX Control Panel Server" cmd /c "npm start"

REM Give the server a moment, then open the app
timeout /t 2 >nul
start "" "http://localhost:5173"

echo The VMIX Control Panel should now be open in your browser.
echo This window can be closed.
timeout /t 3 >nul
exit /b 0
