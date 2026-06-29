$ErrorActionPreference = "Stop"

# The Vite build contains code/assets only. This script adds the generated map
# data and deployment files required by a fully static GitHub Pages artifact.
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$distDir = Join-Path $root "dist"
$sourceDataDir = Join-Path $root "data\processed"
$targetDataDir = Join-Path $distDir "data\processed"
$siteTemplateDir = Join-Path $root "public_site"

if (-not (Test-Path -LiteralPath $distDir)) {
  throw "Missing dist folder. Run the public site build before preparing the Pages artifact."
}

if (-not (Test-Path -LiteralPath (Join-Path $sourceDataDir "manifest.json"))) {
  throw "Missing processed data manifest at $sourceDataDir"
}

New-Item -ItemType Directory -Force -Path $targetDataDir | Out-Null
# Copy only the manifest and GeoJSON contract, not local source shapefiles.
Copy-Item -Path (Join-Path $sourceDataDir "manifest.json") -Destination $targetDataDir -Force
Copy-Item -Path (Join-Path $sourceDataDir "*.geojson") -Destination $targetDataDir -Force
New-Item -ItemType File -Force -Path (Join-Path $distDir ".nojekyll") | Out-Null

if (Test-Path -LiteralPath $siteTemplateDir) {
  Copy-Item -Path (Join-Path $siteTemplateDir "*") -Destination $distDir -Recurse -Force
}

$metadata = @{
  # Record enough provenance to identify when and from where the artifact was
  # assembled without embedding machine-specific absolute paths.
  generated_at_utc = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
  source_data = "website/data/processed"
  target_site = "https://s2hublab.github.io/indot-solar-suitability-map/"
} | ConvertTo-Json

Set-Content -Path (Join-Path $distDir "deployment-metadata.json") -Value $metadata -Encoding UTF8

Write-Host "Prepared GitHub Pages artifact:"
Write-Host $distDir

