@echo off
setlocal enabledelayedexpansion

REM Install required tools if not already installed
call npm list -g uglify-js >nul 2>&1 || npm install -g uglify-js
call npm list -g clean-css-cli >nul 2>&1 || npm install -g clean-css-cli

REM Create compressed directory if it doesn't exist
if not exist "compressed" mkdir "compressed"

REM Process all .js files in main directory and subdirectories
for /r "main" %%f in (*.js) do (
    REM Get relative path from main directory
    set "filepath=%%f"
    set "relpath=!filepath:*main\=!"
    
    REM Create directory structure in compressed folder
    for %%d in ("compressed\!relpath!\.") do (
        if not exist "%%~dpd" mkdir "%%~dpd"
    )
    
    REM Minify JavaScript file
    echo Minifying JS: !relpath!
    call uglifyjs "%%f" -o "compressed\!relpath!" -c -m
)

REM Process all .css files in main directory and subdirectories
for /r "main" %%f in (*.css) do (
    REM Get relative path from main directory
    set "filepath=%%f"
    set "relpath=!filepath:*main\=!"
    
    REM Create directory structure in compressed folder
    for %%d in ("compressed\!relpath!\.") do (
        if not exist "%%~dpd" mkdir "%%~dpd"
    )
    
    REM Minify CSS file
    echo Minifying CSS: !relpath!
    call cleancss -o "compressed\!relpath!" "%%f"
)

echo.
echo Minification complete!
pause