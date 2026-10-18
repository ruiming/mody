// Builds a Chrome Web Store upload: release/mody-<version>.zip from dist/.
// The store rejects manifests carrying `key` / `update_url`, so both are removed.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const manifestPath = 'dist/manifest.json';
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
delete manifest.key;
delete manifest.update_url;
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

mkdirSync('release', { recursive: true });
const zip = `release/mody-${manifest.version}.zip`;
rmSync(zip, { force: true });
execFileSync('zip', ['-r', '-X', `../${zip}`, '.', '-x', '.*'], { cwd: 'dist', stdio: 'inherit' });
console.log(`Created ${zip}`);
