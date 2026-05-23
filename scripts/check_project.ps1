$ErrorActionPreference = "Stop"

Write-Host "Exporting app-ready data..."
.venv\Scripts\python.exe scripts\export_app_data.py

Write-Host "Running Python tests..."
.venv\Scripts\python.exe -m pytest -q

Write-Host "Building frontend..."
npm run build

Write-Host "Project checks completed."
