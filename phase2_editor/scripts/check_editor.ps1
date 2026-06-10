$ErrorActionPreference = "Stop"

$editorRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $editorRoot "..")
$pythonCandidates = @(
  (Join-Path $editorRoot ".venv\Scripts\python.exe"),
  (Join-Path $repoRoot ".venv\Scripts\python.exe")
)
$python = $pythonCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $python) {
  throw "Could not find project Python. Expected .venv under phase2_editor or the repository root."
}

Set-Location $editorRoot

Write-Host "Running editor backend smoke tests..."
& $python -m pytest -q tests
if ($LASTEXITCODE -ne 0) {
  throw "Editor tests failed with exit code $LASTEXITCODE"
}

Write-Host "Building editor frontend and static map app..."
npm run check
if ($LASTEXITCODE -ne 0) {
  throw "Editor frontend/map build failed with exit code $LASTEXITCODE"
}

Write-Host "Editor checks completed."
