/* =============================================================================
   Shared navigation — Single Source of Truth for every mobile screen.

   Renders, from ONE `NAV_CONFIG` object:
     1. Mobile bottom tab bar (max 5 items, Xendit pattern):
        Home • Transaksi • [FAB: Buat] • Saldo • Menu
     2. "Menu" bottom sheet — secondary destinations
        (Payment Links, Subscriptions, QR Codes (#qr-codes anchor),
        Disbursements, Settings, plus the "Lainnya" extras).
     3. FAB bottom sheet — create actions.
     4. Desktop sidebar (md and up) derived from the same config, so
        mobile and desktop navigation can never drift apart.

   The active tab / sheet item / sidebar entry is auto-detected from
   `window.location.pathname` + `location.hash`.

   Pages only need:
     <head>   <link rel="stylesheet" href="../_shared/nav.css">
     <body>   <div id="app-nav-root"></div>
              <script src="../_shared/nav.js"></script>
   and NO hardcoded navigation markup.
   ========================================================================== */
(() => {
  'use strict';

  /* ---------------------------------------------------------------- Config */
  const NAV_CONFIG = {
    brand: {
      name: 'Imanino Corps',
      sub: 'Enterprise Account',
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByM5ZGw25jiHBEHqCbnX3pXLCDq4OMK2Y7byxy6yzBtecR3O0aAdrxMLlRWnMW7m04t0mFbjoczTUV7c7GaEZNSRsrEQqlSiUKvV4bapZ0hfKkz24e6wdpUMhEgTgCzYiJIbeX-M-LbHx6lFP7X53P9A104x8l_mKV5dyoc03PbuS80_9KlezvXa_hjpI9ru0JzkffN-r0pFEaqKRUkYti7VX_dv8avqoYm5luxf6_0xhc6-heLm9U',
    },

    /* screen key -> [folder under screens/mobile/, optional hash anchor] */
    screens: {
      home: ['dashboard_home'],
      transactions: ['transaction_ledger'],
      balance: ['balance_history'],
      'payment-links': ['payment_links_invoices'],
      'qr-codes': ['payment_links_invoices', '#qr-codes'],
      subscriptions: ['subscription_management'],
      disbursements: ['payout_settings'],
      settings: ['developer_settings'],
      customers: ['customer_directory'],
      reports: ['custom_reports_builder'],
      webhooks: ['webhook_logs'],
      apiKeys: ['api_key_management'],
      kyc: ['identity_verification_kyc'],
      team: ['team_permissions'],
      fraud: ['fraud_prevention_blocklist'],
    },

    /* Bottom tabs — exactly 5 (Xendit max). Center item is the FAB. */
    tabs: [
      { id: 'home', label: 'Home', icon: 'home', screen: 'home' },
      { id: 'transactions', label: 'Transaksi', icon: 'receipt_long', screen: 'transactions' },
      { id: 'create', label: 'Buat', icon: 'add', fab: true },
      { id: 'balance', label: 'Saldo', icon: 'account_balance_wallet', screen: 'balance' },
      { id: 'menu', label: 'Menu', icon: 'menu', opens: 'menu' },
    ],

    /* "Menu" bottom sheet — secondary menu, kept out of the tab bar. */
    menuSheet: [
      { label: 'Payment Links', icon: 'link', screen: 'payment-links' },
      { label: 'Subscriptions', icon: 'autorenew', screen: 'subscriptions' },
      { label: 'QR Codes', icon: 'qr_code_2', screen: 'qr-codes' },
      { label: 'Disbursements', icon: 'payments', screen: 'disbursements' },
      { label: 'Settings', icon: 'settings', screen: 'settings' },
    ],

    /* Remaining screens, grouped under "Lainnya" in the sheet + sidebar. */
    menuMore: [
      { label: 'Customers', icon: 'group', screen: 'customers' },
      { label: 'Reports', icon: 'assessment', screen: 'reports' },
      { label: 'Webhook Logs', icon: 'webhook', screen: 'webhooks' },
      { label: 'API Keys', icon: 'key', screen: 'apiKeys' },
      { label: 'KYC', icon: 'verified_user', screen: 'kyc' },
      { label: 'Team', icon: 'admin_panel_settings', screen: 'team' },
      { label: 'Fraud Prevention', icon: 'shield', screen: 'fraud' },
    ],

    /* FAB ("Buat") actions — map to the create flows of existing screens. */
    createActions: [
      { label: 'Buat Payment Link', sub: 'Cekout sekali pakai', icon: 'link', screen: 'payment-links' },
      { label: 'Kirim Payout', sub: 'Transfer ke bank/ewallet', icon: 'payments', screen: 'disbursements' },
      { label: 'Buat Subscription', sub: 'Tagihan berulang', icon: 'autorenew', screen: 'subscriptions' },
      { label: 'Generate QR Code', sub: 'QRIS statis', icon: 'qr_code_2', screen: 'qr-codes' },
    ],
  };

  /* ------------------------------------------------------------ Path base */
  /* Resolve `screens/mobile/` relative to this script so the prototype works
     from file:// or any server sub-path (no hardcoded "/screens/..."). */
  const currentScript = document.currentScript;
  const scriptHref = currentScript && currentScript.src
    ? currentScript.src
    : new URL('../_shared/nav.js', location.href).href;
  const MOBILE_BASE = new URL('../', scriptHref).href; // .../screens/mobile/

  const hrefFor = (screenKey) => {
    const [folder, hash = ''] = NAV_CONFIG.screens[screenKey];
    return MOBILE_BASE + folder + '/code.html' + hash;
  };

  /* ----------------------------------------------- Active state detection */
  /* Auto-detect from pathname + hash (requirement: no per-page flags). */
  const currentScreen = (() => {
    const path = location.pathname || '';
    const hash = location.hash || '';
    if (path.includes('/payment_links_invoices/code.html') && hash === '#qr-codes') return 'qr-codes';
    for (const [key, [folder]] of Object.entries(NAV_CONFIG.screens)) {
      if (key === 'qr-codes') continue; // handled above
      if (path.includes('/' + folder + '/code.html')) return key;
    }
    return null;
  })();

  /* -------------------------------------------------------------- Helpers */
  const icon = (name, cls = '') => `<span class="material-symbols-outlined nx-icon ${cls}" aria-hidden="true">${name}</span>`;
  const isActive = (screen) => Boolean(screen) && screen === currentScreen;

  /* ----------------------------------------------------------------- DOM */
  const root = document.getElementById('app-nav-root') || document.body.appendChild(document.createElement('div'));
  root.id = root.id || 'app-nav-root';

  const tabHtml = (tab) => {
    if (tab.fab) {
      return `<button type="button" class="nx-fab" id="nx-fab" aria-haspopup="dialog" aria-controls="nx-sheet" aria-label="${tab.label}">
        <span class="nx-fab-circle">${icon(tab.icon)}</span>
        <span class="nx-label">${tab.label}</span>
      </button>`;
    }
    if (tab.opens === 'menu') {
      return `<button type="button" class="nx-item" id="nx-menu-btn" aria-haspopup="dialog" aria-controls="nx-sheet" aria-label="${tab.label}">
        ${icon(tab.icon)}<span class="nx-label">${tab.label}</span>
      </button>`;
    }
    return `<a class="nx-item${isActive(tab.screen) ? ' nx-active' : ''}" href="${hrefFor(tab.screen)}" aria-current="${isActive(tab.screen) ? 'page' : 'false'}">
      ${icon(tab.icon)}<span class="nx-label">${tab.label}</span>
    </a>`;
  };

  const sheetItemHtml = (item, active) => `
    <a class="nx-sheet-item${active ? ' nx-active' : ''}" href="${hrefFor(item.screen)}" aria-current="${active ? 'page' : 'false'}">
      ${icon(item.icon)}
      <span class="nx-item-name">${item.label}${item.sub ? `<span class="nx-item-sub">${item.sub}</span>` : ''}</span>
      <span class="material-symbols-outlined nx-chevron" aria-hidden="true">chevron_right</span>
    </a>`;

  const sideItemHtml = (item) => `
    <a class="nx-side-item${isActive(item.screen) ? ' nx-active' : ''}" href="${hrefFor(item.screen)}" aria-current="${isActive(item.screen) ? 'page' : 'false'}">
      ${icon(item.icon)}<span>${item.label}</span>
    </a>`;

  const primary = NAV_CONFIG.menuSheet;
  const more = NAV_CONFIG.menuMore;

  root.innerHTML = `
  <!-- Mobile bottom tab bar (max 5 items, Xendit pattern) -->
  <nav class="nx-bar" aria-label="Navigasi utama">
    ${NAV_CONFIG.tabs.map(tabHtml).join('\n    ')}
  </nav>

  <!-- Desktop sidebar — same NAV_CONFIG, so it stays in sync with the tabs -->
  <aside class="nx-sidebar" aria-label="Navigasi">
    <div class="nx-side-brand">
      <img src="${NAV_CONFIG.brand.logo}" alt="${NAV_CONFIG.brand.name} logo">
      <div>
        <div class="nx-brand-name">${NAV_CONFIG.brand.name}</div>
        <div class="nx-brand-sub">${NAV_CONFIG.brand.sub}</div>
      </div>
    </div>
    <div class="nx-side-section">Utama</div>
    <div class="nx-side-list">
      ${sideItemHtml({ label: 'Home', icon: 'home', screen: 'home' })}
      ${sideItemHtml({ label: 'Transaksi', icon: 'receipt_long', screen: 'transactions' })}
      ${sideItemHtml({ label: 'Saldo', icon: 'account_balance_wallet', screen: 'balance' })}
    </div>
    <div class="nx-side-section">Produk</div>
    <div class="nx-side-list">
      ${primary.map(sideItemHtml).join('\n      ')}
    </div>
    <div class="nx-side-section">Lainnya</div>
    <div class="nx-side-list">
      ${more.map(sideItemHtml).join('\n      ')}
    </div>
    <div class="nx-side-foot">
      <a class="nx-side-item${isActive('settings') ? ' nx-active' : ''}" href="${hrefFor('settings')}" aria-current="${isActive('settings') ? 'page' : 'false'}">
        ${icon('settings')}<span>Settings</span>
      </a>
    </div>
  </aside>

  <!-- Bottom sheet (Menu / FAB) -->
  <div class="nx-overlay" id="nx-overlay" hidden></div>
  <section class="nx-sheet" id="nx-sheet" role="dialog" aria-modal="true" aria-labelledby="nx-sheet-title" hidden>
    <div class="nx-sheet-grabber" aria-hidden="true"></div>
    <header class="nx-sheet-head">
      <h2 class="nx-sheet-title" id="nx-sheet-title">Menu</h2>
      <button type="button" class="nx-sheet-close" id="nx-sheet-close" aria-label="Tutup">
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </header>
    <div class="nx-sheet-body" id="nx-sheet-body"></div>
  </section>`;

  /* ------------------------------------------------------- Sheet behavior */
  const overlay = root.querySelector('#nx-overlay');
  const sheet = root.querySelector('#nx-sheet');
  const sheetTitle = root.querySelector('#nx-sheet-title');
  const sheetBody = root.querySelector('#nx-sheet-body');
  const closeBtn = root.querySelector('#nx-sheet-close');
  let lastFocused = null;

  const fillSheet = (mode) => {
    if (mode === 'create') {
      sheetTitle.textContent = 'Buat';
      sheetBody.innerHTML = NAV_CONFIG.createActions.map((a) => sheetItemHtml(a, false)).join('');
    } else {
      sheetTitle.textContent = 'Menu';
      sheetBody.innerHTML = `
        ${primary.map((i) => sheetItemHtml(i, isActive(i.screen))).join('')}
        <div class="nx-sheet-label">Lainnya</div>
        ${more.map((i) => sheetItemHtml(i, isActive(i.screen))).join('')}`;
    }
  };

  const openSheet = (mode) => {
    fillSheet(mode);
    lastFocused = document.activeElement;
    overlay.hidden = false;
    sheet.hidden = false;
    // let the browser paint the hidden state before animating in
    requestAnimationFrame(() => requestAnimationFrame(() => {
      overlay.classList.add('nx-open');
      sheet.classList.add('nx-open');
      document.body.classList.add('nx-sheet-open');
      closeBtn.focus({ preventScroll: true });
    }));
  };

  const closeSheet = () => {
    overlay.classList.remove('nx-open');
    sheet.classList.remove('nx-open');
    document.body.classList.remove('nx-sheet-open');
    window.setTimeout(() => {
      overlay.hidden = true;
      sheet.hidden = true;
    }, 260);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus({ preventScroll: true });
  };

  const sheetIsOpen = () => !sheet.hidden;

  root.querySelector('#nx-menu-btn').addEventListener('click', () => {
    if (sheetIsOpen()) closeSheet(); else openSheet('menu');
  });
  root.querySelector('#nx-fab').addEventListener('click', () => {
    if (sheetIsOpen()) closeSheet(); else openSheet('create');
  });
  closeBtn.addEventListener('click', closeSheet);
  overlay.addEventListener('click', closeSheet);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheetIsOpen()) closeSheet(); });
  sheetBody.addEventListener('click', (e) => { if (e.target.closest('a')) closeSheet(); });

  /* Debug / integration hook (xendit-client.js style, read-only). */
  window.XenditNav = { config: NAV_CONFIG, active: currentScreen, open: openSheet, close: closeSheet };
})();
