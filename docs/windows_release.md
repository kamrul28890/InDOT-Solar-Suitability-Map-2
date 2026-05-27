# Windows Click-to-Run Release

Build the shareable Windows package with:

```powershell
.\scripts\build_windows_release.ps1
```

The script creates:

```text
release/INDOT_Solar_Map_Windows.zip
```

The ZIP is intended for non-technical users. They only need to unzip it and double-click:

```text
Run_INDOT_Map.bat
```

The launcher starts the packaged local server and opens:

```text
http://127.0.0.1:8000
```

Use `Stop_INDOT_Map.bat` to stop the local server.

The package includes the built frontend, processed GeoJSON data, and a bundled Windows server executable. It does not include raw shapefiles, PDFs, Python virtual environments, Node dependencies, or Docker artifacts.
