@echo off
echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo npm install failed. Please check for errors.
    pause
    exit /b %errorlevel%
)

echo Starting development server...
call npm run dev
pause
