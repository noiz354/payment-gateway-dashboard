# Dashboard BFF

Node 18+ Express backend for the Xendit dashboard integration.

```sh
cp .env.example .env
npm install
npm test
npm start
```

Set `XENDIT_SECRET_KEY` and `XENDIT_WEBHOOK_TOKEN` in `.env`. `XENDIT_URL` is an optional SDK base URL override intended for a mock server; tests use it and never use a real API key. The backend serves the existing `screens/` prototype as static files, so its browser fetches use relative `/api/*` URLs.

Endpoints: `GET /api/balance`, `GET /api/transactions`, `GET /api/transactions/:id`, `GET|POST /api/invoices`, `GET /api/payouts/channels`, `GET|POST /api/payouts`, `GET|POST /api/customers`, `GET /api/webhooks`, and `POST /webhooks/xendit`.
