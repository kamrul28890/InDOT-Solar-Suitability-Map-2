@echo off
setlocal
cd /d "%~dp0"
set "PORT=8765"
set "SERVER_EXE=%~dp0server\INDOTMapServer.exe"

if not exist "%SERVER_EXE%" (
  echo Could not find the map server executable:
  echo %SERVER_EXE%
  echo.
  pause
  exit /b 1
)

echo Starting INDOT Solar Suitability Map...
echo Please keep this folder together. The server, data, and web files are all included here.
start "INDOT Solar Map Server" /min "%SERVER_EXE%" --host 127.0.0.1 --port %PORT%

echo Waiting for the local server to be ready...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$url='http://127.0.0.1:%PORT%/health'; for($i=0; $i -lt 45; $i++){ try { Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { Start-Sleep -Seconds 1 } }; exit 1"

if errorlevel 1 (
  echo The map server did not start in time.
  echo You can try running this file again, or use Stop_INDOT_Map.bat and retry.
  echo.
  pause
  exit /b 1
)

start "" "http://127.0.0.1:%PORT%"
echo The map is running at http://127.0.0.1:%PORT%
echo You can close this window after the browser opens.
echo Use Stop_INDOT_Map.bat when finished.
echo.
timeout /t 8 > nul
