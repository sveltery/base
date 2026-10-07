// Test-only compilation of actual native code and immutable MIT pin archives.
import { registerHooks, createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const base = createRequire(new URL('../packages/base/package.json', import.meta.url));
const reference = createRequire(new URL('../apps/fixtures/package.json', import.meta.url));
const { compile, compileModule } = base('svelte/compiler');
const ts = base('typescript');
const archive = new URL('../parity/composite-owners/recovery/original/', import.meta.url);
const original = (name) => new URL(name, archive);
const present = (url) => existsSync(fileURLToPath(url)) || existsSync(fileURLToPath(url) + '.gz');

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === 'react' || specifier.startsWith('react-dom/')) {
      return nextResolve(reference.resolve(specifier), context);
    }
    if (specifier === 'svelte' || specifier.startsWith('svelte/')) {
      return nextResolve(base.resolve(specifier), context);
    }
    if (specifier.startsWith('@base-ui/utils/')) {
      return {
        url: original(`packages/utils/src/${specifier.slice(15)}.ts`).href,
        shortCircuit: true,
      };
    }
    if (specifier.startsWith('.') && context.parentURL) {
      const target = new URL(specifier, context.parentURL);
      for (const url of [
        target,
        new URL(target.href.replace(/\.js$/, '.ts')),
        new URL(target.href + '.ts'),
        new URL(target.href + '.tsx'),
      ]) {
        if (present(url)) return { url: url.href, shortCircuit: true };
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!/\.(?:ts|tsx|svelte)$/.test(url)) return nextLoad(url, context);
    const path = fileURLToPath(url);
    let raw = existsSync(path)
      ? readFileSync(path, 'utf8')
      : gunzipSync(readFileSync(path + '.gz')).toString('utf8');
    if (
      process.env.SVELTERY_COMPOSITE_WITNESS === 'public' &&
      path.endsWith('/internals/composite/list/createCompositeList.svelte.ts')
    ) {
      raw = readFileSync(
        new URL(
          '../parity/composite-owners/recovery/public2626-createCompositeList.svelte.ts.txt',
          import.meta.url,
        ),
        'utf8',
      );
      if (
        createHash('sha256').update(raw).digest('hex') !==
        '71f38c19bcb64f4443f76d533a583cebe826c896a1b22cac6c462c7bcbce07b5'
      )
        throw new Error('Public2626 preimage changed');
    }
    if (url.endsWith('.svelte'))
      return {
        format: 'module',
        source: compile(raw, { filename: path, generate: 'client' }).js.code,
        shortCircuit: true,
      };
    const source = ts.transpileModule(raw, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ESNext,
        jsx: ts.JsxEmit.React,
        verbatimModuleSyntax: true,
      },
    }).outputText;
    return {
      format: 'module',
      source: url.endsWith('.svelte.ts')
        ? compileModule(source, { filename: path, generate: 'client' }).js.code
        : source,
      shortCircuit: true,
    };
  },
});
