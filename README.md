# Restaurant Reservation System

A full-stack web app for managing restaurant reservations, built as a university final project.

**Live demo:** https://rrsfinal.vercel.app

Frontend deployment URL - restaurant-reservation-system-jfejl9jhu-burgerbonanza.vercel.app

Backend deployment URL - https://restaurant-reservation-system-83uv.onrender.com

---

## Team — Group 3

| Name | GitHub |
|---|---|
| Irakli Sajaia | [@iraklisajaia] |
| Giorgi Khutsishvili | [@GiorgiKH16] | 
| Abdel Latif Ghassan Abdel Qadir | [@AbdelLatif-Abdelqadir] |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Create React App |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Email | Nodemailer (console-simulated in dev) |
| Tests | Jest + Supertest |
| Hosting | Vercel (frontend) · Render (backend) · MongoDB Atlas (database) |

---

## Features

- **Login / Register** — JWT-based auth; Customer, Staff, and Admin roles
- **Real-time availability** — server-side capacity check prevents double-booking
- **Configurable settings** — Admin can set table capacity and operating hours
- **Waitlist** — customers join a waitlist when a slot is full; staff seat them when space opens
- **Staff dashboard** — List, Day, and Week views with inline reschedule
- **Email confirmations** — Nodemailer sends confirmation on booking/waitlist join (simulated via console.log in dev)
- **Centralized error handling** — no raw stack traces exposed to clients

---

## Seeded Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@bb.com | admin |
| Staff | staff@bb.com | staff |

Created automatically on first server start.

---

## Local Setup

### Prerequisites

- Node.js 18+
- A MongoDB instance (local or Atlas)

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in JWT_SECRET and MONGODB_URI
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm start              # runs on http://localhost:3000
```



## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register a new Customer account |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | Any | Get current user |
| GET | `/api/bookings` | Any | List bookings (Staff/Admin: all; Customer: own only) |
| POST | `/api/bookings` | Any | Create a booking |
| PUT | `/api/bookings/:id` | Staff/Admin | Update a booking |
| DELETE | `/api/bookings/:id` | Any | Cancel a booking (Customer: own only) |
| GET | `/api/settings` | — | Get restaurant settings |
| PUT | `/api/settings` | Admin | Update capacity and hours |
| GET | `/api/waitlist` | Any | List waitlist entries |
| POST | `/api/waitlist` | Any | Join the waitlist |
| DELETE | `/api/waitlist/:id` | Any | Remove from waitlist (own entry or Staff/Admin) |
| POST | `/api/waitlist/:id/seat` | Staff/Admin | Seat a waitlisted party |

---

## Testing

```bash
cd backend
npm install
npm test
```

9 tests covering:

- `POST /api/auth/register` — creates Customer account, returns token
- `POST /api/auth/login` — rejects wrong password (401)
- Booking confirmation — simulated email logs to console on creation
- `POST /api/bookings` — rejects unauthenticated requests (401)
- `POST /api/bookings` — creates booking, then rejects when slot is full (409 + `waitlistAvailable`)
- `PUT /api/bookings/:id` — forbidden for Customer (403)
- `PUT /api/bookings/:id` — succeeds for Admin (200)
- `DELETE /api/bookings/:id` — Customer can cancel their own booking (200)
- `DELETE /api/bookings/:id` — Customer cannot cancel another guest's booking (403)

> Tests require a reachable `MONGODB_URI` in `backend/.env`.
