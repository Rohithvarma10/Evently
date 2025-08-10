# Evently — Full-Stack Event Booking

A full-stack app for discovering events and booking tickets, with an admin dashboard to manage events and view bookings.

## Monorepo Structure

```
/Frontend   # React + Vite app
/backend    # Node.js + Express + MongoDB API
```

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm 9+
- MongoDB 6+ (Atlas or local)

## 1) Backend Setup

1. Create env file

   ```bash
   cd backend
   # create .env if you don't have one yet
   echo "MONGO_URI=mongodb://localhost:27017/evently" > .env
   echo "JWT_SECRET=replace-with-a-strong-secret" >> .env
   echo "PORT=3000" >> .env
   ```

2. Install and run

   ```bash
   npm install
   node index.js
   ```

   API will be available at `http://localhost:3000`.

## 2) Frontend Setup

1. Point the frontend to your backend origin:

   - Update `Frontend/src/lib/api.js` → set `API_BASE = "http://localhost:3000"`
   - Also update pages that define their own `API_BASE`:
     - `src/temp/login.jsx`
     - `src/temp/eventdetails.jsx`
     - `src/temp/AdminEvents.jsx`
     - `src/temp/AdminEventBookings.jsx`
     - `src/temp/MyBookings.jsx`

2. Install and run

   ```bash
   cd ../Frontend
   npm install
   npm run dev
   ```

   Open the printed Vite URL (usually `http://localhost:5173`).

## 3) First Run Checklist

- Register a user via `/register`
- To use the admin dashboard, promote a user to `admin` in MongoDB:

  ```js
  use evently;
  db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
  ```

- As admin, create events at `/admin/events`
- As a normal user, browse `/events`, view details, and book

## Common Scripts

- Frontend
  - `npm run dev` — start Vite dev server
  - `npm run build` — build
  - `npm run preview` — preview build
  - `npm run lint` — lint
- Backend
  - `node index.js` — start API

## Troubleshooting

- Mongo connection error: verify `MONGO_URI` and connectivity
- 401 Unauthorized on frontend: login again; token is stored in `localStorage` as `token`
- Admin routes returning 403: ensure the user has `role = "admin"`


## Production Notes

- Restrict CORS `origin`
- Use strong `JWT_SECRET`
- Use environment-specific API base and HTTPS
- Consider adding a `start` script in backend and a reverse proxy

For folder-specific details, see:

- `Frontend/README.md`
- `backend/README.md`