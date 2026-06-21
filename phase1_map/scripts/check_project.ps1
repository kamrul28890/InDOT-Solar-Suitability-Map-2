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

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [scriptblock]$Command
  )
  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed with exit code $LASTEXITCODE."
  }
}

Write-Host "Exporting app-ready data..."
Invoke-Checked { & $python scripts\export_app_data.py }

Write-Host "Running Python tests..."
Invoke-Checked { & $python -m pytest -q }

Write-Host "Running JavaScript tests..."
Invoke-Checked { npm test }

Write-Host "Building frontend..."
Invoke-Checked { npm run build }

Write-Host "Project checks completed."
