@echo off
setlocal

set "PORT=8010"
set "ROOT=%~dp0"
set "SERVER_EXE=%ROOT%server\editor_server.exe"
set "PYTHON=%ROOT%server\.venv\Scripts\python.exe"
set "RUNNER=%ROOT%server\run_editor.py"

echo Starting INDOT Solar Editor...

if exist "%SERVER_EXE%" (
  start "INDOT Solar Editor Server" /min "%SERVER_EXE%" --host 127.0.0.1 --port %PORT%
) else if exist "%PYTHON%" (
  start "INDOT Solar Editor Server" /min "%PYTHON%" "%RUNNER%" --host 127.0.0.1 --port %PORT%
) else (
  echo Missing server executable.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$url='http://127.0.0.1:%PORT%/health'; for($i=0; $i -lt 45; $i++){ try { Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { Start-Sleep -Seconds 1 } }; exit 1"
if errorlevel 1 (
  echo The editor server did not start in time.
  pause
  exit /b 1
)

start "" "http://127.0.0.1:%PORT%"
echo The editor is running at http://127.0.0.1:%PORT%
endlocal
