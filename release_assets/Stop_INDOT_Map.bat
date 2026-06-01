@echo off
setlocal
echo Stopping INDOT Solar Suitability Map...
taskkill /F /IM INDOTMapServer.exe > nul 2>&1
if errorlevel 1 (
  echo No running INDOT map server was found.
) else (
  echo Server stopped.
)
echo.
pause
