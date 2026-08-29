import { Router } from 'express';
import { xenditClient } from '../lib/xendit.js';

export const transactionsRouter = Router();
transactionsRouter.get('/:id', async (req, res, next) => {
  try { res.json(await xenditClient.Transaction.getTransactionByID({ id: req.params.id })); } catch (error) { next(error); }
});
transactionsRouter.get('/', async (req, res, next) => {
  try {
    const csv = (name: string) => req.query[name] ? String(req.query[name]).split(',') : undefined;
    res.json(await xenditClient.Transaction.getAllTransactions({
      ...(csv('types') ? { types: csv('types') } : {}), ...(csv('statuses') ? { statuses: csv('statuses') } : {}),
      ...(csv('channelCategories') ? { channelCategories: csv('channelCategories') } : {}),
      ...(req.query.currency ? { currency: String(req.query.currency) } : {}), ...(req.query.limit ? { limit: Number(req.query.limit) } : {}),
      ...(req.query.afterId ? { afterId: String(req.query.afterId) } : {}),
    } as any));
  } catch (error) { next(error); }
});
