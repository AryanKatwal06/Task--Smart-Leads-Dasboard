# Smart Leads Dashboard Backend API Documentation

This document is derived from the current backend implementation under `server/src`.

## 1) Project API Overview

The backend is a TypeScript Express API for lead management with:
- JWT authentication (access + refresh token rotation)
- Role-based access (`admin`, `sales`)
- Lead CRUD, filtering, analytics, CSV export
- Saved filters per user
- Bulk CSV lead import
- Audit logging for export/import events

### Architecture (implemented flow)

`Express Router -> Security middleware -> Route middleware (auth/role/validation/upload) -> Controller -> Service -> Repository/Model (MongoDB) -> JSON/CSV response`

### Tech stack in backend
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcrypt`)
- Validation (`zod` on selected routes)
- Security middleware (`helmet`, `cors`, `xss-clean`, `express-mongo-sanitize`, `express-rate-limit`)
- Optional Redis caching for analytics
- Optional cron scheduler for export/cache jobs

---

## 2) Base URL

### Local
- API base: `http://localhost:5000/api/v1`
- Health: `http://localhost:5000/api/v1/health`

### Production
- README lists backend deployment at: `https://task-smart-leads-dashboard.onrender.com`
- Production API base becomes: `https://task-smart-leads-dashboard.onrender.com/api/v1`

If deploying elsewhere, set frontend `VITE_API_URL` to your deployed backend `/api/v1` base.

---

## 3) Authentication System

## Token model
- **Access token**: JWT signed with `JWT_ACCESS_TOKEN_SECRET`, default expiry `15m`
- **Refresh token**: JWT signed with `JWT_REFRESH_TOKEN_SECRET`, default expiry `7d`
- Refresh tokens are **hashed with bcrypt** and persisted in `RefreshToken` collection.

### Login/register response pattern
`POST /auth/register` and `POST /auth/login` return:

```json
{
  "user": {
    "id": "<mongoId>",
    "name": "John",
    "email": "john@example.com",
    "role": "admin"
  },
  "accessToken": "<jwt>"
}
```

Refresh token is set as HTTP-only cookie:
- name: `refreshToken`
- path: `/api/v1/auth`
- `httpOnly: true`
- `sameSite: "lax"`
- `secure: true` only in production

### RBAC and first-user bootstrap behavior (implemented)
In `AuthService.register`:
- System checks total users count.
- **If count is 0, first registered user gets role `admin` automatically.**
- **All subsequent users default to `sales`** (unless `role` is explicitly passed to service internals).

### Auth middleware behavior
`protect` middleware accepts access token from:
1. `Authorization: Bearer <token>`
2. `x-access-token` header
3. `accessToken` cookie

Failure behavior:
- Missing token -> `401 { "error": "Unauthorized" }`
- Invalid token -> `401 { "error": "Invalid token" }`

### Role middleware behavior
`authorize(roles)` checks `req.user.role` (case-insensitive):
- Not allowed -> `403 { "error": "Forbidden" }`

---

## 4) Request Lifecycle

1. `app.ts` loads JSON parser + cookie parser.
2. Global security middleware applies (`helmet`, CORS, XSS clean, mongo sanitize, rate limit).
3. Request enters versioned route (`/api/v1/...`).
4. Route-level middleware executes (`protect`, `authorize`, `validateBody`, `multer`, etc.).
5. Controllers call service/repository logic.
6. Mongoose executes DB operations.
7. Response sent as JSON or CSV.
8. Errors bubble through `asyncHandler` to `errorHandler`.

Error handler behavior:
- `ApiError` -> returns configured status + `{ "error": "<message>" }`
- Other errors -> `500 { "error": "Internal Server Error" }`

---

## 5) Environment Variables

> Table includes variables referenced in backend code/config files. Some are runtime-used; some are schema/documentation-only.

| Variable | Used In | Required | Default | Notes |
|---|---|---:|---|---|
| `PORT` | `index.ts` | No | `5000` | API listen port |
| `NODE_ENV` | auth/db/redis/config | No | environment default | Affects cookie security, DB fallback, test cache behavior |
| `MONGO_URI` | `index.ts`, `db.ts`, scheduler script | Conditionally | none | Required in production; dev can fallback to in-memory MongoDB |
| `JWT_ACCESS_TOKEN_SECRET` | `utils/jwt.ts` | No (but required for real security) | `dev_access_secret` | Access JWT signing secret |
| `JWT_REFRESH_TOKEN_SECRET` | `utils/jwt.ts` | No (but required for real security) | `dev_refresh_secret` | Refresh JWT signing secret |
| `JWT_ACCESS_TOKEN_EXPIRES` | `utils/jwt.ts` | No | `15m` | Access token expiry |
| `JWT_REFRESH_TOKEN_EXPIRES` | `utils/jwt.ts`, `auth.service.ts` | No | `7d` | Refresh token expiry + DB `expiresAt` calculation |
| `CLIENT_ORIGIN` | `middlewares/security.ts` | No | `http://localhost:3000` | Primary allowed CORS origin; supports comma-separated list |
| `CORS_ORIGIN` | `middlewares/security.ts` | No | fallback | Alternate CORS origin env |
| `REDIS_URL` | `utils/redis.ts` | No | `redis://localhost:6379` | Optional analytics cache backend |
| `ENABLE_SCHEDULER` | `index.ts` | No | `false` unless set | Enables cron export/cache jobs when `true` |
| `EXPORT_NOTIFICATION_EMAIL` | `jobs/exportScheduler.ts` | No | `admin@smartleads.com` | Recipient for scheduled export notification |
| `EMAIL_HOST` | `utils/email.ts` | No | `localhost` | SMTP host |
| `EMAIL_PORT` | `utils/email.ts` | No | `587` | SMTP port |
| `EMAIL_USER` | `utils/email.ts` | No | none | SMTP auth user |
| `EMAIL_PASSWORD` | `utils/email.ts` | No | none | SMTP auth password |
| `EMAIL_FROM` | `utils/email.ts` | No | `noreply@smartleads.com` | Outgoing sender |
| `USE_REAL_MONGO` | `test-utils/mongo.ts` | Test-only | `false` | Uses real Mongo in tests instead of memory server |
| `JWT_SECRET` | `config/env.ts` schema | Schema-only | none | Declared in unused env validator file |
| `JWT_EXPIRES_IN` | `config/env.ts` schema | Schema-only | `15m` | Declared in unused env validator file |
| `REFRESH_TOKEN_SECRET` | `config/env.ts` schema | Schema-only | none | Declared in unused env validator file |
| `REFRESH_TOKEN_EXPIRES_IN` | `config/env.ts` schema | Schema-only | `7d` | Declared in unused env validator file |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | `config/env.ts` schema | Schema-only | none | Declared in unused env validator file |

---

## 6) Complete Endpoint Documentation

All paths below are relative to `/api/v1` unless stated.

## Root + Health

### GET `/`
- **Purpose**: root service probe
- **Auth**: Public
- **Success 200**
```json
{ "status": "ok", "service": "smart-leads-dashboard-api" }
```

### GET `/health`
- **Purpose**: health check
- **Auth**: Public
- **Success 200**
```json
{ "status": "ok" }
```

## Auth Routes (`/auth`)

### POST `/auth/register`
- **Purpose**: create user + issue tokens
- **Auth**: Public
- **Body validation (Zod)**
  - `name`: non-empty string
  - `email`: valid email
  - `password`: min 8 chars
- **Request body**
```json
{ "name": "John", "email": "john@example.com", "password": "password123" }
```
- **Success 201**: user + `accessToken` (refresh token in cookie)
- **Errors**
  - `400 { "errors": ... }` validation failure
  - `400 { "error": "Email already in use" }`

### POST `/auth/login`
- **Purpose**: authenticate + issue new access/refresh tokens
- **Auth**: Public
- **Body validation (Zod)**
  - `email`: valid email
  - `password`: non-empty string
- **Success 200**: same response shape as register
- **Errors**
  - `400 { "errors": ... }` validation failure
  - `401 { "error": "Invalid credentials" }`

### POST `/auth/debug-check`
- **Purpose**: development-only credential debug helper
- **Auth**: Public
- **Body validation**: `email` required valid email, `password` optional string
- **Behavior**
  - In production: `403 { "error": "Not allowed" }`
  - Otherwise returns user-found/password-match diagnostics.

### POST `/auth/refresh`
- **Purpose**: rotate refresh token and issue new access token
- **Auth**: requires `refreshToken` cookie
- **Success 200**
```json
{
  "user": { "id": "...", "name": "...", "email": "...", "role": "sales" },
  "accessToken": "<jwt>"
}
```
- **Errors**
  - `401 { "error": "No refresh token" }`
  - `401 { "error": "Invalid refresh token" }`

### POST `/auth/logout`
- **Purpose**: revoke refresh token(s), clear refresh cookie
- **Auth**: Public route (works with or without auth context)
- **Success 200**
```json
{ "ok": true }
```

### GET `/auth/me`
- **Purpose**: current authenticated user profile
- **Auth**: Bearer required (`protect`)
- **Success 200**
```json
{ "user": { "id": "...", "name": "...", "email": "...", "role": "admin" } }
```
- **Errors**
  - `401 { "error": "Unauthorized" }`
  - `404 { "error": "User not found" }`

## Lead Routes (`/leads`) - Protected + RBAC (`admin` or `sales`)

Required header for all routes below:
- `Authorization: Bearer <accessToken>`

### GET `/leads`
- **Purpose**: paginated lead listing with filters/sort
- **Query params**
  - `status` (`New|Contacted|Qualified|Lost`)
  - `source` (`Website|Instagram|Referral`)
  - `search` (name/email regex, case-insensitive)
  - `startDate`, `endDate` (applied to `createdAt`)
  - `page` (default 1)
  - `limit` (default 10, capped at 100)
  - `sortBy` (`name|email|status|source|createdAt|updatedAt`)
  - `sortOrder` (`asc|desc`, default desc)
- **Success 200**
```json
{
  "leads": [
    {
      "_id": "...",
      "name": "Lead 1",
      "email": "lead1@example.com",
      "status": "New",
      "source": "Website",
      "createdAt": "2026-05-18T07:00:00.000Z",
      "updatedAt": "2026-05-18T07:00:00.000Z"
    }
  ],
  "meta": { "total": 1, "page": 1, "limit": 10, "totalPages": 1 }
}
```

### POST `/leads`
- **Purpose**: create a lead
- **Body validation (Zod)**
  - `name` required non-empty
  - `email` required valid email
  - `status` optional enum
  - `source` optional enum
- **Success 201**
```json
{ "lead": { "_id": "...", "name": "...", "email": "...", "status": "New", "source": "Website" } }
```
- **Errors**
  - `400 { "errors": ... }` validation failure

### GET `/leads/:id`
- **Purpose**: fetch lead by id
- **Success 200**: `{ "lead": { ... } }`
- **Errors**
  - `404 { "error": "Lead not found" }`
  - `500 { "error": "Internal Server Error" }` (e.g., invalid ObjectId cast)

### PATCH `/leads/:id`
- **Purpose**: partial update
- **Body validation**: partial of create schema
- **Success 200**: `{ "lead": { ...updated... } }`
- **Errors**
  - `400 { "errors": ... }` validation failure
  - `404 { "error": "Lead not found" }`

### DELETE `/leads/:id`
- **Purpose**: delete lead
- **Success**: `204 No Content`
- **Errors**
  - `404 { "error": "Lead not found" }`

### GET `/leads/analytics`
- **Purpose**: aggregated lead analytics (cached)
- **Query params**: same filter set as list endpoint
- **Success 200**
```json
{
  "byStatus": { "New": 10, "Contacted": 5 },
  "bySource": { "Website": 8, "Referral": 7 },
  "timeseries": [
    { "_id": "2026-05-18", "count": 3 }
  ]
}
```

### GET `/leads/export`
- **Purpose**: stream filtered leads as CSV
- **Query params**: same filters + `save=true` to also persist under `exports/`
- **Success 200**
  - `Content-Type: text/csv`
  - `Content-Disposition: attachment; filename="<generated>.csv"`
- Also writes audit log action `EXPORT_ON_DEMAND`.

### GET `/leads/exports`
- **Purpose**: list files in local `exports/` directory
- **Success 200**
```json
{
  "exports": [
    {
      "filename": "leads_2026-05-18.csv",
      "path": "/v1/leads/exports/download/leads_2026-05-18.csv",
      "createdAt": "2026-05-18T07:00:00.000Z"
    }
  ]
}
```

### GET `/leads/exports/download/:filename`
- **Purpose**: download stored export file
- **Security**: path traversal blocked (`403 Forbidden`)
- **Success 200**: CSV attachment
- **Errors**
  - `403 { "error": "Forbidden" }`
  - `404 { "error": "Export file not found" }`

## Saved Filter Routes (`/saved-filters`) - Protected

All endpoints require authenticated user (`protect`).

### GET `/saved-filters`
- Returns current user's filters only.
- **Success 200**: `{ "filters": [ ... ] }`

### POST `/saved-filters`
- Creates filter with `userId` from auth context.
- No Zod schema here; Mongoose schema requires `name`.
- **Success 201**: `{ "filter": { ... } }`

### GET `/saved-filters/:id`
- Returns filter only if it belongs to current user.
- **Success 200**: `{ "filter": { ... } }`
- **Error**: `404 { "error": "Saved filter not found" }`

### PATCH `/saved-filters/:id`
- Updates owned filter (`runValidators: true`).
- **Success 200**: `{ "filter": { ... } }`
- **Error**: `404 { "error": "Saved filter not found" }`

### DELETE `/saved-filters/:id`
- Deletes owned filter.
- **Success**: `204 No Content`
- **Error**: `404 { "error": "Saved filter not found" }`

## Bulk Import Route (`/bulk-import`) - Protected + RBAC (`admin` or `sales`)

### POST `/bulk-import/import`
- **Content-Type**: `multipart/form-data`
- **File field**: `file`
- **Upload limits**: in-memory; max `10MB`
- CSV parser uses columns in this order: `name,email,status,source`.
- Row behavior:
  - missing `name` or `email` -> row error
  - missing `status` defaults to `New`
  - missing `source` defaults to `Website`
- **Success 200**
```json
{
  "imported": 2,
  "failed": 1,
  "leads": [{ "_id": "...", "name": "A", "email": "a@example.com", "status": "New", "source": "Website" }],
  "errors": [{ "rowIndex": 0, "row": { "name": "", "email": "" }, "error": "Missing name or email" }]
}
```
- Also writes audit log action `BULK_IMPORT`.
- **Errors**
  - `400 { "error": "No file provided" }`

---

## 7) Database Documentation

## Collections and schemas

### `users`
- `name` (required)
- `email` (required, lowercase, unique)
- `password` (bcrypt hash)
- `role` (`admin` or `sales`, default `sales`)
- timestamps

### `refreshtokens`
- `user` (`ObjectId` ref `User`)
- `token` (hashed refresh token)
- `expiresAt` (optional)
- `revoked` (default false)
- timestamps

### `leads`
- `name` (required)
- `email` (required, lowercase)
- `status` enum: `New|Contacted|Qualified|Lost` (default `New`)
- `source` enum: `Website|Instagram|Referral` (default `Website`)
- timestamps

Indexes:
- compound: `{ status: 1, source: 1, createdAt: -1 }`
- single: `{ name: 1 }`
- single: `{ email: 1 }`

### `savedfilters`
- `userId` (string, indexed)
- `name` (required)
- optional: `status`, `source`, `search`, `startDate`, `endDate`, `sortBy`, `sortOrder`
- timestamps

### `auditlogs`
- `action` (required, indexed)
- `resource` (required, indexed)
- `userId` (optional)
- `userRole` (optional)
- `details` (mixed object)
- timestamps

## Relationships
- `RefreshToken.user` references `User._id`
- `SavedFilter.userId` is stored as string (not ObjectId ref)
- `AuditLog` stores user metadata as strings

---

## 8) Middleware Documentation

### Global middleware (`app.ts` + `security.ts`)
- `express.json()`
- `cookie-parser`
- `helmet` (CSP disabled, COEP disabled)
- `cors` with allowed origin list from `CLIENT_ORIGIN` or `CORS_ORIGIN`
- `xss-clean`
- `express-mongo-sanitize`
- `express-rate-limit` (100 requests / 15 minutes, standard headers)

### Route middleware
- `protect` (JWT auth)
- `authorize([...])` (RBAC)
- `validateBody(schema)` (Zod validation on selected endpoints)
- `multer.single('file')` for bulk import
- `asyncHandler` wrapper for async controller errors
- `errorHandler` final error responder

---

## 9) Error Handling

### Error payload patterns actually used
1. `ApiError` path:
```json
{ "error": "<message>" }
```
2. Zod validation failures:
```json
{ "errors": { "field": { "_errors": ["..."] } } }
```
3. Unhandled exceptions / non-ApiError:
```json
{ "error": "Internal Server Error" }
```

### Common status codes observed
- `200`, `201`, `204`
- `400` (validation or logical bad request)
- `401` (auth/credentials/token)
- `403` (RBAC/path traversal)
- `404` (missing entities/files)
- `500` (unhandled errors, including some Mongoose cast/validation paths not wrapped as `ApiError`)

---

## 10) Security Notes

Implemented controls:
- Password hashing with `bcrypt` (salt rounds: 10)
- Access + refresh JWT split
- Refresh token hashing at rest in DB
- Refresh token rotation on `/auth/refresh`
- HTTP-only refresh cookie
- CORS origin allowlist and credentials mode
- Helmet headers
- XSS sanitization and Mongo operator sanitization
- Rate limiting
- Path traversal defense for export download

Operational caveat from code:
- JWT secrets have insecure dev fallbacks if env vars are missing; production must override.

---

## 11) Deployment

From repository deployment docs/config:
- **Backend hosting target**: Render (working directory `server`, build `npm install && npm run build`, start `npm start`)
- **Frontend hosting target**: Vercel (`client`, with `VITE_API_URL` set to backend API base)
- **Database**: MongoDB Atlas recommended in `DEPLOY.md`
- **Optional**: Redis for cache, SMTP for notifications

Also present:
- Docker Compose local stack (`mongo`, `backend`, `frontend`)

---

## 12) Testing & API Verification Guidance

### Existing backend tests
- Jest + Supertest under `server/src/__tests__` and `server/src/tests`
- Covers auth service, lead pagination/filtering, and CSV export behavior

### Notes for this environment
- Integration tests using `mongodb-memory-server` require downloading Mongo binaries.
- In restricted networks, tests may fail due to download DNS/network errors.

### Manual API testing
No Postman collection is present in this repository. Recommended workflow:
1. Register first user (`/auth/register`) and verify role is `admin`.
2. Register second user and verify role defaults to `sales`.
3. Login and call protected endpoints with bearer token.
4. Test `/auth/refresh` using refresh cookie.
5. Test lead filters/pagination/sort and CSV export routes.

---

## Quick cURL examples

```bash
# Register (first user becomes admin)
curl -i -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@example.com","password":"password123"}'

# Login
curl -i -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# List leads (replace token)
curl -s http://localhost:5000/api/v1/leads?page=1&limit=10 \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```
