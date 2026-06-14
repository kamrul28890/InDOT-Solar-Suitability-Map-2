# Editor Packaging

Windows launcher assets for the Phase 2 editor.

The active release builder is:

```powershell
npm run release:windows
```

That command runs `scripts/build_windows_release.ps1`, builds the React editor, packages the FastAPI backend with PyInstaller, and creates:

```text
release/INDOT_Solar_Editor_Windows.zip
```

The ZIP includes `Run_Editor.bat`, `Stop_Editor.bat`, `INSTRUCTIONS.txt`, and the packaged `server/editor_server.exe`.
