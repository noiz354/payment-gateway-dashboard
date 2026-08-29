/* Browser-side BFF adapter. Xendit credentials never enter this file. */
window.XenditDashboard = (() => {
  const escape = (value) => String(value ?? '').replace(/[&<>\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
  const money = (value, currency = 'IDR') => value == null ? '' : new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value));
  const statusClass = (status) => /paid|succeed|complete|active|settled/i.test(status || '') ? 'text-emerald-700 bg-emerald-100' : /fail|expire|reject/i.test(status || '') ? 'text-red-700 bg-red-100' : 'text-amber-700 bg-amber-100';
  const request = async (url, options) => { const r = await fetch(url, { headers: { Accept: 'application/json', ...(options?.body ? {'Content-Type': 'application/json'} : {}) }, ...options }); if (!r.ok) throw new Error((await r.json()).error || `HTTP ${r.status}`); return r.json(); };
  const recordsOf = (data) => Array.isArray(data) ? data : (data?.data || [data]);
  const value = (o, ...keys) => keys.map(k => o?.[k]).find(v => v !== undefined && v !== null);
  function render(resource, data) {
    const records = recordsOf(data); document.querySelectorAll('tbody').forEach(tbody => {
      if (!records.length) { tbody.innerHTML = '<tr><td colspan="12" class="p-4 text-center text-on-surface-variant">No records found</td></tr>'; return; }
      tbody.innerHTML = records.map((r, i) => {
        const id = value(r, 'id', 'externalId', 'referenceId', 'reference_id') || `record-${i + 1}`;
        const state = value(r, 'status', 'event') || '—';
        const name = value(r, 'payerEmail', 'email', 'description', 'type') || '—';
        const amount = value(r, 'amount', 'balance');
        const amountText = typeof amount === 'number' ? money(amount, r.currency || 'IDR') : (amount ?? '—');
        return `<tr data-transaction-id="${resource === 'transactions' ? id : ''}" class="border-b border-outline-variant hover:bg-surface-container-low cursor-pointer"><td class="px-3 py-3 font-data-mono text-data-mono">${escape(id)}</td><td class="px-3 py-3"><span class="inline-flex rounded-full px-2 py-0.5 text-xs ${statusClass(state)}">${escape(state)}</span></td><td class="px-3 py-3">${escape(name)}</td><td class="px-3 py-3 text-right font-data-mono text-data-mono">${escape(amountText)}</td></tr>`;
      }).join('');
    });
    if (resource === 'transactions') document.querySelectorAll('[data-transaction-id]').forEach(row => row.addEventListener('click', async () => { const id = row.dataset.transactionId; if (!id) return; try { const detail = await request(`/api/transactions/${encodeURIComponent(id)}`); window.alert(`Transaction ${id}\\nStatus: ${detail.status || '—'}\\nAmount: ${detail.amount ?? '—'}`); } catch (e) { window.alert(`Unable to load transaction: ${e.message}`); } }));
  }
  async function create(resource) {
    const prompts = resource === 'invoices' ? [['amount','Amount'],['externalId','External ID'],['description','Description'],['currency','Currency']] : resource === 'payouts' ? [['amount','Amount'],['referenceId','Reference ID'],['channelCode','Channel code'],['currency','Currency']] : [['referenceId','Reference ID'],['email','Email'],['type','Type (INDIVIDUAL or BUSINESS)']];
    const data = {}; for (const [key, label] of prompts) { const v = window.prompt(label); if (v === null) return; data[key] = key === 'amount' ? Number(v) : v; }
    try { await request(`/api/${resource}`, { method: 'POST', body: JSON.stringify(data) }); window.location.reload(); } catch (e) { window.alert(`Unable to create ${resource}: ${e.message}`); }
  }
  function bindCreate(resource) { [...document.querySelectorAll('button')].find(b => /create link|add customer|new batch/i.test(b.textContent || ''))?.addEventListener('click', () => create(resource)); }
  async function init(resource, endpoint = `/api/${resource}`) {
    try {
      if (resource === 'dashboard') { const [balance, transactions] = await Promise.all([request('/api/balance?currency=IDR'), request('/api/transactions?limit=10')]); document.querySelectorAll('[data-balance-value]').forEach(el => el.textContent = money(balance.balance, balance.currency)); render('transactions', transactions); }
      else if (resource === 'audit') { const [transactions, webhooks] = await Promise.all([request('/api/transactions?limit=25'), request('/api/webhooks')]); render('transactions', transactions); document.body.dataset.webhookCount = String(recordsOf(webhooks).length); }
      else if (resource === 'payout-channels') { const channels = await request('/api/payouts/channels?currency=IDR'); render(resource, channels); }
      else render(resource, await request(endpoint));
      document.body.dataset.xenditState = 'live';
    } catch (e) { console.error(e); document.body.dataset.xenditState = 'error'; }
    if (resource === 'invoices' || resource === 'customers' || resource === 'payouts') bindCreate(resource);
    if (resource === 'payout-channels') { try { const channels = await request('/api/payouts/channels?currency=IDR'); const select = document.querySelector('select'); if (select) select.innerHTML = recordsOf(channels).map(c => `<option value="${c.channelCode || c.channel_code}">${c.channelName || c.channelCode || c.channel_code}</option>`).join(''); } catch (e) { console.error(e); } }
    if (resource === 'report') [...document.querySelectorAll('button')].find(b => /generate report/i.test(b.textContent || ''))?.addEventListener('click', report);
  }
  function report() { const source = document.querySelector('input[name="datasource"]:checked')?.value || 'transactions'; const endpoint = source === 'payouts' ? '/api/payouts?referenceId=report' : source === 'customers' ? '/api/customers?referenceId=report' : '/api/transactions'; init(source, endpoint); }

  return { init, report, render };
})();
