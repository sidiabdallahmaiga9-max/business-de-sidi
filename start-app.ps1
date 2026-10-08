$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$url = 'http://localhost:3102/auth.html'
$ok = $false

for ($i = 0; $i -lt 90; $i++) {
    try {
        Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 | Out-Null
        $ok = $true
        break
    }
    catch {
        Start-Sleep -Seconds 1
    }
}

if ($ok) {
    try {
        Start-Process $url
    }
    catch {
        Write-Host "Le serveur est pret. Ouvrez manuellement: $url" -ForegroundColor Yellow
    }
}
else {
    Write-Host "Le serveur n'a pas demarre a temps. Ouvrez manuellement: $url" -ForegroundColor Yellow
}
