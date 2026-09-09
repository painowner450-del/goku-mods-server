# GOKU MODS SERVER V3 — Backend Ready

## Run locally
1. Install Node.js 18+.
2. Copy `.env.example` to `.env` and adjust values if needed.
3. Run `npm install`.
4. Run `npm start`.
5. Open `http://localhost:3000/`.

## Backend endpoints
- `GET /api/health` — health check.
- `POST /api/auth/connect` — server-side bridge to the configured key-validation service.
- `GET /api/history?url=<allowed draw.ar-lottery01.com URL>` — server-side bridge for public game history.

The history proxy only allows HTTPS requests to `draw.ar-lottery01.com` to prevent the endpoint from becoming an open proxy.

## Deployment
Works with Render, Railway, or any Node.js host. Set the start command to `npm start`.

## Important
This package does not contain Firebase Admin credentials. The existing frontend Firebase configuration is preserved so the current application logic is not silently broken. For true server-authoritative authentication, add a Firebase Admin SDK service account on the hosting provider and move user/key validation into backend routes before removing the client-side Firebase access.
