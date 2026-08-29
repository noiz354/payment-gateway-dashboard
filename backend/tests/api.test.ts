import { createServer, type Server } from 'node:http';
import { AddressInfo } from 'node:net';
import request from 'supertest';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';

let mock: Server;
let app: any;
let mockUrl: string;

beforeAll(async () => {
  mock = createServer((req, res) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      res.setHeader('content-type', 'application/json');
      const url = req.url || '/';
      let response: unknown;
      if (url.startsWith('/balance')) response = { balance: 125000, currency: 'IDR' };
      else if (url.startsWith('/transactions')) response = { data: [{ id: 'txn_mock', status: 'SUCCEEDED', amount: 1000 }] };
      else if (url.startsWith('/v2/invoices') && req.method === 'POST') response = { id: 'inv_mock', status: 'PENDING', available_banks: [], available_retail_outlets: [], available_ewallets: [], available_qr_codes: [], available_direct_debits: [], available_paylaters: [] };
      else if (url.startsWith('/v2/invoices')) response = [{ id: 'inv_mock', status: 'PAID', available_banks: [], available_retail_outlets: [], available_ewallets: [], available_qr_codes: [], available_direct_debits: [], available_paylaters: [] }];
      else if (url.startsWith('/v2/payouts') && req.method === 'POST') response = { id: 'payout_mock', status: 'ACCEPTED' };
      else if (url.startsWith('/v2/payouts')) response = { data: [{ id: 'payout_mock' }] };
      else if (url.startsWith('/customers') && req.method === 'POST') response = { id: 'cus_mock', reference_id: 'customer-1', addresses: null, identity_accounts: null, kyc_documents: null };
      else response = { data: [{ id: 'cus_mock', reference_id: 'customer-1', addresses: null, identity_accounts: null, kyc_documents: null }] };
      res.end(JSON.stringify(response));
    });
  });
  await new Promise<void>(resolve => mock.listen(0, '127.0.0.1', resolve));
  mockUrl = `http://127.0.0.1:${(mock.address() as AddressInfo).port}`;
  process.env.XENDIT_URL = mockUrl;
  process.env.XENDIT_SECRET_KEY = 'xnd_development_test_key_never_real';
  process.env.XENDIT_WEBHOOK_TOKEN = 'test-webhook-token';
  process.env.NODE_ENV = 'test';
  ({ app } = await import('../server.js'));
});
afterAll(() => mock.close());

describe('Xendit BFF endpoints (SDK pointed at mock server)', () => {
  it('GET /api/balance', async () => expect((await request(app).get('/api/balance?currency=IDR')).body.balance).toBe(125000));
  it('GET /api/transactions', async () => expect((await request(app).get('/api/transactions?limit=25')).body.data[0].id).toBe('txn_mock'));
  it('GET and POST /api/invoices', async () => {
    expect((await request(app).get('/api/invoices')).body[0].id).toBe('inv_mock');
    expect((await request(app).post('/api/invoices').send({ amount: 1000, externalId: 'test' })).status).toBe(201);
  });
  it('GET and POST /api/payouts', async () => {
    expect((await request(app).get('/api/payouts?referenceId=ref-1')).body.data[0].id).toBe('payout_mock');
    expect((await request(app).post('/api/payouts').set('idempotency-key', 'payout-test').send({ amount: 1000, referenceId: 'ref-1' })).status).toBe(201);
  });
  it('GET and POST /api/customers', async () => {
    expect((await request(app).get('/api/customers?referenceId=customer-1')).body.data[0].id).toBe('cus_mock');
    expect((await request(app).post('/api/customers').send({ referenceId: 'customer-1', type: 'INDIVIDUAL' })).status).toBe(201);
  });
  it('verifies x-callback-token on webhook', async () => {
    expect((await request(app).post('/webhooks/xendit').send({ event: 'invoice.paid' })).status).toBe(401);
    expect((await request(app).post('/webhooks/xendit').set('x-callback-token', 'test-webhook-token').send({ event: 'invoice.paid' })).text).toBe('ok');
  });
});
