# Backend (Node.js + Express + MongoDB) — Evently

REST API for user authentication, event management, availability, and bookings.

## Requirements

- Node.js 18+ (recommended 20+)
- npm 9+
- MongoDB 6+ (Atlas or local)

## Environment Variables

Create a `.env` file in `backend/`:

```
MONGO_URI=mongodb://localhost:27017/evently
JWT_SECRET=replace-with-a-strong-secret
PORT=3000
```

- `MONGO_URI` is required
- `JWT_SECRET` is required
- `PORT` defaults to `3000` if omitted

## Install & Run

```bash
cd backend
npm install
node index.js
```

Server starts on `http://localhost:3000` (or `$PORT`).

## CORS

CORS is currently open to all origins for development:

```js
app.use(cors({ origin: '*', credentials: true }));
```

For production, restrict `origin` to your frontend domain.

## API Summary

Base path: `/api`

- Auth
  - `POST /auth/register` — create user (role forced to `user`)
  - `POST /auth/login` — returns `{ token, user: { username, email, role } }`
- Events
  - `GET /events` — list events
  - `GET /events/:id` — get event by id
  - `GET /events/:id/availability` — computed seats left, etc.
  - `POST /events/create` — create event (auth + admin)
  - `PUT /events/:id` — update event (auth + admin)
  - `DELETE /events/:id` — delete event (auth + admin)
- Bookings
  - `POST /bookings` — create a booking for current user (auth)
  - `GET /bookings/me` — current user bookings (auth)
  - `GET /bookings/event/:id` — bookings for an event (auth + admin)

Auth uses bearer tokens:

```
Authorization: Bearer <JWT>
```

## Models

- User: `username`, `email`, `password (hashed)`, `role` (`user|admin`) + timestamps
- Event: `title`, `date`, `location`, `capacity`, `image`, `isPublished`, `createdBy` + indexes
- Booking: `event`, `user`, `seats` + timestamps

## Admin Access

New registrations are `user` role by default. To promote a user to admin, update the record in MongoDB:

```js
// In a Mongo shell or script
use evently;
db.users.updateOne({ email: "admin@example.com" }, { $set: { role: "admin" } });
```

## Health Check

- `GET /` — returns "API is running" string

## Notes

- Helmet is enabled for basic security headers.
- Errors return a JSON body with `msg` or `error` and proper HTTP status codes.
- Capacity and availability are enforced when booking.