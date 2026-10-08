@echo off
setlocal
cd /d "%~dp0"
title Business de Sidi - Demarrage

if not exist package.json (
    echo Dossier du projet invalide.
    pause
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo Node.js est introuvable. Installez Node.js puis recommencez.
    pause
    exit /b 1
)

if not exist node_modules (
    echo Installation des dependances...
    call npm install
    if errorlevel 1 (
        echo Echec de l'installation des dependances.
        pause
        exit /b 1
    )
)

echo Demarrage du bot sur le port 3102...
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1"
if errorlevel 1 (
    echo Le demarrage a echoue. Consultez server.log et server-error.log.
    pause
    exit /b 1
)
exit /b 0
