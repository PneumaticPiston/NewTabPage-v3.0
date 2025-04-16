@echo off
setlocal enabledelayedexpansion
echo Starting file processing...
REM Create the compressed directory if it doesn't exist
if not exist ".\compressed" mkdir ".\compressed"
REM Create temporary directory for npm packages
if not exist ".\temp" mkdir ".\temp"
cd ".\temp"
REM Install required npm packages locally
echo Installing required npm packages locally...
call npm init -y >nul 2>&1
call npm install terser clean-css-cli --save >nul 2>&1
REM Return to original directory
cd ..
REM Set paths to node modules
set "TERSER=.\temp\node_modules\.bin\terser"
set "CLEANCSS=.\temp\node_modules\.bin\cleancss"
echo Processing JavaScript files...
for /r ".\main" %%F in (*.js) do (
    REM Get the relative path from main directory
    set "fullpath=%%F"
    set "relpath=!fullpath:%CD%\main\=!"
    
    REM Create the output directory structure
    set "outputdir=.\compressed\!relpath!"
    set "outputdir=!outputdir:%%~nxF=!"
    
    if not exist "!outputdir!" mkdir "!outputdir!" 2>nul
    
    REM Create the output file path
    set "outputfile=!outputdir!%%~nxF"
    
    echo Minifying: %%F
    echo Output: !outputfile!
    
    REM Call terser with proper quotes around paths
    call !TERSER! "%%F" --compress --mangle --output "!outputfile!"
    
    if !errorlevel! neq 0 (
        echo Failed to minify JS file with terser. Creating a fallback...
        copy "%%F" "!outputfile!" >nul
    )
)
echo Processing CSS files...
for /r ".\main" %%F in (*.css) do (
    REM Get the relative path from main directory
    set "fullpath=%%F"
    set "relpath=!fullpath:%CD%\main\=!"
    
    REM Create the output directory structure
    set "outputdir=.\compressed\!relpath!"
    set "outputdir=!outputdir:%%~nxF=!"
    
    if not exist "!outputdir!" mkdir "!outputdir!" 2>nul
    
    REM Create the output file path
    set "outputfile=!outputdir!%%~nxF"
    
    echo Minifying: %%F
    echo Output: !outputfile!
    
    REM Call cleancss with proper quotes around paths
    call !CLEANCSS! -o "!outputfile!" "%%F"
    
    if !errorlevel! neq 0 (
        echo Failed to minify CSS file with cleancss. Creating a fallback...
        copy "%%F" "!outputfile!" >nul
    )
)
REM Copy all non-JS/CSS files
echo Copying all non-JS/CSS files...
for /r ".\main" %%F in (*) do (
    set "ext=%%~xF"
    if /i not "!ext!"==".js" if /i not "!ext!"==".css" (
        REM Get the relative path from main directory
        set "fullpath=%%F"
        set "relpath=!fullpath:%CD%\main\=!"
        
        REM Create the output directory structure
        set "outputdir=.\compressed\!relpath!"
        set "outputdir=!outputdir:%%~nxF=!"
        
        if not exist "!outputdir!" mkdir "!outputdir!" 2>nul
        
        REM Copy the file with the same name
        set "outputfile=!outputdir!%%~nxF"
        
        echo Copying: %%F
        echo Output: !outputfile!
        
        copy "%%F" "!outputfile!" >nul
    )
)
echo Processing complete!
echo All files are available in the .\compressed\ directory.
REM Clean up temp directory if needed
REM rmdir /s /q ".\temp"
endlocal