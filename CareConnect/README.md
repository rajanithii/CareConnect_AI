# CareConnect AI

CareConnect AI connects donors, hospitals, and blood banks through a web application with emergency request workflows and AI-assisted planning.

## Repository Layout

- `backend/` contains the FastAPI application, feature domains, scripts, and tests.
- `frontend/` contains the React and Vite application.
- `docs/` contains setup, architecture, deployment, and feature documentation.
- `.github/workflows/` runs backend and frontend checks on pushes and pull requests.

See [the architecture guide](docs/architecture.md) for the module boundaries and [the documentation index](docs/README.md) for project guides.

## Requirements

- Python 3.13
- Node.js 22 and npm
- PostgreSQL for a local backend connected to a database

## Backend Setup

From the repository root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Set the database URL and any required service credentials in `backend/.env`, then start the API from `backend/`:

```powershell
uvicorn app.main:app --reload
```

The interactive API documentation is available at `http://localhost:8000/docs`.

Run backend tests from `backend/`:

```powershell
python -m pytest
```

## Frontend Setup

From the repository root:

```powershell
cd frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Set `VITE_API_BASE_URL` in `frontend/.env.local` if the API is not running at its default URL. Validate the frontend with:

```powershell
npm run lint
npm run build
```

## Configuration and Secrets

Use `backend/.env.example` and `frontend/.env.example` as templates. Never commit `.env`, `.env.local`, credentials, or production secrets. See `docs/` for analytics, deployment, SEO, and feature-specific guides.