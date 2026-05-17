# Deployment Guide

This document describes deploying the Smart Leads Dashboard to popular hosts and configuring MongoDB Atlas.

## Common environment variables

Required server env vars:

- `MONGO_URI` — MongoDB connection string
- `JWT_ACCESS_TOKEN_SECRET` — access-token signing secret
- `JWT_REFRESH_TOKEN_SECRET` — refresh-token signing secret
- `JWT_ACCESS_TOKEN_EXPIRES` — access-token lifetime, default `15m`
- `JWT_REFRESH_TOKEN_EXPIRES` — refresh-token lifetime, default `7d`
- `CLIENT_ORIGIN` or `CORS_ORIGIN` — frontend origin
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_FROM` — email transport settings
- `EXPORT_NOTIFICATION_EMAIL` — notification recipient for scheduled exports
- `REDIS_URL` — Redis connection string
- `ENABLE_SCHEDULER` — `true` to enable scheduled exports

## MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Create a database user and whitelist your app IPs (or 0.0.0.0/0 for testing).
3. Copy the connection string and set `MONGO_URI` in your host's secrets.

## Vercel (Frontend)

1. Connect the `client` directory in a new Vercel project.
2. Build command: `npm run build`.
3. Output directory: `dist` (Vite will produce `dist`).
4. Set `CLIENT_ORIGIN` to your deployed URL in server environment.

## Render (Backend)

1. Create a new Web Service, connect to the repo, and set working directory to `server`.
2. Build command: `npm install && npm run build`.
3. Start command: `npm start`.
4. Add environment variables listed above.

## Railway

1. Create two services: one for `server` (Node) and one for `client` (static or Vercel).
2. Set `MONGO_URI` and the auth secrets via the Railway Secrets UI.
3. Use `npm install && npm run build` and `npm start` for the server service.

## Docker (production)

1. Build multi-stage images: `docker build -f server/Dockerfile -t smart-leads-server ./server` and `docker build -f client/Dockerfile -t smart-leads-client ./client`.
2. Use your container host (AWS ECS, DigitalOcean App Platform, Render, etc.).

## Final checklist

- [ ] Set all required environment variables in your host.
- [ ] Use secrets manager — never store secrets in repo.
- [ ] Verify scheduler only enabled when required (`ENABLE_SCHEDULER=true`).
- [ ] Configure SMTP in production if needed.
- [ ] Confirm the frontend points at the deployed backend through `VITE_API_URL`.
- [ ] Run post-deploy smoke checks on the production URL.
- [ ] Watch backend logs and health checks during the first deploy window.
- [ ] Confirm MongoDB connectivity, auth flows, and export jobs after rollout.
