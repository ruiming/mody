// Dev helper: compile every .svelte file under the given dir and report errors.
// Usage: node src/check-svelte.mjs src/app
import { compile } from 'svelte/compiler';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.svelte') ? [p] : [];
  });

let failed = 0;
for (const file of walk(process.argv[2] || 'src')) {
  try {
    const { warnings } = compile(readFileSync(file, 'utf8'), { filename: file });
    for (const w of warnings) if (!w.code.startsWith('a11y')) console.log(`warn ${file}: ${w.message}`);
  } catch (e) {
    failed++;
    console.log(`ERROR ${file}: ${e.message}`);
  }
}
console.log(failed ? `${failed} file(s) failed` : 'all ok');
process.exit(failed ? 1 : 0);
