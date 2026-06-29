$ErrorActionPreference = "Stop"

# Legacy source-bundle path retained for maintainers who need a portable Python
# environment instead of the primary PyInstaller distribution.
$editorRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$repoRoot = Resolve-Path (Join-Path $editorRoot "..")
$releaseRoot = Join-Path $editorRoot "release"
$packageName = "INDOT_Solar_Editor_Windows"
$packageDir = Join-Path $releaseRoot $packageName
$serverDir = Join-Path $packageDir "server"

Set-Location $editorRoot

Write-Host "Running editor checks..."
# Do not copy a package until tests and both frontend builds pass.
& "$editorRoot\scripts\check_editor.ps1"
if ($LASTEXITCODE -ne 0) {
  throw "Editor checks failed with exit code $LASTEXITCODE"
}

Write-Host "Assembling editor package folder..."
# Recreate only this named package, preserving unrelated release artifacts.
if (Test-Path $packageDir) { Remove-Item -LiteralPath $packageDir -Recurse -Force }
New-Item -ItemType Directory -Force -Path $serverDir | Out-Null

Copy-Item "$editorRoot\packaging\Run_Editor.bat" $packageDir
Copy-Item "$editorRoot\packaging\Stop_Editor.bat" $packageDir
Copy-Item "$editorRoot\packaging\README_RUN_THIS_FIRST.txt" $packageDir
Copy-Item "$editorRoot\packaging\run_editor.py" $serverDir
Copy-Item "$repoRoot\.venv" (Join-Path $serverDir ".venv") -Recurse
Copy-Item "$editorRoot\backend" (Join-Path $serverDir "backend") -Recurse
Copy-Item "$editorRoot\frontend_dist" (Join-Path $serverDir "frontend_dist") -Recurse
New-Item -ItemType Directory -Force -Path (Join-Path $serverDir "map_app") | Out-Null
Copy-Item "$editorRoot\map_app\dist" (Join-Path $serverDir "map_app\dist") -Recurse
Copy-Item "$repoRoot\phase1_map\config" (Join-Path $serverDir "phase1_config") -Recurse

$zipPath = Join-Path $releaseRoot "$packageName.zip"
if (Test-Path $zipPath) { Remove-Item -LiteralPath $zipPath -Force }
Compress-Archive -Path "$packageDir\*" -DestinationPath $zipPath -Force

Write-Host "Editor package folder created:"
Write-Host $packageDir
Write-Host "Editor package ZIP created:"
Write-Host $zipPath
