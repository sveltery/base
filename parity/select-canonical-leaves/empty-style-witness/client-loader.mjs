// Test-only Node loader: compile packed Svelte source with the declared peer compiler.
// Consumers normally use their Svelte bundler; Node does not understand .svelte files.
import { registerHooks, createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const require = createRequire(new URL('../../../packages/base/package.json', import.meta.url));
const { compile, compileModule } = require('svelte/compiler');
const { transpileModule, ModuleKind, ScriptTarget } = require('typescript');
registerHooks({
  resolve(specifier, context, nextResolve) {
    // Source SSR tests run before packaging; TypeScript emits these imports as .js.
    if (specifier.startsWith('.') && specifier.endsWith('.js') && context.parentURL) {
      const target = new URL(specifier, context.parentURL);
      const source = new URL(target.href.replace(/\.js$/, '.ts'));
      if (!existsSync(fileURLToPath(target)) && existsSync(fileURLToPath(source))) {
        return nextResolve(source.href, context);
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (url.endsWith('.svelte') || url.endsWith('.svelte.js') || url.endsWith('.svelte.ts')) {
      const raw = readFileSync(fileURLToPath(url), 'utf8');
      const source = url.endsWith('.svelte.ts')
        ? transpileModule(raw, {
            compilerOptions: {
              module: ModuleKind.ESNext,
              target: ScriptTarget.ESNext,
              verbatimModuleSyntax: true,
            },
          }).outputText
        : raw;
      const result = url.endsWith('.svelte')
        ? compile(source, { filename: fileURLToPath(url), generate: 'client' })
        : compileModule(source, { filename: fileURLToPath(url), generate: 'client' });
      return { format: 'module', source: result.js.code, shortCircuit: true };
    }
    return nextLoad(url, context);
  },
});
