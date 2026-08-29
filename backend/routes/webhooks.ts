import { Router } from 'express';
import { listWebhooks, saveWebhook } from '../lib/webhook-store.js';

export function webhookRouter() {
  const router = Router();
  router.get('/', (_req, res) => res.json(listWebhooks()));
  router.post('/xendit', async (req, res, next) => {
    const expected = process.env.XENDIT_WEBHOOK_TOKEN;
    const received = req.header('x-callback-token');
    if (!expected || !received || received !== expected) return res.status(401).json({ error: 'invalid callback token' });
    try { res.status(200).json(saveWebhook(req.body)); } catch (error) { next(error); }
  });
  return router;
}
