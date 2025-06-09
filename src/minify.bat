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

REM Extract version from manifest.json - specifically the "version" property
echo Extracting version from manifest.json...
set "version="
if exist ".\compressed\manifest.json" (
    for /f "tokens=2 delims=:," %%a in ('findstr /C:"\"version\":" ".\compressed\manifest.json"') do (
        set "version=%%~a"
        set "version=!version:"=!"
        set "version=!version: =!"
        goto :gotversion
    )
) else (
    echo Warning: manifest.json not found in compressed directory
    set "version=unknown"
)

:gotversion
echo Detected version: %version%

REM Create ZIP file with the version name in the compressed directory
echo Creating ZIP file: .\compressed\NTPv%version%.zip
powershell -Command "Add-Type -Assembly 'System.IO.Compression.FileSystem'; $zipFile = '.\compressed\NTPv%version%.zip'; if(Test-Path $zipFile){Remove-Item $zipFile}; $sourceDir = '.\compressed'; $tempDir = '.\temp_zip_contents'; if(Test-Path $tempDir){Remove-Item $tempDir -Recurse -Force}; New-Item -ItemType Directory -Path $tempDir | Out-Null; Get-ChildItem -Path $sourceDir -Exclude '*.zip' | Copy-Item -Destination $tempDir -Recurse; [System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipFile, [System.IO.Compression.CompressionLevel]::Optimal, $false); Remove-Item $tempDir -Recurse -Force;"

echo ZIP file creation complete!
REM Clean up temp directory if needed
REM rmdir /s /q ".\temp"

echo Removeing temporary files
cd .\compressed\
rmdir /q /s assets
rmdir /q /s newtab
rmdir /q /s settings
rmdir /q /s theme
rmdir /q /s welcome
rmdir /q /s widgets
del background.js
del manifest.json
pause