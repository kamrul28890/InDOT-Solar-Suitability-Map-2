param(
  [Parameter(Mandatory = $true)]
  [string]$PackagePath
)

$ErrorActionPreference = "Stop"

# Resolve both source and destination before copying so the operation remains
# bounded to a validated update package and the website processed-data directory.
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$sourceData = Join-Path (Resolve-Path -LiteralPath $PackagePath) "data\processed"
$targetData = Join-Path $root "website\data\processed"

if (-not (Test-Path -LiteralPath (Join-Path $sourceData "manifest.json"))) {
  # The manifest is the minimum structural proof that PackagePath is an editor
  # update artifact rather than an arbitrary folder.
  throw "The package must contain data\processed\manifest.json."
}

New-Item -ItemType Directory -Force -Path $targetData | Out-Null
Copy-Item -Path (Join-Path $sourceData "manifest.json") -Destination $targetData -Force
Copy-Item -Path (Join-Path $sourceData "*.geojson") -Destination $targetData -Force

Write-Host "Applied map update package to:"
Write-Host $targetData

