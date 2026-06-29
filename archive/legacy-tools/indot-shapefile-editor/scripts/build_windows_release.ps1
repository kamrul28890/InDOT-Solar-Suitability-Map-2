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
$projData = Join-Path $root ".venv\Lib\site-packages\pyproj\proj_dir\share\proj"
$gdalData = Join-Path $root ".venv\Lib\site-packages\pyogrio\gdal_data"

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

Write-Host "Running editor tests..."
Invoke-Checked { & "$root\.venv\Scripts\python.exe" -m pytest -q } "pytest"

Write-Host "Building editor frontend..."
Invoke-Checked { npm run build } "frontend build"

Write-Host "Checking PyInstaller..."
& "$root\.venv\Scripts\python.exe" -m PyInstaller --version | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Installing PyInstaller into editor virtual environment..."
  Invoke-Checked { & "$root\.venv\Scripts\python.exe" -m pip install pyinstaller==6.11.1 } "PyInstaller install"
}

Write-Host "Cleaning prior release artifacts..."
Remove-PathWithRetry $packageDir
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Remove-PathWithRetry $releaseWorkDir
Remove-PathWithRetry $pyInstallerDist
Remove-PathWithRetry $pyInstallerWork
Remove-PathWithRetry $pyInstallerSpec

Write-Host "Building editor server executable..."
Invoke-Checked { & "$root\.venv\Scripts\python.exe" -m PyInstaller `
  --noconfirm `
  --clean `
  --onedir `
  --name editor_server `
  --distpath $pyInstallerDist `
  --workpath $pyInstallerWork `
  --specpath $pyInstallerSpec `
  --add-data "$root\dist;dist" `
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
  "$root\packaging_run_editor.py" } "PyInstaller build"

Write-Host "Assembling release folder..."
New-Item -ItemType Directory -Path $packageDir | Out-Null
Copy-Item -Path "$root\release_assets\Run_Editor.bat" -Destination $packageDir
Copy-Item -Path "$root\release_assets\INSTRUCTIONS.txt" -Destination $packageDir
Copy-Item -Path (Join-Path $pyInstallerDist "editor_server") -Destination (Join-Path $packageDir "server") -Recurse

Write-Host "Creating ZIP package..."
Compress-Archive -Path "$packageDir\*" -DestinationPath $zipPath -Force

Write-Host "Release package created:"
Write-Host $zipPath
