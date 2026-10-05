// Source-audit tooling only: resolve actual declared workspace exports to source owners.
// Runtime and consumer builds continue to use the published dist export targets.
import { existsSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';

export function resolveNativePackageSource(root, specifier) {
  if (!specifier.startsWith('@sveltery/utils/')) return undefined;
  const directory = resolve(root, 'packages/utils');
  const manifest = JSON.parse(readFileSync(resolve(directory, 'package.json'), 'utf8'));
  const key = `./${specifier.slice('@sveltery/utils/'.length)}`;
  const entry = manifest.exports[key];
  if (!entry) throw new Error(`Undeclared native utility export: ${specifier}`);
  const target = typeof entry === 'string' ? entry : (entry.svelte ?? entry.default);
  if (!target?.startsWith('./dist/'))
    throw new Error(`Utility export has no published dist target: ${specifier}`);
  const stem = resolve(directory, 'src/lib', target.slice('./dist/'.length));
  const candidates = [stem.replace(/\.js$/, '.ts'), stem.replace(/\.js$/, '.svelte.ts'), stem];
  const source = candidates.find((path) => existsSync(path) && statSync(path).isFile());
  if (!source) throw new Error(`Utility export has no source owner: ${specifier} -> ${target}`);
  return relative(root, source);
}
