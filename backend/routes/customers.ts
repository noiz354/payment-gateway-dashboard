import { Router } from 'express';
import { xenditClient } from '../lib/xendit.js';

export const customersRouter = Router();
customersRouter.get('/', async (req, res, next) => {
  try {
    if (req.query.id) return res.json(await xenditClient.Customer.getCustomer({ id: String(req.query.id) }));
    if (!req.query.referenceId) return res.status(400).json({ error: 'referenceId or id is required' });
    res.json(await xenditClient.Customer.getCustomerByReferenceID({ referenceId: String(req.query.referenceId) }));
  } catch (error) { next(error); }
});
customersRouter.post('/', async (req, res, next) => {
  try {
    const idempotencyKey = String(req.header('idempotency-key') || req.body.idempotencyKey || `cust-${req.body.referenceId || Date.now()}`);
    const { idempotencyKey: _ignored, ...data } = req.body;
    res.status(201).json(await xenditClient.Customer.createCustomer({ idempotencyKey, data }));
  } catch (error) { next(error); }
});
