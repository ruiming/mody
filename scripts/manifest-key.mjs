// Pins the unpacked extension ID by writing the public half of dev-key.pem into
// dist/manifest.json, so every machine loading this build gets the same ID and
// shares chrome.storage.sync data. Never use it for Chrome Web Store uploads.
import { createHash, createPublicKey } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const der = createPublicKey(readFileSync('dev-key.pem')).export({ type: 'spki', format: 'der' });
const manifestPath = 'dist/manifest.json';
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.key = der.toString('base64');
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const id = [...createHash('sha256').update(der).digest('hex').slice(0, 32)]
  .map((c) => String.fromCharCode(97 + parseInt(c, 16)))
  .join('');
console.log(`Pinned extension ID: ${id}`);
