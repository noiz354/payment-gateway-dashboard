import { Router } from 'express';
import { xenditClient } from '../lib/xendit.js';

export const balanceRouter = Router();
balanceRouter.get('/', async (req, res, next) => {
  try {
    const result = await xenditClient.Balance.getBalance({
      accountType: (req.query.accountType as 'CASH' | 'HOLDING' | 'TAX') || 'CASH',
      ...(req.query.currency ? { currency: String(req.query.currency) } : {}),
      ...(req.query.atTimestamp ? { atTimestamp: new Date(String(req.query.atTimestamp)) } : {}),
    });
    res.json(result);
  } catch (error) { next(error); }
});
