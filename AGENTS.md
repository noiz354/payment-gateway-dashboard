# AGENTS.md

Guidance for coding agents working in this repository.

## What this repo is

A static UI-prototype monorepo for an enterprise payment-gateway dashboard. There is no build system, framework, or backend — every screen is a single self-contained `code.html` file rendered with Tailwind CSS (CDN) plus a `screen.png` preview.

## Directory rules

- `design-system/` — design tokens and specs (`DESIGN.md`). Do not place screens here.
- `screens/mobile/` — mobile-first / responsive screens (no `_desktop` suffix).
- `screens/desktop/` — desktop-density screens (`_desktop` suffix).

When adding a new screen:
1. Decide platform: mobile-first → `screens/mobile/<name>/`, desktop → `screens/desktop/<name>_desktop/`.
2. Create `code.html` and a rendered `screen.png` preview.
3. Register it in `SCREENS.md` and note it in `PROGRESS.md`.

## Design-system rules

- Match the active design system: **Kinetic Enterprise** for `screens/mobile/`, **Kinetic Ledger** for `screens/desktop/`.
- Use the exact token names from the matching `DESIGN.md` (colors like `primary`/`surface-variant`, typography like `headline-xl`/`data-mono`, spacing like `gutter`/`stack-md`).
- Do not invent new color or spacing tokens. If a value is missing, extend `DESIGN.md` first, then the `tailwind.config` block in the screen.
- Numeric/currency values use the `data-mono` font and are right-aligned.
- Every screen carries the persistent **TEST MODE** amber banner (`#d97706`) unless it is explicitly a live-mode screen.

## Shared navigation (Single Source of Truth)

All **mobile** screens share one navigation implementation — do NOT hardcode
bottom bars, sidebars, or menu sheets in a screen's `code.html`:

- `screens/mobile/_shared/nav.js` — defines the single `NAV_CONFIG` and renders the chrome into `<div id="app-nav-root"></div>`:
  - Mobile bottom tab bar (max 5, Xendit pattern): **Home, Transaksi, center FAB (Buat), Saldo, Menu**.
  - "Menu" bottom sheet: **Payment Links, Subscriptions, QR Codes (`#qr-codes` anchor), Disbursements, Settings** (+ "Lainnya" extras).
  - FAB sheet: create actions. Desktop sidebar (md and up) is derived from the same config.
  - Active state is auto-detected from `window.location.pathname` + `location.hash`.
- `screens/mobile/_shared/nav.css` — nav-only styling (plain CSS, Kinetic Enterprise palette, safe-area padded, mobile-first).
- Every mobile screen injects in `<head>`: `<link rel="stylesheet" href="../_shared/nav.css"/>` and at the end of `<body>`: `<div id="app-nav-root"></div>` + `<script src="../_shared/nav.js"></script>`.
- To add a screen to navigation: register it in `NAV_CONFIG.screens` (key → `[folder, hash?]`) and add an entry to `menuSheet`/`menuMore`/`createActions` as appropriate.
- Pages with a full-width fixed top app bar push the shared sidebar down via `--nx-sidebar-top` (or `--nx-sidebar-top-md` for the md..lg band only) on `#app-nav-root`.
- In-page section navs (e.g. "Fraud & Risk" on the blocklist screen, tab strips) are content — keep them in the screen.
- Desktop screens keep using `screens/navigation.js` (label-based `a[href="#"]` rewriter); the mobile `_shared` nav owns all mobile chrome.

## Screen conventions

- Standalone HTML: `<!DOCTYPE html>` + Tailwind CDN `<script>` + inline `tailwind.config` + Material Symbols + Google Fonts (Inter, JetBrains Mono).
- Keep the shared layout skeleton consistent: top app bar, main content grid, and the shared navigation chrome (see above) instead of per-screen nav markup.
- Sticky table headers use `label-caps`; numeric cells use `data-mono`.
- No inline `<style>` beyond the standard Material Symbols / scrollbar setup already present in existing screens.

## Commands

None required. To preview a screen, open its `code.html` directly in a browser. Files are plain HTML and need no install or build.
