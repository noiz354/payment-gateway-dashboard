import { Router } from 'express';

export type WebhookHandler = (payload: Record<string, unknown>) => void | Promise<void>;
export function webhookRouter(handleEvent: WebhookHandler = () => undefined) {
  const router = Router();
  router.post('/xendit', async (req, res, next) => {
    const expected = process.env.XENDIT_WEBHOOK_TOKEN;
    const received = req.header('x-callback-token');
    if (!expected || !received || received !== expected) return res.status(401).json({ error: 'invalid callback token' });
    try { await handleEvent(req.body); res.status(200).send('ok'); } catch (error) { next(error); }
  });
  return router;
}
