# Deployment

## Local Development

Start the API:

```powershell
.venv\Scripts\python.exe -m uvicorn app.api.main:app --reload --host 127.0.0.1 --port 8000
```

Start the frontend:

```powershell
npm run dev
```

Open `http://127.0.0.1:5173`.

## Production-Style Local Run

Build the frontend:

```powershell
npm run build
```

Serve the API and built frontend from one process:

```powershell
.venv\Scripts\python.exe -m uvicorn app.api.main:app --host 127.0.0.1 --port 8000
```

Open `http://127.0.0.1:8000`.

## Docker

Build and run:

```powershell
docker compose up --build
```

Open `http://127.0.0.1:8000`.

The Docker image uses the committed `data/processed/` files. Regenerate them before building the image if the source shapefiles change.
