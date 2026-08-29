import { Router } from 'express';
import { xenditClient } from '../lib/xendit.js';

export const invoicesRouter = Router();
invoicesRouter.get('/', async (req, res, next) => {
  try {
    const statuses = req.query.statuses ? String(req.query.statuses).split(',') : undefined;
    const result = await xenditClient.Invoice.getInvoices({
      ...(statuses ? { statuses } : {}),
      ...(req.query.limit ? { limit: Number(req.query.limit) } : {}),
      ...(req.query.createdAfter ? { createdAfter: new Date(String(req.query.createdAfter)) } : {}),
    } as any);
    res.json(result);
  } catch (error) { next(error); }
});
invoicesRouter.post('/', async (req, res, next) => {
  try {
    const result = await xenditClient.Invoice.createInvoice({ data: req.body });
    res.status(201).json(result);
  } catch (error) { next(error); }
});
