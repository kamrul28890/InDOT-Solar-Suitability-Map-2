INDOT Solar Suitability Map

For Windows desktop users

This folder contains a self-contained copy of the INDOT Solar Suitability Map.
You do not need to install Python, Node.js, npm, Docker, GIS software, or shapefiles.

How to run the map

1. Right-click the ZIP file and choose "Extract All..." first.
   Do not run the app directly from inside the ZIP preview window.
2. Open the extracted folder named INDOT_Solar_Map_Windows.
3. Double-click Run_INDOT_Map.bat.
4. Wait a few seconds. Your default browser should open the map automatically.

If the browser does not open automatically, open this address manually:

http://127.0.0.1:8765

How to stop the map

Double-click Stop_INDOT_Map.bat.

Troubleshooting

- If Windows SmartScreen warns about an unknown app, click "More info", then "Run anyway".
- If Windows Firewall asks for permission, allow access for private networks.
- Keep the files and folders together. The app needs the server, data, and dist folders.
- If Run_INDOT_Map.bat says the server did not start, double-click Stop_INDOT_Map.bat, wait a few seconds, then run Run_INDOT_Map.bat again.
- The app runs only on your computer at 127.0.0.1. It does not publish anything to the internet.
