import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const files = [
  'app.js',
  'step-localization.js',
  'technique-tutorial-data.js',
  'techniques-i18n.js',
];
const temp = mkdtempSync(join(tmpdir(), 'yzf-esm-syntax-'));
try {
  for (const name of files) {
    const source = readFileSync(join(root, name), 'utf8');
    const target = join(temp, `${basename(name, '.js')}.mjs`);
    writeFileSync(target, source);
    const result = spawnSync(process.execPath, ['--check', target], { encoding: 'utf8' });
    if (result.status !== 0) {
      process.stderr.write(result.stderr || result.stdout || `ESM syntax check failed: ${name}\n`);
      process.exit(result.status || 1);
    }
  }
  console.log(`PASS frontend ESM syntax (${files.length} modules)`);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
