# Smart Leads Dashboard Backend API Documentation

This document is derived from the current backend implementation under `server/src`.

---

# 1. Project API Overview

The backend is a TypeScript Express API for lead management with:

- JWT authentication (access + refresh token rotation)
- Role-based access (`admin`, `sales`)
- Lead CRUD operations
- Lead filtering & analytics
- CSV export support
- Saved filters per user
- Bulk CSV lead import
- Audit logging for export/import events

## Architecture Flow

```text
Express Router
→ Security Middleware
→ Route Middleware (Auth / Validation / Upload)
→ Controller
→ Service
→ Repository / MongoDB
→ JSON / CSV Response
```

## Backend Tech Stack

- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- bcrypt
- Zod Validation
- Helmet
- CORS
- Redis (Optional)
- Cron Scheduler (Optional)

---

# 2. Base URL

## Local Development

```text
http://localhost:5000/api/v1
```

Health Route:

```text
http://localhost:5000/api/v1/health
```

## Production

```text
https://task-smart-leads-dashboard.onrender.com/api/v1
```

---

# 3. Authentication System

## Token Structure

### Access Token
- Signed using `JWT_ACCESS_TOKEN_SECRET`
- Default Expiry: `15m`

### Refresh Token
- Signed using `JWT_REFRESH_TOKEN_SECRET`
- Default Expiry: `7d`

Refresh tokens are hashed using bcrypt before storing in MongoDB.

---

## First User Bootstrap Logic

- The **FIRST registered user** automatically becomes `ADMIN`.
- All subsequent users become `SALES`.

---

## Authentication Middleware

The `protect` middleware accepts tokens from:

1. `Authorization: Bearer <token>`
2. `x-access-token`
3. `accessToken` cookie

### Failure Responses

#### Missing Token

```json
{
  "error": "Unauthorized"
}
```

#### Invalid Token

```json
{
  "error": "Invalid token"
}
```

---

## Role-Based Authorization

The `authorize()` middleware validates user roles.

### Unauthorized Access

```json
{
  "error": "Forbidden"
}
```

---

# 4. Request Lifecycle

1. Express app initializes middleware.
2. Security middleware executes.
3. Route middleware executes.
4. Controllers invoke services.
5. Services communicate with MongoDB.
6. JSON or CSV response is returned.
7. Errors pass through centralized error handler.

---

# 5. Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | API server port |
| `NODE_ENV` | Runtime environment |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_TOKEN_SECRET` | Access token secret |
| `JWT_REFRESH_TOKEN_SECRET` | Refresh token secret |
| `JWT_ACCESS_TOKEN_EXPIRES` | Access token expiry |
| `JWT_REFRESH_TOKEN_EXPIRES` | Refresh token expiry |
| `CLIENT_ORIGIN` | Frontend allowed origin |
| `CORS_ORIGIN` | CORS allowed origin |
| `REDIS_URL` | Redis cache URL |
| `ENABLE_SCHEDULER` | Enables scheduler jobs |
| `EMAIL_HOST` | SMTP host |
| `EMAIL_PORT` | SMTP port |
| `EMAIL_USER` | SMTP username |
| `EMAIL_PASSWORD` | SMTP password |
| `EMAIL_FROM` | Sender email |
| `EXPORT_NOTIFICATION_EMAIL` | Export notification email |

---

# 6. API Endpoints

---

# Root Routes

## GET `/`

### Purpose
Root service probe.

### Authentication
Public

### Success Response

```json
{
  "status": "ok",
  "service": "smart-leads-dashboard-api"
}
```

---

## GET `/health`

### Purpose
Health check route.

### Authentication
Public

### Success Response

```json
{
  "status": "ok"
}
```

---

# Authentication Routes

Base Route:

```text
/api/v1/auth
```

---

## POST `/register`

### Purpose
Registers a new user and issues authentication tokens.

### Authentication
Public

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response

```json
{
  "user": {
    "id": "mongoId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  },
  "accessToken": "jwt_token"
}
```

### Error Responses

#### Validation Failure

```json
{
  "errors": {}
}
```

#### Email Already Exists

```json
{
  "error": "Email already in use"
}
```

---

## POST `/login`

### Purpose
Authenticates an existing user.

### Authentication
Public

### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response

```json
{
  "user": {
    "id": "mongoId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "sales"
  },
  "accessToken": "jwt_token"
}
```

### Error Response

```json
{
  "error": "Invalid credentials"
}
```

---

## POST `/refresh`

### Purpose
Generates a new access token using refresh token.

### Authentication
Refresh Token Required

---

## POST `/logout`

### Purpose
Revokes refresh token and clears authentication cookies.

### Authentication
Public

### Success Response

```json
{
  "ok": true
}
```

---

## GET `/me`

### Purpose
Returns authenticated user profile.

### Authentication
Bearer Token Required

### Success Response

```json
{
  "user": {
    "id": "mongoId",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

---

# Lead Routes

Base Route:

```text
/api/v1/leads
```

Authentication Required:
`Bearer Token`

---

## GET `/leads`

### Purpose
Returns paginated leads list with filtering and sorting.

### Query Parameters

| Parameter | Description |
|---|---|
| `status` | Lead status |
| `source` | Lead source |
| `search` | Name/email search |
| `startDate` | Filter start date |
| `endDate` | Filter end date |
| `page` | Page number |
| `limit` | Results limit |
| `sortBy` | Sorting field |
| `sortOrder` | asc / desc |

### Success Response

```json
{
  "leads": [],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

## POST `/leads`

### Purpose
Creates a new lead.

### Request Body

```json
{
  "name": "Lead Name",
  "email": "lead@example.com",
  "status": "New",
  "source": "Website"
}
```

### Success Response

```json
{
  "lead": {}
}
```

---

## PATCH `/leads/:id`

### Purpose
Updates lead information.

---

## DELETE `/leads/:id`

### Purpose
Deletes a lead.

---

## GET `/leads/analytics`

### Purpose
Returns lead analytics and aggregations.

### Success Response

```json
{
  "byStatus": {},
  "bySource": {},
  "timeseries": []
}
```

---

## GET `/leads/export`

### Purpose
Exports leads as CSV.

---

# Saved Filter Routes

Base Route:

```text
/api/v1/saved-filters
```

Authentication Required.

---

## GET `/saved-filters`

Returns authenticated user's saved filters.

---

## POST `/saved-filters`

Creates a new saved filter.

---

## PATCH `/saved-filters/:id`

Updates saved filter.

---

## DELETE `/saved-filters/:id`

Deletes saved filter.

---

# Bulk Import Routes

Base Route:

```text
/api/v1/bulk-import
```

---

## POST `/import`

### Purpose
Imports leads using CSV upload.

### Content Type

```text
multipart/form-data
```

### File Field

```text
file
```

### Success Response

```json
{
  "imported": 2,
  "failed": 1
}
```

---

# 7. Database Documentation

## Collections

- users
- leads
- refreshtokens
- savedfilters
- auditlogs

---

## User Schema

| Field | Description |
|---|---|
| `name` | User full name |
| `email` | Unique email |
| `password` | bcrypt hashed password |
| `role` | admin / sales |

---

## Lead Schema

| Field | Description |
|---|---|
| `name` | Lead name |
| `email` | Lead email |
| `status` | Lead status |
| `source` | Lead source |

---

# 8. Middleware Documentation

## Global Middleware

- express.json()
- cookie-parser
- helmet
- cors
- xss-clean
- express-mongo-sanitize
- express-rate-limit

---

## Route Middleware

- protect
- authorize()
- validateBody()
- multer.single()
- asyncHandler
- errorHandler

---

# 9. Error Handling

## Standard Error Response

```json
{
  "error": "Internal Server Error"
}
```

---

## Common Status Codes

| Status Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

# 10. Security Features

Implemented Security Features:

- JWT Authentication
- Refresh Token Rotation
- bcrypt Password Hashing
- Helmet Security Headers
- CORS Protection
- XSS Protection
- MongoDB Sanitization
- Rate Limiting
- Role-Based Access Control

---

# 11. Deployment

## Frontend
Vercel

## Backend
Render

## Database
MongoDB Atlas

## Containerization
Docker & Docker Compose

---

# 12. Testing

## Backend Testing Tools

- Jest
- Supertest

## Manual API Testing

- Postman
- Browser DevTools
- Network Inspector

---

# 13. Project Features

- Secure Authentication
- Admin & Sales Roles
- Lead Management
- CSV Import/Export
- Analytics Dashboard
- Saved Filters
- Responsive UI
- Production Deployment
- Dockerized Architecture
- MongoDB Atlas Integration

---

# 14. Conclusion

Smart Leads Dashboard is a full-stack production-grade lead management system built using modern MERN architecture principles.

The backend focuses on:
- scalability
- modular architecture
- maintainability
- production deployment
- authentication security
- enterprise-grade API structure