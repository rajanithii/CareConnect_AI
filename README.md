<div align="center">

<img src="docs/assets/hero.svg" alt="CareConnect AI: intelligent blood management and emergency coordination" width="100%">

<br>

![Status](https://img.shields.io/badge/ACTIVE_DEVELOPMENT-B3122A?style=flat-square&labelColor=0A0A0A)
![React](https://img.shields.io/badge/REACT-0A0A0A?style=flat-square&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FASTAPI-0A0A0A?style=flat-square&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/POSTGRESQL-0A0A0A?style=flat-square&logo=postgresql&logoColor=white)
![Groq](https://img.shields.io/badge/GROQ-0A0A0A?style=flat-square)
![Firebase](https://img.shields.io/badge/FIREBASE-0A0A0A?style=flat-square&logo=firebase&logoColor=white)

<br>

> **One workflow from emergency request → donor response → inventory → hospital coordination.**

CareConnect connects emergency requests with donor matching, alerts, inventory intelligence, forecasting, and inter-hospital coordination.

<img src="docs/assets/flow.svg" alt="Hospital request flows through AI processing and compatible donor alerts to donor response" width="100%">

<br>

<a href="#product-flow">Flow</a> ·
<a href="#features">Features</a> ·
<a href="#ai--intelligence">AI &amp; Intelligence</a> ·
<a href="#architecture">Architecture</a> ·
<a href="#tech-stack">Tech Stack</a> ·
<a href="#quick-start">Quick Start</a> ·
<a href="#testing">Testing</a> ·
<a href="#roadmap">Roadmap</a>

<img src="docs/assets/divider.svg" alt="">

</div>

## Product Flow

```mermaid
flowchart LR
    A([Request]) --> B([Understand]) --> C([Match]) --> D([Alert]) --> E([Respond]) --> F([Manage]) --> G([Predict]) --> H([Coordinate])

    classDef red fill:#B3122A,stroke:#7A0C1C,color:#ffffff;
    classDef dark fill:#111113,stroke:#000000,color:#ffffff;
    class A,D red;
    class B,C,E,F,G,H dark;
```

## Features

<table>
<tr>
<td width="50%" valign="top">

**Emergency coordination**<br>
Structured and natural-language blood requests with donor matching and alerts.

</td>
<td width="50%" valign="top">

**Donor, hospital, and admin portals**<br>
Role-specific dashboards, request workflows, and operational views.

</td>
</tr>
<tr>
<td valign="top">

**Blood bank operations**<br>
Inventory, expiry monitoring, FIFO recommendations, and usage records.

</td>
<td valign="top">

**Demand intelligence**<br>
Forecast assistance, peak and seasonal analysis, and shortage-risk signals.

</td>
</tr>
<tr>
<td valign="top">

**Hospital coordination**<br>
Recommendations and structured inter-hospital transfer workflows.

</td>
<td valign="top">

**Live notifications**<br>
Firebase Cloud Messaging and WebSocket request updates.

</td>
</tr>
</table>

<br>

## AI & Intelligence

CareConnect uses a hybrid intelligence layer combining LLM assistance, deterministic rules, and statistical analysis.

```mermaid
flowchart TB
    LLM["LLM assistance<br/>Emergency request extraction<br/>Demand analysis and forecasting assistance"]
    RULES["Deterministic intelligence<br/>Compatibility · eligibility<br/>Distance · explainable donor priority scoring"]
    ANALYTICS["Statistical / rule-based analysis<br/>Shortage risk · inventory · expiry<br/>FIFO recommendations · demand signals"]

    LLM --> RULES --> ANALYTICS

    classDef red fill:#B3122A,stroke:#7A0C1C,color:#ffffff;
    classDef dark fill:#111113,stroke:#000000,color:#ffffff;
    class LLM red;
    class RULES,ANALYTICS dark;
```

Donor ranking is deterministic and explainable; the project does not claim a trained donor-prediction model.

<br>

## Architecture

```mermaid
flowchart TD
    FE["React + Vite frontend<br/>Hospital · Donor · Admin"]
    API["FastAPI"]
    MOD["Service / API modules<br/>Authentication · Donors · Hospitals · Requests<br/>Matching · AI · Notifications · Blood inventory<br/>Analytics · Forecasting · Shortage prediction<br/>Recommendations · Expiry · Exchange · Admin"]
    DB[("PostgreSQL")]

    FE --> API --> MOD --> DB
    MOD -. "LLM assistance" .-> GROQ["Groq"]
    MOD -. "Push notifications" .-> FIREBASE["Firebase Cloud Messaging"]
    MOD -. "Geocoding" .-> OSM["OpenStreetMap / Nominatim"]

    classDef red fill:#B3122A,stroke:#7A0C1C,color:#ffffff;
    classDef dark fill:#111113,stroke:#000000,color:#ffffff;
    classDef soft fill:#F3F4F6,stroke:#9CA3AF,color:#111111;
    class API,MOD dark;
    class DB red;
    class FE,GROQ,FIREBASE,OSM soft;
```

<br>

## Tech Stack

**Frontend**<br>
![React 19](https://img.shields.io/badge/React_19-0A0A0A?style=flat-square&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-0A0A0A?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-0A0A0A?style=flat-square&logo=tailwindcss&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-0A0A0A?style=flat-square&logo=reactrouter&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-0A0A0A?style=flat-square)

**Backend and data**<br>
![Python](https://img.shields.io/badge/Python-0A0A0A?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0A0A0A?style=flat-square&logo=fastapi&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-0A0A0A?style=flat-square)
![Pydantic](https://img.shields.io/badge/Pydantic-0A0A0A?style=flat-square)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-0A0A0A?style=flat-square&logo=postgresql&logoColor=white)

**Integrations and quality**<br>
![Groq](https://img.shields.io/badge/Groq-0A0A0A?style=flat-square)
![Firebase](https://img.shields.io/badge/Firebase-0A0A0A?style=flat-square&logo=firebase&logoColor=white)
![OpenStreetMap](https://img.shields.io/badge/OpenStreetMap-0A0A0A?style=flat-square&logo=openstreetmap&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-0A0A0A?style=flat-square&logo=githubactions&logoColor=white)
![Pytest](https://img.shields.io/badge/Pytest-0A0A0A?style=flat-square&logo=pytest&logoColor=white)

<br>

## Status

```text
ACTIVE DEVELOPMENT

Core workflows and feature modules are present in the codebase.
Production deployment pending.
```

Implemented in the codebase does not imply production-scale validation or real-world hospital deployment.

<br>

## Quick Start

**Requirements:** Python 3.13 · Node.js 22 · PostgreSQL

Clone the repository from [GitHub](https://github.com/rajanithii/CareConnect_AI), then configure the backend from the repository root:

```powershell
cd CareConnect\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Set `DATABASE_URL` and the required service credentials in `CareConnect/backend/.env`. Start the API from `CareConnect/backend/`:

```powershell
uvicorn app.main:app --reload
```

In a second terminal, start the frontend:

```powershell
cd CareConnect\frontend
npm ci
Copy-Item .env.example .env.local
npm run dev
```

| Service | Local URL |
| :-- | :-- |
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8000` |
| API docs | `http://localhost:8000/docs` |

Never commit real credentials, API keys, or Firebase service-account files.

<br>

## Repository

```text
CareConnect_AI/
├── .github/workflows/       # CI checks
├── docs/assets/             # README hero, flow, and divider SVGs
├── CareConnect/
│   ├── backend/
│   │   ├── app/              # FastAPI domains and shared services
│   │   ├── scripts/
│   │   ├── tests/
│   │   └── requirements.txt
│   ├── frontend/
│   │   ├── src/
│   │   └── package.json
│   └── docs/
└── README.md
```

<br>

## Testing

Run backend tests from the backend directory:

```powershell
cd CareConnect\backend
python -m pytest
```

Run frontend checks from the frontend directory:

```powershell
cd CareConnect\frontend
npm run lint
npm run build
```

GitHub Actions runs backend tests and frontend lint/build checks on pushes and pull requests. It does not deploy the application.

<br>

## Roadmap

- Production deployment and operational validation
- Expanded monitoring and test coverage
- Further inventory optimization and forecasting improvements

<br>

<div align="center">

<img src="docs/assets/divider.svg" alt="">

### CARECONNECT AI

*Connecting blood needs with intelligent coordination.*

**Rajanithi N** · [@rajanithii](https://github.com/rajanithii)

</div>