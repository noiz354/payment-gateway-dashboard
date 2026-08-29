import { Router } from 'express';
import { xenditClient } from '../lib/xendit.js';

export const payoutsRouter = Router();
payoutsRouter.get('/', async (req, res, next) => {
  try {
    if (req.query.id) return res.json(await xenditClient.Payout.getPayoutById({ id: String(req.query.id) }));
    if (!req.query.referenceId) return res.status(400).json({ error: 'referenceId or id is required' });
    res.json(await xenditClient.Payout.getPayouts({ referenceId: String(req.query.referenceId) }));
  } catch (error) { next(error); }
});
payoutsRouter.post('/', async (req, res, next) => {
  try {
    const idempotencyKey = String(req.header('idempotency-key') || req.body.idempotencyKey || `payout-${req.body.referenceId || Date.now()}`);
    const { idempotencyKey: _ignored, ...data } = req.body;
    res.status(201).json(await xenditClient.Payout.createPayout({ idempotencyKey, data }));
  } catch (error) { next(error); }
});
