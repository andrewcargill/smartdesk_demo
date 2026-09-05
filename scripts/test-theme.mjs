import { build } from 'esbuild';
import { mkdir, unlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

// Reuse the project's JSX compiler; no browser or additional dependency required.
const outfile = 'test-results/.theme-tests.cjs';
await mkdir('test-results', { recursive: true });
try {
  await build({ entryPoints: ['tests/theme.test.jsx'], outfile, bundle: true, platform: 'node', packages: 'external', jsx: 'automatic', logLevel: 'silent' });
  const result = spawnSync(process.execPath, ['--test', outfile], { stdio: 'inherit' });
  process.exitCode = result.status ?? 1;
} finally {
  await unlink(outfile).catch(() => {});
}
