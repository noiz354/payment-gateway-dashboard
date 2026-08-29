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

## Screen conventions

- Standalone HTML: `<!DOCTYPE html>` + Tailwind CDN `<script>` + inline `tailwind.config` + Material Symbols + Google Fonts (Inter, JetBrains Mono).
- Keep the shared layout skeleton consistent: sidebar (desktop) / bottom nav (mobile), top app bar, main content grid.
- Sticky table headers use `label-caps`; numeric cells use `data-mono`.
- No inline `<style>` beyond the standard Material Symbols / scrollbar setup already present in existing screens.

## Commands

None required. To preview a screen, open its `code.html` directly in a browser. Files are plain HTML and need no install or build.
