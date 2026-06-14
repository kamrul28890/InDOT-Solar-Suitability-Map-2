$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$releaseDir = Join-Path $root "release"
$packageName = "INDOT_Solar_Editor_Windows"
$releaseWorkDir = Join-Path $root "build\release_package"
$packageDir = Join-Path $releaseWorkDir $packageName
$zipPath = Join-Path $releaseDir "$packageName.zip"
$pyInstallerDist = Join-Path $root "build\pyinstaller_dist"
$pyInstallerWork = Join-Path $root "build\pyinstaller_work"
$pyInstallerSpec = Join-Path $root "build\pyinstaller_spec"
$repoRoot = Resolve-Path (Join-Path $root "..")
$pythonCandidates = @(
  (Join-Path $root ".venv\Scripts\python.exe"),
  (Join-Path $repoRoot ".venv\Scripts\python.exe")
)
$python = $pythonCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $python) {
  throw "Could not find project Python. Expected .venv under phase2_editor or repository root."
}
$venvRoot = Resolve-Path (Join-Path (Split-Path (Split-Path $python -Parent) -Parent) ".")
$projData = Join-Path $venvRoot "Lib\site-packages\pyproj\proj_dir\share\proj"
$gdalData = Join-Path $venvRoot "Lib\site-packages\pyogrio\gdal_data"

Set-Location $root

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [scriptblock]$Command,
    [Parameter(Mandatory = $true)]
    [string]$Label
  )

  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE"
  }
}

function Remove-PathWithRetry {
  param(
    [Parameter(Mandatory = $true)]
    [string]$PathToRemove
  )

  if (-not (Test-Path $PathToRemove)) { return }
  for ($attempt = 1; $attempt -le 8; $attempt++) {
    try {
      Remove-Item -LiteralPath $PathToRemove -Recurse -Force -ErrorAction Stop
      return
    } catch {
      if ($attempt -eq 8) { throw }
      Start-Sleep -Seconds 2
    }
  }
}

Write-Host "Building editor frontend..."
Invoke-Checked { npm run build } "frontend build"

Write-Host "Building static Phase 1-style map app..."
Invoke-Checked { npm run build:map } "map app build"

Write-Host "Running editor tests..."
Invoke-Checked { & $python -m pytest -q tests } "pytest"

Write-Host "Checking PyInstaller..."
& $python -m PyInstaller --version | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Installing PyInstaller into editor virtual environment..."
  Invoke-Checked { & $python -m pip install pyinstaller==6.11.1 } "PyInstaller install"
}

Write-Host "Cleaning prior release artifacts..."
Remove-PathWithRetry $packageDir
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Remove-PathWithRetry $releaseWorkDir
Remove-PathWithRetry $pyInstallerDist
Remove-PathWithRetry $pyInstallerWork
Remove-PathWithRetry $pyInstallerSpec

Write-Host "Building editor server executable..."
Invoke-Checked { & $python -m PyInstaller `
  --noconfirm `
  --clean `
  --onedir `
  --name editor_server `
  --distpath $pyInstallerDist `
  --workpath $pyInstallerWork `
  --specpath $pyInstallerSpec `
  --add-data "$root\dist;dist" `
  --add-data "$root\map_app\dist;map_app\dist" `
  --add-data "$projData;proj" `
  --add-data "$gdalData;gdal_data" `
  --runtime-hook "$root\scripts\pyi_runtime_geo_env.py" `
  --hidden-import editor_backend.main `
  --collect-submodules uvicorn `
  --collect-submodules fastapi `
  --collect-submodules starlette `
  --collect-submodules pydantic `
  --collect-submodules geopandas `
  --collect-submodules pyogrio `
  --collect-submodules shapely `
  "$root\packaging\run_editor.py" } "PyInstaller build"

Write-Host "Assembling release folder..."
New-Item -ItemType Directory -Path $packageDir | Out-Null
Copy-Item -Path "$root\packaging\Run_Editor.bat" -Destination $packageDir
Copy-Item -Path "$root\packaging\Stop_Editor.bat" -Destination $packageDir
Copy-Item -Path "$root\packaging\README_RUN_THIS_FIRST.txt" -Destination (Join-Path $packageDir "INSTRUCTIONS.txt")
Copy-Item -Path (Join-Path $pyInstallerDist "editor_server") -Destination (Join-Path $packageDir "server") -Recurse

Write-Host "Creating ZIP package..."
Compress-Archive -Path "$packageDir\*" -DestinationPath $zipPath -Force

Write-Host "Release package created:"
Write-Host $zipPath
