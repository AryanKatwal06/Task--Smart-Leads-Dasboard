# API Documentation

Base URL: `/api/v1`

Authentication uses short-lived access tokens plus refresh tokens. Most endpoints below require a valid bearer token.

## Auth

- POST `/auth/register`
  - body: `{ name, email, password }`
  - returns: user object (no password)

- POST `/auth/login`
  - body: `{ email, password }`
  - returns: `{ accessToken, refreshToken, user }`

- POST `/auth/refresh`
  - body: `{ token }` (refresh token)
  - returns: new access token

- POST `/auth/logout`
  - invalidates refresh token

## Leads

- GET `/leads` - list leads
  - query: `page`, `limit`, `search`, `status`, `source`
  - auth: required
  - returns: `{ data: Lead[], meta: { total, page, pages } }`

- GET `/leads/:id` - get single lead
  - auth: required

- POST `/leads` - create
  - body: lead payload
  - auth: required

- PUT `/leads/:id` - update
  - auth: required

- DELETE `/leads/:id` - delete
  - auth: required, admin

## Analytics

- GET `/leads/analytics`
  - query: optional date filters depending on the view
  - auth: required
  - returns aggregated lead counts and time-series data

## Exports

- GET `/leads/export`
  - auth: required
  - streams CSV for the current filter set

- GET `/leads/exports`
  - auth: required
  - lists generated export files

- GET `/leads/exports/download/:filename`
  - auth: required
  - downloads a specific export file

## Saved Filters

- CRUD endpoints under `/saved-filters`
  - auth: required
  - used for storing reusable lead filter presets

Error responses use standard `{ message, errors? }` format and appropriate HTTP status codes.
