// Independently source-bound six-case lifecycle supplements. These separately verify
// the scope diagnosed by the private UI48 matrix; they do not copy that artifact or
// claim its 48 observations as executed here. Zero ordinary Input/Field credit.
// Base UI 1.8.0 pin: 47b40521eab921c2756bf9bdb0b0f07fbfdb8c8c; MIT.
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { hydrate, mount, tick, unmount } from 'svelte';
import Fixture from './InputCheckedDefaultsFixture.svelte';
import NativeFixture from './NativeInputCheckedDefaultsFixture.svelte';
import { mountInputCheckedDefaultsReference } from '../../../../apps/fixtures/src/lib/input-checked-defaults-reference.js';
type CheckedDefaultProps = { type: 'checkbox' | 'radio'; id?: string; checked?: boolean | null; defaultChecked?: boolean; readonly?: boolean };
const cases: CheckedDefaultProps[] = [
  { type: 'checkbox', checked: true, readonly: true },
  { type: 'checkbox', checked: false, readonly: true },
  { type: 'checkbox', defaultChecked: true },
  { type: 'checkbox', checked: null, defaultChecked: true },
  { type: 'radio', checked: true, readonly: true },
  { type: 'radio', defaultChecked: true },
];
const cleanups: (() => void | Promise<void>)[] = [];
const serverCache = new Map<string, string>();
afterEach(async () => { for (const cleanup of cleanups.splice(0)) await cleanup(); document.body.replaceChildren(); });
function serverHTML(reference: boolean | 'native', inputProps: CheckedDefaultProps) {
  const key = JSON.stringify({ reference, inputProps });
  if (serverCache.has(key)) return serverCache.get(key)!;
  const script = reference === true
    ? `import { createRequire } from 'node:module'; const require = createRequire(new URL('./apps/fixtures/package.json', import.meta.url)); const { createElement: h } = require('react'); const { renderToString } = require('react-dom/server'); const { Input } = require('@base-ui/react/input'); const { readonly, ...props } = ${JSON.stringify(inputProps)}; process.stdout.write(renderToString(h('form', null, h(Input, { ...props, readOnly: readonly }))));`
    : `import { createRequire } from 'node:module'; import Fixture from './packages/base/tests/dom/${reference === 'native' ? 'NativeInputCheckedDefaultsFixture' : 'InputCheckedDefaultsFixture'}.svelte'; const require = createRequire(new URL('./packages/base/package.json', import.meta.url)); const { render } = require('svelte/server'); process.stdout.write(render(Fixture, { props: { inputProps: ${JSON.stringify(inputProps)} } }).body);`;
  const html = execFileSync(process.execPath, ['--import', './scripts/svelte-ssr-loader.mjs', '--input-type=module', '-e', script], { cwd: resolve(process.cwd(), '../..'), encoding: 'utf8' });
  serverCache.set(key, html); return html;
}
function observation(input: HTMLInputElement) {
  return { checked: input.checked, defaultChecked: input.defaultChecked, checkedAttribute: input.getAttribute('checked'), value: input.value, defaultValue: input.defaultValue };
}
async function settle(reference: boolean) { if (reference) await new Promise(resolve => setTimeout(resolve, 25)); else { await tick(); await tick(); } }
for (const reference of [true]) for (const hydration of [false, true]) for (const [index, props] of cases.entries()) it(`${reference ? 'React' : 'Svelte'} checked defaults lifecycle case=${index} ${hydration ? 'hydrate' : 'client'}`, async () => {
  const inputProps = { ...props, id: `checked-default-${index}` };
  const host = document.createElement('section'); host.innerHTML = serverHTML(reference, inputProps); document.body.append(host);
  const serverInput = host.querySelector<HTMLInputElement>('input')!;
  const initial = inputProps.checked ?? inputProps.defaultChecked ?? false;
  const expected = { checked: initial, defaultChecked: initial, checkedAttribute: initial ? '' : null, value: 'on', defaultValue: '' };
  expect(observation(serverInput)).toEqual(expected);
  if (!hydration) host.replaceChildren();
  if (reference) {
    const { readonly, ...reactProps } = inputProps;
    cleanups.push(mountInputCheckedDefaultsReference(host, { ...reactProps, readOnly: readonly }, hydration));
  } else {
    const component = (hydration ? hydrate : mount)(Fixture, { target: host, props: { inputProps } }); cleanups.push(() => unmount(component));
  }
  await settle(reference);
  const input = host.querySelector<HTMLInputElement>('input')!;
  if (hydration) expect(input).toBe(serverInput);
  expect(observation(input)).toEqual(expected);
  input.click();
  const clicked = { ...expected, checked: inputProps.checked != null || inputProps.type === 'radio' ? initial : !initial };
  expect(observation(input)).toEqual(clicked);
  await settle(reference); expect(observation(input)).toEqual(clicked);
  input.checked = !initial; input.form!.reset();
  expect(observation(input)).toEqual(expected);
  await settle(reference); expect(observation(input)).toEqual(expected);
});

// The original React assertions above remain intact. These native comparisons
// run the same six cases against a genuine Svelte input; differing source behavior
// follows the user's 2026-10-03 native-default directive and earns zero credit.
for (const hydration of [false, true]) for (const [index, props] of cases.entries()) it(`source-derived Input keeps native Svelte defaults case=${index} ${hydration ? 'hydrate' : 'client'}`, async () => {
  const inputProps = { ...props, id: `native-checked-default-${index}` };
  const portHost = document.createElement('section'), nativeHost = document.createElement('section');
  portHost.innerHTML = serverHTML(false, inputProps); nativeHost.innerHTML = serverHTML('native', inputProps);
  document.body.append(portHost, nativeHost);
  const serverPort = portHost.querySelector<HTMLInputElement>('input')!, serverNative = nativeHost.querySelector<HTMLInputElement>('input')!;
  expect(observation(serverPort)).toEqual(observation(serverNative));
  if (!hydration) { portHost.replaceChildren(); nativeHost.replaceChildren(); }
  const mountComponent = hydration ? hydrate : mount;
  const port = mountComponent(Fixture, { target: portHost, props: { inputProps } });
  const native = mountComponent(NativeFixture, { target: nativeHost, props: { inputProps } });
  cleanups.push(() => unmount(port), () => unmount(native)); await tick(); await tick();
  const portInput = portHost.querySelector<HTMLInputElement>('input')!, nativeInput = nativeHost.querySelector<HTMLInputElement>('input')!;
  if (hydration) { expect(portInput).toBe(serverPort); expect(nativeInput).toBe(serverNative); }
  expect(observation(portInput)).toEqual(observation(nativeInput));
  portInput.click(); nativeInput.click(); expect(observation(portInput)).toEqual(observation(nativeInput));
  await tick(); await tick(); expect(observation(portInput)).toEqual(observation(nativeInput));
  portInput.checked = !portInput.checked; nativeInput.checked = !nativeInput.checked;
  portInput.form!.reset(); nativeInput.form!.reset(); expect(observation(portInput)).toEqual(observation(nativeInput));
  await tick(); await tick(); expect(observation(portInput)).toEqual(observation(nativeInput));
});
