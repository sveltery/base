// Native representation probes against installed Svelte 5.57.1; no Base UI assertion credit.
import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import type { ClassValue } from 'svelte/elements';
import { resolveClassValue } from '../src/lib/internals/resolveClassValue.js';
import { mergeProps } from '../src/lib/merge-props/index.js';

// Test-only access to actual pinned private reference functions, not library runtime imports.
const { clsx, to_class } = await import(
  new URL('../node_modules/svelte/src/internal/shared/attributes.js', import.meta.url).href
);

it('normalizes ClassValue inputs like the pinned native Svelte clsx/to_class boundary', () => {
  const version = JSON.parse(readFileSync(new URL('../node_modules/svelte/package.json', import.meta.url), 'utf8')).version;
  expect(version).toBe('5.57.1');
  expect(typeof clsx).toBe('function');
  expect(typeof to_class).toBe('function');
  const inherited = Object.assign(Object.create({ inherited: true, omitted: false }), { own: true });
  const cases: ClassValue[] = [
    undefined, null, '', false, true, 0, -0, NaN, 4, 1n, 'plain',
    [], {}, inherited,
    ['first', [0, false, null, undefined, '', NaN, 'second', [4, true, 1n]], inherited],
    { visible: true, hidden: false, numeric: 1, zero: 0 },
  ];
  for (const value of cases) {
    const normalized = resolveClassValue(value);
    expect(normalized, `source normalization for ${String(value)}`).toBe(
      value == null ? undefined : String(clsx(value)),
    );
    expect(to_class(normalized)).toBe(to_class(clsx(value)));
  }
});

it('normalizes each prop before the shared source class concatenation order', () => {
  const internal: ClassValue = ['internal', [false, { inherited: true }]];
  const external: ClassValue = { external: true, omitted: false };
  expect(mergeProps({ class: internal }, { class: external }).class).toBe(
    `${String(clsx(external))} ${String(clsx(internal))}`,
  );
});
