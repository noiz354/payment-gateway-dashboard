# Progress

Status tracking for the payment-gateway dashboard mockup set.

## Design Systems

| System | Target | Tokens | Spec |
| --- | --- | --- | --- |
| Kinetic Enterprise | Mobile-first screens | Complete | `design-system/kinetic_enterprise/DESIGN.md` |
| Kinetic Ledger | Desktop-density screens | Complete | `design-system/kinetic_ledger/DESIGN.md` |

## Screens

- Mobile (Kinetic Enterprise): 14 of 14 built
- Desktop (Kinetic Ledger): 19 of 19 built

Full per-screen details in [SCREENS.md](./SCREENS.md).

## Status Key

- ✅ Built — `code.html` + `screen.png` present
- ⬜ Planned — not yet started

## Change Log

- **2026-08-29** — Unified mobile navigation into a Single Source of Truth (Xendit mobile pattern): new `screens/mobile/_shared/nav.js` (one `NAV_CONFIG`: bottom tabs Home / Transaksi / center FAB "Buat" / Saldo / Menu + "Menu" bottom sheet with Payment Links, Subscriptions, QR Codes `#qr-codes`, Disbursements, Settings + "Lainnya" extras) and `nav.css`. Stripped all hardcoded bottom bars and desktop sidebars from the 14 mobile `code.html` files; each now injects `<div id="app-nav-root">` + shared nav only. Active state auto-detected from `pathname` + `hash`; desktop sidebar rendered from the same config.
- **2026-08-29** — Reorganized repo into `design-system/` and `screens/{mobile,desktop}`; added `README.md`, `AGENTS.md`, `PROGRESS.md`, `SCREENS.md`.
