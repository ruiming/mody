# Mody

Modify HTTP request / response headers, redirect URLs and CSP in Chrome (Manifest V3).
Profiles, filters, undo, JSON import/export and Chrome-account cloud sync. No tracking.

## Develop

```sh
npm install
npm run build          # unpacked extension in dist/
npm run build:synced   # same, plus a pinned extension ID (see below)
npm run check          # compile-check all Svelte components
npm run package        # release/mody-<version>.zip for the Chrome Web Store
```

Load `dist/` via `chrome://extensions` → Developer mode → Load unpacked.

## Cloud sync

Profiles are synced through `chrome.storage.sync` (the user's own Google account):
compressed, chunked snapshots (last 20 kept, ~90 KB usable quota), auto-apply of
newer changes from other devices or confirm-before-apply, restore from any snapshot.

`chrome.storage.sync` is scoped by extension ID. Store installs share one ID
automatically. For unpacked builds on several machines use `npm run build:synced`,
which writes the public key of `dev-key.pem` (gitignored, keep it safe) into
`dist/manifest.json` so the ID is always `ioclpfbljkoeoklpgieelgobljkejnai`.
Switching an existing unpacked install to the pinned ID changes its ID, so export
profiles first and import them afterwards.

## Publish

`npm run package`, then upload `release/mody-<version>.zip` in the Chrome Web Store
developer dashboard. Listing copy, permission justifications, privacy policy and
images are in `store/` (`store/compose.py` regenerates the images from `store/raw/`).

## Layout

- `src/shared/` — profile model, storage keys, message types, cloud sync format
- `src/background/` — service worker: DNR rule generation, badge, menus, commands, cloud sync
- `src/app/` — popup and options page (Svelte); design tokens and primitives in `src/app/ui/`
- `assets/` — icon sources; `scripts/` — build helpers; `store/` — store listing

## Known limitations (Manifest V3)

Per-cookie Cookie / Set-Cookie modifiers and exclude-URL filters cannot be expressed
with declarativeNetRequest; they are shown disabled in the Add dialog.
