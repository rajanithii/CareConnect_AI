# Architecture

CareConnect AI is a monorepo with independently installable backend and frontend applications. Keep domain behavior in feature packages, shared infrastructure in shared modules, and product documentation outside application source trees.

```text
CareConnect/
├── .github/workflows/       # Backend and frontend CI
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI application and router registration
│   │   ├── database.py
│   │   ├── security.py
│   │   └── <feature>/       # Domain routes, schemas, services, and models
│   ├── scripts/             # Maintainer and database utilities
│   ├── tests/               # Backend test suite
│   ├── .env.example
│   └── requirements.txt
├── docs/
│   ├── analytics/
│   ├── marketing/
│   ├── modules/
│   └── seo/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/             # HTTP clients
│   │   ├── app/             # App-level composition
│   │   ├── components/      # Reusable UI
│   │   ├── contexts/        # Shared client state
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/           # Route-level views
│   │   ├── routes/
│   │   ├── services/        # Frontend use cases and data access
│   │   └── utils/
│   └── package.json
├── .gitignore
└── README.md
```

## Boundaries

- A backend feature package owns its domain-specific API routes, validation schemas, services, and models. Shared database, security, and cross-domain utilities stay outside feature packages.
- Frontend pages compose reusable components and call services; API clients keep transport details out of UI components.
- Register application routes in the existing app entry points rather than duplicating applications or creating per-feature servers.
- Keep generated environments and build output local. Commit source, lockfiles, tests, configuration templates, and maintained documentation.