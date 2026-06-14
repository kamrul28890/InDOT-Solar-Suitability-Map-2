@echo off
setlocal
cd /d "%~dp0"

set PORT=8010
echo Starting INDOT Solar Editor on http://127.0.0.1:%PORT% ...

start "INDOT Solar Editor Server" /min "%~dp0server\editor_server.exe" --host 127.0.0.1 --port %PORT%

echo Waiting for server...
for /l %%i in (1,1,40) do (
  powershell -NoProfile -Command "try { $r = Invoke-WebRequest 'http://127.0.0.1:%PORT%/health' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } } catch { exit 1 }"
  if not errorlevel 1 goto ready
  timeout /t 1 /nobreak >nul
)

echo Server did not become ready. Leave this window open and check the server console.
pause
exit /b 1

:ready
start "" "http://127.0.0.1:%PORT%/"
echo Editor is running at http://127.0.0.1:%PORT%/
echo Close the server window to stop the editor.
pause
