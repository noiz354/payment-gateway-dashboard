import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { balanceRouter } from './routes/balance.js';
import { transactionsRouter } from './routes/transactions.js';
import { invoicesRouter } from './routes/invoices.js';
import { payoutsRouter } from './routes/payouts.js';
import { customersRouter } from './routes/customers.js';
import { webhookRouter } from './routes/webhooks.js';

export const app = express();
app.use(express.json());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/balance', balanceRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/payouts', payoutsRouter);
app.use('/api/customers', customersRouter);
app.use('/webhooks', webhookRouter());
// Serve the existing prototype when running the BFF locally.
app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')));
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Xendit request failed:', error?.message || error);
  res.status(error?.statusCode || error?.status || 502).json({ error: error?.body?.message || error?.message || 'Xendit request failed' });
});

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, '0.0.0.0', () => console.log(`Dashboard BFF listening on ${port}`));
}
