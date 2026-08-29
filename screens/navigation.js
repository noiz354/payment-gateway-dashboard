/* Shared navigation for the standalone prototype screens. */
(() => {
  const desktop = location.pathname.includes('/desktop/');
  const dir = desktop ? '/screens/desktop/' : '/screens/mobile/';
  const names = desktop ? {
    home: 'dashboard_home_desktop', balance: 'balance_history_desktop', transactions: 'transaction_ledger_desktop',
    payment: 'billing_invoices_desktop', subscriptions: 'subscription_management_desktop', qr: 'billing_invoices_desktop',
    payouts: 'bulk_payouts_desktop', settings: 'developer_settings_desktop', reports: 'custom_reports_builder_desktop',
    accounts: 'customer_directory_desktop', audit: 'detailed_audit_log_desktop', support: 'support_documentation_hub_desktop',
  } : {
    home: 'dashboard_home', balance: 'balance_history', transactions: 'transaction_ledger', payment: 'payment_links_invoices',
    subscriptions: 'subscription_management', qr: 'payment_links_invoices', payouts: 'payout_settings', settings: 'developer_settings',
    reports: 'custom_reports_builder', accounts: 'customer_directory', audit: 'webhook_logs', support: 'developer_settings',
  };
  const routeFor = (label) => {
    const key = label.trim().toLowerCase();
    if (key === 'home' || key === 'dashboard') return names.home;
    if (key === 'balance') return names.balance;
    if (['transactions', 'transact', 'ledger'].includes(key)) return names.transactions;
    if (['payment links', 'links', 'payments'].includes(key)) return names.payment;
    if (key === 'subscriptions') return names.subscriptions;
    if (key === 'qr codes') return names.qr;
    if (['disbursements', 'bulk payouts'].includes(key)) return names.payouts;
    if (['settings', 'developer settings'].includes(key)) return names.settings;
    if (key === 'reports' || key === 'reporting' || key === 'analytics') return names.reports;
    if (['accounts', 'customers'].includes(key)) return names.accounts;
    if (key === 'audit log') return names.audit;
    if (key === 'support') return names.support;
    return null;
  };
  document.querySelectorAll('a[href="#"]').forEach((anchor) => {
    const label = [...anchor.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join(' ').trim() || anchor.textContent;
    const route = routeFor(label);
    if (route) anchor.href = `${dir}${route}/code.html${label.trim().toLowerCase() === 'qr codes' ? '#qr-codes' : ''}`;
  });
})();
