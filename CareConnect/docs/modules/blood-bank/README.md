# Blood Bank Module

The blood bank feature is integrated into the main backend and frontend applications.

## Active Source Paths

- Backend routes and analytics: `backend/app/blood_bank/`
- Backend inventory models: `backend/app/models/`
- Frontend pages: `frontend/src/pages/Hospital/`
- Frontend routes: `frontend/src/routes/AppRoutes.jsx`
- Hospital navigation: `frontend/src/components/hospital/hospitalNav.js`

The backend routers are registered by `backend/app/main.py`. Feature development should update these active source files rather than applying the former wiring patches.

For local setup and test commands, see the repository-root `README.md`.