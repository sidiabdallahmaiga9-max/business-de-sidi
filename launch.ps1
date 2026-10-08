$ErrorActionPreference = 'Stop'

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

$port = 3102
$url = "http://localhost:$port/auth.html"
$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
    Write-Host 'Node.js est introuvable. Installez Node.js puis recommencez.' -ForegroundColor Red
    exit 1
}

if (-not (Test-Path (Join-Path $projectPath 'node_modules\express'))) {
    Write-Host 'Les dependances ne sont pas installees. Lancez npm install.' -ForegroundColor Red
    exit 1
}

$conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($conns) {
    $processIds = $conns | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($processId in $processIds) {
        if ($processId -and $processId -ne $PID) {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

$logPath = Join-Path $projectPath 'server.log'
$errorLogPath = Join-Path $projectPath 'server-error.log'
$checkUrl = "http://127.0.0.1:$port/auth.html"
$env:PORT = "$port"
Remove-Item $errorLogPath -Force -ErrorAction SilentlyContinue
$serverProcess = Start-Process -FilePath $nodeCommand.Source -ArgumentList 'server.js' -WorkingDirectory $projectPath -WindowStyle Hidden -RedirectStandardOutput $logPath -RedirectStandardError $errorLogPath -PassThru
$lastError = ''

for ($i = 0; $i -lt 45; $i++) {
    try {
        Invoke-WebRequest -UseBasicParsing -Uri $checkUrl -TimeoutSec 3 | Out-Null
        Start-Process $url
        Write-Host "Ouverture: $url"
        exit 0
    }
    catch {
        $lastError = $_.Exception.Message
        if ($serverProcess.HasExited) {
            break
        }
        Start-Sleep -Seconds 1
    }
}

Write-Host "Le serveur n'a pas demarre sur le port $port. Consultez server.log et server-error.log." -ForegroundColor Red
if ($lastError) {
    Write-Host "Detail: $lastError" -ForegroundColor Yellow
}
if (Test-Path $errorLogPath) {
    Get-Content $errorLogPath -Tail 20
}
exit 1
