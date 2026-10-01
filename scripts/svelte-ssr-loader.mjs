// Test-only Node loader: compile packed Svelte source with the declared peer compiler.
// Consumers normally use their Svelte bundler; Node does not understand .svelte files.
import { registerHooks, createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../packages/base/package.json', import.meta.url));
const { compile, compileModule } = require('svelte/compiler');
registerHooks({
  load(url, context, nextLoad) {
    if (url.endsWith('.svelte') || url.endsWith('.svelte.js')) {
      const source = readFileSync(fileURLToPath(url), 'utf8');
      const result = url.endsWith('.svelte') ? compile(source, { filename: fileURLToPath(url), generate: 'server' }) : compileModule(source, { filename: fileURLToPath(url), generate: 'server' });
      return { format: 'module', source: result.js.code, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
