$ErrorActionPreference = "Stop"

# Prefer an editor-local environment, then use the repository environment from
# the documented workspace setup.
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

# npm run check is the canonical gate: backend tests and both frontend builds.
Write-Host "Building editor frontend, static map app, and running backend tests..."
npm run check
if ($LASTEXITCODE -ne 0) {
  throw "Editor checks failed with exit code $LASTEXITCODE"
}

Write-Host "Editor checks completed."
