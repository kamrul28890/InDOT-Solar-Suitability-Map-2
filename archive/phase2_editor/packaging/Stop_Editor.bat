@echo off
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*editor_api.main*' -or $_.CommandLine -like '*editor_server.exe*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }"
echo INDOT Solar Editor server stopped if it was running.

