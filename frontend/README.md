# Frontend (React + Vite) — Evently

Modern React frontend for the Evently event booking platform. Provides registration, login, event browsing, event details, ticket booking, "My Bookings", and an admin dashboard to manage events and view bookings.

## Requirements

- Node.js 18+ (recommended 20+)
- npm 9+

## Tech Stack

- React 19 + Vite 7
- React Router 7
- TanStack Query 5
- Tailwind CSS 4 + `@tailwindcss/vite`
- shadcn/ui components (`@shadcn/ui`)
- react-hook-form + zod (validation)
- axios (HTTP)
- sonner (toasts)
- lucide-react (icons)

## Local Development

1) Install dependencies

```bash
cd Frontend
npm install
```

2) Point the app to your backend API

By default the app targets a Replit URL. For local development, change it to your backend origin (e.g. `http://localhost:3000`).

- Primary location:
  - `src/lib/api.js` → update `API_BASE`
- Pages that also define their own `API_BASE` (keep these in sync or refactor to use `src/lib/api.js`):
  - `src/temp/login.jsx`
  - `src/temp/eventdetails.jsx`
  - `src/temp/AdminEvents.jsx`
  - `src/temp/AdminEventBookings.jsx`
  - `src/temp/MyBookings.jsx`

Example for local dev:

```js
// src/lib/api.js
export const API_BASE = "http://localhost:3000";
```

3) Start the dev server

```bash
npm run dev
```

Vite will print the local URL (typically `http://localhost:5173`).

## Build and Preview

```bash
npm run build
npm run preview
```

## Lint

```bash
npm run lint
```

## Routing Overview

- `/` → redirects to `/register`
- Public:
  - `/register`
  - `/login`
- Auth required:
  - `/events` — list events
  - `/events/:id` — event details
  - `/book/:id` — book tickets
  - `/my-bookings` — your bookings
- Admin only:
  - `/admin/events` — manage events
  - `/admin/events/:id/bookings` — view bookings for an event
