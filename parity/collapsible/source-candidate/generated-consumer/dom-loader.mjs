// Installed peer compiler, native client output, development checks and no HMR.
import { registerHooks, createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('./package.json', import.meta.url));
const { compile, compileModule } = require('svelte/compiler');
registerHooks({ load(url, context, nextLoad) {
  if (url.endsWith('.svelte') || url.endsWith('.svelte.js')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    const options = { filename: fileURLToPath(url), generate: 'client', dev: true, hmr: false };
    const result = url.endsWith('.svelte') ? compile(source, options) : compileModule(source, options);
    return { format: 'module', source: result.js.code, shortCircuit: true };
  }
  return nextLoad(url, context);
} });
