$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$releaseDir = Join-Path $root "release"
$packageName = "INDOT_Solar_Map_Windows"
$packageDir = Join-Path $releaseDir $packageName
$zipPath = Join-Path $releaseDir "$packageName.zip"
$pyInstallerDist = Join-Path $root "build\pyinstaller_dist"
$pyInstallerWork = Join-Path $root "build\pyinstaller_work"
$pyInstallerSpec = Join-Path $root "build\pyinstaller_spec"
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
    [scriptblock]$Command,
    [Parameter(Mandatory = $true)]
    [string]$Label
  )

  & $Command
  if ($LASTEXITCODE -ne 0) {
    throw "$Label failed with exit code $LASTEXITCODE"
  }
}

Write-Host "Running full project checks..."
& "$root\scripts\check_project.ps1"

Write-Host "Checking PyInstaller..."
& $python -m PyInstaller --version | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host "Installing PyInstaller into the project virtual environment..."
  Invoke-Checked { & $python -m pip install pyinstaller==6.11.1 } "PyInstaller install"
}

Write-Host "Cleaning prior release artifacts..."
if (Test-Path $packageDir) { Remove-Item -LiteralPath $packageDir -Recurse -Force }
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
if (Test-Path $pyInstallerDist) { Remove-Item -LiteralPath $pyInstallerDist -Recurse -Force }
if (Test-Path $pyInstallerWork) { Remove-Item -LiteralPath $pyInstallerWork -Recurse -Force }
if (Test-Path $pyInstallerSpec) { Remove-Item -LiteralPath $pyInstallerSpec -Recurse -Force }

Write-Host "Building server executable..."
Invoke-Checked { & $python -m PyInstaller `
  --noconfirm `
  --clean `
  --onedir `
  --name INDOTMapServer `
  --distpath $pyInstallerDist `
  --workpath $pyInstallerWork `
  --specpath $pyInstallerSpec `
  --hidden-import app.api.main `
  --collect-submodules uvicorn `
  --collect-submodules fastapi `
  --collect-submodules starlette `
  --collect-submodules pydantic `
  "$root\packaging\run_indot_map.py" } "PyInstaller build"

Write-Host "Assembling release folder..."
New-Item -ItemType Directory -Path $packageDir | Out-Null
Copy-Item -Path "$root\release_assets\Run_INDOT_Map.bat" -Destination $packageDir
Copy-Item -Path "$root\release_assets\Stop_INDOT_Map.bat" -Destination $packageDir
Copy-Item -Path "$root\release_assets\README_RUN_THIS_FIRST.txt" -Destination $packageDir
Copy-Item -Path "$root\dist" -Destination (Join-Path $packageDir "dist") -Recurse
Copy-Item -Path "$root\data" -Destination (Join-Path $packageDir "data") -Recurse
Copy-Item -Path (Join-Path $pyInstallerDist "INDOTMapServer") -Destination (Join-Path $packageDir "server") -Recurse

Write-Host "Creating ZIP package..."
Compress-Archive -Path "$packageDir\*" -DestinationPath $zipPath -Force

Write-Host "Release package created:"
Write-Host $zipPath
