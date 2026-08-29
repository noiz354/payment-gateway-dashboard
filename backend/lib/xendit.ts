import 'dotenv/config';
import { Xendit } from 'xendit-node';

/** The only place the Xendit secret is consumed. Never import this module in browser code. */
export const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_SECRET_KEY || 'test-only-no-real-key',
  xenditURL: process.env.XENDIT_URL,
});

export const { Balance, Transaction, Invoice, Payout, Customer, PaymentRequest, Refund } = xenditClient;
