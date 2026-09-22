# Find It Campus

A full-stack Lost &amp; Found platform for college campuses. Students can report lost or found items, search approved listings, submit claims, and track their reports — while admins review reports, manage claims, and manage users.

```
find-it-campus/
├── find-it-campus-backend/    Node.js + Express + TypeScript + MongoDB API
└── find-it-campus-frontend/   React + TypeScript + Vite + Tailwind CSS
```

## Features

**Students**
- Register / log in (JWT-based auth, passwords hashed with bcrypt)
- Report a lost item or a found item, with an optional photo (uploaded to Cloudinary)
- Search approved items by keyword, category, lost/found type, and location
- View item details and submit a claim on a found item
- Track "My Reports" and "My Claims" with live status

**Admins**
- Dashboard with platform-wide counts (items, claims, users)
- Review pending reports: approve or reject (with an optional reason)
- View approved and rejected items
- Review claims: approve or reject — approving a claim marks the item as `claimed` and auto-rejects any other pending claims on the same item
- View and manage users (activate/deactivate)

## Tech stack

- **Frontend:** React, TypeScript, Vite, React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express, TypeScript, MongoDB, Mongoose, JWT, Bcrypt, Cloudinary, Multer
- **Tooling:** Git, Postman (collection included)

## Getting started

### 1. Backend

```bash
cd find-it-campus-backend
npm install
cp .env.example .env
# fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* in .env
npm run dev
```

The API runs on `http://localhost:5000` by default. Health check: `GET /api/health`.

### 2. Frontend

```bash
cd find-it-campus-frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
npm run dev
```

The app runs on `http://localhost:5173` by default.

### 3. MongoDB

Use a local MongoDB instance or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. Paste the connection string into `MONGO_URI` in the backend `.env`.

### 4. Cloudinary

Create a free [Cloudinary](https://cloudinary.com/) account and copy your Cloud Name, API Key, and API Secret into the backend `.env`. Item images upload directly to Cloudinary; only the resulting URL and public ID are stored in MongoDB.

### 5. Creating an admin user

There is no public "become admin" option (by design — see Security below). Register a normal account, then promote it directly in MongoDB:

```js
// in mongosh, or MongoDB Compass
db.users.updateOne({ email: "you@college.edu" }, { $set: { role: "admin" } })
```

## API overview

All responses follow `{ success, message, data }`. Endpoints marked 🔒 require `Authorization: Bearer <token>`; 🔒👑 require an authenticated admin.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new student account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/auth/me` 🔒 | Get the current authenticated user |
| GET | `/api/items` | Search approved items (`search`, `type`, `category`, `location`, `page`, `limit`) |
| POST | `/api/items` 🔒 | Report a lost/found item (multipart, field `image`) |
| GET | `/api/items/my` 🔒 | Get the current user's reports |
| GET | `/api/items/:id` | Get a single item (pending items only visible to owner/admin) |
| PATCH | `/api/items/:id` 🔒 | Edit your own report |
| DELETE | `/api/items/:id` 🔒 | Delete your own report (or admin) |
| POST | `/api/claims` 🔒 | Submit a claim on an approved found item |
| GET | `/api/claims/my` 🔒 | Get the current user's claims |
| GET | `/api/claims/:id` 🔒 | Get a single claim (owner/admin only) |
| GET | `/api/admin/dashboard` 🔒👑 | Platform-wide stats |
| GET | `/api/admin/items/pending` \| `/approved` \| `/rejected` 🔒👑 | Items by status |
| PATCH | `/api/admin/items/:id/approve` \| `/reject` 🔒👑 | Review a report |
| GET | `/api/admin/claims` 🔒👑 | All claims |
| PATCH | `/api/admin/claims/:id/approve` \| `/reject` 🔒👑 | Review a claim |
| GET | `/api/admin/users` 🔒👑 | List users |
| GET | `/api/admin/users/:id/reports` \| `/claims` 🔒👑 | A user's reports/claims |
| PATCH | `/api/admin/users/:id/toggle-active` 🔒👑 | Activate/deactivate a user |

A ready-to-import Postman collection is at `find-it-campus-backend/postman_collection.json`.

## Security notes

- Passwords are hashed with bcrypt; the password field is never returned by the API.
- JWT is required on every protected route and verified server-side (`authMiddleware`); admin routes are additionally gated by `adminMiddleware`. The frontend's route guards (`ProtectedRoute`, `AdminRoute`) are UX-only — authorization is never trusted from the client.
- Public registration always creates a `student` account; there's no way to self-promote to `admin` from the UI or the register endpoint.
- All inputs are validated server-side regardless of frontend validation.
- Secrets live in `.env` files, which are git-ignored; `.env.example` files show the required variables without real values.

## Notes on scope

This project was generated end-to-end (backend + frontend) as a working scaffold you can run locally, extend, and push to GitHub. A few things worth knowing if you build on it further:
- The "Edit Report" flow (`PATCH /api/items/:id`) exists on the backend but there's no dedicated edit page in the UI yet — a good next feature to add.
- Rate limiting, refresh tokens, and email verification aren't implemented — fine for a class project/demo, but add them before any real production use.
