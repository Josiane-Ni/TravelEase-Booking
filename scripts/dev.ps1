# scripts/dev.ps1 - Windows PowerShell dev runner for TravelEase
$rootDir = (Get-Item $PSScriptRoot).Parent.FullName
$laravelDir = Join-Path $rootDir "laravel source"
$frontendDir = Join-Path $rootDir "travelease-frontend"

Write-Host "Starting TravelEase development servers..." -ForegroundColor Cyan

# Start Laravel backend on 127.0.0.1:8000
$laravelProcess = Start-Process php -ArgumentList "artisan", "serve", "--host=127.0.0.1", "--port=8000" -WorkingDirectory $laravelDir -PassThru
Write-Host "Laravel API running at http://127.0.0.1:8000 (PID: $($laravelProcess.Id))" -ForegroundColor Green

# Start Laravel scheduler for flight hold expiration
$schedulerProcess = Start-Process php -ArgumentList "artisan", "schedule:work" -WorkingDirectory $laravelDir -PassThru
Write-Host "Hold expiry scheduler running (PID: $($schedulerProcess.Id))" -ForegroundColor Green

# Start React frontend
Write-Host "Starting React frontend at http://127.0.0.1:5175..." -ForegroundColor Cyan
Set-Location $frontendDir

try {
    npm run dev
} finally {
    Write-Host "Stopping background processes..." -ForegroundColor Yellow
    Stop-Process -Id $laravelProcess.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $schedulerProcess.Id -Force -ErrorAction SilentlyContinue
}
