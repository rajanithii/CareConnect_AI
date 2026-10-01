# BloodLink AI — Frontend

Intelligent Emergency Blood Donor Network. Built with React 19, Vite, Tailwind CSS, Framer Motion, and React Router.

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Build for production

```bash
npm run build
npm run preview
```

## What's implemented

- Full premium landing page (Hero, Features, How It Works, AI section, Live Stats, Why BloodLink, Testimonials, FAQ, CTA)
- Auth flow: Login, Register, Forgot Password, Reset Password
- Hospital Dashboard (stats, recent requests, AI suggestions, quick actions)
- Donor Dashboard (availability toggle, stats, nearby requests, donation history)
- Full reusable component library (Button, Card, Badge, Input, Modal, Toast, etc.)
- Axios API layer wired to the documented backend endpoints (placeholder — connect a real API base URL via `VITE_API_BASE_URL`)
- Remaining portal pages (Hospital sub-pages, Admin panel, AI Insights, Notification Center, etc.) are scaffolded with routing + layout + "coming soon" placeholders, ready to be filled in with the same design system.

## Environment

Create a `.env` file:

```
VITE_API_BASE_URL=http://localhost:8000/api
```
