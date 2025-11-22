# Script para reiniciar el backend de Vitrinex
Write-Host "Reiniciando backend de Vitrinex..." -ForegroundColor Cyan

# Detener procesos de Node.js que estén corriendo en el puerto 3000
Write-Host "Deteniendo procesos anteriores..." -ForegroundColor Yellow
$port = 3000
$processId = (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue).OwningProcess
if ($processId) {
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "Proceso detenido (PID: $processId)" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "No hay procesos previos en el puerto $port" -ForegroundColor Gray
}

# Cambiar al directorio del backend
$backendPath = Join-Path $PSScriptRoot "backend"
Set-Location -Path $backendPath

# Iniciar el backend
Write-Host "Iniciando backend..." -ForegroundColor Cyan
Write-Host "Directorio: $PWD" -ForegroundColor Gray
Write-Host ""
Write-Host "Backend corriendo en http://localhost:3000" -ForegroundColor Green
Write-Host "Chatbot con IA REAL de OpenAI activado" -ForegroundColor Magenta
Write-Host ""
Write-Host "Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

npm run dev
