$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$pythonCandidates = @(
  (Join-Path $root ".venv\Scripts\python.exe"),
  (Join-Path $root "..\.venv\Scripts\python.exe")
)
$python = $pythonCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $python) {
  throw "Could not find project Python. Expected .venv under phase1_map or the repository root."
}

Set-Location $root

Write-Host "Exporting app-ready data..."
& $python scripts\export_app_data.py

Write-Host "Running Python tests..."
& $python -m pytest -q

Write-Host "Building frontend..."
npm run build

Write-Host "Project checks completed."
