param(
  [Parameter(Mandatory = $true)]
  [string]$PackagePath
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$sourceData = Join-Path (Resolve-Path -LiteralPath $PackagePath) "data\processed"
$targetData = Join-Path $root "phase1_map\data\processed"

if (-not (Test-Path -LiteralPath (Join-Path $sourceData "manifest.json"))) {
  throw "The package must contain data\processed\manifest.json."
}

New-Item -ItemType Directory -Force -Path $targetData | Out-Null
Copy-Item -Path (Join-Path $sourceData "manifest.json") -Destination $targetData -Force
Copy-Item -Path (Join-Path $sourceData "*.geojson") -Destination $targetData -Force

Write-Host "Applied map update package to:"
Write-Host $targetData
