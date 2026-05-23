# Testing

Run the full local verification pass:

```powershell
.\scripts\check_project.ps1
```

This performs three checks:

1. Regenerates app-ready GeoJSON data.
2. Runs Python tests for the exporter and API.
3. Builds the production frontend bundle.

The expected current Python result is `6 passed`.
